import json
import csv

with open("Booth Data - Sheet2.csv", "r") as file:
    data = list(csv.DictReader(file))

print(data)
"""
for i in data:
    tmp = i["Zone"]
    print(tmp)
    z,_ = tmp.split("-",1)
    i["Zone"] = z

length = len(data)
json_data = {"l1":data[:length//3], "l2":data[length//3:2*length//3], "l3":data[2*length//3:]}
"""

json_data = {}
for i in data:
    i["Level"] = "l"+i["Level"]
    if "," in i["Tags"]:
        i["Tags"] = i["Tags"].split(",")
    if i["Level"] not in json_data:
        json_data[i["Level"]] = []
    json_data[i["Level"]].append(i)

with open("funtasia_data.json", "w") as file:
    json.dump(json_data, file, indent=2)
