# https://bun.sh/guides/ecosystem/docker
# use the official Bun image
# see all versions at https://hub.docker.com/r/oven/bun/tags
FROM oven/bun:1-alpine as base
WORKDIR /app

# install dependencies into temp directory
# this will cache them and speed up future builds
FROM base AS install
RUN mkdir -p /temp/dev
COPY package.json bun.lock /temp/dev/
RUN cd /temp/dev && bun install --frozen-lockfile

# install with --production (exclude devDependencies)
RUN mkdir -p /temp/prod
COPY package.json bun.lock /temp/prod/
RUN cd /temp/prod && bun install --frozen-lockfile --production

# copy node_modules from temp directory
# then copy all (non-ignored) project files into the image
FROM base AS prerelease
COPY --from=install /temp/dev/node_modules node_modules
COPY . .

# [optional] tests & build
ENV NODE_ENV=production
# RUN bun test
# RUN bun run build

# copy production dependencies and source code into final image
FROM base AS release
COPY --from=install /temp/prod/node_modules node_modules
COPY --from=prerelease /app/index.ts .
COPY --from=prerelease /app/print.css .
COPY --from=prerelease /app/package.json .

# install prince
VOLUME /app
ARG TARGETARCH
# https://www.princexml.com/latest/
# https://www.princexml.com/download/prince-14.2-alpine3.13-x86_64.tar.gz -o prince.tar.gz
ARG PRINCE_VER=15.1
ARG DISTRO=linux-generic
RUN echo "Building for $TARGETARCH"
RUN apk add --no-cache curl
RUN prince_arch=$([ "$TARGETARCH" == "arm64" ] && echo "aarch64-musl" || echo "x86_64") \
    && curl https://www.princexml.com/download/prince-${PRINCE_VER}-${DISTRO}-${prince_arch}.tar.gz -o prince.tar.gz \
    && mkdir prince \
    && tar -zxvf prince.tar.gz -C prince --strip-components=1 \
    && rm prince.tar.gz \
    && cd prince \
    && yes "" | ./install.sh
RUN apk add --no-cache \
    terminus-font \
    ttf-inconsolata \
    ttf-dejavu \
    font-croscore \
    font-noto \
    font-noto-extra \
    --repository=https://dl-cdn.alpinelinux.org/alpine/edge/community/

# Install fonts
RUN apk add --no-cache msttcorefonts-installer fontconfig && \
    update-ms-fonts && \
    fc-cache -f && rm -rf /var/cache/*

# run the app
USER bun
EXPOSE 8080/tcp
ENTRYPOINT [ "bun", "run", "index.ts" ]
