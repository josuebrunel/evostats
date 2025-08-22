NAME=evostat
SRC=./cmd/main.go
BIN=./bin/${NAME}

deps:
	go install github.com/a-h/templ/cmd/templ@latest
	go get github.com/a-h/templ@latest

templ:
	templ generate

tidy:
	go mod tidy

build: tidy templ
	go build -o ${BIN} ${SRC}

run: build
	${BIN}