#!/bin/bash

SAVEIFS=$IFS
IFS=$'\n'

FILES=/Users/siesta/MAMP/www/dev.example.com/public_html/data/borders/*

for f in $FILES
do
    fname=$(basename -- "$f")
    value=$(jq -r .properties.name $f)
    echo "<option value=\"$fname\">$value</option>" >> ../data/select.txt
done

IFS=$SAVEIFS