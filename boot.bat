docker run --rm -p 0.0.0.0:33306:3306 --name ncadb -v D:/docker/mysql/logs:/logs -v D:/docker/mysql/data:/var/lib/mysql -e MYSQL_ROOT_PASSWORD=123456 -d mysql:5.7

docker run --rm -p 127.0.0.1:16379:6379 --name ncaredis -d redis:3.2.10

docker run --rm -p 27017:27017 --name ncamongo -d mongo:3.4
