package api

import (
	"github.com/gin-gonic/gin"
)

// AddRoutes will add the API routes to the supplied router.
func AddRoutes(router *gin.Engine) {

	// Basic versioning support.
	apiGroup := router.Group("/api/v1")

	// Add top-level endpoints
	apiGroup.GET("health", handleHealth)
	apiGroup.HEAD("health", handleHealthHead)
}
