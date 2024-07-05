// src/Poll.tsx
import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useDebounce } from "./hooks/useDebounce";
import { useQuery, gql } from "@apollo/client";
import { useParams } from "react-router-dom";

const GET_COMMUNITY_MESSAGES = gql`
  query GetCommunityMessages($channel_id: String!, $user_id: String!, $limit: Int, $page: Int) {
    getAllCommunityMessage(data: { channel_id: $channel_id, user_id: $user_id, limit: $limit, page: $page }) {
      total_records
      total_pages
      current_page
      per_page
      results {
        id
        channel_id
        message_type
        is_deleted
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
  }
`;

type Option = {
  option_id: string;
  option_text: string;
  vote_count: number;
};

const Poll: React.FC = () => {
  const { channel_id, user_id } = useParams<{ channel_id: string; user_id: string }>();
  const { loading, error, data } = useQuery(GET_COMMUNITY_MESSAGES, {
    variables: { channel_id, user_id, limit: 1, page: 1 },
  });

  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [previousOptions, setPreviousOptions] = useState<string[]>([]);
  const [question, setQuestion] = useState<string>("");
  const [options, setOptions] = useState<Option[]>([]);
  const [multiple, setMultiple] = useState<boolean>(false);

  useEffect(() => {
    if (data && data.getAllCommunityMessage.results.length > 0) {
      const poll = data.getAllCommunityMessage.results[0].meta_data.poll_details;
      setQuestion(poll.question_text);
      setOptions(poll.options_list);
      setMultiple(poll.is_multiple_response);
    }
  }, [data]);

  const handleSelectionChange = (optionId: string) => {
    setSelectedOptions(prev => {
      if (multiple) {
        return prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId];
      } else {
        return prev.includes(optionId) ? [] : [optionId];
      }
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
      <h3>{question}</h3>
      {options.map(option => (
        <div key={option.option_id}>
          <input type="checkbox" id={"id_" + option.option_id} checked={selectedOptions.includes(option.option_id)} onChange={() => handleSelectionChange(option.option_id)} />
          <label htmlFor={"id_" + option.option_id}>
            {option.option_id} ({option.vote_count})
          </label>
        </div>
      ))}
    </div>
  );
};

export default Poll;
