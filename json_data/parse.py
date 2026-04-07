import json
import csv

with open("Funtasia Booth.csv", "r") as file:
    data = list(csv.DictReader(file))

print(data)
for i in data:
    tmp = i["Zone"]
    # print(tmp)
    z,_ = tmp.split("-",1)
    i["Zone"] = z

length = len(data)
json_data = {"l1":data[:length//3], "l2":data[length//3:2*length//3], "l3":data[2*length//3:]}

with open("funtasia_data.json", "w") as file:
    json.dump(json_data, file, indent=2)
