import { PrismaClient } from '@/generated/prisma/client'
import type { Profile, Project, DiscussPost, DiscussComment } from '@/generated/prisma/client'

// Models
import { ProfileModel } from '@/models/profiles/profile-model'
import { ProjectModel } from '@/models/projects/project-model'
import { DiscussPostModel } from '@/models/discussion/discuss-post-model'
import { DiscussCommentModel } from '@/models/discussion/discuss-comment-model'

// Models
const profileModel = new ProfileModel()
const projectModel = new ProjectModel()
const discussPostModel = new DiscussPostModel()
const discussCommentModel = new DiscussCommentModel()

// Embeddings for hybrid search. Text is embedded through an
// OpenAI-compatible /embeddings endpoint configured via env vars:
//
//   EMBEDDINGS_API_KEY    required to enable semantic search
//   EMBEDDINGS_BASE_URL   default https://api.openai.com/v1
//   EMBEDDINGS_MODEL      default text-embedding-3-small (1536 dimensions,
//                         matching the vector(1536) columns in the schema)
//
// When no API key is configured (or a request fails) the service degrades
// gracefully: embeddings come back undefined, rows keep a NULL embedding and
// the semantic leg of hybrid search is renormalised away.
export class EmbeddingService {

  // Consts
  clName = 'EmbeddingService'

  // Env
  apiKey = process.env.EMBEDDINGS_API_KEY
  baseUrl = process.env.EMBEDDINGS_BASE_URL ?? `https://api.openai.com/v1`
  model = process.env.EMBEDDINGS_MODEL ?? `text-embedding-3-small`

  // Code
  // Embed a single text. Returns undefined when no provider is configured or
  // the request fails; callers fall back to the other search techniques.
  async embed(text: string): Promise<number[] | undefined> {

    // Debug
    const fnName = `${this.clName}.embed()`

    // Skip when semantic search is not configured or the text is empty
    if (this.apiKey == null || this.apiKey === '') {
      return undefined
    }

    const trimmed = text.trim()
    if (trimmed === '') {
      return undefined
    }

    // Request
    try {
      const response = await fetch(`${this.baseUrl}/embeddings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          input: trimmed
        }),
        signal: AbortSignal.timeout(10000)
      })

      if (response.ok === false) {
        console.error(`${fnName}: embeddings request failed: ${response.status}`)
        return undefined
      }

      const body = await response.json() as {
        data?: Array<{ embedding?: number[] }>
      }

      return body.data?.[0]?.embedding
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      return undefined
    }
  }

  // The searchable text for a profile: identity and descriptive fields.
  profileText(profile: {
    displayName: string
    headline: string | null
    bio: string | null
    location: string | null
  }): string {
    return [
      profile.displayName,
      profile.headline,
      profile.bio,
      profile.location
    ].filter(part => part != null && part.trim() !== '').join('. ')
  }

  // The searchable text for a project: instance name plus descriptive fields.
  projectText(
    project: {
      tagline: string | null
      description: string | null
      techStack: string[]
    },
    instanceName: string) {

    return [
      instanceName,
      project.tagline,
      project.description,
      project.techStack.length > 0 ?
        `Tech stack: ${project.techStack.join(', ')}` :
        undefined
    ].filter(part => part != null && part.trim() !== '').join('. ')
  }

  // The searchable text for a discussion post: title plus body.
  discussPostText(post: {
    title: string
    body: string
  }): string {

    return [
      post.title,
      post.body
    ].filter(part => part != null && part.trim() !== '').join('. ')
  }

  // The searchable text for a discussion comment: just the body.
  discussCommentText(comment: {
    body: string
  }): string {

    return comment.body
  }

  // Generate and store the embedding for a profile. Best effort: with no
  // provider configured or on failure the column is written as NULL so the
  // search service degrades to the other techniques.
  async syncProfileEmbedding(
    prisma: PrismaClient,
    profile: Profile): Promise<void> {

    // Debug
    const fnName = `${this.clName}.syncProfileEmbedding()`

    // Embed and store
    try {
      const embedding = await
        this.embed(this.profileText(profile))

      await
        profileModel.updateEmbedding(
          prisma,
          profile.id,
          embedding)
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
    }
  }

  // Generate and store the embedding for a project (same semantics as
  // syncProfileEmbedding). The instance name must be passed in because the
  // project name lives on the project's instance.
  async syncProjectEmbedding(
    prisma: PrismaClient,
    project: Project,
    instanceName: string): Promise<void> {

    // Debug
    const fnName = `${this.clName}.syncProjectEmbedding()`

    // Embed and store
    try {
      const embedding = await
        this.embed(this.projectText(project, instanceName))

      await
        projectModel.updateEmbedding(
          prisma,
          project.id,
          embedding)
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
    }
  }


  // Generate and store the embedding for a discussion post (same semantics
  // as syncProfileEmbedding).
  async syncDiscussPostEmbedding(
    prisma: PrismaClient,
    post: DiscussPost): Promise<void> {

    // Debug
    const fnName = `${this.clName}.syncDiscussPostEmbedding()`

    // Embed and store
    try {
      const embedding = await
        this.embed(this.discussPostText(post))

      await
        discussPostModel.updateEmbedding(
          prisma,
          post.id,
          embedding)
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
    }
  }

  // Generate and store the embedding for a discussion comment (same
  // semantics as syncProfileEmbedding).
  async syncDiscussCommentEmbedding(
    prisma: PrismaClient,
    comment: DiscussComment): Promise<void> {

    // Debug
    const fnName = `${this.clName}.syncDiscussCommentEmbedding()`

    // Embed and store
    try {
      const embedding = await
        this.embed(this.discussCommentText(comment))

      await
        discussCommentModel.updateEmbedding(
          prisma,
          comment.id,
          embedding)
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
    }
  }
}