#!/usr/bin/env python3

import sys
import json
import cgi

fs = cgi.FieldStorage()

sys.stdout.write("Content-Type: application/json")

sys.stdout.write("\n")
sys.stdout.write("\n")


d = {}
for k in fs.keys():
    d[k] = fs.getvalue(k)

sys.stdout.write(json.dumps(d,indent=1))
sys.stdout.write("\n")

sys.stdout.close()
