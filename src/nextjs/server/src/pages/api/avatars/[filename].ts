import type { NextApiRequest, NextApiResponse } from 'next'
import { AvatarStorageService } from '@/services/uploads/avatar-storage-service'

// Serves a previously uploaded avatar image. The filename is a generated
// <uuid>.<extension>, so only safe, exact filenames are accepted.

// Services
const avatarStorageService = new AvatarStorageService()

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse) {

  // Only GET is supported
  if (req.method !== 'GET') {
    res.status(405).json({ status: false, message: `Method not allowed` })
    return
  }

  // Load the file
  const filename = req.query.filename
  const filenameString = Array.isArray(filename) ? filename[0] : filename

  if (filenameString == null) {
    res.status(400).json({ status: false, message: `Filename is required` })
    return
  }

  const file = await avatarStorageService.read(filenameString)

  if (file == null) {
    res.status(404).json({ status: false, message: `Image not found` })
    return
  }

  // Return the image (immutable: filenames are unique)
  res.setHeader('Content-Type', file.contentType)
  res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
  res.status(200).send(file.buffer)
}
