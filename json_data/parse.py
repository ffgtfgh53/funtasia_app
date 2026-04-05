import json
import csv

with open("Booth Data.csv", "r") as file:
    csv_reader = csv.DictReader(file)
    booths = {row["booth_id"]: row for row in csv_reader}

with open("booths.json", "w") as file:
    json.dump(booths, file, indent=2)
