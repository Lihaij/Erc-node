#!/bin/sh
curl -H "Content-type: application/json" -X POST -d '{"projectConfig": {"projectId":"1111563517","projectSecret":"95439b0863c241c63a861b87d1e647b7","itsmApiUrl":"http://121.40.164.61:8080/tgmonitor/rest/app!getAPIInfo2"}}' http://localhost:8081/tech-sdkwrapper/timevale/init
