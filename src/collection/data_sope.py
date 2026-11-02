import requests
import pandas as pd
import json

#communicating with cdx and returning the data in a JSON file
#checking if cdx is responding.

#cdx endpoint
cdx='https://web.archive.org/cdx/search/cdx'

#defining the params
params = {
    'url':'https://ikman.lk/en/ads/sri-lanka/vehicles',
    'matchType':'domain',
    'from':2019,
    'to':2026,
    'output':'json',
    'fl':'timestamp,original,statuscode',
    'limit':5
}

#sending request
response=requests.get(cdx,params=params,timeout=30)
print(response.status_code)
