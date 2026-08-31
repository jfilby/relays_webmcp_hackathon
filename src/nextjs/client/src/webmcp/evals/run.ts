//
// Entry point for the WebMCP tool evals. Importing each eval file registers
// its evals with the harness; runEvals then executes them all.
//
// Run with `pnpm --filter client evals` or `pnpm exec tsx src/webmcp/evals/run.ts`.
//
import './profiles-evals'
import './projects-evals'
import './discuss-evals'
import './collaboration-evals'
import './auth-evals'
import { runEvals } from './harness'

runEvals().then(passed => {

  process.exitCode = passed ? 0 : 1
})
