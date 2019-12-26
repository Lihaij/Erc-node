FROM node:10.15.3

VOLUME ["/home/erc-server"]
WORKDIR /home/erc-server

CMD npm install && npm run prod
