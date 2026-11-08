// Núcleo do UDS (Fundação): tudo que toca o sistema (arquivos e configurações) fica aqui.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::fs;

#[derive(Serialize)]
struct Entry {
    name: String,
    path: String,
    is_dir: bool,
}

#[derive(Serialize)]
struct FileInfo {
    kind: String,
    mime: String,
    text: String,
    size: u64,
    /// Primeiros bytes do arquivo (até 512), usados pela interface para identificar o formato pelo conteúdo.
    head: Vec<u8>,
}

/// Pasta `portable/` ao lado do executável: configurações e dados do WebView ficam aqui.
fn portable_dir() -> PathBuf {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|d| d.join("portable")))
        .unwrap_or_else(|| PathBuf::from("portable"))
}

/// Pasta `themes/` ao lado do executável. Em desenvolvimento (`npm run dev`) o executável fica em
/// src-tauri/target/debug, então procura nas pastas acima até achar a `themes/` do projeto.
fn themes_dir() -> PathBuf {
    let mut d = std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|x| x.to_path_buf()))
        .unwrap_or_else(|| PathBuf::from("."));
    let padrao = d.join("themes");
    if cfg!(debug_assertions) {
        for _ in 0..6 {
            if d.join("themes").is_dir() {
                return d.join("themes");
            }
            if !d.pop() {
                break;
            }
        }
    }
    padrao
}

/// Identificação de imagens pelo conteúdo (magic numbers).
fn sniff(b: &[u8]) -> Option<(&'static str, &'static str)> {
    if b.starts_with(&[0x89, b'P', b'N', b'G']) {
        return Some(("image", "image/png"));
    }
    if b.starts_with(&[0xFF, 0xD8, 0xFF]) {
        return Some(("image", "image/jpeg"));
    }
    if b.starts_with(b"GIF8") {
        return Some(("image", "image/gif"));
    }
    if b.len() > 12 && &b[0..4] == b"RIFF" && &b[8..12] == b"WEBP" {
        return Some(("image", "image/webp"));
    }
    None
}

fn list_dir_impl(path: &str) -> Result<Vec<Entry>, String> {
    let mut v: Vec<Entry> = fs::read_dir(path)
        .map_err(|e| e.to_string())?
        .flatten()
        .map(|e| Entry {
            name: e.file_name().to_string_lossy().to_string(),
            path: e.path().to_string_lossy().to_string(),
            is_dir: e.path().is_dir(),
        })
        .collect();
    v.sort_by(|a, b| {
        b.is_dir
            .cmp(&a.is_dir)
            .then(a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });
    Ok(v)
}

fn read_file_impl(path: &str, force_text: bool) -> Result<FileInfo, String> {
    let p = Path::new(path);
    let size = fs::metadata(p).map_err(|e| e.to_string())?.len();
    let mut head = vec![0u8; 512.min(size as usize)];
    let mut f = fs::File::open(p).map_err(|e| e.to_string())?;
    let n = f.read(&mut head).map_err(|e| e.to_string())?;
    head.truncate(n);
    let mk = |kind: &str, mime: &str, text: String| FileInfo {
        kind: kind.into(),
        mime: mime.into(),
        text,
        size,
        head: head.clone(),
    };
    let binary = || mk("binary", "application/octet-stream", String::new());
    if !force_text {
        if let Some((k, m)) = sniff(&head) {
            return Ok(mk(k, m, String::new()));
        }
    }
    // Bytes nulos no início indicam arquivo binário (como o Git faz), mesmo que o resto pareça UTF-8.
    if !force_text && head.contains(&0) {
        return Ok(binary());
    }
    if size > 5_000_000 {
        return if force_text {
            Err("Arquivo grande demais para o editor (limite de 5 MB).".into())
        } else {
            Ok(binary())
        };
    }
    let bytes = fs::read(p).map_err(|e| e.to_string())?;
    match String::from_utf8(bytes) {
        Ok(t) => {
            let is_svg = !force_text && t.chars().take(600).collect::<String>().contains("<svg");
            if is_svg {
                Ok(mk("image", "image/svg+xml", String::new()))
            } else {
                Ok(mk("text", "text/plain", t))
            }
        }
        Err(e) if force_text => Ok(mk("text", "text/plain", String::from_utf8_lossy(e.as_bytes()).to_string())),
        Err(_) => Ok(binary()),
    }
}

#[tauri::command]
fn list_dir(path: String) -> Result<Vec<Entry>, String> {
    list_dir_impl(&path)
}

#[tauri::command]
fn read_file(path: String, force_text: bool) -> Result<FileInfo, String> {
    read_file_impl(&path, force_text)
}

#[tauri::command]
fn write_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        let _ = fs::create_dir_all(parent);
    }
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn create_dir(path: String) -> Result<(), String> {
    fs::create_dir_all(&path).map_err(|e| e.to_string())
}

#[tauri::command]
fn rename_path(from: String, to: String) -> Result<(), String> {
    fs::rename(&from, &to).map_err(|e| e.to_string())
}

