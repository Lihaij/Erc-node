#!/bin/sh
accountId=`jq -r ".accountId" account.json`
# echo '{"accountId":"'${accountId}'","color":"RED","templateType":"STAR"}'
curl -H "Content-type: application/json" -X POST -d '{"accountId":"'${accountId}'","color":"RED","templateType":"STAR"}' http://localhost:8081/tech-sdkwrapper/timevale/seal/addOrganizeSeal > seal.json
