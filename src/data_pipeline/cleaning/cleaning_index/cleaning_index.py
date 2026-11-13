""" This file is for cleaning the captured indexes of the archives. here I am using pandas to parse through the code"""

import pandas as pd
import numpy as np
import json

df = pd.read_json(json_file)
print(df.head())