FROM golang:1.16-alpine as build-env

# Set necessary environmet variables needed for our image
# ENV GO111MODULE=on \
#     CGO_ENABLED=0 \
#     GOOS=linux \
#     GOARCH=amd64

RUN mkdir /goApi
WORKDIR /goApi


RUN apk add --update --no-cache ca-certificates git
# Copy and download dependency using go mod
COPY goApi/go.mod .
COPY goApi/go.sum .
# COPY goApi/.env .env
RUN go mod download

# Copy and build the app
COPY ./goApi .

RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -a -installsuffix cgo -o /go/bin/api

EXPOSE 8000

# <- Second step to build minimal image
FROM scratch 
COPY --from=build-env /go/bin/api /go/bin/api
ENTRYPOINT ["/go/bin/api"]
# RUN go build -o main .

# WORKDIR /dist

# RUN cp /build/main .

# EXPOSE 8000

# CMD ["/dist/main"]