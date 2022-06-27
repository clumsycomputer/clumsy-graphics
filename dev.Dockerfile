FROM debian
WORKDIR /graphics-renderer
RUN apt-get update
RUN apt-get --yes install ffmpeg
RUN apt-get --yes install inkscape
RUN apt-get --yes install curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - 
RUN apt-get --yes install nodejs
RUN npm install -g yarn
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY tsconfig.dist.json ./
COPY dist.docker-compose.yml ./
COPY dist.Dockerfile ./
RUN yarn install
RUN yarn playwright install