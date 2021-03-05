#!/bin/bash

SAVEIFS=$IFS
IFS=$'\n'

FILES=/Users/siesta/MAMP/www/dev.example.com/public_html/data/borders/*

for f in $FILES
do
    dirname="$(dirname -- $f)"
    code=$(jq -r .properties.iso_a2 $f)
    
    if [ ${#code} -eq 2 ]; then
        mv $f "$dirname/$code.json"
    fi
done

IFS=$SAVEIFS