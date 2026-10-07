"""Gera src/componentes/marcas.js a partir dos logos em marcas/originais/<id>/.

Para cada OS: recorta as bordas vazias do logo, reduz para o tamanho usado no app,
tira o símbolo para o ícone redondo e mede as cores do próprio logo.
Uso: python3 scripts/marcas.py   (precisa do Pillow: pip install pillow)
"""
import json, pathlib
from collections import Counter
from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parent.parent
ORIG = RAIZ / "marcas" / "originais"
PUB = RAIZ / "public" / "marcas"

# Onde está o símbolo de cada logo (fração da largura/altura do logo já recortado).
# Gnosis não tem símbolo separado: usa o "G" do nome.
SIMBOLO = {
    "afne": (0.615, 0.0, 0.93, 0.46),
    "gnosis": (0.0, 0.25, 0.232, 0.82),
    "igedes": (0.0, 0.0, 0.31, 1.0),
    "fas": (0.0, 0.0, 0.43, 1.0),
}
# Cor principal (a que vai no cartão) = a mais presente no logo, salvo indicação.
NOMES = {"afne": "Associação Filantrópica Nova Esperança", "gnosis": "Instituto Gnosis", "igedes": "IGEDES", "fas": "FAS"}


def aparar(im):
    """Corta as bordas transparentes ou brancas."""
    fundo = Image.new("RGBA", im.size, (255, 255, 255, 0))
    alfa = im.getchannel("A")
    branco = Image.eval(im.convert("L"), lambda v: 0 if v > 240 else 255)
    mascara = Image.composite(branco, Image.new("L", im.size, 0), alfa.point(lambda a: 255 if a > 40 else 0))
    caixa = mascara.getbbox()
    return im.crop(caixa) if caixa else im


def cores(im, n=3):
    px = [p for p in im.getdata() if p[3] > 200 and not (p[0] > 225 and p[1] > 225 and p[2] > 225)]
    grupos = Counter(((r // 16) * 16, (g // 16) * 16, (b // 16) * 16) for r, g, b, _ in px)
    saida = []
    for (r0, g0, b0), qtd in grupos.most_common(12):
        membros = [p for p in px if (p[0] // 16) * 16 == r0 and (p[1] // 16) * 16 == g0 and (p[2] // 16) * 16 == b0]
        media = tuple(round(sum(p[i] for p in membros) / len(membros)) for i in range(3))
        if all(sum(abs(media[i] - c[0][i]) for i in range(3)) > 60 for c in saida):
            saida.append((media, qtd))
        if len(saida) == n:
            break
    return ["#%02X%02X%02X" % c for c, _ in saida]


def luminancia(hexcor):
    c = [int(hexcor[i:i + 2], 16) / 255 for i in (1, 3, 5)]
    c = [x / 12.92 if x <= 0.03928 else ((x + 0.055) / 1.055) ** 2.4 for x in c]
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]


def contraste(a, b):
    la, lb = sorted([luminancia(a), luminancia(b)], reverse=True)
    return (la + 0.05) / (lb + 0.05)


def main():
    marcas, relatorio = {}, {}
    for pasta in sorted(p for p in ORIG.iterdir() if p.is_dir()):
        oid = pasta.name
        arq = next((f for f in pasta.iterdir() if f.stem == "logo"), None)
        if not arq:
            continue
        im = aparar(Image.open(arq).convert("RGBA"))
        logo = im.copy()
        logo.thumbnail((360, 112), Image.LANCZOS)
        x0, y0, x1, y1 = SIMBOLO.get(oid, (0, 0, 1, 1))
        simb = aparar(im.crop((int(x0 * im.width), int(y0 * im.height), int(x1 * im.width), int(y1 * im.height))))
        lado = max(simb.size)
        quadro = Image.new("RGBA", (lado, lado), (255, 255, 255, 0))
        quadro.paste(simb, ((lado - simb.width) // 2, (lado - simb.height) // 2))
        quadro = quadro.resize((112, 112), Image.LANCZOS)
        cs = cores(im)
        principal = cs[0]
        # Arquivos de imagem separados (não embutidos na página): o claude.ai só analisa para compartilhar
        # imagens publicadas como arquivo, e o Next.js serve public/ direto.
        PUB.mkdir(parents=True, exist_ok=True)
        logo.save(PUB / f"{oid}-logo.png", "PNG", optimize=True)
        quadro.save(PUB / f"{oid}-icone.png", "PNG", optimize=True)
        marcas[oid] = {"logo": f"marcas/{oid}-logo.png", "icone": f"marcas/{oid}-icone.png", "cor": principal, "cores": cs}
        relatorio[oid] = {
            "nome": NOMES.get(oid, oid), "arquivo": arq.name, "tamanho_original": Image.open(arq).size,
            "cores_do_logo": cs, "cor_principal": principal,
            "contraste_sobre_cartao": round(contraste(principal, "#FFFDF9"), 2),
            "fonte": "logo enviado pela usuária (salvo do site da organização)",
        }
    js = ("/* Logos e cores das OS, tirados dos logos dos sites de cada organização.\n"
          "   Gerado por scripts/marcas.py a partir de marcas/originais/ (não editar à mão). */\n"
          "const MARCAS = " + json.dumps(marcas, ensure_ascii=False, indent=1) + ";\nexport { MARCAS };\n")
    (RAIZ / "src" / "componentes" / "marcas.js").write_text(js, encoding="utf-8")
    (ORIG / "relatorio.json").write_text(json.dumps(relatorio, ensure_ascii=False, indent=2), encoding="utf-8")
    for oid, r in relatorio.items():
        print(oid, r["cores_do_logo"], "contraste", r["contraste_sobre_cartao"])


if __name__ == "__main__":
    main()
