import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  size = 'md',
  className = '', 
  ...props 
}) => {
  
  const sizeStyles = {
    sm: "px-5 py-2 text-sm",
    md: "px-8 py-3 text-base",
    lg: "px-10 py-4 text-lg"
  };

  const variants = {
    // Warm Gradient
    primary: "bg-gradient-love text-white shadow-lg shadow-orange-200 hover:shadow-xl hover:shadow-orange-300 hover:-translate-y-0.5 border-none",
    // Soft White
    secondary: "bg-white text-brand-primary border border-gray-100 shadow-sm hover:bg-gray-50",
    // Outline
    outline: "bg-transparent text-warm-text border-2 border-gray-200 hover:border-brand-primary hover:text-brand-primary",
    // Ghost
    ghost: "text-warm-subtext hover:text-brand-primary bg-transparent hover:bg-brand-primary/5"
  };

  return (
    <button 
      className={`
        relative rounded-full font-sans font-semibold transition-all duration-300 
        focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
        ${sizeStyles[size]} 
        ${variants[variant]} 
        ${className}
      `}
      disabled={isLoading || props.disabled}
      {...props}
    >
      <span className={`relative z-10 flex items-center justify-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center z-20">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};