# Implementation of tags

## 1. Reading tags
When parsing the json data in directory.js, use key 'Tags' to get the tags of each exhibition.

## 2. Displaying tags
With reference to tags.html in notes/directory, we can display the tags in the directory modal. Pay attention to Lines 141 and 156 in tags.html for a concrete method of implementation.

## 3. Filtering exhibitions
Add in filter capabilities to filter based on level, zone and tags. Level and Zone shld be a single select separate dropdown, while tags should have its own multiselect. The dropdowns should be as follows:
level: [b3,b2,b1,l1,l2]
zone:["Yellow","Green","Blue","Red","Purple","Orange","Brown"]
tags should be generated based on the tags in the json data.