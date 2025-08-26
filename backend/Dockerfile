# Build
FROM    golang:latest AS build

ENV     GO111MODULE=on
ENV     CGO_ENABLED=0

RUN     mkdir /go/src/app
WORKDIR /go/src/app
ADD     . /go/src/app
ENV 	GOCACHE=/root/.cache/go-build
RUN 	--mount=type=cache,target="/root/.cache/go-build"
RUN     make deps
RUN     make build
EXPOSE  8080 


# Subscriber
FROM alpine:latest AS subscriber
RUN  mkdir /opt/evostats/
WORKDIR /opt/evostats/
COPY --from=build  /go/src/app/bin/evostats /opt/evostats/evostats
CMD [ "./evostats" ]
