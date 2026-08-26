import { CustomError, UsersService } from 'serene-core-server'
import { prisma } from '@/db'
import { UsernameModel } from '@/models/users/username-model'
// import { CreateChatSessionService } from '@/services/chats/create-chat-service'
import { ProjectsQueryService } from '@/services/projects/query-service'
// import { ServerActionsQueryService } from '@/services/actions/query-service'
import { UsernamesQueryService } from '@/services/usernames/query-service'

// Models
const usernameModel = new UsernameModel()

// Services
// const createChatSessionService = new CreateChatSessionService()
const projectsQueryService = new ProjectsQueryService()
// const serverActionsQueryService = new ServerActionsQueryService()
const usernamesQueryService = new UsernamesQueryService()
const usersService = new UsersService()

// Code
export async function loadServerStartData(
  parent: any,
  args: any,
  context: any,
  info: any) {

  // Debug
  const fnName = `loadServerStartData()`

  // console.log(`${fnName}: args: ` + JSON.stringify(args))

  // Get user
  const user = await
    usersService.getUserByUserProfileId(
      prisma,
      args.userProfileId)

  // Get username
  const username = await
    usernameModel.getByUserProfileId(
      prisma,
      args.userProfileId)

  // Get pageUser
  var pageUser: any = undefined

  if (args.pageUsername != null) {

    pageUser = await
      usernamesQueryService.getPageUsername(
        prisma,
        args.userProfileId,  // viewerUserProfileId
        args.pageUsername)
  }

  // Load pageProject
  var pageProject: any = undefined

  if (args.pageProjectKey != null) {

    pageProject = await
      projectsQueryService.getProjectByKey(
        prisma,
        args.userProfileId,  // viewerUserProfileId
        null,  // parentId
        args.pageProjectKey)

    if (pageProject.status === false) {
      return pageProject
    }
  }

  /* Load chat session
  var chatSession: any = undefined

  if (args.loadChatSession === true &&
      (args.chatSessionId != null ||
       args.chatSettingsName != null)) {

    // Debug
    console.log(`${fnName}: loading chat session..`)

    // Load chat session
    var chatSessionResults: any = null

    await prisma.$transaction(async (transactionPrisma: any) => {

      try {
        chatSessionResults = await
          createChatSessionService.getOrCreateChatSession(
            transactionPrisma,
            args.projectId,
            args.userProfileId,
            args.chatSessionId,
            null,  // externalIntegration
            null,  // externalId
            args.chatSettingsName,
            args.agentId,
            args.graphId,
            null)  // chatSessionOptions
      } catch (error) {
        if (error instanceof CustomError) {
          return {
            status: false,
            message: error.message
          }
        } else {
          return {
            status: false,
            message: `Unexpected error: ${error}`
          }
        }
      }
    })

    // Debug
    console.log(`${fnName}: chatSessionResults: ` +
                JSON.stringify(chatSessionResults))

    // Handle chatSessionResults
    if (chatSessionResults.status === false) {
      return chatSessionResults
    }

    chatSession = chatSessionResults.chatSession
  } */

  /* Debug
  console.log(`${fnName}: pageUser: ` + JSON.stringify(pageUser))
  console.log(`${fnName}: pageProject: ` + JSON.stringify(pageProject)) */

  // Return
  return {
    status: true,
    username: username,
    pageUser: pageUser,
    pageProject: pageProject,
    // redirectUrl: redirectUrl
    // chatSession: chatSession
  }
}
