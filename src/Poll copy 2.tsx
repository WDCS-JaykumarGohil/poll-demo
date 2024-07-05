// src/Poll.tsx
import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useDebounce } from "./hooks/useDebounce";

type Option = {
  id: string;
  text: string;
  vote_count: number;
};

type PollProps = {
  question: string;
  options: Option[];
  multiple: boolean;
};

const Poll: React.FC<PollProps> = ({ question, options, multiple }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [previousOptions, setPreviousOptions] = useState<string[]>([]);
  const [updatedOptions, setUpdatedOptions] = useState<Option[]>(options);

  const handleSelectionChange = (optionId: string) => {
    setSelectedOptions(prev => {
      let newSelection: string[] = [];
      if (multiple) {
        newSelection = prev.includes(optionId) ? prev.filter(id => id !== optionId) : [...prev, optionId];
      } else {
        newSelection = prev.includes(optionId) ? [] : [optionId];
      }

      const updated = updatedOptions.map(option => {
        if (newSelection.includes(option.id) && !prev.includes(option.id)) {
          return { ...option, vote_count: option.vote_count + 1 };
        } else if (!newSelection.includes(option.id) && prev.includes(option.id)) {
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
  }, [selectedOptions]);

  return (
    <div>
      <h3>{question}</h3>
      {updatedOptions.map(option => (
        <div key={option.id}>
          <input type="checkbox" id={"id_" + option.id} checked={selectedOptions.includes(option.id)} onChange={() => handleSelectionChange(option.id)} />
          <label htmlFor={"id_" + option.id}>
            {option.text} ({option.vote_count})
          </label>
        </div>
      ))}
    </div>
  );
};

export default Poll;
