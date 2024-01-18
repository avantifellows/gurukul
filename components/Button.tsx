import React from 'react';
import { PrimaryButton } from '@/app/types';

const PrimaryButton: React.FC<PrimaryButton> = ({ onClick, children, className }) => {
  const buttonClasses = `p-2 ${className}`;

  return (
    <button className={buttonClasses} onClick={onClick}>
      {children}
    </button>
  );
};

export default PrimaryButton;
