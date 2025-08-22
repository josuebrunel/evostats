package app

import (
	"evostat/pkg/storage"
	"log/slog"

	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

type App struct {
	listenAddr string
	store      storage.Storer
}

func New() App {
	return App{
		listenAddr: "127.0.0.1:8080",
		store:      storage.NewJSONFile("user_data"),
	}
}

func (a App) Run() {
	e := echo.New()
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	e.POST("/process", Process(a.store))
	e.GET("/report/:id", Report(a.store))

	if err := e.Start(a.listenAddr); err != nil {
		slog.Error("failed to start server", "error", err)
		panic("failed to start server")
	}
}
