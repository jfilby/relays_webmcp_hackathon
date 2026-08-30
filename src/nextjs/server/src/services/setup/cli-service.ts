import { UsersService } from 'serene-core-server'
import { PrismaClient } from '@/generated/prisma/client'
import { ServerTestTypes } from '@/types/server-test-types'
import { BatchService } from '../batch/service'
import { DemoDataSetupService } from './demo-data/setup-service'
import { SetupService } from './setup-service'
// import { TestsService } from '../tests/tests-service'

// Services
const batchService = new BatchService()
const demoDataSetupService = new DemoDataSetupService()
const setupService = new SetupService()
// const testsService = new TestsService()
const usersService = new UsersService()

// Class
export class CliService {

  // Consts
  clName = 'CliService'

  batchCommand = 'batch'
  demoDataCommand = 'demo-data'
  setupCommand = 'setup'
  testsCommand = 'tests'

  commands = [
    this.batchCommand,
    this.setupCommand,
    this.testsCommand
  ]

  // Code
  async runCommand(
    prisma: PrismaClient,
    command: string) {

    // Debug
    const fnName = `${this.clName}.runCommand()`

    // Output
    console.log(`${fnName}: comand to run: ${command}`)

    // Get/create an admin user
    const adminUserProfile = await
      usersService.getOrCreateUserByEmail(
        prisma,
        ServerTestTypes.adminUserEmail,
        undefined)  // defaultUserPreferences

    // Get/create a regular (non-admin) user
    const regularTestUserProfile = await
      usersService.getOrCreateUserByEmail(
        prisma,
        ServerTestTypes.regularTestUserEmail,
        undefined)  // defaultUserPreferences

    // Handle command to run
    switch (command) {

      case this.batchCommand: {

        await batchService.run(prisma)
        break
      }

      case this.demoDataCommand: {

        await demoDataSetupService.setup(prisma)
        break
      }

      case this.setupCommand: {

        await setupService.setup(prisma)
        break
      }

      /* case this.testsCommand: {

        await testsService.tests(
          prisma,
          undefined)  // testName

        break
      } */

      default: {

        console.log(`${fnName}: invalid command, selection is: ` +
          JSON.stringify(this.commands))

        await prisma.$disconnect()
        process.exit(1)
      }
    }
  }
}
