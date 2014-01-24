#! /bin/bash

N=1000
baseurl=`cat $(dirname $0)/apiurl.txt`
url="$baseurl/search?fields=*all&maxResults=$N&startAt="
auth=`cat $(dirname $0)/auth.txt`
i=0
while true; do
    filename=/tmp/file-$i.txt
    echo $filename $i
    curl -s -o $filename -H "Authorization: Basic $auth" "$url$i"
    total=$(json_reformat < $filename | head -n 6 | grep total | sed -e 's/.*://' -e 's/,//')
    i=$((i + N))
    [ "$total" -lt $i ] && break
done


