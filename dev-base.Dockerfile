FROM ghcr.io/clumsycomputer/graphics-renderer-base
RUN yarn global add @playwright/test@1.22.2
RUN playwright install