// server/src/pages/api/socket-io.ts
import { NextApiRequest, NextApiResponse } from 'next'

// Start the Socket.io server and register its handlers when this route
// module is loaded. The shared server singleton lives in
// services/socket-io/; only one process binds the port.
import '@/services/socket-io/dm-socket-service'

const socketIoHandler = async (req: NextApiRequest, res: NextApiResponse) => {

  // The client app runs on a different origin (e.g. :3001) than this
  // server (:3000), and the client pings this route to start the
  // socket.io singleton. Allow that cross-origin bootstrap call.
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')

  res.status(200).json({ status: true })
}

export default socketIoHandler
