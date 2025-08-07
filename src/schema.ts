import gql from 'graphql-tag';

export const typeDefs = gql`
"""
A user in the organization.
"""
type User {
  id: ID!                     # Unique identifier
  name: String!               # Full name of the user
  role: Role!                 # User role used for access control
  team: String!               # Team/department the user belongs to
}

"""
A recognition (kudos) sent from one employee to another.
"""
type Recognition {
  id: ID!                     # Unique identifier for the recognition
  sender: User!               # User who sent the recognition
  recipient: User!            # User who received the recognition
  message: String!            # Short message included in the kudos
  emoji: String!              # Emoji used to express appreciation
  visibility: Visibility!     # Visibility level (public, private, anonymous)
  createdAt: String!          # Timestamp when recognition was sent
}

"""
User role for access control.
"""
enum Role {
  EMPLOYEE
  MANAGER
  HR
  LEAD
}

"""
Visibility level of a recognition.
"""
enum Visibility {
  PUBLIC
  PRIVATE
  ANONYMOUS
}

type Query {
  users: [User!]!

  """
  List all recognitions visible to a given user.
  Returns all recognitions if the user is HR or Manager,
  otherwise only returns public recognitions.
  """
  recognitions(userId: ID!): [Recognition!]!

  """
  List only the recognitions received by this user.
  Includes private and anonymous recognitions addressed to them.
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
  Used for real-time updates in the UI.
  """
  newRecognition: Recognition!
}
`;
