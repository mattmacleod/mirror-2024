package api

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func handleHealth(c *gin.Context) {
	c.JSON(http.StatusOK, map[string]interface{}{"OK": true})
}

func handleHealthHead(c *gin.Context) {
	c.Status(http.StatusOK)
}
