"""Gera os ícones de um tipo de arquivo (Estilo 1 e 2, preto e branco) seguindo as regras de assets-design/icones-base/leia-me.txt.

Uso:
    python scripts/gerar_icone.py SIGLA nome [categoria]
    python scripts/gerar_icone.py --pastas      (refaz os ícones de pasta)
Exemplo:
    python scripts/gerar_icone.py GML gml 12_extras
Cria 4 PNGs de 100x100 em src/icones/estilo1|estilo2/<categoria>/preto|branco/<nome>.png.
Depois registre a extensão em src/icones/indice.js (veja ReadMe/icones.md).
Requer: pip install pillow
"""
import os, sys
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FONTE = os.path.join(RAIZ, "assets-design", "icones-base", "fonte")
K = 8  # supersampling para bordas suaves
COR = {"branco": (255, 255, 255), "preto": (0, 0, 0)}


def fonte(px, condensada=False):
    nome = "dejavusanscondensed-bold.ttf" if condensada else "dejavusans-bold.ttf"
    return ImageFont.truetype(os.path.join(FONTE, nome), int(px * K))


def melhor_fonte(texto, max_px, max_larg):
    """Maior fonte (até max_px) em que o texto cabe em max_larg; usa a condensada em rótulos longos."""
    d = ImageDraw.Draw(Image.new("L", (10, 10)))
    for cond in (False, True):
        px = max_px
        while px > 8:
            f = fonte(px, cond)
            if d.textlength(texto, font=f) <= max_larg * K:
                return f
            px -= 1
    return fonte(8, True)


def linha(d, pts, larg, cor):
    pts = [(x * K, y * K) for x, y in pts]
    d.line(pts, fill=cor, width=int(larg * K), joint="curve")
    r = larg * K / 2
    for x, y in pts:
        d.ellipse((x - r, y - r, x + r, y + r), fill=cor)


def estilo1(texto, cor):
    c = COR[cor]
    corpo = Image.new("RGBA", (100 * K, 100 * K), (0, 0, 0, 0))
    d = ImageDraw.Draw(corpo)
    linha(d, [(20, 5), (58, 5), (80, 27), (80, 95), (20, 95), (20, 5)], 6, c + (255,))
    linha(d, [(58, 5), (58, 27), (80, 27)], 6, c + (255,))
    f = melhor_fonte(texto, 30, 66)
    # apaga o contorno atrás do texto (margem de 4 px) e depois escreve o texto
    mascara = Image.new("L", corpo.size, 0)
    ImageDraw.Draw(mascara).text((50 * K, 64 * K), texto, font=f, anchor="mm", fill=255, stroke_width=4 * K, stroke_fill=255)
    corpo.paste((0, 0, 0, 0), mask=mascara)
    ImageDraw.Draw(corpo).text((50 * K, 64 * K), texto, font=f, anchor="mm", fill=c + (255,))
    return corpo.resize((100, 100), Image.LANCZOS)


def estilo2(texto, cor):
    c = COR[cor]
    oposta = COR["preto" if cor == "branco" else "branco"]
    im = Image.new("RGBA", (100 * K, 100 * K), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((4 * K, 16 * K, 96 * K, 84 * K), radius=10 * K, fill=c + (255,))
    f = melhor_fonte(texto, 36, 80)
    d.text((50 * K, 50 * K), texto, font=f, anchor="mm", fill=oposta + (255,))
    return im.resize((100, 100), Image.LANCZOS)


# ---- Ícones de pasta (fechada e aberta), no mesmo traço dos ícones de arquivo ----
def _poly(d, pts, c, preencher):
    """Polígono com cantos arredondados: preenchido (Estilo 2) ou só contorno de 6 px (Estilo 1)."""
    if preencher:
        d.polygon([(x * K, y * K) for x, y in pts], fill=c + (255,))
        linha(d, pts + [pts[0]], 8, c + (255,))
    else:
        linha(d, pts + [pts[0]], 6, c + (255,))


def pasta(cor, aberta=False, preenchida=False):
    c = COR[cor]
    ins = 4 if preenchida else 0  # o preenchimento engrossa 4 px para cada lado
    def i(x, y, dx, dy):
        return (x + ins * dx, y + ins * dy)
    if not aberta:
        pts = [i(8, 84, 1, -1), i(8, 16, 1, 1), i(38, 16, 0, 1), i(46, 26, 0, 1), i(92, 26, -1, 1), i(92, 84, -1, -1)]
        im = Image.new("RGBA", (100 * K, 100 * K), (0, 0, 0, 0))
        _poly(ImageDraw.Draw(im), pts, c, preenchida)
        return im.resize((100, 100), Image.LANCZOS)
    fundo = [i(8, 84, 1, -1), i(8, 16, 1, 1), i(38, 16, 0, 1), i(46, 26, 0, 1), i(80, 26, -1, 1), i(80, 60, -1, 0)]
    frente = [i(8, 84, 1, -1), i(22, 44, 1, 1), i(96, 44, -1, 1), i(82, 84, -1, -1)]
    im = Image.new("RGBA", (100 * K, 100 * K), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if preenchida:
        d.polygon([(x * K, y * K) for x, y in fundo], fill=c + (255,)); linha(d, fundo + [fundo[0]], 8, c + (255,))
        folga = Image.new("L", im.size, 0)  # recorte de 4 px entre o fundo e a aba da frente
        fd = ImageDraw.Draw(folga)
        fd.polygon([(x * K, y * K) for x, y in frente], fill=255); linha(fd, frente + [frente[0]], 16, 255)
        im.paste((0, 0, 0, 0), mask=folga)
        d = ImageDraw.Draw(im)
        _poly(d, frente, c, True)
    else:
        linha(d, fundo[:-1] + [(80, 44)], 6, c + (255,))
        folga = Image.new("L", im.size, 0)  # apaga o fundo atrás da aba da frente
        ImageDraw.Draw(folga).polygon([(x * K, y * K) for x, y in frente], fill=255)
        im.paste((0, 0, 0, 0), mask=folga)
        _poly(ImageDraw.Draw(im), frente, c, False)
    return im.resize((100, 100), Image.LANCZOS)


def gerar_pastas(destino=None):
    base = destino or os.path.join(RAIZ, "src", "icones")
    for est, cheia in (("estilo1", False), ("estilo2", True)):
        for cor in ("preto", "branco"):
            pasta_dir = os.path.join(base, est, "00_pastas", cor)
            os.makedirs(pasta_dir, exist_ok=True)
            pasta(cor, False, cheia).save(os.path.join(pasta_dir, "pasta.png"))
            pasta(cor, True, cheia).save(os.path.join(pasta_dir, "pasta-aberta.png"))


def gerar(texto, nome, categoria, destino=None):
    base = destino or os.path.join(RAIZ, "src", "icones")
    feitos = []
    for est, fn in (("estilo1", estilo1), ("estilo2", estilo2)):
        for cor in ("preto", "branco"):
            pasta = os.path.join(base, est, categoria, cor)
            os.makedirs(pasta, exist_ok=True)
            caminho = os.path.join(pasta, nome + ".png")
            fn(texto, cor).save(caminho)
            feitos.append(caminho)
    return feitos


if __name__ == "__main__":
    if sys.argv[1:2] == ["--pastas"]:
        gerar_pastas()
        sys.exit("ícones de pasta gerados em src/icones/*/00_pastas/")
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    for f in gerar(sys.argv[1], sys.argv[2], sys.argv[3] if len(sys.argv) > 3 else "12_extras"):
        print("criado:", os.path.relpath(f, RAIZ))
