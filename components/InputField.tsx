import React, { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({ id, className, ...rest }) => {
  return (
    <input id={id} className={className} {...rest} />
  );
};

export default InputField;