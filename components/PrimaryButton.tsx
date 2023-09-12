import React from 'react';

interface PrimaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  disabled?: boolean;
}

const PrimaryButton = React.forwardRef<HTMLButtonElement, PrimaryButtonProps>(
  ({ className = '', disabled, children, ...props }, ref) => {
    return (
      <button
        {...props}
        ref={ref}
        className={`${
          disabled ? 'opacity-25' : ''
        } ${className}`}
        disabled={disabled}
      >
        {children}
      </button>
    );
  }
);

export default PrimaryButton;
