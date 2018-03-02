#!/usr/bin/env python3

import dbmodule
import configparser
import sys
import cgi
import json

#collecting GET data
fs = cgi.FieldStorage()
d = {}
for k in fs.keys():
    d[k] = fs.getvalue(k)


#headers:
sys.stdout.write("Content-Type: application/json")
sys.stdout.write("\n")
sys.stdout.write("\n")

#database config
config = configparser.ConfigParser()
config.read("config.ini")

con = dbmodule.psycopg("pest_inter",config['DB']['un'],password=config['DB']['pw'])

#codes = d["codes[]"]
codes = tuple(["un_priv_employment_agen_1997_sv", "un_medic_exam_young_ind_1946_sv"])

rows = con.FetchQuery('SELECT startaddr, finaddr FROM librarysrc WHERE code IN %(codes)s',{'codes':codes},flatten=True)
rows = [str(row) for row in rows]
print(rows)

#sys.stdout.write(json.dumps(rows,indent=1))
sys.stdout.write("\n")

sys.stdout.close()
