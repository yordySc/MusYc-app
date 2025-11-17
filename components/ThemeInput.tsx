import React, { useState, PropsWithChildren } from 'react';
import { TextInput, TextInputProps, StyleProp, ViewStyle } from 'react-native';

interface ThemeInputProps extends TextInputProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  status?: 'default' | 'error' | 'success'; 
}

const ThemeInput: React.FC<PropsWithChildren<ThemeInputProps>> = ({ 
  className = '', 
  style, 
  status = 'default',
  placeholderTextColor,
  ...props 
}) => {
  const [isFocused, setIsFocused] = useState(false);
  let baseClasses = 'p-3 rounded-lg border text-base font-medium';
  let themeClasses = 'bg-card-light dark:bg-card-dark text-text-light dark:text-text-dark';
  let borderClasses = 'border-border-light dark:border-border-dark';

  if (isFocused) {
    borderClasses = 'border-primary dark:border-secondary';
  }
  
  if (status === 'error') {
    borderClasses = 'border-red-500';
  } else if (status === 'success') {
    borderClasses = 'border-primary';
  }

  const finalClasses = `${baseClasses} ${themeClasses} ${borderClasses} ${className}`;
  
  const defaultPlaceholderColor = isFocused 
    ? (status === 'error' ? '#f87171' : '#a8b5c9') 
    : '#9ca3af'; 

  return (
    <TextInput 
      className={finalClasses}
      style={style}
      placeholderTextColor={placeholderTextColor || defaultPlaceholderColor}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      {...props}
    />
  );
};

export default ThemeInput;