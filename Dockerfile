# Docker with node and can exec command java
FROM node:latest
RUN apt-get -y install default-jre

ENV PORT 8080
COPY package.json /app/package.json
RUN cd /app && npm i
COPY . /app/
WORKDIR /app

CMD ["npm",  "start"]
