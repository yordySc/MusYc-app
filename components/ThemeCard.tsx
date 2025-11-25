import React, { PropsWithChildren } from 'react';
import { View, ViewProps, StyleProp, ViewStyle } from 'react-native';

interface ThemeCardProps extends ViewProps {
  className?: string;
  style?: StyleProp<ViewStyle>;
  borderStyle?: 'default' | 'none' | 'left-accent'; 
}
const ThemeCard: React.FC<PropsWithChildren<ThemeCardProps>> = ({ 
  className = '', 
  style, 
  borderStyle = 'default',
  children, 
  ...props 
}) => {
  let baseClasses = 'p-4 rounded-xl shadow-sm';
  let themeClasses = 'bg-bg-card-light dark:bg-bg-card-dark border border-border-light dark:border-border-dark';

  if (borderStyle === 'left-accent') {
    baseClasses += ' border-l-4'; 
    themeClasses = 'bg-bg-card-light dark:bg-bg-card-dark border border-border-light dark:border-border-dark border-l-secondary dark:border-l-accent';
  } else if (borderStyle === 'none') {
    themeClasses = 'bg-bg-card-light dark:bg-bg-card-dark';
  }
  
  const finalClasses = `${baseClasses} ${themeClasses} ${className}`;
  return (
    <View className={finalClasses} style={style} {...props}>
      {children}
    </View>
  );
};

export default ThemeCard;