"""Read raw CDX json files, clean them, write json to data/processed/."""
import ast
import json
from pathlib import Path

import pandas as pd

ROOT = Path(__file__).resolve().parents[4]
RAW = ROOT / "data" / "raw" / "CDX_indexes"
OUT = ROOT / "data" / "processed"
OUT.mkdir(parents=True, exist_ok=True)

CDX_COLS = ["urlkey", "timestamp", "original", "mimetype",
            "statuscode", "digest", "length"]
JUNK_EXT = r"\.(?:css|js|png|jpe?g|gif|svg|ico|woff2?|ttf|json|xml|txt|pdf|webp)(?:\?|$)"


def parse_text(text: str):
    """Try strict JSON, then Python-literal, then line by line."""
    text = text.strip()
    for parser in (json.loads, ast.literal_eval):
        try:
            return parser(text)
        except (ValueError, SyntaxError):
            pass
    rows = []
    for line in text.splitlines():
        line = line.strip().rstrip(",")
        if line in ("", "[", "]"):
            continue
        for parser in (json.loads, ast.literal_eval):
            try:
                rows.append(parser(line))
                break
            except (ValueError, SyntaxError):
                pass
    return rows


def to_records(obj) -> list[dict]:
    """Flatten pages / header rows / dicts into a list of record dicts."""
    if isinstance(obj, dict):
        if "original" in obj or "timestamp" in obj:      # a single record
            return [obj]
        return [r for v in obj.values() for r in to_records(v)]
    if isinstance(obj, list):
        if obj and all(isinstance(x, str) for x in obj):
            if obj == CDX_COLS[:len(obj)] or "timestamp" in obj:
                return []                                 # a header row
            return [dict(zip(CDX_COLS, obj))]             # a headerless row
        if obj and isinstance(obj[0], list) and "timestamp" in obj[0]:
            header = obj[0]                               # page with header
            return [dict(zip(header, row)) for row in obj[1:]]
        return [r for x in obj for r in to_records(x)]
    return []


def clean(records: list[dict]) -> pd.DataFrame:
    df = pd.DataFrame(records)
    df = df[(df["statuscode"].astype(str) == "200")
            & (df["mimetype"].astype(str).str.lower() == "text/html")]
    df = df[~df["original"].str.contains(JUNK_EXT, case=False, regex=True)]
    df = df.assign(ts=pd.to_datetime(df["timestamp"], format="%Y%m%d%H%M%S",
                                     errors="coerce")).dropna(subset=["ts"])
    df = df.sort_values("ts").drop_duplicates(subset=["original", "digest"])
    df["year_month"] = df["ts"].dt.strftime("%Y-%m")
    df["timestamp_iso"] = df["ts"].dt.strftime("%Y-%m-%dT%H:%M:%S")
    return df.drop(columns="ts").reset_index(drop=True)


for path in sorted(RAW.glob("*.json")):
    text = path.read_text(encoding="utf-8")
    records = to_records(parse_text(text))
    if not records:
        print(f"{path.name}: NO RECORDS PARSED. File starts with:\n{text[:300]!r}\n")
        continue
    df = clean(records)
    out = OUT / f"{path.stem}_clean.json"
    df.to_json(out, orient="records", indent=2)
    print(f"{path.name}: {len(records)} raw -> {len(df)} clean -> {out.name}")
    print(df.groupby("year_month").size().to_string(), "\n")