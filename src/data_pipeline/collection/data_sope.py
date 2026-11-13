"""Download Wayback Machine CDX indexes for listing pages and save one JSON file per URL.

Usage:
    python fetch_cdx.py              # exact URL match (page 1 only)
    python fetch_cdx.py --prefix     # also catches sub-pages (?page=2, /toyota, ...)
"""
import argparse
import json
import re
import time
import urllib.parse
import urllib.request
from pathlib import Path

URLS = [
    "https://ikman.lk/en/ads/sri-lanka/cars",
    "https://riyasewana.com/search/cars",
    "https://riyasewana.com/search/suvs",
]

CDX_ENDPOINT = "https://web.archive.org/cdx/search/cdx"
OUT_DIR = Path('/index/CDX_indexes')


def fetch_cdx(url, prefix=False, retries=4):
    params = {
        "url": url,
        "output": "json",
        "filter": "statuscode:200",
        "matchType": "prefix" if prefix else "exact",
    }
    full = f"{CDX_ENDPOINT}?{urllib.parse.urlencode(params)}"

    #looping the sites and other variables
    for attempt in range(retries):
        try:
            req = urllib.request.Request(full, headers={"User-Agent": "university-research-project"})
            with urllib.request.urlopen(req, timeout=120) as resp:
                body = resp.read().decode("utf-8")
            return json.loads(body) if body.strip() else []
        except Exception as e:
            wait = 5 * (attempt + 1)
            print(f"  attempt {attempt + 1} failed ({e}); retrying in {wait}s")
            time.sleep(wait)
    raise RuntimeError(f"Giving up on {url}")


def rows_to_dicts(rows):
    if not rows:
        return []
    header, data = rows[0], rows[1:]
    return [dict(zip(header, r)) for r in data]


def slugify(url):
    return re.sub(r"[^a-zA-Z0-9]+", "_", url.split("://", 1)[-1]).strip("_")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--prefix", action="store_true", help="match all URLs starting with the given one")
    args = ap.parse_args()

    OUT_DIR.mkdir(exist_ok=True)
    for url in URLS:
        print(f"Fetching {url}")
        records = rows_to_dicts(fetch_cdx(url, prefix=args.prefix))
        out = OUT_DIR / f"{slugify(url)}{'_prefix' if args.prefix else ''}.json"
        out.write_text(json.dumps(records, indent=2), encoding="utf-8")
        years = sorted({r["timestamp"][:4] for r in records})
        print(f"  {len(records)} captures -> {out}  (years: {', '.join(years) or 'none'})")
        time.sleep(2)  # be polite to archive.org


if __name__ == "__main__":
    main()
