import React from 'react';

interface InputLabelProps {
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}

const InputLabel: React.FC<InputLabelProps> = ({ htmlFor, className, children }) => {
  return (
    <label htmlFor={htmlFor} className={className}>
      {children}
    </label>
  );
};

export default InputLabel;
