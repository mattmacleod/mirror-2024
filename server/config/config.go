package config

import (
	"os"
	"sort"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/op/go-logging"
	"github.com/spf13/viper"
)

var logger = logging.MustGetLogger("config")

var defaultConfig = map[string]interface{}{
	"PORT": "8888",
	"ENV":  "debug",
}

// LoadConfigsFromDefault function sets the default configuration in Viper.
func LoadConfigsFromDefault() {
	for key, value := range defaultConfig {
		viper.SetDefault(key, value)
	}
}

// LoadConfigsFromEnv function first loads the default configuration and then
// overrides it with values from the environment. It also logs the final
// configuration to the log.
func LoadConfigsFromEnv() {
	// Load the default configuration.
	LoadConfigsFromDefault()

	// Load the environment variables.
	viper.AutomaticEnv()

	// Dump the application configuration to the log.
	logger.Info("loaded application configuration:")
	keys := viper.AllKeys()
	sort.Strings(keys)
	for _, key := range keys {
		logger.Infof("  %40s: %v", strings.ToUpper(key), viper.GetString(key))
	}

	// Set the Gin release mode. This is a global setting that affects the
	// behavior of the Gin framework. We set it here because we want to
	// avoid raising warnings about it in the log.
	gin.SetMode(Env())
}

// LogLevel returns level of logging. We explicitly use an environment
// variable, because we want to configure the logging system before
// we handle the rest of our configuration using Viper.
func LogLevel() string {
	logLevel := viper.GetString("LOG_LEVEL")
	validLogLevels := map[string]bool{"debug": true, "info": true, "notice": true, "error": true}
	if logLevel == "" {
		var isSet bool
		logLevel, isSet = os.LookupEnv("LOG_LEVEL")
		if !isSet {
			return "info"
		}
	}
	_, isValid := validLogLevels[logLevel]
	if !isValid {
		return "info"
	}
	return logLevel
}

// Port returns the port that the application should listen on for incoming
// HTTP requests.
func Port() string {
	return viper.GetString("PORT")
}

// Env returns the execution environment of the application. Can be "debug",
// "release", or "test".
func Env() string {
	return viper.GetString("ENV")
}
