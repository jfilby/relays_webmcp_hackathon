//
// Minimal harness for the WebMCP evals. Provides synchronous assertions and
// a runner that executes each registered eval, collecting pass/fail results.
//
// No test framework: the evals run directly under tsx with
// `pnpm --filter client evals` (see package.json) or
// `pnpm exec tsx src/webmcp/evals/run.ts`.
//

export type EvalCheck = {
  name: string
  ok: boolean
  detail?: string
}

export type EvalResult = {
  name: string
  ok: boolean
  checks: EvalCheck[]
}

export type EvalFn = () => void | Promise<void>

const registered: Array<{ name: string; fn: EvalFn }> = []

export function evals(name: string, fn: EvalFn): void {

  registered.push({ name, fn })
}

// Assertion helpers. Each throws on failure with a descriptive message, so an
// eval stops at its first failed check.

export function check(cond: unknown, message: string): void {

  if (!cond) {
    throw new Error(message)
  }
}

export function checkEqual<T>(actual: T, expected: T, message: string): void {

  if (actual !== expected) {
    throw new Error(`${message} (expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)})`)
  }
}

export function checkDeepEqual<T>(actual: T, expected: T, message: string): void {

  const actualJson = JSON.stringify(actual)
  const expectedJson = JSON.stringify(expected)

  if (actualJson !== expectedJson) {
    throw new Error(`${message} (expected ${expectedJson}, got ${actualJson})`)
  }
}

// Asserts the async function rejects with an Error whose message contains the
// given substring.
export async function checkThrows(fn: () => Promise<unknown> | unknown, expectedSubstring: string, message: string): Promise<void> {

  try {
    await fn()
  } catch (error) {
    const text = error instanceof Error ? error.message : String(error)
    if (!text.includes(expectedSubstring)) {
      throw new Error(`${message} (expected error containing "${expectedSubstring}", got "${text}")`)
    }
    return
  }

  throw new Error(`${message} (expected error containing "${expectedSubstring}", but no error was thrown)`)
}

export async function runEvals(): Promise<boolean> {

  let failed = 0

  for (const entry of registered) {

    try {
      await entry.fn()
      console.log(`PASS  ${entry.name}`)
    } catch (error) {
      failed++
      const text = error instanceof Error ? error.message : String(error)
      console.error(`FAIL  ${entry.name}`)
      console.error(`      ${text}`)
    }
  }

  const total = registered.length

  console.log(``)
  console.log(`${total - failed}/${total} evals passed`)

  return failed === 0
}
