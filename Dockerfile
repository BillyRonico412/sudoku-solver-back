# Docker with node and can exec command java
FROM openjdk:latest

RUN apk add --update -y curl \
  && curl -sL https://deb.nodesource.com/setup_9.x | bash - \
  && apk add --update -y nodejs \
  && curl -L https://www.npmjs.com/install.sh | sh
ENV PORT 8080
COPY package.json /app/package.json
RUN cd /app && npm i
COPY . /app/
WORKDIR /app

CMD ["npm",  "start"]
