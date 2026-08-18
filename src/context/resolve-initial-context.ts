/** A context (theme) name — e.g. `"default"`, `"dark"`, `"light"`. */
export type Context = string

/** The base context name that maps to the `:root` scope (no override class needed). */
export const DEFAULT_CONTEXT = "default"

/**
 * localStorage key under which the selected context is persisted.
 *
 * Kept as `"radium-context"` regardless of this package's name so an existing user's
 * stored theme choice (and the `manager.ts` postMessage protocol) keep working.
 */
const STORAGE_KEY = "radium-context"

/** URL query parameter that overrides the stored context on load. */
const URL_PARAM = "context"

/**
 * Storybook's native globals parameter, which hosts embedding a preview use to drive the
 * active context (e.g. `?globals=context:dark`). Read as a fallback after `?context=` so a
 * plain app embedded in the same host switches themes without needing Storybook.
 */
const GLOBALS_PARAM = "globals"

/**
 * Context-name allowlist: must start with a letter, then letters/digits/dash/underscore.
 * A security boundary — the value is applied as a CSS class — and a guard against
 * URL/storage tampering.
 */
const CONTEXT_NAME_RE = /^[a-zA-Z][a-zA-Z0-9_-]*$/

function isValidContextName(value: unknown): value is Context {
  return typeof value === "string" && CONTEXT_NAME_RE.test(value)
}

/**
 * Read the context from Storybook's `globals` parameter, a comma-separated list of
 * `key:value` pairs (`?globals=context:dark,foo:bar`). Only the `context` key is read.
 */
function readContextFromGlobals(params: URLSearchParams): Context | null {
  const raw = params.get(GLOBALS_PARAM)
  if (!raw) return null

  for (const entry of raw.split(",")) {
    const separator = entry.indexOf(":")
    if (separator === -1) continue
    const key = entry.slice(0, separator).trim()
    const value = entry.slice(separator + 1).trim()
    if (key === URL_PARAM && isValidContextName(value)) return value
  }

  return null
}

/**
 * Read the context from the URL, validated. Prefers the explicit `?context=` parameter and
 * falls back to Storybook's `?globals=context:<name>`. Returns `null` outside the browser.
 */
function readContextFromUrl(): Context | null {
  if (typeof window === "undefined") return null
  const params = new URLSearchParams(window.location.search)
  const value = params.get(URL_PARAM)
  if (value && isValidContextName(value)) return value
  return readContextFromGlobals(params)
}

/** Read the persisted context from `localStorage`, validated. Safe if storage is unavailable. */
function readStoredContext(): Context | null {
  try {
    const value = window.localStorage.getItem(STORAGE_KEY)
    return value && isValidContextName(value) ? value : null
  } catch {
    return null
  }
}

/** Options for resolving the initial context on load. */
export interface ResolveContextOptions {
  /**
   * Known contexts (e.g. the `CONTEXTS` constant `radium` generates from your design
   * tokens). A resolved value is only honored if it is a member of this list.
   */
  contexts?: Context[]
  /** Fallback when neither the URL nor storage yields a valid context. Default: `"default"`. */
  fallback?: Context
}

/**
 * Resolve the context to use on load. Precedence: URL `?context=` → URL
 * `?globals=context:<name>` (Storybook's format) → `localStorage` →
 * `fallback` (default `"default"`). A resolved value is only honored if it is one of the
 * known `contexts` (when those are provided); otherwise it falls through.
 */
export function resolveInitialContext(options: ResolveContextOptions = {}): Context {
  const fallback = options.fallback ?? DEFAULT_CONTEXT
  const known = options.contexts
  const allowed = (c: Context | null): c is Context =>
    c !== null && (!known || known.includes(c))

  const fromUrl = readContextFromUrl()
  if (allowed(fromUrl)) return fromUrl

  const fromStorage = readStoredContext()
  if (allowed(fromStorage)) return fromStorage

  return fallback
}
