FROM ghcr.io/clumsycomputer/clumsy-graphics-base
CMD yarn install && yarn _clumsy-graphics ${GRAPHICS_RENDERER_SUB_COMMAND}