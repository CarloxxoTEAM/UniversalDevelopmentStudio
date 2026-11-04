"""Monta a pasta portátil e o ZIP de uma plataforma. Uso: python scripts/package.py windows|linux|macos"""
import json, pathlib, shutil, sys, zipfile

plat = sys.argv[1]
root = pathlib.Path(__file__).resolve().parent.parent
name = "UniversalDevelopmentStudio"
ver = json.loads((root / "src-tauri/tauri.conf.json").read_text(encoding="utf-8"))["version"]
exe = root / "src-tauri/target/release" / (name + (".exe" if plat == "windows" else ""))
out = root / "dist-portable"
pkg = out / name

shutil.rmtree(out, ignore_errors=True)
pkg.mkdir(parents=True)
shutil.copy2(exe, pkg / exe.name)
for d in ["portable", "plugins", "languages", "projects", "ReadMe"]:
    if (root / d).exists():
        shutil.copytree(root / d, pkg / d)
for f in ["README.md", "LICENSE"]:
    if (root / f).exists():
        shutil.copy2(root / f, pkg / f)

zip_path = out / f"{name}-{ver}-{plat}.zip"
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for p in sorted(pkg.rglob("*")):
        if p.is_file():
            info = zipfile.ZipInfo.from_file(p, p.relative_to(out).as_posix())
            info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, p.read_bytes())
print("Pacote:", zip_path)
