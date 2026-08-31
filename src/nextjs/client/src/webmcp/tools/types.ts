//
// Shared types for the WebMCP tool factories.
//

// The result shape the page-level submit/aux functions return.
export type SubmitResult = {
  status: 'ok' | 'error'
  message: string
}
