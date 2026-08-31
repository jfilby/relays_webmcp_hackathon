import http from 'node:http'
import { Server } from 'socket.io'
import { z } from 'zod'
import { prisma } from '@/db'
import { DmsService } from '@/services/dms/service'

// Payload schemas (socket.io payloads are unvalidated external input)
const joinPayloadSchema = z.object({
  userProfileId: z.string().min(1)
})

const sendPayloadSchema = z.object({
  userProfileId: z.string().min(1),
  toProfilePublicId: z.string().min(1),
  message: z.string().min(1).max(5000)
})

const readPayloadSchema = z.object({
  userProfileId: z.string().min(1),
  withProfilePublicId: z.string().min(1)
})

interface AckResult {
  status: boolean
  message?: string
}

// Room event payloads (mirrored in the client, see
// client/src/services/dms/dm-socket-service.ts)
export interface DmMessageEvent {
  event: 'dm:message'
  dm: {
    id: string
    fromProfileId: string
    toProfileId: string
    message: string
    readAt: string | null
    created: string
  }
}

export interface DmReadEvent {
  event: 'dm:read'
  byProfileId: string
  withProfileId: string
  readAt: string
}

// Services
const dmsService = new DmsService()

// The Socket.io server singleton is created once per process and guarded
// globally so Next.js route reloads don't attempt to bind the port twice.
const globalForSocketIo = globalThis as unknown as {
  dmSocketIo?: Server
  dmHttpServer?: http.Server
}

// Room name for a pair of profiles. The same room name is computed for both
// orders so both parties share one room.
export const roomNameForPair = (profileIdA: string, profileIdB: string) =>
  [profileIdA, profileIdB].sort().join(':')

