#!/bin/bash
for unit_num in {1..10}; do
  f="u$unit_num.js"
  
  # Count object-format options (with "val")
  obj_opts=$(head -c 200000 "$f" | grep -o '"o":\[{' | wc -l)
  
  # Count string-format options (without "val") 
  str_opts=$(head -c 200000 "$f" | grep -o '"o":\["' | wc -l)
  
  echo "u$unit_num: obj_options=$obj_opts str_options=$str_opts"
done
