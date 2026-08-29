import { config as loadEnv } from 'dotenv'

// Load the env files, matching the Next.js convention
const dev = process.env.NODE_ENV !== 'production'
const env = dev ? 'development' : 'production'

loadEnv({
  quiet: true,
  path: [
    `.env.${env}.local`,
    '.env.local',
    `.env.${env}`,
    '.env'
  ]
})

// Requires/imports
import { prisma } from '@/db'

// Main
(async () => {

  // Debug
  const fnName = 'cli.ts'

  // Dynamic imports
  const { CliService } = await import('@/services/setup/cli-service')

  // Test
  // console.log(`NEXT_PUBLIC_SERVER_PORT: ` +
  //   `${process.env.NEXT_PUBLIC_SERVER_PORT}`)

  // Services
  const cliService = new CliService()

  // Run setup if needed
  // await setupService.setupIfRequired(prisma)

  // Run a command or show the menu
  if (process.argv.length >= 2 &&
      process.argv[2] != null) {

    // Run the chosen command
    await cliService.runCommand(
      prisma,
      process.argv[2])  // command

  } else {
    // await cliService.menu(prisma)
    console.error(`${fnName}: you must specify a command to run`)
  }

  // Done
  await prisma.$disconnect()
  process.exit(0)
})()
