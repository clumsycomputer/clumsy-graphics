FROM mcr.microsoft.com/devcontainers/base:ubuntu
USER vscode
WORKDIR /home/vscode
RUN sudo apt update
RUN sudo apt install -y clang clang-tools clangd lldb lld cmake
ENV INFER_VERSION=1.1.0
ENV PATH=/infer/bin:${PATH}
RUN sudo curl --remote-name --location "https://github.com/facebook/infer/releases/download/v$INFER_VERSION/infer-linux64-v$INFER_VERSION.tar.xz" \
    && sudo tar --directory /opt --extract --xz --file "./infer-linux64-v$INFER_VERSION.tar.xz" \
    && rm -rf "./infer-linux64-v$INFER_VERSION.tar.xz" \
    && sudo ln -s "/opt/infer-linux64-v$INFER_VERSION/bin/infer" /usr/local/bin/infer
