// schemagen generates a JSON Schema from the models package.
// Run from the repo root: go run ./backend/cmd/schemagen
// Output: schema/api.schema.json
package main

import (
	"encoding/json"
	"flag"
	"jarvis/mcp-server/models"
	"log"
	"os"

	"github.com/invopop/jsonschema"
)

type APISchema struct {
	Todo         models.Todo         `json:"Todo"`
	Reminder     models.Reminder     `json:"Reminder"`
	ShoppingItem models.ShoppingItem `json:"ShoppingItem"`
}

func main() {
	out := flag.String("out", "schema/api.schema.json", "output path for generated schema")
	flag.Parse()

	r := &jsonschema.Reflector{ExpandedStruct: true}
	schema := r.Reflect(&APISchema{})

	data, err := json.MarshalIndent(schema, "", "  ")
	if err != nil {
		log.Fatalf("marshal: %v", err)
	}

	if err := os.WriteFile(*out, data, 0644); err != nil {
		log.Fatalf("write %s: %v", *out, err)
	}
	log.Printf("schema written to %s", *out)
}
