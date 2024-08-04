FROM golang:1.22-alpine AS builder
 
WORKDIR /app
 
COPY apps/api-go/ .
 
RUN go mod tidy

RUN go build -o dist/api-go .

FROM alpine:latest

COPY --from=builder /app/dist/api-go ./
 
EXPOSE 4000
 
CMD [ "./api-go" ]
