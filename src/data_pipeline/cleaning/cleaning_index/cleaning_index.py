""" This file is for cleaning the captured indexes of the archives. here I am using pandas to parse through the code"""

import pandas as pd
import json
import data.CDX_indexes as cdi
import os
from pathlib import Path

#code to cycle through the CSV files
file = sorted(Path('data').glob('*.json'))
