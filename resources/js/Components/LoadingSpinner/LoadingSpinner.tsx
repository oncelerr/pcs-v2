import React from 'react';
import './LoadingSpinner.css';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
  fullPage?: boolean;
  backgroundColor?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'medium',
  color = '#126654',
  fullPage = false,
  backgroundColor = 'rgba(245, 245, 245)'
}) => {
  // Size mapping in pixels
  const sizeMap = {
    small: '20px',
    medium: '40px',
    large: '60px'
  };

  const spinnerSize = sizeMap[size];
  const borderWidth = size === 'small' ? '2px' : '4px';

  const spinnerStyle: React.CSSProperties = {
    width: spinnerSize,
    height: spinnerSize,
    border: `${borderWidth} solid rgba(0, 0, 0, 0.1)`,
    borderTopColor: color,
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  };

  if (fullPage) {
    return (
      <div className="loading-container">
        <div className="spinner" style={spinnerStyle}></div>
      </div>
    );
  }

  return <div className="spinner" style={spinnerStyle}></div>;
};

export default LoadingSpinner;
