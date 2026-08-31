# WebMCP Client

Testing was carried out with Chrome v152. It was necessary to enable the WebMCP
API: chrome://flags/#enable-webmcp-testing


## Running evals

Run `pnpm evals` from the client dir.

Alternatively run command `pnpm --filter client evals` from nextjs root, or
`pnpm exec tsx src/webmcp/evals/run.ts` from the client dir.

