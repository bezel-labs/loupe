import { resolveInitialContext } from "./resolve-initial-context"

const CONTEXTS = ["default", "dark", "light"]

beforeEach(() => {
  window.localStorage.clear()
  window.history.replaceState(null, "", "/")
})

describe("resolveInitialContext", () => {
  it("prefers a valid URL ?context= over storage", () => {
    window.history.replaceState(null, "", "/?context=light")
    window.localStorage.setItem("radium-context", "dark")
    expect(resolveInitialContext({ contexts: CONTEXTS })).toBe("light")
  })

  it("falls back to storage, then to the default", () => {
    window.localStorage.setItem("radium-context", "dark")
    expect(resolveInitialContext({ contexts: CONTEXTS })).toBe("dark")
    window.localStorage.clear()
    expect(resolveInitialContext({ contexts: CONTEXTS })).toBe("default")
  })

  it("reads Storybook's ?globals=context:<name> when ?context= is absent", () => {
    window.history.replaceState(null, "", "/?globals=context:dark")
    expect(resolveInitialContext({ contexts: CONTEXTS })).toBe("dark")
  })

  it("picks the context key out of a multi-value globals list", () => {
    window.history.replaceState(null, "", "/?globals=theme:x,context:light,other:y")
    expect(resolveInitialContext({ contexts: CONTEXTS })).toBe("light")
  })

  it("prefers ?context= over ?globals=", () => {
    window.history.replaceState(null, "", "/?context=light&globals=context:dark")
    expect(resolveInitialContext({ contexts: CONTEXTS })).toBe("light")
  })

  it("prefers a valid ?globals= context over storage", () => {
    window.history.replaceState(null, "", "/?globals=context:light")
    window.localStorage.setItem("radium-context", "dark")
    expect(resolveInitialContext({ contexts: CONTEXTS })).toBe("light")
  })

  it("ignores a globals entry with no context key, or an invalid value", () => {
    window.history.replaceState(null, "", "/?globals=theme:dark")
    expect(resolveInitialContext({ contexts: CONTEXTS })).toBe("default")

    window.history.replaceState(null, "", "/?globals=context:.dark")
    expect(resolveInitialContext({ contexts: CONTEXTS })).toBe("default")

    window.history.replaceState(null, "", "/?globals=malformed")
    expect(resolveInitialContext({ contexts: CONTEXTS })).toBe("default")
  })

  it("honors a custom fallback", () => {
    expect(resolveInitialContext({ contexts: CONTEXTS, fallback: "dark" })).toBe("dark")
  })

  it("ignores values not in the known contexts list", () => {
    window.history.replaceState(null, "", "/?context=bogus")
    expect(resolveInitialContext({ contexts: CONTEXTS })).toBe("default")
  })

  it("ignores identifier-invalid values from storage", () => {
    window.localStorage.setItem("radium-context", ".dark")
    expect(resolveInitialContext({ contexts: CONTEXTS })).toBe("default")
  })

  it("accepts any identifier-valid value when no contexts list is given", () => {
    window.history.replaceState(null, "", "/?context=high-contrast_2")
    expect(resolveInitialContext()).toBe("high-contrast_2")
  })
})
