package cmd

import (
	"github.com/mattmacleod/mirror-2024/server"
	"github.com/spf13/cobra"
)

// RootCmd represents the base command when called without any subcommands.
//
// This application doesn't have any subcommands at present.
var RootCmd = &cobra.Command{
	Use:   "mirror-server",
	Short: "Mirror server",
	Long:  `An API and UI for my smart mirror project.`,
	Run: func(cmd *cobra.Command, args []string) {
		logger.Info("Starting application server")

		// Start the server. This is a blocking call.
		s := server.NewServer()
		s.Start()

		logger.Info("Application server stopped")
	},
}
