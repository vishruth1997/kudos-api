import gql from 'graphql-tag';

export const typeDefs = gql`
  """
  A user in the organization
  """
  type User {
    id: ID!
    name: String!
    role: Role!
    team: String!
  }

  """
  A recognition (kudos) sent from one employee to another
  """
  type Recognition {
    id: ID!
    sender: User!
    recipient: User!
    message: String!
    emoji: String!
    visibility: Visibility!
    createdAt: String!
  }

  enum Role {
    EMPLOYEE
    MANAGER
    HR
    LEAD
  }

  enum Visibility {
    PUBLIC
    PRIVATE
    ANONYMOUS
  }

  type Query {
    users: [User!]!

    """
    List all recognitions visible to a given user.
    """
    recognitions(userId: ID!): [Recognition!]!

    """
    List only the recognitions received by this user.
    """
    myRecognitions(userId: ID!): [Recognition!]!
  }

  type Mutation {
    """
    Send a new recognition from one user to another.
    """
    sendRecognition(
      senderId: ID!
      recipientId: ID!
      message: String!
      emoji: String!
      visibility: Visibility!
    ): Recognition!
  }

  type Subscription {
    """
    Fires whenever a new recognition is created.
    """
    newRecognition: Recognition!
  }
`;
