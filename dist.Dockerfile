FROM debian
WORKDIR /project
RUN apt-get update
RUN apt-get --yes install ffmpeg
RUN apt-get --yes install inkscape
RUN apt-get --yes install curl
RUN curl -sL https://deb.nodesource.com/setup_16.x | bash - 
RUN apt-get --yes install nodejs
RUN npm install -g yarn
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
RUN yarn install
COPY ./clumsycomputer-graphics-renderer-v2.0.3.tgz ../clumsycomputer-graphics-renderer-v2.0.3.tgz
RUN cd .. && tar -xvzf ./clumsycomputer-graphics-renderer-v2.0.3.tgz  && cd ./package && yarn install && yarn link
CMD _graphics-renderer ${GRAPHICS_RENDERER_SUB_COMMAND}