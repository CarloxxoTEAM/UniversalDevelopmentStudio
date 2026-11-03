// Núcleo do UDS: tudo que toca o sistema (arquivos, terminal, configurações) fica aqui.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use serde::Serialize;
use std::io::Read;
use std::path::{Path, PathBuf};
use std::{fs, process::Command};

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
}

/// Pasta `portable/` ao lado do executável: configurações e dados do WebView ficam aqui.
fn portable_dir() -> PathBuf {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|d| d.join("portable")))
        .unwrap_or_else(|| PathBuf::from("portable"))
}

/// Identificação pelo conteúdo (magic numbers), sem depender da extensão.
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
    if b.len() > 12 && &b[0..4] == b"RIFF" && &b[8..12] == b"WAVE" {
        return Some(("audio", "audio/wav"));
    }
    if b.starts_with(b"ID3") || b.starts_with(&[0xFF, 0xFB]) {
        return Some(("audio", "audio/mpeg"));
    }
    if b.starts_with(b"OggS") {
        return Some(("audio", "audio/ogg"));
    }
    if b.starts_with(b"fLaC") {
        return Some(("audio", "audio/flac"));
    }
    if b.len() > 12 && &b[4..8] == b"ftyp" {
        return Some(("video", "video/mp4"));
    }
    if b.starts_with(&[0x1A, 0x45, 0xDF, 0xA3]) {
        return Some(("video", "video/webm"));
    }
    if b.starts_with(b"glTF") {
        return Some(("glb", "model/gltf-binary"));
    }
    None
}

#[tauri::command]
fn list_dir(path: String) -> Result<Vec<Entry>, String> {
    let mut v: Vec<Entry> = fs::read_dir(&path)
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

#[tauri::command]
fn read_file(path: String, force_text: bool) -> Result<FileInfo, String> {
    let p = Path::new(&path);
    let size = fs::metadata(p).map_err(|e| e.to_string())?.len();
    let mut head = vec![0u8; 512.min(size as usize)];
    let mut f = fs::File::open(p).map_err(|e| e.to_string())?;
    let n = f.read(&mut head).map_err(|e| e.to_string())?;
    head.truncate(n);
    if !force_text {
        if let Some((k, m)) = sniff(&head) {
            return Ok(FileInfo { kind: k.into(), mime: m.into(), text: String::new(), size });
        }
    }
    if size > 5_000_000 {
        return Err("Arquivo grande demais para o editor (limite de 5 MB).".into());
    }
    let bytes = fs::read(p).map_err(|e| e.to_string())?;
    match String::from_utf8(bytes) {
        Ok(t) => {
            let is_svg = !force_text && t.chars().take(600).collect::<String>().contains("<svg");
            let (kind, mime) = if is_svg { ("image", "image/svg+xml") } else { ("text", "text/plain") };
            Ok(FileInfo { kind: kind.into(), mime: mime.into(), text: if is_svg { String::new() } else { t }, size })
        }
        Err(e) if force_text => Ok(FileInfo {
            kind: "text".into(),
            mime: "text/plain".into(),
            text: String::from_utf8_lossy(e.as_bytes()).to_string(),
            size,
        }),
        Err(_) => Ok(FileInfo { kind: "binary".into(), mime: "application/octet-stream".into(), text: String::new(), size }),
    }
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

fn walk(dir: &Path, q: &str, out: &mut Vec<String>) {
    if out.len() >= 200 {
        return;
    }
    let Ok(rd) = fs::read_dir(dir) else { return };
    for e in rd.flatten() {
        let p = e.path();
        let name = e.file_name().to_string_lossy().to_string();
        if p.is_dir() {
            if matches!(name.as_str(), "node_modules" | ".git" | "target") {
                continue;
            }
            walk(&p, q, out);
        } else {
            let mut hit = name.to_lowercase().contains(q);
            if !hit && e.metadata().map(|m| m.len() < 1_000_000).unwrap_or(false) {
                if let Ok(t) = fs::read_to_string(&p) {
                    hit = t.to_lowercase().contains(q);
                }
            }
            if hit {
                out.push(p.to_string_lossy().to_string());
            }
        }
    }
}

#[tauri::command]
fn search(root: String, query: String) -> Vec<String> {
    let mut out = Vec::new();
    walk(Path::new(&root), &query.to_lowercase(), &mut out);
    out
}

#[tauri::command]
async fn run_command(cmd: String, cwd: Option<String>) -> Result<String, String> {
    let mut c = if cfg!(windows) {
        let mut c = Command::new("cmd");
        c.args(["/C", &cmd]);
        c
    } else {
        let mut c = Command::new("sh");
        c.args(["-c", &cmd]);
        c
    };
    if let Some(d) = cwd {
        c.current_dir(d);
    }
    #[cfg(windows)]
    {
        use std::os::windows::process::CommandExt;
        c.creation_flags(0x08000000); // sem janela de console
    }
    let o = c.output().map_err(|e| e.to_string())?;
    Ok(format!(
        "{}{}",
        String::from_utf8_lossy(&o.stdout),
        String::from_utf8_lossy(&o.stderr)
    ))
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
            search, run_command, load_config, save_config, portable_path
        ])
        .run(tauri::generate_context!())
        .expect("erro ao iniciar o UDS");
}

#[cfg(test)]
mod tests {
    use super::sniff;

    #[test]
    fn reconhece_png_sem_extensao() {
        assert_eq!(sniff(&[0x89, b'P', b'N', b'G', 0, 0]), Some(("image", "image/png")));
    }

    #[test]
    fn texto_comum_nao_e_midia() {
        assert_eq!(sniff(b"console.log('oi')"), None);
    }
}
