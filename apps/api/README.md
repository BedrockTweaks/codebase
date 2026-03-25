# Bedrock Tweaks API

Modern Hono-based API for assembling Minecraft Bedrock resource packs, addons, and crafting tweaks.

## Features

- **Hono OpenAPI** - Auto-generated Swagger documentation
- **Zod Validation** - Runtime type safety with shared schemas
- **Functional Programming** - Pure functions, no class-based services
- **Feature-based Architecture** - Organized by domain (resource-packs, addons, crafting-tweaks)

## Development

```bash
# Install dependencies
pnpm install

# Start dev server (port 8000)
pnpm dev

# Build for production
pnpm build

# Run production server
pnpm start

# Run tests
pnpm test
```

## API Documentation

Interactive API docs available at `http://localhost:8000/api/docs` when running.

## Environment Variables

See [.env.example](.env.example) for required configuration.
