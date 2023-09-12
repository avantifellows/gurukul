import React, { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  className?: string;
}

const InputField: React.FC<InputFieldProps> = ({ id, className, ...rest }) => {
  return (
    <input id={id} className={`ps-2 pe-2 ${className}`} {...rest} />
  );
};

export default InputField;