import fs from 'node:fs/promises'
import path from 'node:path'
import { randomUUID } from 'node:crypto'

// Avatars are stored on the local filesystem and served through the
// /api/avatars routes. Only small image files are accepted; the filename is
// generated here so it is always safe (no user-supplied path components).

// Class
export class AvatarStorageService {

  // Consts
  clName = 'AvatarStorageService'

  // Maximum accepted file size (2 MB)
  maxBytes = 2 * 1024 * 1024

  // Allowed content types mapped to a file extension
  contentTypes: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif'
  }

  // Directory the avatars are stored in (created on demand)
  directory = process.env.AVATARS_PATH ?? `${process.cwd()}/uploads/avatars`

  // Save an avatar image and return the generated filename
  async save(
    buffer: Buffer,
    contentType: string): Promise<string> {

    // Debug
    const fnName = `${this.clName}.save()`

    // Validate
    const extension = this.contentTypes[contentType]

    if (extension == null) {
      console.error(`${fnName}: unsupported content type: ${contentType}`)
      throw 'Validation error'
    }

    // Store the file
    const filename = `${randomUUID()}.${extension}`

    try {
      await fs.mkdir(this.directory, { recursive: true })
      await fs.writeFile(`${this.directory}/${filename}`, buffer)
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Storage error'
    }

    // Return
    return filename
  }

  // Read an avatar by filename, returning null when it doesn't exist
  async read(
    filename: string): Promise<{ buffer: Buffer, contentType: string } | null> {

    // Debug
    const fnName = `${this.clName}.read()`

    // Only generated filenames are accepted (no traversal, no user paths)
    if (this.isValidFilename(filename) === false) {
      return null
    }

    // Read the file
    try {
      const buffer = await fs.readFile(`${this.directory}/${filename}`)

      // Restore the content type from the extension
      const contentType = Object.keys(this.contentTypes)
        .find(contentType => this.contentTypes[contentType] === filename.split('.').pop())

      if (contentType == null) {
        return null
      }

      return {
        buffer: buffer,
        contentType: contentType
      }
    } catch {
      return null
    }
  }

  // Delete an avatar by filename (best effort: a missing file is not an error)
  async delete(
    filename: string): Promise<void> {

    // Debug
    const fnName = `${this.clName}.delete()`

    // Only generated filenames are accepted
    if (this.isValidFilename(filename) === false) {
      return
    }

    // Delete the file
    try {
      await fs.unlink(`${this.directory}/${filename}`)
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
    }
  }

  // Extract the filename from an avatar URL stored on a profile, or null when
  // the URL doesn't point at the avatar API
  filenameFromUrl(avatarUrl: string | null | undefined): string | null {

    // Validate
    if (avatarUrl == null || avatarUrl === '') {
      return null
    }

    // The filename is the last path segment of the /api/avatars/ URL
    const match = /\/api\/avatars\/([^/?#]+)$/.exec(avatarUrl)

    if (match == null) {
      return null
    }

    const filename = decodeURIComponent(match[1])

    // Validate
    if (this.isValidFilename(filename) === false) {
      return null
    }

    return filename
  }

  isValidFilename(filename: string): boolean {

    // Filenames are generated as <uuid>.<extension>
    return /^[0-9a-f-]{36}\.(jpg|png|webp|gif)$/.test(filename)
  }
}
