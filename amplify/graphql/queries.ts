/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "./API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getAllCanvasIdsForAuthenticatedUser = /* GraphQL */ `query GetAllCanvasIdsForAuthenticatedUser($ownerUsername: String!) {
  getAllCanvasIdsForAuthenticatedUser(ownerUsername: $ownerUsername) {
    areCanvasIdsReturned
    canvasIds
    errorMessage
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetAllCanvasIdsForAuthenticatedUserQueryVariables,
  APITypes.GetAllCanvasIdsForAuthenticatedUserQuery
>;
export const getCanvasCard = /* GraphQL */ `query GetCanvasCard($canvasId: String!) {
  getCanvasCard(canvasId: $canvasId) {
    canvasCard {
      description
      likeCount
      name
      ownerUsername
      publicity
      thumbnail
      viewCount
      __typename
    }
    errorMessage
    isCanvasCardReturned
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCanvasCardQueryVariables,
  APITypes.GetCanvasCardQuery
>;
export const getCanvasData = /* GraphQL */ `query GetCanvasData($canvasId: String!) {
  getCanvasData(canvasId: $canvasId) {
    canvasData {
      canvasData
      description
      likeCount
      name
      ownerUsername
      publicity
      viewCount
      __typename
    }
    errorMessage
    isCanvasDataReturned
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCanvasDataQueryVariables,
  APITypes.GetCanvasDataQuery
>;
export const getCanvasLikes = /* GraphQL */ `query GetCanvasLikes($likeId: Int!, $username: ID!) {
  getCanvasLikes(likeId: $likeId, username: $username) {
    canvasId
    cognitoId
    createdAt
    likeId
    ownerCognitoId
    updatedAt
    username
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCanvasLikesQueryVariables,
  APITypes.GetCanvasLikesQuery
>;
export const getCanvasSocialStats = /* GraphQL */ `query GetCanvasSocialStats($canvasId: String!, $ownerUsername: ID!) {
  getCanvasSocialStats(canvasId: $canvasId, ownerUsername: $ownerUsername) {
    canvasId
    createdAt
    likeCount
    ownerCognitoId
    ownerUsername
    updatedAt
    viewCount
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCanvasSocialStatsQueryVariables,
  APITypes.GetCanvasSocialStatsQuery
>;
export const getCanvases = /* GraphQL */ `query GetCanvases($canvasId: String!, $ownerUsername: ID!) {
  getCanvases(canvasId: $canvasId, ownerUsername: $ownerUsername) {
    canvasId
    createdAt
    description
    name
    ownerCognitoId
    ownerUsername
    publicity
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetCanvasesQueryVariables,
  APITypes.GetCanvasesQuery
>;
export const getPublicCanvasIdsForUser = /* GraphQL */ `query GetPublicCanvasIdsForUser($ownerUsername: String!) {
  getPublicCanvasIdsForUser(ownerUsername: $ownerUsername) {
    areCanvasIdsReturned
    canvasIds
    errorMessage
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetPublicCanvasIdsForUserQueryVariables,
  APITypes.GetPublicCanvasIdsForUserQuery
>;
export const getUsers = /* GraphQL */ `query GetUsers($username: ID!) {
  getUsers(username: $username) {
    cognitoId
    createdAt
    numberOfCanvases
    updatedAt
    username
    __typename
  }
}
` as GeneratedQuery<APITypes.GetUsersQueryVariables, APITypes.GetUsersQuery>;
export const listCanvasLikes = /* GraphQL */ `query ListCanvasLikes(
  $filter: ModelCanvasLikesFilterInput
  $likeId: ModelIntKeyConditionInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
  $username: ID
) {
  listCanvasLikes(
    filter: $filter
    likeId: $likeId
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
    username: $username
  ) {
    items {
      canvasId
      cognitoId
      createdAt
      likeId
      ownerCognitoId
      updatedAt
      username
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCanvasLikesQueryVariables,
  APITypes.ListCanvasLikesQuery
>;
export const listCanvasLikesByCanvasIdAndUsername = /* GraphQL */ `query ListCanvasLikesByCanvasIdAndUsername(
  $canvasId: String!
  $filter: ModelCanvasLikesFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
  $username: ModelIDKeyConditionInput
) {
  listCanvasLikesByCanvasIdAndUsername(
    canvasId: $canvasId
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
    username: $username
  ) {
    items {
      canvasId
      cognitoId
      createdAt
      likeId
      ownerCognitoId
      updatedAt
      username
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCanvasLikesByCanvasIdAndUsernameQueryVariables,
  APITypes.ListCanvasLikesByCanvasIdAndUsernameQuery
>;
export const listCanvasSocialStats = /* GraphQL */ `query ListCanvasSocialStats(
  $canvasId: ModelStringKeyConditionInput
  $filter: ModelCanvasSocialStatsFilterInput
  $limit: Int
  $nextToken: String
  $ownerUsername: ID
  $sortDirection: ModelSortDirection
) {
  listCanvasSocialStats(
    canvasId: $canvasId
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    ownerUsername: $ownerUsername
    sortDirection: $sortDirection
  ) {
    items {
      canvasId
      createdAt
      likeCount
      ownerCognitoId
      ownerUsername
      updatedAt
      viewCount
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCanvasSocialStatsQueryVariables,
  APITypes.ListCanvasSocialStatsQuery
>;
export const listCanvasSocialStatsByCanvasId = /* GraphQL */ `query ListCanvasSocialStatsByCanvasId(
  $canvasId: String!
  $filter: ModelCanvasSocialStatsFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listCanvasSocialStatsByCanvasId(
    canvasId: $canvasId
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      canvasId
      createdAt
      likeCount
      ownerCognitoId
      ownerUsername
      updatedAt
      viewCount
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCanvasSocialStatsByCanvasIdQueryVariables,
  APITypes.ListCanvasSocialStatsByCanvasIdQuery
>;
export const listCanvases = /* GraphQL */ `query ListCanvases(
  $canvasId: ModelStringKeyConditionInput
  $filter: ModelCanvasesFilterInput
  $limit: Int
  $nextToken: String
  $ownerUsername: ID
  $sortDirection: ModelSortDirection
) {
  listCanvases(
    canvasId: $canvasId
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    ownerUsername: $ownerUsername
    sortDirection: $sortDirection
  ) {
    items {
      canvasId
      createdAt
      description
      name
      ownerCognitoId
      ownerUsername
      publicity
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCanvasesQueryVariables,
  APITypes.ListCanvasesQuery
>;
export const listCanvasesByCanvasId = /* GraphQL */ `query ListCanvasesByCanvasId(
  $canvasId: String!
  $filter: ModelCanvasesFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
) {
  listCanvasesByCanvasId(
    canvasId: $canvasId
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
  ) {
    items {
      canvasId
      createdAt
      description
      name
      ownerCognitoId
      ownerUsername
      publicity
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListCanvasesByCanvasIdQueryVariables,
  APITypes.ListCanvasesByCanvasIdQuery
>;
export const listUsers = /* GraphQL */ `query ListUsers(
  $filter: ModelUsersFilterInput
  $limit: Int
  $nextToken: String
  $sortDirection: ModelSortDirection
  $username: ID
) {
  listUsers(
    filter: $filter
    limit: $limit
    nextToken: $nextToken
    sortDirection: $sortDirection
    username: $username
  ) {
    items {
      cognitoId
      createdAt
      numberOfCanvases
      updatedAt
      username
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListUsersQueryVariables, APITypes.ListUsersQuery>;