import { PrismaClient } from '@/generated/prisma/client'

export class DirectMessageModel {

  // Consts
  clName = 'DirectMessageModel'

  // Code
  async create(
    prisma: PrismaClient,
    fromProfileId: string,
    toProfileId: string,
    message: string,
    readAt: Date | null | undefined = undefined) {

    // Debug
    const fnName = `${this.clName}.create()`

    // Create record
    try {
      return await prisma.directMessage.create({
        data: {
          fromProfileId: fromProfileId,
          toProfileId: toProfileId,
          message: message,
          readAt: readAt ?? null
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  // Load a conversation thread between two profiles, oldest first. The most
  // recent `limit` messages are returned.
  async getThread(
    prisma: PrismaClient,
    profileIdA: string,
    profileIdB: string,
    limit: number = 200) {

    // Debug
    const fnName = `${this.clName}.getThread()`

    // Query
    try {
      const messages = await prisma.directMessage.findMany({
        where: {
          OR: [
            {
              fromProfileId: profileIdA,
              toProfileId: profileIdB
            },
            {
              fromProfileId: profileIdB,
              toProfileId: profileIdA
            }
          ]
        },
        orderBy: {
          created: 'desc'
        },
        take: limit
      })

      // Return oldest first
      return messages.reverse()
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  // One row per peer profile that has exchanged messages with the given
  // profile: the latest message in the thread and the number of unread
  // messages sent to the given profile.
  async getConversationSummaries(
    prisma: PrismaClient,
    profileId: string) {

    // Debug
    const fnName = `${this.clName}.getConversationSummaries()`

    // Query
    try {
      return await prisma.$queryRaw<{
        peerProfileId: string
        unreadCount: bigint
        lastMessageId: string
      }[]>`
        WITH peers AS (
          SELECT CASE WHEN dm.from_profile_id = ${profileId}
                      THEN dm.to_profile_id
                      ELSE dm.from_profile_id
                 END AS peer_id,
                 MAX(dm.created) AS last_created
          FROM direct_message dm
          WHERE dm.from_profile_id = ${profileId}
             OR dm.to_profile_id = ${profileId}
          GROUP BY 1
        )
        SELECT
          peers.peer_id AS "peerProfileId",
          (SELECT COUNT(*)
             FROM direct_message unread_m
            WHERE unread_m.to_profile_id = ${profileId}
              AND unread_m.from_profile_id = peers.peer_id
              AND unread_m.read_at IS NULL) AS "unreadCount",
          (SELECT last_m.id
             FROM direct_message last_m
            WHERE (last_m.from_profile_id = ${profileId}
                     AND last_m.to_profile_id = peers.peer_id)
               OR (last_m.to_profile_id = ${profileId}
                     AND last_m.from_profile_id = peers.peer_id)
            ORDER BY last_m.created DESC
            LIMIT 1) AS "lastMessageId"
        FROM peers
        ORDER BY peers.last_created DESC`
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  // Mark all messages sent to the given profile by the peer as read
  async markThreadRead(
    prisma: PrismaClient,
    toProfileId: string,
    fromProfileId: string,
    readAt: Date) {

    // Debug
    const fnName = `${this.clName}.markThreadRead()`

    // Update
    try {
      const result = await prisma.directMessage.updateMany({
        where: {
          fromProfileId: fromProfileId,
          toProfileId: toProfileId,
          readAt: null
        },
        data: {
          readAt: readAt
        }
      })

      return result.count
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  // Total number of unread messages sent to the given profile
  async getUnreadCount(
    prisma: PrismaClient,
    profileId: string) {

    // Debug
    const fnName = `${this.clName}.getUnreadCount()`

    // Query
    try {
      return await prisma.directMessage.count({
        where: {
          toProfileId: profileId,
          readAt: null
        }
      })
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }
}
