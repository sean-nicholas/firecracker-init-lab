FROM golang:1.18-alpine as build

WORKDIR /go/src/github.com/alexellis/firecracker-init-lab/init

COPY init .

RUN go build --tags netgo --ldflags '-s -w -extldflags "-lm -lstdc++ -static"' -o init main.go

FROM ubuntu
# FROM denoland/deno:alpine

# RUN apk add curl
# RUN apk add haveged
# RUN apk add --update nodejs npm
RUN apt-get update
RUN apt-get install -y curl
RUN apt-get install -y haveged
# RUN apt-get install -y nodejs
# RUN apt-get install -y npm
RUN apt-get install -y p7zip-full
RUN DENO_INSTALL="/root/deno" curl -fsSL https://deno.land/install.sh | sh

COPY hello.ts /root/hello.ts

COPY --from=build /go/src/github.com/alexellis/firecracker-init-lab/init/init /init

