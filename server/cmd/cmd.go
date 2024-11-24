package cmd

import (
	"os"

	"github.com/mattmacleod/mirror-2024/config"
	"github.com/op/go-logging"
	"github.com/spf13/cobra"
)

// The logger is initially nil and must be configured by init
var logger = logging.MustGetLogger("cmd")

// The init function hooks up the cobra command system to start by initialising
// the logging system and the configuration package.
func init() {
	cobra.OnInitialize(initLogging, config.LoadConfigsFromEnv)
}

// Execute adds all child commands to the root and sets flags appropriately.
func Execute() {
	if err := RootCmd.Execute(); err != nil {
		logger.Fatalf("failed to launch: %v", err)
	}
}

// The initLogging function initializes the logging system, which is the first
// thing that is done before anything else.
func initLogging() {
	// Create a nice log formatter which matches our log format.
	logging.SetFormatter(
		logging.MustStringFormatter(
			`%{color:bold}%{time:2006-01-02T15:04:05Z-07:00} %{level:.3s} %{module} %{color:reset}%{message}`,
		),
	)

	// Log to stderr.
	loggingBackend := logging.NewLogBackend(os.Stderr, "", 0)
	mod := logging.AddModuleLevel(loggingBackend)

	// Determine the logging level to use.
	logLevel := config.LogLevel()

	// Configure the logging level.
	level, err := logging.LogLevel(logLevel)
	if err != nil {
		level = logging.INFO
	}
	mod.SetLevel(level, "")
	logging.SetBackend(mod)
}