export function getDmSocketIo(): Server {

  // Reuse the existing singleton
  if (globalForSocketIo.dmSocketIo != null) {
    return globalForSocketIo.dmSocketIo
  }

  // Debug
  const fnName = 'getDmSocketIo()'

  // Create the HTTP server and Socket.io instance
  const httpServer = http.createServer()

  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: {
      origin: true,
      methods: ['GET', 'POST']
    }
  })

  // Handle connections
  io.on('connection', (socket) => {

    // Rooms this socket has joined
    const joinedRooms = new Set<string>()

    // Join the signed-in user's personal room (all their DM conversations)
    socket.on('dm:join', async (
      payload: unknown,
      ack: ((result: AckResult) => void) | undefined) => {

      const parsed = joinPayloadSchema.safeParse(payload)

      if (!parsed.success) {
        if (typeof ack === 'function') {
          ack({
            status: false,
            message: 'Invalid join payload'
          })
        }
        return
      }

      const { userProfileId } = parsed.data

      // Only join if the user profile exists
      const profile = await
        dmsService.getMyProfile(
          prisma,
          userProfileId)

      if (profile == null) {
        if (typeof ack === 'function') {
          ack({
            status: false,
            message: 'Access denied'
          })
        }
        return
      }

      // Join the personal room
      const roomName = roomNameForPair(profile.id, profile.id)
      await socket.join(roomName)
      joinedRooms.add(roomName)

      if (typeof ack === 'function') {
        ack({
          status: true,
          message: 'OK'
        })
      }
    })

    // Send a direct message
    socket.on('dm:send', async (
      payload: unknown,
      ack: ((result: AckResult) => void) | undefined) => {

      const parsed = sendPayloadSchema.safeParse(payload)

      if (!parsed.success) {
        if (typeof ack === 'function') {
          ack({
            status: false,
            message: 'Invalid send payload'
          })
        }
        return
      }

      const { userProfileId, toProfilePublicId, message } = parsed.data

      // Persist the message
      try {
        const results = await dmsService.sendDm(
          prisma,
          userProfileId,
          toProfilePublicId,
          message)

        if (results.status !== true || results.messageItem == null ||
          results.peer == null) {
          if (typeof ack === 'function') {
            ack({
              status: false,
              message: results.message ?? 'Send failed'
            })
          }
          return
        }

        // Resolve the sender's profile for room targeting
        const fromProfile = await
          dmsService.getMyProfile(
            prisma,
            userProfileId)

        if (fromProfile == null) {
          if (typeof ack === 'function') {
            ack({
              status: false,
              message: 'Access denied'
            })
          }
          return
        }

        // Emit to the shared conversation room (both parties are members)
        const roomName = roomNameForPair(fromProfile.id, results.peer.id)
        const roomEvent: DmMessageEvent = {
          event: 'dm:message',
          dm: results.messageItem
        }
        io.to(roomName).emit('dm:message', roomEvent)

        // Also emit to each party's personal room so open popups/threads and
        // unread counters update everywhere
        const fromRoom = roomNameForPair(fromProfile.id, fromProfile.id)
        const toRoom = roomNameForPair(results.peer.id, results.peer.id)
        io.to(fromRoom).emit('dm:message', roomEvent)
        io.to(toRoom).emit('dm:message', roomEvent)

        if (typeof ack === 'function') {
          ack({
            status: true,
            message: 'OK'
          })
        }
      } catch (error: unknown) {
        const err = error as { message?: string }

        console.error(`${fnName}: error: ` + (err.message ?? error))

        if (typeof ack === 'function') {
          ack({
            status: false,
            message: err.message ?? 'Send failed'
          })
        }
      }
    })

    // Mark a thread as read (notifies the peer so their sent messages show
    // as read)
    socket.on('dm:read', async (
      payload: unknown,
      ack: ((result: AckResult) => void) | undefined) => {

      const parsed = readPayloadSchema.safeParse(payload)

      if (!parsed.success) {
        if (typeof ack === 'function') {
          ack({
            status: false,
            message: 'Invalid read payload'
          })
        }
        return
      }

      const { userProfileId, withProfilePublicId } = parsed.data

      try {
        // Resolve both profiles first so the read event can name them
        const myProfile = await
          dmsService.getMyProfile(
            prisma,
            userProfileId)

        if (myProfile == null) {
          if (typeof ack === 'function') {
            ack({
              status: false,
              message: 'Access denied'
            })
          }
          return
        }

        const results = await dmsService.getMessages(
          prisma,
          userProfileId,
          withProfilePublicId)

        if (results.status !== true || results.peer == null) {
          if (typeof ack === 'function') {
            ack({
              status: false,
              message: results.message ?? 'Thread not found'
            })
          }
          return
        }

        await dmsService.markThreadRead(
          prisma,
          userProfileId,
          withProfilePublicId)

        // Emit to both personal rooms
        const readAt = new Date().toISOString()
        const fromRoom = roomNameForPair(myProfile.id, myProfile.id)
        const toRoom = roomNameForPair(results.peer.id, results.peer.id)
        const readEvent: DmReadEvent = {
          event: 'dm:read',
          byProfileId: myProfile.id,
          withProfileId: results.peer.id,
          readAt: readAt
        }
        io.to(fromRoom).emit('dm:read', readEvent)
        io.to(toRoom).emit('dm:read', readEvent)

        if (typeof ack === 'function') {
          ack({
            status: true,
            message: 'OK'
          })
        }
      } catch (error: unknown) {
        const err = error as { message?: string }

        console.error(`${fnName}: error: ` + (err.message ?? error))

        if (typeof ack === 'function') {
          ack({
            status: false,
            message: err.message ?? 'Read failed'
          })
        }
      }
    })

    // Leave rooms on disconnect
    socket.on('disconnect', () => {
      joinedRooms.clear()
    })
  })

  // Start listening (dev: port 3002, production: port 3012)
  const port = Number(process.env.NEXT_PUBLIC_SOCKETIO_PORT ?? 3002)

  httpServer.listen(port, () => {
    console.log(`DM Socket.io server listening on :${port}`)
  })

  // Store the singleton
  globalForSocketIo.dmHttpServer = httpServer
  globalForSocketIo.dmSocketIo = io

  // Return
  return io
}

// Start the server when this module is loaded (skip during next build, where
// route modules are bundled but not meant to bind ports)
if (process.env.NEXT_PHASE !== 'phase-production-build') {
  getDmSocketIo()
}
