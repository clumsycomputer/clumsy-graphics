FROM clumsycomputer/graphics-renderer-base
COPY ./package.json ./package.json
COPY ./yarn.lock ./yarn.lock
RUN yarn install
CMD yarn _graphics-renderer ${GRAPHICS_RENDERER_SUB_COMMAND}