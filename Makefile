.PHONY: generate build dev

# Generate TypeScript types from Go models.
# Run this whenever models change.
generate:
	cd backend && go run ./cmd/schemagen -out ../schema/api.schema.json
	cd frontend && npx json2ts -i ../schema/api.schema.json -o src/types/api.generated.ts --no-additionalProperties
	@echo "Done. Types written to frontend/src/types/api.generated.ts"

# Build the Go backend
build:
	go build -o bin/server ./backend

# Start both services in dev mode (requires two terminals or use 'make dev' in tmux)
dev:
	@echo "Run these in separate terminals:"
	@echo "  cd backend && go run ."
	@echo "  cd frontend && npm run dev"
