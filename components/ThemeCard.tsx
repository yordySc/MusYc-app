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
  let baseClasses = 'p-4 rounded-xl shadow-md';
  let themeClasses = 'bg-card-light dark:bg-card-dark border-border-light dark:border-border-dark';

  if (borderStyle !== 'none') {
    baseClasses += ' border';
  }

  if (borderStyle === 'left-accent') {
    baseClasses += ' border-l-4'; 
    themeClasses = themeClasses + ' border-l-primary dark:border-l-secondary';
  } else if (borderStyle === 'none') {
    themeClasses = themeClasses.replace('border-border-light dark:border-border-dark', '');
  }
  const finalClasses = `${baseClasses} ${themeClasses} ${className}`;
  return (
    <View className={finalClasses} style={style} {...props}>
      {children}
    </View>
  );
};

export default ThemeCard;