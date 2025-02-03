import React from 'react';
import type { PrimaryButton as PrimaryButtonProps } from '@/app/types';

const PrimaryButton: React.FC<PrimaryButtonProps> = ({ onClick, children, className }) => {
  const buttonClasses = `${className}`;

  return (
    <button className={buttonClasses} onClick={onClick}>
      {children}
    </button>
  );
};

export default PrimaryButton;
