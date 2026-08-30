import type { NextApiRequest, NextApiResponse } from 'next'
import { AvatarStorageService } from '@/services/uploads/avatar-storage-service'
import { ProfileModel } from '@/models/profiles/profile-model'
import { prisma } from '@/db'

// Uploads a new avatar image. The raw file bytes are sent as the request body
// with the image MIME type in the Content-Type header, and the owner is passed
// as the userProfileId query parameter. On success the generated filename is
// returned; the caller then stores the public URL on the profile via the
// updateProfile mutation.

// Models
const profileModel = new ProfileModel()

// Services
const avatarStorageService = new AvatarStorageService()

// Disable the default body parser so the raw image bytes can be read
export const config = {
  api: {
    bodyParser: false
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse) {

  // Debug
  const fnName = 'avatars/upload.ts:handler()'

  // CORS headers (the client app runs on a different origin)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  // Preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }

  // Only POST is supported
  if (req.method !== 'POST') {
    res.status(405).json({ status: false, message: `Method not allowed` })
    return
  }

  // Validate the owner
  const userProfileId = req.query.userProfileId

  if (typeof userProfileId !== 'string' || userProfileId === '') {
    res.status(400).json({ status: false, message: `userProfileId is required` })
    return
  }

  // The owner must have a profile
  const profile = await profileModel.getByUserProfileId(prisma, userProfileId)

  if (profile == null) {
    res.status(400).json({ status: false, message: `Profile not found` })
    return
  }

  // Validate the content type
  const contentType = Array.isArray(req.headers['content-type']) ?
    req.headers['content-type'][0] :
    req.headers['content-type']

  if (contentType == null || avatarStorageService.contentTypes[contentType] == null) {
    res.status(400).json({
      status: false,
      message: `Unsupported image type (use JPEG, PNG, WebP or GIF)`
    })
    return
  }

  // Read the raw body, refusing anything larger than the maximum size
  const chunks: Buffer[] = []
  let totalBytes = 0
  let tooLarge = false

  for await (const chunk of req) {

    totalBytes += chunk.length

    if (totalBytes > avatarStorageService.maxBytes) {
      tooLarge = true
      continue
    }

    chunks.push(chunk)
  }

  if (tooLarge === true) {
    res.status(400).json({ status: false, message: `Image is too large (maximum 2 MB)` })
    return
  }

  const buffer = Buffer.concat(chunks)

  if (buffer.length === 0) {
    res.status(400).json({ status: false, message: `No image was uploaded` })
    return
  }

  // Store the file (any previous file is left in place until the avatar is
  // deleted or replaced through the profile mutations)
  let filename: string

  try {
    filename = await avatarStorageService.save(buffer, contentType)
  } catch (error) {
    console.error(`${fnName}: error: ${error}`)
    res.status(500).json({ status: false, message: `Failed to store the image` })
    return
  }

  // Return
  res.status(200).json({
    status: true,
    filename: filename
  })
}
