#!/bin/bash

SAVEIFS=$IFS
IFS=$'\n'

for file in `ls ../data/borders2 | sort -V`; do
    echo "<option value=\"$file\">$file</option>" >> ../data/select.txt
done

IFS=$SAVEIFS