import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes, DemoProjectData } from '@/types/demo-data-types'
import { CoreDemoDataSetupService } from './core-service'
import { ProfilesDemoDataSetupService } from './profiles-service'

// Services
const coreDemoDataService = new CoreDemoDataSetupService()
const profilesDemoDataService = new ProfilesDemoDataSetupService()

// Class
// Upserts demo projects and their members, URLs and interests.

export class ProjectsDemoDataSetupService {

  // Consts
  clName = 'ProjectsDemoDataSetupService'

  // Code
  async setup(prisma: PrismaClient) {

    // Debug
    const fnName = `${this.clName}.setup()`

    // Upsert projects
    for (const data of DemoDataTypes.projects) {
      const instance = await coreDemoDataService.getInstanceByKey(
        prisma,
        data.instanceKey)

      const organizationId = data.organizationKey != null ?
        await this.getOrganizationIdByKey(prisma, data.organizationKey) :
        null

      const project = await prisma.project.upsert({
        where: {
          publicId: data.publicId
        },
        create: this.toCreate(data, instance.id, organizationId),
        update: this.toUpdate(data, organizationId)
      })

      // Upsert URLs
      for (const url of data.urls ?? []) {
        await prisma.projectUrl.upsert({
          where: {
            projectId_url: {
              projectId: project.id,
              url: url.url
            }
          },
          create: {
            projectId: project.id,
            kind: url.kind,
            url: url.url,
            label: url.label
          },
          update: {
            kind: url.kind,
            label: url.label
          }
        })
      }
    }

    // Upsert members
    for (const data of DemoDataTypes.projectMembers) {
      const project = await this.getProjectByKey(prisma, data.projectKey)
      const profile = await profilesDemoDataService.getProfileByKey(
        prisma,
        data.profileKey)

      await prisma.projectMember.upsert({
        where: {
          projectId_profileId: {
            projectId: project.id,
            profileId: profile.id
          }
        },
        create: {
          projectId: project.id,
          profileId: profile.id,
          role: data.role,
          status: data.status
        },
        update: {
          role: data.role,
          status: data.status
        }
      })
    }

    // Upsert interests
    for (const data of DemoDataTypes.projectInterests) {
      const profile = await profilesDemoDataService.getProfileByKey(
        prisma,
        data.profileKey)
      const project = await this.getProjectByKey(prisma, data.projectKey)

      await prisma.projectInterest.upsert({
        where: {
          profileId_projectId: {
            profileId: profile.id,
            projectId: project.id
          }
        },
        create: {
          profileId: profile.id,
          projectId: project.id
        },
        update: {}
      })
    }
  }

  // Helpers

  async getProjectByKey(
    prisma: PrismaClient,
    key: string) {

    const data = DemoDataTypes.projects.find(d => d.key === key)

    if (data == null) {
      throw `${this.clName}: no demo project data for key: ${key}`
    }

    const project = await prisma.project.findUnique({
      where: {
        publicId: data.publicId
      }
    })

    if (project == null) {
      throw `${this.clName}: demo project not found: ${data.publicId}`
    }

    return project
  }

  async getOrganizationIdByKey(
    prisma: PrismaClient,
    key: string) {

    const data = DemoDataTypes.organizations.find(d => d.key === key)

    if (data == null) {
      throw `${this.clName}: no demo organization data for key: ${key}`
    }

    const organization = await prisma.organization.findFirst({
      where: {
        name: data.name
      },
      select: {
        id: true
      }
    })

    if (organization == null) {
      throw `${this.clName}: demo organization not found: ${data.name}`
    }

    return organization.id
  }

  private toCreate(
    data: DemoProjectData,
    instanceId: string,
    organizationId: string | null) {

    return {
      publicId: data.publicId,
      instanceId: instanceId,
      organizationId: organizationId,
      tagline: data.tagline,
      description: data.description,
      image: data.image,
      techStack: data.techStack ?? [],
      stage: data.stage,
      isOpenToCollaborators: data.isOpenToCollaborators ?? false,
      isPromoted: data.isPromoted ?? false,
      status: data.status
    }
  }

  private toUpdate(
    data: DemoProjectData,
    organizationId: string | null) {

    return {
      organizationId: organizationId,
      tagline: data.tagline,
      description: data.description,
      image: data.image,
      techStack: data.techStack ?? [],
      stage: data.stage,
      isOpenToCollaborators: data.isOpenToCollaborators ?? false,
      isPromoted: data.isPromoted ?? false,
      status: data.status
    }
  }
}
