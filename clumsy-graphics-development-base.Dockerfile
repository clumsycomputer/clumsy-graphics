FROM ghcr.io/clumsycomputer/clumsy-graphics-base
RUN yarn global add @playwright/test@1.22.2
RUN playwright install