FROM ghcr.io/clumsycomputer/clumsy-graphics-base
CMD yarn install && yarn _clumsy-graphics startDevelopment --animationModulePath=${ANIMATION_MODULE_PATH} --clientServerPort=${CLIENT_SERVER_PORT}