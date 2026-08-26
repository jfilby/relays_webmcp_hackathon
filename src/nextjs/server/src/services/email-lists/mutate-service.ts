import { PrismaClient } from '@/generated/prisma/client'
import { BaseDataTypes } from '@/types/base-data-types'
import { EmailListModel } from '@/models/email-lists/email-list-model'
import { EmailListUserModel } from '@/models/email-lists/email-list-user-model'

// Models
const emailListModel = new EmailListModel()
const emailListUserModel = new EmailListUserModel()

export class EmailListsMutateService {

  // Consts
  clName = 'EmailListsMutateService'

  updatesEmailListName = 'updates'

  // Get the "updates" email list, creating it (active) if it doesn't exist.
  async getOrCreateUpdatesList(
    prisma: PrismaClient) {

    // Debug
    const fnName = `${this.clName}.getOrCreateUpdatesList()`

    // Try to get the existing list
    const emailList = await
      emailListModel.getByName(
        prisma,
        this.updatesEmailListName)

    if (emailList != null) {
      return emailList
    }

    // Create it (a race could still create it; a unique-constraint failure is
    // handled by the caller as a duplicate tuple rather than a crash).
    try {
      return await
        emailListModel.create(
          prisma,
          BaseDataTypes.activeStatus,
          this.updatesEmailListName)
    } catch (error) {
      console.error(`${fnName}: error: ${error}`)
      throw 'Prisma error'
    }
  }

  // Subscribe a signed-in user profile to the updates email list.
  async subscribeByUserProfileId(
    prisma: PrismaClient,
    userProfileId: string) {

    // Ensure the updates list exists
    const updatesList = await
      this.getOrCreateUpdatesList(
        prisma)

    // No-op if already subscribed
    const existing = await
      emailListUserModel.getByUserProfileId(
        prisma,
        updatesList.id,
        userProfileId)

    if (existing != null) {
      return
    }

    // Subscribe
    await emailListUserModel.createByUserProfileId(
      prisma,
      updatesList.id,
      userProfileId)
  }

  // Unsubscribe a signed-in user profile from the updates email list.
  async unsubscribeByUserProfileId(
    prisma: PrismaClient,
    userProfileId: string) {

    // Ensure the updates list exists
    const updatesList = await
      this.getOrCreateUpdatesList(
        prisma)

    // Delete the membership if present
    const existing = await
      emailListUserModel.getByUserProfileId(
        prisma,
        updatesList.id,
        userProfileId)

    if (existing != null) {
      await emailListUserModel.deleteById(
        prisma,
        existing.id)
    }
  }

  // Subscribe a visitor (not signed-in) by email address.
  async subscribeByEmail(
    prisma: PrismaClient,
    email: string) {

    // Ensure the updates list exists
    const updatesList = await
      this.getOrCreateUpdatesList(
        prisma)

    // No-op if already subscribed
    const existing = await
      emailListUserModel.getByEmail(
        prisma,
        updatesList.id,
        email)

    if (existing != null) {
      return
    }

    // Subscribe
    await emailListUserModel.createByEmail(
      prisma,
      updatesList.id,
      email)
  }
}