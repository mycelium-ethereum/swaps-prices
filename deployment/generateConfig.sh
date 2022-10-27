#!/bin/bash

mkdir -p ./output

sed -i '' "s|IMAGE_NAME|$2|g" ./deployment.yml

for filename in *.yml; do
  ytt -f "$filename" -f "$1" >> "./output/$(basename "$filename" .yml).yml"
done

