import React from 'react';

interface LoadingSpinnerProps {
  small?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ small = false }) => {
  const sizeClasses = small ? 'w-5 h-5 border-2' : 'w-10 h-10 border-[3px]';
  return (
    <div className={`animate-spin rounded-full ${sizeClasses} border-sky-400 border-t-transparent`}></div>
  );
};