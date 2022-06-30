FROM ghcr.io/clumsycomputer/graphics-renderer-base
CMD yarn install && yarn _graphics-renderer ${GRAPHICS_RENDERER_SUB_COMMAND}