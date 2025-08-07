# Nest Kudos GraphQL API

This is a real-time employee recognition GraphQL API built using Apollo Server, Express, TypeScript, and WebSockets.

---

## Prerequisites

- **Node.js:** v20.19.4
- **npm:** Comes with Node.js

---

##  Setup & Run

Follow these steps to install and run the API locally.

### 1. Clone the repository
```bash
git clone https://github.com/vishruth1997/kudos-api.git
cd kudos-api
```

### 2. Install dependencies
```bash
npm install
```

### 3. Start the development server
```bash
npm start
```

After running this command, you should see:
```
 Server running at http://localhost:4000/graphql
 Subscriptions ready at ws://localhost:4000/graphql
```

---

##  Open GraphQL Playground

Open your browser and go to:

```
http://localhost:4000/graphql
```

This opens Apollo’s GraphQL Playground where you can:

- Run queries
- Send mutations
- Subscribe to real-time updates

---

##  Project Structure

```
.
├── src/
│   ├── auth.ts         # Simulated “login” via getCurrentUser()
│   ├── index.ts        # Express + ApolloServer + WebSocket setup
│   ├── mockData.ts     # In-memory users & recognitions
│   ├── resolvers.ts    # Query, Mutation, Subscription logic + RBAC
│   ├── schema.ts       # GraphQL typeDefs with descriptions
│   └── types.ts        # TypeScript enums for Role & Visibility
├── package.json
├── tsconfig.json
└── README.md
```

---

##  API Schema Overview

```graphql
"""
A user in the organization.
"""
type User {
  id: ID!
  name: String!
  role: Role!
  team: String!
}

"""
A recognition (kudos) sent from one employee to another.
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
  List all recognitions visible to the given user.
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
```

---

##  Usage Examples

### 1. Query all users
```graphql
query {
  users {
    id
    name
    role
    team
  }
}
```

### 2. Query recognitions (as Manager or HR)
```graphql
query {
  recognitions(userId: "2") {
    id
    message
    emoji
    visibility
    sender { name }
    recipient { name }
  }
}
```

### 3. Query my recognitions (recipient)
```graphql
query {
  myRecognitions(userId: "1") {
    id
    message
    visibility
    createdAt
  }
}
```

### 4. Send a recognition
```graphql
mutation {
  sendRecognition(
    senderId: "1"
    recipientId: "2"
    message: "Excellent work on the sprint!"
    emoji: ":)"
    visibility: PUBLIC
  ) {
    id
    message
    createdAt
  }
}
```

### 5. Subscribe to new recognitions (real-time)
```graphql
subscription {
  newRecognition {
    id
    message
    emoji
    visibility
    sender { name }
    recipient { name }
  }
}
```

---

##  Role-Based Access Control

| Role      | Can Send | View Own Recognitions | View All Recognitions |
|-----------|----------|------------------------|------------------------|
| EMPLOYEE  | Yes      | Yes                      | No (only public)       |
| MANAGER   | Yes      | Yes                      | Yes                    |
| HR        | No       | Yes                      | Yes                    |
| LEAD      | Yes      | Yes                      | No (unless cross-team) |

- Access control enforced using the `getCurrentUser()` utility in `auth.ts`
- RBAC logic handled directly in resolvers

---

##  Design Decisions & Assumptions

-  **In-memory data** (`mockData.ts`) is used to keep the project self-contained and easy to test without needing to set up a database. This enables fast prototyping and clear demonstration of API behavior. It also matches the assignment’s instruction to use mock data or simple storage.

-  **Simulated authentication** is implemented via passing `userId` as an argument to queries and mutations. Since no authentication system was required, this approach allows us to simulate role-based access control without implementing login/session/token infrastructure, while still showing how different roles affect behavior.

-  **GraphQL Subscriptions** using `graphql-ws` are used to deliver real-time recognition notifications. This directly fulfills the requirement for real-time updates. Apollo Server v5 with WebSocket support was chosen for a modern, production-aligned solution.

-  **Fallback strategy** (polling every 10 minutes) is acknowledged and documented for cases where WebSocket-based subscriptions are not feasible. Though not implemented, the code structure supports switching to polling without major redesign.

-  **Extensible schema**: The `Recognition` type is designed to easily accept future features like `badges`, `likes`, `comments`, and `reactions` by extending the existing type or adding related types. This anticipates evolving requirements without requiring schema overhauls.

-  **Analytics-ready design**: Every recognition stores the `message`, `emoji`, `visibility`, and is linked to `sender` and `recipient`, who have `team` info. This enables team-based and keyword-based analytics, as mentioned in the assignment. Keyword search and engagement metrics can be layered on top of this data.

-  **Slack/Teams integration** is planned as a future feature. The mutation logic (e.g., `sendRecognition`) can be extended to trigger HTTP webhooks or API calls to Slack or Microsoft Teams without altering the core schema or business logic. This aligns with stakeholder interest and supports modular expansion.

---


```
