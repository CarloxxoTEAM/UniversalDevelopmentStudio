"""Gera arquivos de áudio reais (1 segundo) com etiquetas e capa, e o gabarito do ffprobe, para tests/audio.test.js.
Uso: python tests/gerar_amostras_audio.py   (requer ffmpeg, ffprobe e pillow)"""
import json, os, subprocess
from PIL import Image
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "amostras", "audio")
os.makedirs(D, exist_ok=True)
capa = os.path.join(D, "capa.png")
Image.new("RGB", (64, 64), (230, 80, 60)).save(capa)
SINE = ["-f", "lavfi", "-i", "sine=frequency=440:duration=1:sample_rate=44100"]
TAGS = {"title": "Canção de Teste", "artist": "Banda UDS", "album": "Álbum Um", "date": "2026", "track": "3/12", "genre": "Rock", "comment": "Comentário de teste"}
def meta(tags): return sum((["-metadata", f"{k}={v}"] for k, v in tags.items()), [])
COVER_IN = ["-i", capa]
def ff(nome, args):
    saida = os.path.join(D, nome)
    if os.path.exists(saida): os.remove(saida)
    subprocess.run(["ffmpeg", "-v", "error", "-y"] + args + [saida], check=True)
    return nome
ff("com-capa.mp3", SINE + COVER_IN + ["-map", "0:a", "-map", "1:v", "-c:a", "libmp3lame", "-b:a", "128k", "-ac", "2", "-c:v", "copy", "-id3v2_version", "3"] + meta(TAGS))
ff("v24-mono.mp3", SINE + ["-c:a", "libmp3lame", "-b:a", "64k", "-ar", "22050", "-ac", "1", "-id3v2_version", "4", "-write_id3v1", "1"] + meta({"title": "Música Ñandú", "artist": "Çedilha", "album": "Ação", "date": "2025", "track": "1", "genre": "Jazz"}))
ff("so-id3v1.mp3", SINE + ["-c:a", "libmp3lame", "-b:a", "128k", "-ac", "1", "-id3v2_version", "0"])
# o ffmpeg não grava ID3v1 sem ID3v2: acrescenta a etiqueta v1 (128 bytes) à mão
campo = lambda t, n: t.encode("latin-1")[:n].ljust(n, b"\0")
with open(os.path.join(D, "so-id3v1.mp3"), "ab") as f:
    f.write(b"TAG" + campo("Antiga", 30) + campo("Velha Guarda", 30) + campo("Fita", 30) + campo("1999", 4) + campo("", 28) + b"\0" + bytes([7]) + bytes([13]))
ff("com-capa.flac", SINE + COVER_IN + ["-map", "0:a", "-map", "1:v", "-c:a", "flac", "-ac", "2", "-c:v", "copy", "-disposition:v:0", "attached_pic"] + meta(TAGS))
ff("tags.ogg", SINE + ["-c:a", "libvorbis", "-q:a", "3", "-ac", "2"] + meta(TAGS))
ff("tags.opus", SINE + ["-c:a", "libopus", "-b:a", "64k", "-ac", "2"] + meta(TAGS))
ff("com-capa.m4a", SINE + COVER_IN + ["-map", "0:a", "-map", "1:v", "-c:a", "aac", "-b:a", "96k", "-ac", "2", "-c:v", "copy", "-disposition:v:0", "attached_pic"] + meta(TAGS))
ff("tags.wav", SINE + ["-c:a", "pcm_s16le", "-ar", "22050", "-ac", "1"] + meta({"title": "Onda", "artist": "Tom", "album": "Seno", "date": "2024", "genre": "Teste"}))
ff("24bits.wav", SINE + ["-c:a", "pcm_s24le", "-ar", "8000", "-ac", "2"])
verdade = {}
for nome in sorted(os.listdir(D)):
    if nome.endswith(".png") or nome.endswith(".json"): continue
    j = json.loads(subprocess.check_output(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", os.path.join(D, nome)]))
    a = next(s for s in j["streams"] if s["codec_type"] == "audio")
    verdade[nome] = {"duracao": float(j["format"]["duration"]), "taxa": int(a["sample_rate"]), "canais": int(a["channels"]),
                     "bits": int(a.get("bits_per_sample") or a.get("bits_per_raw_sample") or 0), "codec": a["codec_name"],
                     "tags": {k.lower(): v for k, v in {**(a.get("tags") or {}), **(j["format"].get("tags") or {})}.items()}}
json.dump(verdade, open(os.path.join(D, "verdade.json"), "w"), indent=1, ensure_ascii=False)
print("amostras de áudio:", ", ".join(verdade))
