import { gql } from '@apollo/client';

export const QUERY_USER = gql`
  query getUser($username: String!) {
    user(username: $username) {
      _id
      username
      email
      games_played
      games_won
      games_lost
    }
  }
`;

export const QUERY_ME = gql`
  query getMe {
    me {
      _id
      username
      email
      games_played
      games_won
      games_lost
    }
  }
`;
