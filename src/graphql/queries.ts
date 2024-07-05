// src/graphql/queries.ts
import { gql } from "@apollo/client";

export const GET_POLL_DATA = gql`
  query GetPollData($channel_id: String!, $user_id: String!) {
    getAllCommunityMessage(data: { channel_id: $channel_id, user_id: $user_id, limit: 10, page: 1 }) {
      results {
        id
        message_type
        meta_data {
          poll_details {
            question_text
            is_multiple_response
            options_list {
              option_id
              option_text
              vote_count
            }
          }
        }
      }
    }
  }
`;
