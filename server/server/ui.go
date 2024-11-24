package server

import (
	"embed"
	"encoding/json"
	"fmt"
	"html/template"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/lpar/gzipped/v2"
	"github.com/mattmacleod/mirror-2024/config"
)

type viteManifest map[string]viteManifestEntry
type viteManifestEntry struct {
	File           string   `json:"file"`
	Name           string   `json:"name"`
	Src            string   `json:"src"`
	IsEntry        bool     `json:"isEntry"`
	IsDynamicEntry bool     `json:"isDynamicEntry"`
	Imports        []string `json:"imports"`
	DynamicImports []string `json:"dynamicImports"`
	CSS            []string `json:"css"`
	Assets         []string `json:"assets"`
}

// Add root redirect and UI handler
func (s *Server) addUIHandler() {
	s.router.GET("", handleUIRedirect)
	s.router.GET("/ui/*path", handleUI)
}

func handleUIRedirect(c *gin.Context) {
	c.Redirect(302, "/ui")
}

func handleUI(c *gin.Context) {
	c.HTML(200, "index.tmpl", nil)
}

func (s *Server) getUITemplate(scriptTags string) string {

	// Create configuration script
	configScript := s.getConfigScript()

	return fmt.Sprintf(`
    <!DOCTYPE html>
    <html>
      <head>
        <script>%s</script>
        %s
        <title>Mirror</title>
			</head>
      <body>
        <div id='AppRoot' class='AppRoot'></div>
      </body>
    </html>
  `, configScript, scriptTags)
}

func (s *Server) getConfigScript() string {
	config := map[string]interface{}{
		"env": config.Env(),
	}

	json, err := json.Marshal(config)
	if err != nil {
		logger.Warning("Failed to encode configuration: %s", err)
		return ""
	}

	return fmt.Sprintf("window.config=%s", json)
}

//go:embed all:assets
var staticServer embed.FS

// Handle requests for static assets – HTML home page, config, and assets
func (s *Server) addStaticHandler() {
	// If we are in release mode, we need to load the Vite manifest to
	// determine the correct hashed filenames for the assets. In development
	// mode, we can just leave that to the Vite server.
	scriptTags := `
		<script type="module">
			import RefreshRuntime from 'http://localhost:5173/assets/@react-refresh'
			RefreshRuntime.injectIntoGlobalHook(window)
			window.$RefreshReg$ = () => {}
			window.$RefreshSig$ = () => (type) => type
			window.__vite_plugin_react_preamble_installed__ = true
		</script>
		<script type="module" src="http://localhost:5173/assets/@vite/client"></script>
		<script type="module" src="http://localhost:5173/assets/index.tsx"></script>
	`

	if config.Env() == "release" {
		manifest, err := staticServer.ReadFile("assets/.vite/manifest.json")
		if err != nil {
			logger.Fatalf("failed to read manifest file: %v", err)
			return
		}

		scriptTags = manifestToScriptTags(manifest)
	}

	// Serve the UI template
	tmpl, _ := template.New("index.tmpl").Parse(s.getUITemplate(scriptTags))
	s.router.SetHTMLTemplate(tmpl)

	// Serve the static assets
	s.router.GET("/assets/*path", gin.WrapH(gzipped.FileServer(gzipped.FS(staticServer))))

	// Add cache control headers that allow files under the assets path to be
	// cached forever (we use hashed filenames for assets, so they can be cached
	// indefinitely)
	s.router.Use(func(c *gin.Context) {
		if strings.HasPrefix(c.Request.URL.Path, "/assets/") {
			c.Writer.Header().Set("Cache-Control", "public, max-age=31536000, immutable")
		}
		c.Next()
	})
}

// See https://vitejs.dev/guide/backend-integration.html – comments from that
// page are included below for reference.
func manifestToScriptTags(data []byte) string {
	// Parse the manifest JSON
	manifest := make(viteManifest)
	err := json.Unmarshal(data, &manifest)
	if err != nil {
		logger.Fatalf("failed to parse manifest JSON: %v", err)
	}

	// Extract our entry point
	var scriptTags strings.Builder
	entryPoint := manifest["index.tsx"]

	// A <link rel="stylesheet"> tag for each file in the entry point chunk's css
	// list
	for _, css := range entryPoint.CSS {
		scriptTags.WriteString(fmt.Sprintf(`<link rel="stylesheet" href="/assets/%s">`, css))
	}

	// Recursively follow all chunks in the entry point's imports list and include
	// a <link rel="stylesheet"> tag for each CSS file of each imported chunk.
	var addCSSImports func(chunk viteManifestEntry)
	addCSSImports = func(chunk viteManifestEntry) {
		for _, importName := range chunk.Imports {
			importChunk := manifest[importName]
			for _, css := range importChunk.CSS {
				scriptTags.WriteString(fmt.Sprintf(`<link rel="stylesheet" href="/assets/%s">`, css))
			}
			addCSSImports(importChunk)
		}
	}
	addCSSImports(entryPoint)

	// A tag for the file key of the entry point chunk (<script type="module"> for
	// JavaScript, or <link rel="stylesheet"> for CSS)
	scriptTags.WriteString(fmt.Sprintf(`<script type="module" src="/assets/%s"></script>`, entryPoint.File))

	// Optionally, <link rel="modulepreload"> tag for the file of each imported
	// JavaScript chunk, again recursively following the imports starting from the
	// entry point chunk.
	var addJSImports func(chunk viteManifestEntry)
	addJSImports = func(chunk viteManifestEntry) {
		for _, importName := range chunk.Imports {
			importChunk := manifest[importName]
			scriptTags.WriteString(fmt.Sprintf(`<link rel="modulepreload" href="/assets/%s">`, importChunk.File))
			addJSImports(importChunk)
		}
	}
	addJSImports(entryPoint)

	// Return the script tags
	return scriptTags.String()
}
