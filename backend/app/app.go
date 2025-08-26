package app

import (
	"evostat/pkg/storage"
	"evostat/pkg/xenv"
	"log/slog"
	"strconv"
	"time"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

type App struct {
	listenAddr string
	store      storage.Storer
}

func New() App {
	ttl, _ := strconv.Atoi(xenv.GetOrDefault(xenv.AppRedisTtlN))

	store, error := storage.NewRedisStorage(
		xenv.GetOrDefault(xenv.AppRedisN),
		xenv.GetOrDefault(xenv.AppRedisPwdN),
		time.Duration(ttl),
	)
	if error != nil {
		panic(error)
	}
	return App{
		listenAddr: xenv.GetOrDefault(xenv.AppAddrN),
		store:      store,
	}
}

func (a App) Run() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.Static("/static", "static")
	e.POST("/process", Process(a.store))
	e.GET("/report/:id", Report(a.store))

	if err := e.Start(a.listenAddr); err != nil {
		slog.Error("failed to start server", "error", err)
		panic("failed to start server")
	}
}
