import { CustomError } from 'serene-core-server'
import { PrismaClient } from '@/generated/prisma/client'
import { BaseDataTypes } from '@/types/base-data-types'
import { promptGuardClient } from './client'
import { FlaggedInputModel } from '@/models/flagged/flagged-input-model'

// The user/request context needed to attribute a flagged input to a record.
// source identifies where the input originated (specific to the caller, e.g.
// the GraphQL mutation or socket event that produced it).
export interface PromptGuardSanitizeContext {
  createdById: string
  source?: string
  instanceId?: string | null
}

export class PromptGuardService {

  // Consts
  clName = 'PromptGuardService'

  promptGuardEnabled = process.env.PROMPT_GUARD_ENABLED!

  // Models
  flaggedInputModel = new FlaggedInputModel()

  // Code
  checkIsEnabled() {

    // Debug
    const fnName = `${this.clName}.sanitize()`

    // Check
    if (this.promptGuardEnabled === 'true') {
      return true
    } else if (this.promptGuardEnabled === 'false') {
      return false
    }

    throw new CustomError(`${fnName}: process.env.PROMPT_GUARD_ENABLED not set`)
  }

  // Sanitizes one user-supplied prompt before it reaches any LLM call.
  // Fail-closed: blocks whenever the guard service is unavailable or
  // returns an unexpected response, since an unknown prompt cannot be
  // confirmed safe. When the guard classifies the input as malicious, a
  // FlaggedInput record is persisted.
  async sanitize(
    prisma: PrismaClient,
    text: string,
    context: PromptGuardSanitizeContext,
    debug: boolean = false): Promise<{ blocked: boolean; reason?: string }> {

    // Debug
    const fnName = `${this.clName}.sanitize()`

    // Is enabled?
    if (this.checkIsEnabled() === false) {
      return {
        blocked: false
      }
    }

    // Guard the single text
    const guard = await promptGuardClient.check(text, debug, false)

    // Guard service unavailable -> cannot confirm safe -> block
    if (guard.status === false) {
      console.error(`${fnName}: guard check failed: ` + guard.message)
      return {
        blocked: true,
        reason: `Prompt guard unavailable: ${guard.message}`
      }
    }

    // Validate the guard response shape
    const verdict = guard.data as
      { isMalicious?: boolean; confidence?: number } | null | undefined

    if (verdict == null ||
        typeof verdict !== 'object' ||
        typeof verdict.isMalicious !== 'boolean') {
      console.error(`${fnName}: unexpected guard response: ` +
        JSON.stringify(guard.data))
      return {
        blocked: true,
        reason: 'Prompt guard returned an unexpected response'
      }
    }

    // Guard classified the text as malicious -> block
    if (verdict.isMalicious === true &&
      verdict.confidence != null &&
      verdict.confidence >= 0.7) {

      // Debug
      console.error(`${fnName}: input classified malicious` +
        (verdict.confidence != null ?
          ` (confidence: ${verdict.confidence})` : ''))

      // Persist the flagged input (best-effort; a failure to record must
      // not change the block outcome)
      try {
        await this.flaggedInputModel.create(
          prisma,
          context.createdById,
          context.instanceId ?? null,
          BaseDataTypes.activeStatus,
          context.source ?? '',
          text,
          verdict.confidence ?? 0)
      } catch (error) {
        console.error(`${fnName}: failed to record flagged input: ` + error)
      }

      return {
        blocked: true,
        reason: 'Prompt rejected as malicious'
      }
    }

    // Safe
    return {
      blocked: false
    }
  }
}

// Singleton (module scoped, matching the codebase service pattern)
const promptGuardService = new PromptGuardService()

export { promptGuardService }
