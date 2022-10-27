#!/bin/bash

mkdir -p ./output
rm -rf ./output

for filename in *.yml; do
  ytt -f "$filename" -f "$1" >> "./output/$(basename "$filename" .yml).yml"
done

sed -i '' "s|IMAGE_NAME|$2|g" ./output/deployment.yml
