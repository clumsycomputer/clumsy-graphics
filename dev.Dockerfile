FROM ghcr.io/clumsycomputer/graphics-renderer-dev-base
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY tsconfig.dist.json ./
COPY dist.docker-compose.yml ./
COPY dist.Dockerfile ./
RUN yarn install
