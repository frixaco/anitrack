FROM golang:1.22-alpine AS builder
 
WORKDIR /app
 
COPY . .
 
RUN go mod tidy

RUN go build -o dist/api-go .

FROM ubuntu:latest

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    xvfb \
    --no-install-recommends

RUN wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | apt-key add -

RUN sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google-chrome.list'

RUN apt-get update && apt-get install -y \
    google-chrome-stable \
    --no-install-recommends

RUN apt-get clean && rm -rf /var/lib/apt/lists/*

COPY --from=builder /app/dist/api-go ./
 
EXPOSE 4000
 
CMD [ "./api-go" ]
