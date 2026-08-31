// client/src/services/dms/dm-socket-service.ts
//
// Singleton Socket.io connection for direct messages. The client app runs on
// a different origin (:3001) than the server (:3000), so the socket server
// lives on its own port (NEXT_PUBLIC_SOCKET_IO_URL, default :3002). The
// connection is bootstrapped by pinging the server's /api/socket-io route,
// which loads the socket service module and binds the port.
import { io, Socket } from 'socket.io-client'

// Room event payloads (mirrored from server/src/services/socket-io/dm-socket-service.ts)
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

interface AckResult {
  status: boolean
  message?: string
}

export type DmSocket = Socket

// Global singleton guards so React re-renders and route changes reuse one
// socket connection per browser tab.
const globalForDmSocket = globalThis as unknown as {
  dmSocket?: Socket
}

// Ping the server API to make sure the socket.io singleton is running, then
// connect. Resolves with the connected socket.
export async function getDmSocket(): Promise<Socket> {

  // Reuse the existing connection
  if (globalForDmSocket.dmSocket != null) {
    return globalForDmSocket.dmSocket
  }

  // Consts
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api'
  const socketIoUrl = process.env.NEXT_PUBLIC_SOCKET_IO_URL ?? 'http://localhost:3002'

  // Bootstrap the server-side singleton (no-op if already running)
  try {
    await fetch(`${apiUrl}/socket-io`)
  } catch {
    // The socket server may already be up; connection attempt below decides
  }

  // Connect
  const socket = io(socketIoUrl, {
    path: '/socket.io'
  })

  globalForDmSocket.dmSocket = socket

  // Return
  return socket
}

// Join the signed-in user's personal DM room
export function joinDmRoom(
  socket: Socket,
  userProfileId: string): Promise<boolean> {

  return new Promise((resolve) => {
    socket.emit('dm:join', {
      userProfileId: userProfileId
    }, (result: AckResult) => {
      resolve(result.status === true)
    })
  })
}

// Send a direct message
export function sendDm(
  socket: Socket,
  userProfileId: string,
  toProfilePublicId: string,
  message: string): Promise<AckResult> {

  return new Promise((resolve) => {
    socket.emit('dm:send', {
      userProfileId: userProfileId,
      toProfilePublicId: toProfilePublicId,
      message: message
    }, (result: AckResult) => {
      resolve(result)
    })
  })
}

// Mark a thread as read
export function markDmThreadRead(
  socket: Socket,
  userProfileId: string,
  withProfilePublicId: string): Promise<AckResult> {

  return new Promise((resolve) => {
    socket.emit('dm:read', {
      userProfileId: userProfileId,
      withProfilePublicId: withProfilePublicId
    }, (result: AckResult) => {
      resolve(result)
    })
  })
}
