#!/usr/bin/env python3

import dbmodule
import configparser
import sys

#Moi

sys.stdout.write("Content-Type: application/json")
sys.stdout.write("\n")
sys.stdout.write("\n")

config = configparser.ConfigParser()
config.read("config.ini")

con = dbmodule.psycopg("dbmain",config['DB']['un'],password=config['DB']['pw'])
con.query('SELECT db_name FROM  db_names WHERE id > %(id)s ',{'id':1})
rows = con.cur.fetchall()
print(rows[0])
