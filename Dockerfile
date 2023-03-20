# Docker with node and can exec command java
FROM ubuntu:latest

RUN apt-get install -y curl \
  && curl -sL https://deb.nodesource.com/setup_9.x | bash - \
  && apt-get install -y nodejs \
  && curl -L https://www.npmjs.com/install.sh | sh
ENV PORT 8080
COPY package.json /app/package.json
RUN cd /app && npm i
COPY . /app/
WORKDIR /app

CMD ["npm",  "start"]
