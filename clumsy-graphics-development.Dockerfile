FROM ghcr.io/clumsycomputer/clumsy-graphics-development-base
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY tsconfig.package.json ./
COPY clumsy-graphics-package.docker-compose.yml ./
COPY clumsy-graphics-package.Dockerfile ./
RUN yarn install