#[tauri::command]
fn delete_path(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.is_dir() {
        fs::remove_dir_all(p).map_err(|e| e.to_string())
    } else {
        fs::remove_file(p).map_err(|e| e.to_string())
    }
}

#[tauri::command]
fn load_config() -> String {
    fs::read_to_string(portable_dir().join("config").join("settings.json")).unwrap_or_else(|_| "{}".into())
}

#[tauri::command]
fn save_config(json: String) -> Result<(), String> {
    let d = portable_dir().join("config");
    fs::create_dir_all(&d).map_err(|e| e.to_string())?;
    fs::write(d.join("settings.json"), json).map_err(|e| e.to_string())
}

#[tauri::command]
fn themes_path() -> String {
    themes_dir().to_string_lossy().to_string()
}

#[tauri::command]
fn portable_path() -> String {
    portable_dir().to_string_lossy().to_string()
}

fn main() {
    let pd = portable_dir();
    let _ = fs::create_dir_all(pd.join("config"));
    // Mantém os dados do WebView2 (Windows) dentro da pasta portátil.
    #[cfg(windows)]
    std::env::set_var("WEBVIEW2_USER_DATA_FOLDER", pd.join("webview"));

    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            list_dir, read_file, write_file, create_dir, rename_path, delete_path,
            load_config, save_config, portable_path, themes_path
        ])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o UDS");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn tmp(name: &str) -> PathBuf {
        let d = std::env::temp_dir().join(format!("uds_test_{}_{}", name, std::process::id()));
        let _ = fs::remove_dir_all(&d);
        fs::create_dir_all(&d).unwrap();
        d
    }

    #[test]
    fn reconhece_png_sem_extensao() {
        assert_eq!(sniff(&[0x89, b'P', b'N', b'G', 0, 0]), Some(("image", "image/png")));
    }

    #[test]
    fn texto_comum_nao_e_imagem() {
        assert_eq!(sniff(b"console.log('oi')"), None);
    }

    #[test]
    fn devolve_os_primeiros_bytes_do_arquivo() {
        let d = tmp("head");
        let f = d.join("a.bin");
        let dados: Vec<u8> = (0..=255u8).cycle().take(1000).collect();
        fs::write(&f, &dados).unwrap();
        let info = read_file_impl(f.to_str().unwrap(), false).unwrap();
        assert_eq!(info.head.len(), 512);
        assert_eq!(&info.head[..], &dados[..512]);
        let curto = d.join("b.txt");
        fs::write(&curto, "abc").unwrap();
        assert_eq!(read_file_impl(curto.to_str().unwrap(), false).unwrap().head, b"abc".to_vec());
    }

    #[test]
    fn arquivo_com_bytes_nulos_e_binario() {
        let d = tmp("nul");
        let f = d.join("x.dat");
        fs::write(&f, b"ID3\x03\x00abc").unwrap();
        assert_eq!(read_file_impl(f.to_str().unwrap(), false).unwrap().kind, "binary");
        assert_eq!(read_file_impl(f.to_str().unwrap(), true).unwrap().kind, "text");
    }

    #[test]
    fn lista_pastas_antes_de_arquivos() {
        let d = tmp("lista");
        fs::write(d.join("b.txt"), "x").unwrap();
        fs::create_dir(d.join("zeta")).unwrap();
        fs::write(d.join("A.txt"), "x").unwrap();
        let v = list_dir_impl(d.to_str().unwrap()).unwrap();
        let nomes: Vec<&str> = v.iter().map(|e| e.name.as_str()).collect();
        assert_eq!(nomes, vec!["zeta", "A.txt", "b.txt"]);
    }

    #[test]
    fn salva_e_le_texto() {
        let d = tmp("texto");
        let f = d.join("sub").join("a.js");
        write_file(f.to_string_lossy().to_string(), "const a = 1;".into()).unwrap();
        let info = read_file_impl(f.to_str().unwrap(), false).unwrap();
        assert_eq!(info.kind, "text");
        assert_eq!(info.text, "const a = 1;");
    }

    #[test]
    fn binario_e_aberto_como_texto_se_pedido() {
        let d = tmp("bin");
        let f = d.join("x.dat");
        fs::write(&f, [0xFFu8, 0xFE, 0x00, 0x41]).unwrap();
        assert_eq!(read_file_impl(f.to_str().unwrap(), false).unwrap().kind, "binary");
        assert_eq!(read_file_impl(f.to_str().unwrap(), true).unwrap().kind, "text");
    }

    #[test]
    fn renomeia_e_exclui() {
        let d = tmp("ren");
        let a = d.join("a.txt");
        fs::write(&a, "x").unwrap();
        let b = d.join("b.txt");
        rename_path(a.to_string_lossy().to_string(), b.to_string_lossy().to_string()).unwrap();
        assert!(b.exists() && !a.exists());
        delete_path(b.to_string_lossy().to_string()).unwrap();
        assert!(!b.exists());
    }
}
