// src/MessageList.tsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery, gql } from "@apollo/client";
import { useDebounce } from "./hooks/useDebounce";

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

const MessageList: React.FC = () => {
  const { channel_id, user_id } = useParams<{ channel_id: string; user_id: string }>();
  const { loading, error, data } = useQuery(GET_COMMUNITY_MESSAGES, {
    variables: { channel_id, user_id, limit: 10, page: 1 },
  });

  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string[] }>({});
  const [updatedOptions, setUpdatedOptions] = useState<{ [key: string]: any[] }>({});
  const [changedMessageIds, setChangedMessageIds] = useState<string[]>([]);

  useEffect(() => {
    if (data) {
      const initialOptions = data.getAllCommunityMessage.results.reduce((acc: any, message: any) => {
        if (message.message_type === "POLL") {
          acc[message.id] = message.meta_data.poll_details.options_list;
        }
        return acc;
      }, {});
      setUpdatedOptions(initialOptions);
    }
  }, [data]);

  const handleSelectionChange = (messageId: string, optionId: string, isMultiple: boolean) => {
    setSelectedOptions(prev => {
      const prevSelected = prev[messageId] || [];
      let newSelection: string[] = [];

      if (isMultiple) {
        newSelection = prevSelected.includes(optionId) ? prevSelected.filter(id => id !== optionId) : [...prevSelected, optionId];
      } else {
        newSelection = prevSelected.includes(optionId) ? [] : [optionId];
      }

      const updated = updatedOptions[messageId].map(option => {
        if (newSelection.includes(option.option_id) && !prevSelected.includes(option.option_id)) {
          return { ...option, vote_count: option.vote_count + 1 };
        } else if (!newSelection.includes(option.option_id) && prevSelected.includes(option.option_id)) {
          return { ...option, vote_count: option.vote_count - 1 };
        }
        return option;
      });

      setUpdatedOptions(prev => ({
        ...prev,
        [messageId]: updated,
      }));

      if (!changedMessageIds.includes(messageId)) {
        setChangedMessageIds(prev => [...prev, messageId]);
      }

      return { ...prev, [messageId]: newSelection };
    });
  };

  const notify = () => {
    changedMessageIds.forEach(messageId => {
      const deselectedOptions = (selectedOptions[messageId] || []).filter(opt => !(selectedOptions[messageId] || []).includes(opt));
      const selected = (selectedOptions[messageId] || []).filter(opt => !(selectedOptions[messageId] || []).includes(opt));
      if (deselectedOptions.length > 0 || selected.length > 0) {
        const message = `Socket called with new state | DESELECT: ${deselectedOptions.join(", ")}, SELECT: ${selected.join(", ")}`;
        console.log(message);
        alert(message);
      }
    });
    setChangedMessageIds([]);
  };

  const debouncedNotify = useDebounce(notify, 1000);

  useEffect(() => {
    debouncedNotify();
  }, [selectedOptions]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      <h1>
        Messages for Channel: {channel_id} and User: {user_id}
      </h1>
      <ul>
        {data.getAllCommunityMessage.results
          .filter((message: any) => message.message_type === "POLL")
          .map((message: any) => (
            <li key={message.id}>
              <p>Message Type: {message.meta_data.poll_details.is_multiple_response ? "Multiple" : "Single"} Selection</p>
              {message.meta_data?.poll_details && (
                <div>
                  <p>Poll Question: {message.meta_data.poll_details.question_text}</p>
                  <p>Options:</p>
                  <ul>
                    {updatedOptions[message.id]?.map((option: any) => (
                      <li key={option.option_id}>
                        <input type="checkbox" id={"id_" + option.option_id} checked={(selectedOptions[message.id] || []).includes(option.option_id)} onChange={() => handleSelectionChange(message.id, option.option_id, message.meta_data.poll_details.is_multiple_response)} />
                        <label htmlFor={"id_" + option.option_id}>
                          {option.option_text} (Votes: {option.vote_count})
                        </label>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default MessageList;
