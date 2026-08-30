import { PrismaClient } from '@/generated/prisma/client'
import { CoreDemoDataSetupService } from './core-service'
import { ProfilesDemoDataSetupService } from './profiles-service'
import { OrganizationsDemoDataSetupService } from './organizations-service'
import { ProjectsDemoDataSetupService } from './projects-service'
import { CollaborationDemoDataSetupService } from './collaboration-service'
import { DiscussionDemoDataSetupService } from './discussion-service'
import { NotificationsDemoDataSetupService } from './notifications-service'
import { EmailListsDemoDataSetupService } from './email-lists-service'
import { BatchDemoDataSetupService } from './batch-service'
import { AvatarsDemoDataSetupService } from './avatars-service'

// Services
const coreDemoDataService = new CoreDemoDataSetupService()
const profilesDemoDataService = new ProfilesDemoDataSetupService()
const organizationsDemoDataService = new OrganizationsDemoDataSetupService()
const projectsDemoDataService = new ProjectsDemoDataSetupService()
const collaborationDemoDataService = new CollaborationDemoDataSetupService()
const discussionDemoDataService = new DiscussionDemoDataSetupService()
const notificationsDemoDataService = new NotificationsDemoDataSetupService()
const emailListsDemoDataService = new EmailListsDemoDataSetupService()
const batchDemoDataService = new BatchDemoDataSetupService()
const avatarsDemoDataService = new AvatarsDemoDataSetupService()

// Class
export class DemoDataSetupService {

  // Consts
  clName = 'DemoDataSetupService'

  // Code
  async setup(prisma: PrismaClient) {

    // Setup the serene-core data (user profiles and instances) that the
    // Relays-specific demo data hangs off
    await coreDemoDataService.setup(prisma)

    // Setup profiles and networking data (skills, links, endorsements,
    // connections)
    await profilesDemoDataService.setup(prisma)

    // Setup organizations and members
    await organizationsDemoDataService.setup(prisma)

    // Setup projects, members, URLs and interests
    await projectsDemoDataService.setup(prisma)

    // Setup collaboration plans and steps
    await collaborationDemoDataService.setup(prisma)

    // Setup discussion posts and comments
    await discussionDemoDataService.setup(prisma)

    // Setup notifications
    await notificationsDemoDataService.setup(prisma)

    // Setup email lists and subscribers
    await emailListsDemoDataService.setup(prisma)

    // Setup batch jobs
    await batchDemoDataService.setup(prisma)

    // Assign the staged avatars (must run last so it overrides any avatar
    // set in the profile data)
    await avatarsDemoDataService.setup(prisma)
  }
}
