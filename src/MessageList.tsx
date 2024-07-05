// src/MessageList.tsx
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { useDebounce } from "./hooks/useDebounce";

const GET_COMMUNITY_MESSAGE_DETAIL = gql`
  query GetCommunityMessageDetailV3($user_id: String!, $message_id: String!) {
    getCommunityMessageDetailV3(data: { user_id: $user_id, message_id: $message_id }) {
      id
      meta_data {
        poll_details {
          question_text
          is_anonymous_vote
          is_multiple_response
          my_votes
          options_list {
            option_id
            option_text
            vote_count
          }
        }
      }
    }
  }
`;

type Option = {
  option_id: string;
  option_text: string;
  vote_count: number;
};

const MessageList: React.FC = () => {
  const { channel_id, message_id, user_id } = useParams<{ channel_id: string; message_id: string; user_id: string }>();
  const { loading, error, data } = useQuery(GET_COMMUNITY_MESSAGE_DETAIL, {
    variables: { user_id, message_id },
  });

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [previousOptions, setPreviousOptions] = useState<string[]>([]);
  const [updatedOptions, setUpdatedOptions] = useState<Option[]>([]);
  const [pollDetails, setPollDetails] = useState<any>(null);

  useEffect(() => {
    if (data && data.getCommunityMessageDetailV3) {
      const poll = data.getCommunityMessageDetailV3.meta_data.poll_details;
      setPollDetails(poll);
      setUpdatedOptions(poll.options_list);
      console.log("seting selectedOptions values");
      setSelectedOptions(poll.my_votes ? poll.my_votes.split(",") : []);
    }
  }, [data]);

  const handleSelectionChange = (optionId: string) => {
    setSelectedOptions(prev => {
      let newSelection: string[] = [];
      if (pollDetails?.is_multiple_response) {
        newSelection = prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId];
      } else {
        newSelection = prev.includes(optionId) ? [] : [optionId];
      }

      const updated = updatedOptions.map(option => {
        if (newSelection.includes(option.option_id) && !prev.includes(option.option_id)) {
          return { ...option, vote_count: option.vote_count + 1 };
        } else if (!newSelection.includes(option.option_id) && prev.includes(option.option_id)) {
          return { ...option, vote_count: option.vote_count - 1 };
        }
        return option;
      });

      setUpdatedOptions(updated);
      return newSelection;
    });
  };

  const notify = () => {
    const deselectedOptions = previousOptions.filter(opt => !selectedOptions.includes(opt));
    const selected = selectedOptions.filter(opt => !previousOptions.includes(opt));
    if (deselectedOptions.length > 0 || selected.length > 0) {
      const message = `Socket called with new state | DESELECT: ${deselectedOptions.join(", ")}, SELECT: ${selected.join(", ")}`;
      console.log(message);
      alert(message);
    }
    setPreviousOptions(selectedOptions);
  };

  const debouncedNotify = useDebounce(notify, 1000);

  useEffect(() => {
    debouncedNotify();
  }, [selectedOptions, debouncedNotify]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <p>
        Messages for <b>Channel:</b> {channel_id}, <b>MessageId:</b> {message_id} and <b>User:</b> {user_id}
      </p>
      {pollDetails ? (
        <>
          <h3>{pollDetails.question_text}</h3>
          <h3>({pollDetails.is_multiple_response ? "Multiple" : "Single"} Select)</h3>
          {updatedOptions.map(option => (
            <div key={option.option_id}>
              <input type="checkbox" id={"id_" + option.option_id} checked={selectedOptions.includes(option.option_id)} onChange={() => handleSelectionChange(option.option_id)} />
              <label htmlFor={"id_" + option.option_id}>
                {option.option_id} ({option.vote_count})
              </label>
            </div>
          ))}
        </>
      ) : (
        <p>No poll details available.</p>
      )}
    </div>
  );
};

export default MessageList;
