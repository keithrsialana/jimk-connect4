const typeDefs = `
  type User {
    _id: ID
    username: String
    email: String
    password: String
    games_played: Int 
    games_won: Int   
    games_lost: Int 
  }

  input UserInput {
    username: String!
    email: String!
    password: String!
    games_played: Int 
    games_won: Int   
    games_lost: Int 
  }

    input UpdateUser {
    username: String
    email: String
    password: String
    games_played: Int
    games_won: Int   
    games_lost: Int 
  }
    
  
  type Auth {
    token: ID!
    user: User
  }

  type Query {
    users: [User]
    user(username: String!): User
    me: User
  }

  type Mutation {
    addUser(input: UserInput!): Auth
    login(email: String!, password: String!): Auth
    updateUser(input: UpdateUser): User
    deleteUser(userId: ID!):User
  }
`;

export default typeDefs;
