import requests, pandas as pd

CDX = "https://web.archive.org/cdx/search/cdx"

def fetch_cdx(url, year, match="prefix"):
    params = {
        "url": url, "matchType": match, "output": "json",
        "from": str(year), "to": str(year),
        "filter": ["statuscode:200", "mimetype:text/html"],
        "fl": "timestamp,original,statuscode,mimetype,digest,length",
    }
    r = requests.get(CDX, params=params, timeout=60,
                     headers={"User-Agent": "DSGP-Group35 academic research"})
    r.raise_for_status()
    rows = r.json()
    return pd.DataFrame(rows[1:], columns=rows[0]) if rows else pd.DataFrame()
