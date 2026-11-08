"""Gera os arquivos reais de amostra usados em tests/deteccao.test.js. Uso: python tests/gerar_amostras.py (requer pillow)."""
import bz2, gzip, io, os, sqlite3, tarfile, wave, zipfile
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "amostras")
os.makedirs(D, exist_ok=True)
im = Image.new("RGB", (8, 8), (200, 40, 40))
for nome, fmt in [("amostra.png", "PNG"), ("amostra.jpg", "JPEG"), ("amostra.gif", "GIF"), ("amostra.webp", "WEBP"), ("amostra.bmp", "BMP"), ("amostra.tiff", "TIFF")]:
    im.save(os.path.join(D, nome), fmt)
Image.new("RGBA", (16, 16), (0, 0, 0, 255)).save(os.path.join(D, "amostra.ico"), "ICO")
open(os.path.join(D, "amostra.pdf"), "wb").write(b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n")
with wave.open(os.path.join(D, "amostra.wav"), "wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(8000); w.writeframes(b"\x00\x00" * 100)
open(os.path.join(D, "amostra.gz"), "wb").write(gzip.compress(b"ola"))
open(os.path.join(D, "amostra.bz2"), "wb").write(bz2.compress(b"ola"))
with tarfile.open(os.path.join(D, "amostra.tar"), "w") as t:
    i = tarfile.TarInfo("a.txt"); i.size = 3; t.addfile(i, io.BytesIO(b"ola"))
def z(nome, entradas, **kw):
    with zipfile.ZipFile(os.path.join(D, nome), "w", **kw) as f:
        for n, c, tipo in entradas:
            f.writestr(zipfile.ZipInfo(n), c, compress_type=tipo)
S, F = zipfile.ZIP_STORED, zipfile.ZIP_DEFLATED
z("amostra.zip", [("a.txt", "ola", F)])
z("amostra.docx", [("[Content_Types].xml", "<Types/>", F), ("word/document.xml", "<w/>", F)])
z("amostra.xlsx", [("[Content_Types].xml", "<Types/>", F), ("xl/workbook.xml", "<w/>", F)])
z("amostra.epub", [("mimetype", "application/epub+zip", S), ("META-INF/container.xml", "<c/>", F)])
z("amostra.odt", [("mimetype", "application/vnd.oasis.opendocument.text", S), ("content.xml", "<c/>", F)])
z("amostra.jar", [("META-INF/MANIFEST.MF", "Manifest-Version: 1.0\n", F)])
con = sqlite3.connect(os.path.join(D, "amostra.sqlite")); con.execute("create table t(a)"); con.commit(); con.close()
print("amostras geradas em", D)
