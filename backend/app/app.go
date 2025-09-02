package app

import (
	"evostat/pkg/storage"
	"evostat/pkg/xenv"
	"strconv"
	"time"

	"github.com/josuebrunel/gopkg/xlog"
	"github.com/labstack/echo"
	"github.com/labstack/echo/middleware"
)

type App struct {
	listenAddr string
	store      storage.Storer
}

func New() App {
	ttlV, _ := strconv.Atoi(xenv.GetOrDefault(xenv.AppCacheTtlN))

	ttl := time.Duration(ttlV)
	store, err := storage.NewGoCacheStorage(ttl*time.Second, ttl*time.Second)
	if err != nil {
		xlog.Error("failed to create storage", "error", err)
		panic(err)
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
	e.GET("/report/:id/csv", ExportCSV(a.store))
	e.GET("/privacy", PrivacyPolicy())

	if err := e.Start(a.listenAddr); err != nil {
		xlog.Error("failed to start server", "error", err)
		panic("failed to start server")
	}
	defer a.store.Close()
}
