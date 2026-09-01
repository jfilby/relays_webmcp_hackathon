import { useEffect, useRef } from 'react'
//
// Registers tools with the browser's WebMCP API (https://github.com/webmachinelearning/webmcp)
// using the imperative `document.modelContext.registerTool()` API, so AI agents
// can drive the page's forms and actions. Registration is a no-op in browsers
// without WebMCP support.

// JSON Schema describing a tool's input arguments.
export type WebMcpInputSchema = {
  type: 'object'
  properties?: Record<string, unknown>
  required?: string[]
}

// A tool definition as passed to `registerTool`.
export interface WebMcpTool {
  name: string
  title?: string
  description: string
  inputSchema: WebMcpInputSchema
  execute: (args: Record<string, unknown>, context?: { signal?: AbortSignal }) => string | Promise<string>
}

// Structural subset of the ModelContextContainer we rely on.
interface ModelContextLike {
  registerTool: (tool: WebMcpTool, options?: { signal?: AbortSignal }) => void | Promise<void>
}

// Returns the browser's model context, or undefined when WebMCP is unsupported.
export function getModelContext(): ModelContextLike | undefined {

  const doc = document as Document & { modelContext?: ModelContextLike }
  const nav = navigator as Navigator & { modelContext?: ModelContextLike }

  return doc.modelContext ?? nav.modelContext
}

// True when the current browser exposes the WebMCP imperative API.
export function isWebMcpAvailable(): boolean {

  if (typeof document === 'undefined' || typeof navigator === 'undefined') {
    return false
  }

  return getModelContext() != null
}

// Re-registers when the tool *name set* changes (e.g. a page conditionally
// exposes a tool based on state); `execute` is always read from the latest
// render, so tool callbacks see current state without re-registration.
// `getTools` is a factory so page tool definitions (and their state accessors)
// are built lazily, the same as inline tool literals.
export function useWebMcpTools(getTools: () => WebMcpTool[]): void {

  // Tool definitions are built during render; the ref is updated after render
  // (see below) so execute callbacks and registration always see the latest.
  const tools = getTools()

  // Re-run the registration effect only when the tool names change
  const toolNames = tools.map(tool => tool.name).join(',')

  // Latest tools
  const toolsRef = useRef<WebMcpTool[]>(tools)

  useEffect(() => {
    toolsRef.current = tools
  })

  useEffect(() => {

    const modelContext = getModelContext()

    if (modelContext == null || typeof modelContext.registerTool !== 'function') {

      // Surface the silent no-op so unsupported browsers are diagnosable
      console.info(`[webmcp] Not registering ${toolsRef.current.length} tool(s): this browser does not expose the WebMCP modelContext API (check chrome://flags/#enable-webmcp-testing and that the page is a secure context)`)

      return
    }

    // AbortController unregisters all tools on unmount (and on StrictMode re-run)
    const controller = new AbortController()

    for (const tool of toolsRef.current) {

      const toolName = tool.name

      try {
        void modelContext.registerTool({
          name: tool.name,
          title: tool.title,
          description: tool.description,
          inputSchema: tool.inputSchema,
          execute: (args, context) => {

            // Always invoke the freshest callback for this tool name
            const current = toolsRef.current.find(tool => tool.name === toolName)

            if (current == null) {
              throw new Error(`Tool ${toolName} is no longer available`)
            }

            return current.execute(args, context)
          }
        }, {
          signal: controller.signal
        })
      } catch (error) {
        console.warn(`[webmcp] Failed to register tool ${toolName}:`, error)
      }
    }


    console.info(`[webmcp] Registered ${toolsRef.current.length} tool(s): ${toolsRef.current.map(tool => tool.name).join(', ')}`)
    return () => {
      controller.abort()
    }
  }, [toolNames])
}
