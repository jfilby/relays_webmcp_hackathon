import { PrismaClient } from '@/generated/prisma/client'
import { DemoDataTypes } from '@/types/demo-data-types'
import { CoreDemoDataSetupService } from './core-service'
import { ProfilesDemoDataSetupService } from './profiles-service'

// Models
import { OrganizationModel } from '@/models/organizations/organization-model'
import { ProjectInterestModel } from '@/models/projects/project-interest-model'
import { ProjectMemberModel } from '@/models/projects/project-member-model'
import { ProjectModel } from '@/models/projects/project-model'
import { ProjectUrlModel } from '@/models/projects/project-url-model'

// Services
const coreDemoDataService = new CoreDemoDataSetupService()
const profilesDemoDataService = new ProfilesDemoDataSetupService()

// Models
const projectModel = new ProjectModel()
const projectMemberModel = new ProjectMemberModel()
const projectUrlModel = new ProjectUrlModel()
const projectInterestModel = new ProjectInterestModel()
const organizationModel = new OrganizationModel()

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

      const project = await projectModel.upsert(
        prisma,
        undefined,
        data.publicId,
        instance.id,
        data.isPromoted ?? false,
        data.status,
        organizationId,
        data.tagline,
        data.description,
        data.image,
        data.techStack ?? [],
        data.stage,
        data.isOpenToCollaborators ?? false,
        true)  // isDemoData

      // Upsert URLs
      for (const url of data.urls ?? []) {
        await projectUrlModel.upsert(
          prisma,
          undefined,
          project.id,
          url.kind,
          url.url,
          url.label)
      }
    }

    // Upsert members
    for (const data of DemoDataTypes.projectMembers) {
      const project = await this.getProjectByKey(prisma, data.projectKey)
      const profile = await profilesDemoDataService.getProfileByKey(
        prisma,
        data.profileKey)

      await projectMemberModel.upsert(
        prisma,
        undefined,
        project.id,
        profile.id,
        data.role,
        data.status)
    }

    // Upsert interests
    for (const data of DemoDataTypes.projectInterests) {
      const profile = await profilesDemoDataService.getProfileByKey(
        prisma,
        data.profileKey)
      const project = await this.getProjectByKey(prisma, data.projectKey)

      await projectInterestModel.upsert(
        prisma,
        undefined,
        profile.id,
        project.id)
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

    const project = await projectModel.getByPublicId(
      prisma,
      data.publicId)

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

    const organization = await organizationModel.getByName(
      prisma,
      data.name)

    if (organization == null) {
      throw `${this.clName}: demo organization not found: ${data.name}`
    }

    return organization.id
  }
}
