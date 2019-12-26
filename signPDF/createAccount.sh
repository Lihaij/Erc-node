#!/bin/sh
curl -H "Content-type: application/json" -X POST -d '{"name":"中山乐宜嘉家居设备有限公司","organType":"0","organCode":"442000400012534","regType":"REGCODE"}' http://localhost:8081/tech-sdkwrapper/timevale/account/addOrganize > account.json
