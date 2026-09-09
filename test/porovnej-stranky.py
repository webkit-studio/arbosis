#!/usr/bin/env python3
"""Porovná dvě publikované stránky 1:1 — struktura, texty, obrázky, hooky.

    npm run porovnej -- <url-vzoru> <url-kopie>

K čemu to je. Obsah se mezi stránkami ve Webflow přenáší ručně v Designeru
(Data API prvky mezi stránkami přesouvat neumí — ověřeno: homepage slug
zapsat nejde, prázdný slug API odmítá a move_element napříč stránkami vrací
„Target element not found"). Po takovém přenosu není z čeho poznat, jestli se
něco neztratilo — a ztratit se dá potichu: jedna CMS vazba, jeden hook
atribut, jeden odkaz.

Skript proto stáhne obě publikované stránky a porovná šest vrstev zvlášť,
aby bylo vidět NA ČEM se liší, ne jen ŽE se liší.

Skripty a styly se z porovnání vynechávají schválně: bundle z jsDelivr i
stylopis Webflow jsou pro obě stránky stejné a jejich obsah by rozdíly
v markupu jen zašuměl.
"""
import re, sys, subprocess
from collections import Counter

def stahni(url):
    r = subprocess.run(['curl', '-sL', url], capture_output=True)
    return r.stdout.decode('utf-8', 'replace')

def telo(h):
    return h.split('<body', 1)[1] if '<body' in h else h

def bez_skriptu(b):
    return re.sub(r'<(script|style|noscript)[^>]*>.*?</\1>', ' ', b, flags=re.S)

def texty(b):
    t = re.sub(r'<[^>]+>', '\n', bez_skriptu(b))
    return [re.sub(r'\s+', ' ', x).strip() for x in t.split('\n') if x.strip()]

def hooky(b):
    return Counter(re.findall(r'\bdata-[a-z0-9-]+(?==")', bez_skriptu(b)))

def tridy(b):
    out = Counter()
    for m in re.finditer(r'class="([^"]*)"', bez_skriptu(b)):
        for c in m.group(1).split():
            out[c] += 1
    return out

def obrazky(b):
    return [m.split('/')[-1] for m in re.findall(r'<img\b[^>]*\ssrc="([^"]+)"', bez_skriptu(b))]

def odkazy(b):
    return sorted(set(re.findall(r'<a\b[^>]*\shref="([^"]+)"', bez_skriptu(b))))

def kostra(b):
    """Posloupnost tagů — struktura bez obsahu."""
    return [t.lower() for t in re.findall(r'<([a-z][a-z0-9]*)\b', bez_skriptu(b))]

def rozdil(nazev, a, b, ukaz=8):
    if isinstance(a, Counter):
        chybi = a - b
        navic = b - a
        if not chybi and not navic:
            print('  OK   %s' % nazev); return True
        print('  LIŠÍ %s' % nazev)
        if chybi: print('       chybí v kopii :', dict(list(chybi.items())[:ukaz]))
        if navic: print('       navíc v kopii :', dict(list(navic.items())[:ukaz]))
        return False
    if a == b:
        print('  OK   %s' % nazev); return True
    print('  LIŠÍ %s  (vzor %d, kopie %d)' % (nazev, len(a), len(b)))
    sa, sb = set(a), set(b)
    if sa - sb: print('       chybí v kopii :', list(sa - sb)[:ukaz])
    if sb - sa: print('       navíc v kopii :', list(sb - sa)[:ukaz])
    return False

def main():
    vzor_url, kopie_url = sys.argv[1], sys.argv[2]
    print('VZOR :', vzor_url)
    print('KOPIE:', kopie_url)
    print()
    A, B = telo(stahni(vzor_url)), telo(stahni(kopie_url))
    vsechno = []
    vsechno.append(rozdil('posloupnost HTML tagů', Counter(kostra(A)), Counter(kostra(B))))
    vsechno.append(rozdil('CSS třídy', tridy(A), tridy(B)))
    vsechno.append(rozdil('hook atributy', hooky(A), hooky(B)))
    vsechno.append(rozdil('obrázky', obrazky(A), obrazky(B)))
    vsechno.append(rozdil('odkazy', odkazy(A), odkazy(B)))
    vsechno.append(rozdil('texty', texty(A), texty(B)))
    print()
    print('VÝSLEDEK:', 'stránky jsou 1:1' if all(vsechno) else 'NAŠEL JSEM ROZDÍLY (viz výše)')
    return 0 if all(vsechno) else 1

sys.exit(main())
