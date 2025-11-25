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
  let themeClasses = 'bg-bg-card-light dark:bg-bg-card-dark text-text-light dark:text-text-dark';
  let borderClasses = 'border-border-light dark:border-border-dark';

  if (isFocused) {
    borderClasses = 'border-secondary dark:border-accent border-2';
  }
  
  if (status === 'error') {
    borderClasses = 'border-danger border-2';
  } else if (status === 'success') {
    borderClasses = 'border-success border-2';
  }

  const finalClasses = `${baseClasses} ${themeClasses} ${borderClasses} ${className}`;
  
  const defaultPlaceholderColor = isFocused 
    ? '#84FFC6' 
    : '#9CA3AF'; 

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