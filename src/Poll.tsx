// src/Poll.tsx
import React, { useState, useEffect } from "react";
import "react-toastify/dist/ReactToastify.css";
import { useDebounce } from "./hooks/useDebounce";

type Option = {
  id: string;
  text: string;
};

type PollProps = {
  question: string;
  options: Option[];
  multiple: boolean;
};

const Poll: React.FC<PollProps> = ({ question, options, multiple }) => {
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [previousOptions, setPreviousOptions] = useState<string[]>([]);

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

  const debouncedNotify = useDebounce(notify, 2000);

  useEffect(() => {
    debouncedNotify();
  }, [selectedOptions, debouncedNotify]);

  return (
    <div>
      <h3>{question}</h3>
      {options.map(option => (
        <div key={option.id}>
          <input type="checkbox" id={"id_" + option.id} checked={selectedOptions.includes(option.id)} onChange={() => handleSelectionChange(option.id)} />
          <label htmlFor={"id_" + option.id}>{option.text}</label>
        </div>
      ))}
    </div>
  );
};

export default Poll;
