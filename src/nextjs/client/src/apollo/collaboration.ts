import { gql } from '@apollo/client'

export const createPlanMutation = gql`
  mutation createPlan(
    $userProfileId: String!,
    $projectId: String!,
    $title: String!,
    $description: String,
    $targetProfileId: String,
    $rolesNeeded: [String],
    $commitmentLevel: String,
    $compensation: String,
    $deliverables: String,
    $startBy: String)
  {
    createPlan(
      userProfileId: $userProfileId,
      projectId: $projectId,
      title: $title,
      description: $description,
      targetProfileId: $targetProfileId,
      rolesNeeded: $rolesNeeded,
      commitmentLevel: $commitmentLevel,
      compensation: $compensation,
      deliverables: $deliverables,
      startBy: $startBy) {

      status
      message
    }
  }
`

export const updatePlanMutation = gql`
  mutation updatePlan(
    $id: String!,
    $userProfileId: String!,
    $title: String,
    $description: String,
    $rolesNeeded: [String],
    $commitmentLevel: String,
    $compensation: String,
    $deliverables: String,
    $startBy: String)
  {
    updatePlan(
      id: $id,
      userProfileId: $userProfileId,
      title: $title,
      description: $description,
      rolesNeeded: $rolesNeeded,
      commitmentLevel: $commitmentLevel,
      compensation: $compensation,
      deliverables: $deliverables,
      startBy: $startBy) {

      status
      message
    }
  }
`

export const setPlanStatusMutation = gql`
  mutation setPlanStatus(
    $id: String!,
    $userProfileId: String!,
    $status: String!)
  {
    setPlanStatus(
      id: $id,
      userProfileId: $userProfileId,
      status: $status) {

      status
      message
    }
  }
`

export const addPlanStepMutation = gql`
  mutation addPlanStep(
    $userProfileId: String!,
    $planId: String!,
    $title: String!,
    $description: String)
  {
    addPlanStep(
      userProfileId: $userProfileId,
      planId: $planId,
      title: $title,
      description: $description) {

      status
      message
    }
  }
`

export const updatePlanStepMutation = gql`
  mutation updatePlanStep(
    $id: String!,
    $userProfileId: String!,
    $title: String,
    $description: String,
    $status: String)
  {
    updatePlanStep(
      id: $id,
      userProfileId: $userProfileId,
      title: $title,
      description: $description,
      status: $status) {

      status
      message
    }
  }
`

export const deletePlanStepMutation = gql`
  mutation deletePlanStep(
    $id: String!,
    $userProfileId: String!)
  {
    deletePlanStep(
      id: $id,
      userProfileId: $userProfileId) {

      status
      message
    }
  }
`

export const searchCollaborationPlansQuery = gql`
  query searchCollaborationPlans(
          $projectId: String,
          $userProfileId: String) {
    searchCollaborationPlans(
      projectId: $projectId,
      userProfileId: $userProfileId) {

      status
      message
      plans {
        id
        projectId
        projectName
        createdByProfileId
        createdByName
        targetProfileId
        targetName
        status
        title
        description
        rolesNeeded
        commitmentLevel
        compensation
        deliverables
        startBy
        completedAt
        created
        updated
      }
    }
  }
`

export const getCollaborationPlanByIdQuery = gql`
  query getCollaborationPlanById(
          $id: String!) {
    getCollaborationPlanById(
      id: $id) {

      status
      message
      plan {
        id
        projectId
        projectName
        createdByProfileId
        createdByName
        targetProfileId
        targetName
        status
        title
        description
        rolesNeeded
        commitmentLevel
        compensation
        deliverables
        startBy
        completedAt
        created
        updated
      }
    }
  }
`

export const getPlanStepsByPlanIdQuery = gql`
  query getPlanStepsByPlanId(
          $planId: String!) {
    getPlanStepsByPlanId(
      planId: $planId) {

      status
      message
      steps {
        id
        planId
        seq
        title
        description
        status
      }
    }
  }
`
