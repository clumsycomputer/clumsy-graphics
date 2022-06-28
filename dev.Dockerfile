FROM clumsycomputer/graphics-renderer-base
COPY package.json ./
COPY yarn.lock ./
COPY tsconfig.json ./
COPY tsconfig.dist.json ./
COPY dist.docker-compose.yml ./
COPY dist.Dockerfile ./
RUN yarn install
RUN yarn playwright install