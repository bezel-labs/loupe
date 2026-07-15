# @bezel-labs/loupe

Small runtime helpers for a Storybook preview: resolve the initial theme context and load
design-token web fonts. Zero dependencies, browser-only.

## Install

```sh
npm install @bezel-labs/loupe
```

## Usage

### `resolveInitialContext` — pick the initial theme context

Resolves which context (theme) to apply on load. Precedence: URL `?context=` →
`localStorage` → fallback (`"default"`). A value is only honored when it's in the known
`contexts` list, if one is provided.

```ts
import { resolveInitialContext } from "@bezel-labs/loupe"

const context = resolveInitialContext({ contexts: ["default", "dark", "light"] })
```

### `loadFonts` — inject design-token web fonts

Injects a webfont stylesheet (plus `preconnect` hints) into `<head>`. Idempotent — safe to
call repeatedly. Supports Google Fonts (default) and Bunny Fonts.

```ts
import { loadFonts } from "@bezel-labs/loupe"

loadFonts([{ family: "Inter", weights: [400, 600] }])
loadFonts(fonts, { provider: "bunny" })
```

## API

`resolveInitialContext`, `loadFonts`, `fontsHref`, `buildHref`, `preconnectHosts`,
`DEFAULT_CONTEXT`, plus the related types (`Context`, `ResolveContextOptions`, `FontDef`,
`FontProvider`, `FontsHrefOptions`, `LoadFontsOptions`).

## Development

```bash
npm install     # install deps
npm run build   # bundle ESM + CJS + types with tsup
npm test        # run the Jest test suite
npm run typecheck
```

## License

[PolyForm Shield 1.0.0](./LICENSE) — free to use, modify, and redistribute for any purpose
**except** building or providing a product that competes with [Bezel](https://bezel.new).
Open-source, internal, and commercial use are all permitted within that bound.
