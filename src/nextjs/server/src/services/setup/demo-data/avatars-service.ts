import fs from 'node:fs/promises'
import type { Dirent } from 'node:fs'
import { PrismaClient } from '@/generated/prisma/client'

// Models
import { ProfileModel } from '@/models/profiles/profile-model'

// Services
import { AvatarStorageService } from '@/services/uploads/avatar-storage-service'

// Models
const profileModel = new ProfileModel()

// Services
const avatarStorageService = new AvatarStorageService()

// Class
// Assigns the staged avatar images as profile avatars. The staged files are
// named <publicId>.<extension> and live in $BASE_DATA_PATH/staged_avatars, so
// each image is matched to its profile by the filename. Files are copied into
// the avatar storage directory with a generated filename and the public URL is
// stored on the profile, matching how the upload API stores avatars. Must be
// called last by the demo data setup so it overrides any avatar in the demo
// profile data.

export class AvatarsDemoDataSetupService {

  // Consts
  clName = 'AvatarsDemoDataSetupService'

  // Code
  async setup(prisma: PrismaClient) {

    // Debug
    const fnName = `${this.clName}.setup()`

    // Env
    const directory = process.env.BASE_DATA_PATH != null &&
      process.env.BASE_DATA_PATH !== '' ?
      `${process.env.BASE_DATA_PATH}/staged_avatars` :
      `${process.cwd()}/staged_avatars`

    let entries: Dirent[]

    try {
      entries = await fs.readdir(directory, { withFileTypes: true })
    } catch (error) {
      console.error(`${fnName}: unable to read staged avatars at: ` +
        `${directory}: ${error}`)
      throw 'Setup error'
    }

    // Assign each staged image to the profile with the matching publicId
    for (const entry of entries) {

      // Only files are accepted
      if (entry.isFile() === false) {
        continue
      }

      // Split <publicId>.<extension>
      const dotIndex = entry.name.lastIndexOf('.')

      if (dotIndex <= 0 || dotIndex === entry.name.length - 1) {
        console.error(`${fnName}: skipping file with unexpected name: ` +
          `${entry.name}`)
        continue
      }

      const publicId = entry.name.slice(0, dotIndex)
      const extension = entry.name.slice(dotIndex + 1).toLowerCase()

      // Resolve the content type from the extension
      const contentType = Object.keys(avatarStorageService.contentTypes)
        .find(contentType =>
          avatarStorageService.contentTypes[contentType] === extension)

      if (contentType == null) {
        console.error(`${fnName}: skipping file with unsupported extension: ` +
          `${entry.name}`)
        continue
      }

      // The profile must exist
      const profile = await profileModel.getByPublicId(prisma, publicId)

      if (profile == null) {
        console.error(`${fnName}: no profile for staged avatar: ` +
          `${entry.name}`)
        continue
      }

      // Read the staged image
      let buffer: Buffer

      try {
        buffer = await fs.readFile(`${directory}/${entry.name}`)
      } catch (error) {
        console.error(`${fnName}: unable to read staged avatar: ` +
          `${entry.name}: ${error}`)
        continue
      }

      // Idempotent: skip when the current avatar file already matches. A
      // stale URL whose file is already gone is treated as no avatar.
      const currentFilename =
        avatarStorageService.filenameFromUrl(profile.avatar)

      let currentExists = false

      if (currentFilename != null) {
        const current = await avatarStorageService.read(currentFilename)

        if (current != null) {
          if (current.buffer.equals(buffer) === true) {
            continue
          }

          currentExists = true
        }
      }

      // Copy the file into avatar storage with a generated filename
      let filename: string

      try {
        filename = await avatarStorageService.save(buffer, contentType)
      } catch (error) {
        console.error(`${fnName}: unable to store staged avatar: ` +
          `${entry.name}: ${error}`)
        continue
      }

      // Point the profile at the new file
      await profileModel.updateAvatar(
        prisma,
        profile.id,
        `${avatarStorageService.urlPath}/${filename}`)

      // Remove the replaced avatar file, if it still exists
      if (currentExists === true && currentFilename != null) {
        await avatarStorageService.delete(currentFilename)
      }
    }
  }

}
