package server

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strings"

	"github.com/gin-contrib/gzip"
	"github.com/gin-gonic/gin"
	"github.com/mattmacleod/mirror-2024/config"
	"github.com/mattmacleod/mirror-2024/server/api"

	logging "github.com/op/go-logging"
)

var logger = logging.MustGetLogger("server")

// A Server is a wrapper around the main HTTP server
type Server struct {
	port   string
	router *gin.Engine
}

// NewServer returns a newly initialized server instance.
func NewServer() *Server {
	return &Server{
		port:   config.Port(),
		router: gin.New(),
	}
}

// Start launches the HTTP server. This method will not return until the server
// is shutdown.
func (s *Server) Start() {
	// First setup the static handlers. This order is required, otherwise Gin
	// complains about thread safety.
	s.addStaticHandler()

	// Set up new router with own log handler
	s.router.Use(gin.LoggerWithFormatter(loggingHandler))
	s.router.Use(gin.Recovery())

	addr := fmt.Sprintf(":%v", s.port)
	logger.Infof("starting UI server on %v", addr)

	// Add additional middleware and handlers
	s.addCORSHandler()
	s.addCompressionMiddleware()
	s.addUIHandler()
	s.add404Handler()

	// Add API routes
	api.AddRoutes(
		s.router,
	)

	s.listenAndServe(addr)
}

// Add CORS header handling
func (s *Server) addCORSHandler() {
	s.router.Use(func(c *gin.Context) {
		c.Writer.Header().Set("Access-Control-Allow-Origin", "*")
		c.Writer.Header().Set("Access-Control-Allow-Credentials", "true")
		c.Writer.Header().Set("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Writer.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		c.Next()
	})
}

// Add compression middleware, skipping compression for assets (these are
// precompressed and served directly by the filesystem)
func (s *Server) addCompressionMiddleware() {
	s.router.Use(
		gzip.Gzip(
			gzip.BestCompression,
			gzip.WithExcludedPaths([]string{"/assets/"}),
			gzip.WithExcludedExtensions([]string{
				".png", ".gif", ".jpeg", ".jpg", ".woff", ".woff2",
			}),
		),
	)
}

// Add 404 handler for unknown routes
func (s *Server) add404Handler() {
	s.router.NoRoute(func(c *gin.Context) {
		path := c.Request.URL.Path
		if strings.HasPrefix(path, "/api") {
			c.JSON(http.StatusNotFound, map[string]interface{}{"Error": "Endpoint not found"})
		} else {
			c.String(http.StatusNotFound, "404 not found")
		}
	})
}

// Start a HTTP listener and handle requests. Blocks until the server is stopped.
func (s *Server) listenAndServe(listenSpec string) {
	srv := &http.Server{Addr: listenSpec, Handler: s.router}
	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.Criticalf("server error: %s", err)
		}
	}()

	logger.Info("waiting for connections")

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, os.Interrupt)
	sig := <-quit
	logger.Infof("shutting down: %+v", sig)

	if err := srv.Shutdown(context.Background()); err != nil {
		logger.Criticalf("server error: %s", err)
	}

	logger.Infof("server gracefully stopped")
}
