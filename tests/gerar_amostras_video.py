"""Gera vídeos reais curtos (ffmpeg) e o gabarito do ffprobe, para tests/video.test.js.
Uso: python tests/gerar_amostras_video.py   (requer ffmpeg e ffprobe)"""
import json, os, subprocess
D = os.path.join(os.path.dirname(os.path.abspath(__file__)), "amostras", "video")
os.makedirs(D, exist_ok=True)
def entrada(w, h, fps, dur=1.0, audio=True):
    a = ["-f", "lavfi", "-i", f"testsrc=size={w}x{h}:rate={fps}:duration={dur}"]
    if audio: a += ["-f", "lavfi", "-i", f"sine=frequency=440:sample_rate=44100:duration={dur}"]
    return a
def ff(nome, args):
    s = os.path.join(D, nome)
    if os.path.exists(s): os.remove(s)
    subprocess.run(["ffmpeg", "-v", "error", "-y"] + args + [s], check=True)
H264 = ["-c:v", "libx264", "-preset", "ultrafast", "-pix_fmt", "yuv420p"]
AAC = ["-c:a", "aac", "-b:a", "96k", "-ac", "2"]
META = ["-metadata", "title=Vídeo de Teste", "-metadata", "creation_time=2026-03-04T05:06:07Z"]
ff("h264-aac-moov-no-fim.mp4", entrada(160, 120, 25) + H264 + AAC + META)
ff("h264-aac-faststart.mp4", entrada(320, 180, 30) + H264 + ["-profile:v", "high"] + AAC + ["-movflags", "+faststart"] + META)
ff("h264-sem-audio.mp4", entrada(128, 96, 24, audio=False) + H264 + ["-profile:v", "baseline"])
ff("hevc.mp4", entrada(160, 120, 25) + ["-c:v", "libx265", "-preset", "ultrafast", "-pix_fmt", "yuv420p", "-tag:v", "hvc1", "-x265-params", "log-level=none"] + AAC)
ff("fragmentado.mp4", entrada(160, 120, 25) + H264 + AAC + ["-movflags", "frag_keyframe+empty_moov"])
ff("quicktime.mov", entrada(160, 120, 25) + H264 + AAC)
ff("celular.3gp", entrada(176, 144, 15) + ["-c:v", "h263", "-c:a", "aac", "-ac", "1", "-ar", "8000", "-b:a", "12k"])
ff("vp9-opus.webm", entrada(160, 120, 25) + ["-c:v", "libvpx-vp9", "-b:v", "200k", "-c:a", "libopus", "-b:a", "64k"])
ff("vp8-vorbis.webm", entrada(192, 108, 30) + ["-c:v", "libvpx", "-b:v", "200k", "-c:a", "libvorbis", "-ac", "2"])
ff("h264-aac.mkv", entrada(160, 120, 25) + H264 + AAC + ["-metadata", "title=Vídeo MKV"])
ff("av1.mkv", entrada(160, 120, 25, audio=False) + ["-c:v", "libsvtav1", "-preset", "12"])
ff("mpeg4-mp3.avi", entrada(160, 120, 25) + ["-c:v", "mpeg4", "-c:a", "libmp3lame", "-b:a", "96k"])
ff("mjpeg-pcm.avi", entrada(96, 64, 10) + ["-c:v", "mjpeg", "-c:a", "pcm_s16le"])
ff("flv-h264.flv", entrada(160, 120, 25) + H264 + ["-c:a", "aac", "-b:a", "96k"])
ff("theora-vorbis.ogv", entrada(160, 120, 25) + ["-c:v", "libtheora", "-q:v", "5", "-c:a", "libvorbis"])
ff("mpeg2.mpg", entrada(160, 120, 25) + ["-c:v", "mpeg2video", "-c:a", "mp2"])
ff("mpegts.m2ts", entrada(160, 120, 25) + H264 + AAC + ["-f", "mpegts"])
ff("transporte.ts", entrada(160, 120, 25) + H264 + AAC + ["-f", "mpegts"])
ff("wmv2.wmv", entrada(160, 120, 25) + ["-c:v", "wmv2", "-c:a", "wmav2"])
ff("prores.mov", entrada(160, 120, 25, audio=False) + ["-c:v", "prores_ks", "-profile:v", "1"])
# vídeo girado (celular): matriz de rotação de 90 graus no tkhd
ff("girado.mp4", ["-display_rotation", "90"] + ["-i", os.path.join(D, "h264-aac-moov-no-fim.mp4"), "-c", "copy"])
verdade = {}
for nome in sorted(os.listdir(D)):
    if nome.endswith(".json"): continue
    j = json.loads(subprocess.check_output(["ffprobe", "-v", "quiet", "-print_format", "json", "-show_format", "-show_streams", os.path.join(D, nome)]))
    v = next((s for s in j["streams"] if s["codec_type"] == "video"), None)
    a = next((s for s in j["streams"] if s["codec_type"] == "audio"), None)
    def fr(x):
        n, d = x.split("/"); return float(n) / float(d) if float(d) else 0
    rot = 0
    if v:
        for sd in v.get("side_data_list") or []:
            if "rotation" in sd: rot = int(sd["rotation"])
        if "rotate" in (v.get("tags") or {}): rot = int(v["tags"]["rotate"])
    verdade[nome] = {
        "duracao": float(j["format"]["duration"]), "tags": {k.lower(): x for k, x in (j["format"].get("tags") or {}).items()},
        "video": None if not v else {"codec": v["codec_name"], "largura": v["width"], "altura": v["height"], "fps": fr(v.get("avg_frame_rate", "0/1")) or fr(v.get("r_frame_rate", "0/1")), "perfil": v.get("profile"), "nivel": v.get("level"), "rotacao": rot, "bitrate": int(v.get("bit_rate") or 0)},
        "audio": None if not a else {"codec": a["codec_name"], "canais": int(a["channels"]), "taxa": int(a["sample_rate"]), "bitrate": int(a.get("bit_rate") or 0)}, "bitrate": int(j["format"].get("bit_rate") or 0)}
json.dump(verdade, open(os.path.join(D, "verdade.json"), "w"), indent=1, ensure_ascii=False)
print("amostras de vídeo:", ", ".join(verdade))
