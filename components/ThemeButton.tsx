import React, { PropsWithChildren, useState, useCallback } from 'react';
import { Pressable, Text, PressableProps, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'text';

interface ThemeButtonProps extends PressableProps {
  label: string;
  variant?: ButtonVariant; 
  loading?: boolean;
  fullWidth?: boolean; 
  className?: string;
  style?: StyleProp<ViewStyle>; 
}
const ThemeButton: React.FC<PropsWithChildren<ThemeButtonProps>> = ({ 
  label, variant = 'primary', loading = false, fullWidth = true, className = '', disabled, children, ...props 
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getVariantClasses = useCallback((pressedState: boolean) => {
    let bg = '';
    let text = 'text-white';
    let opacity = pressedState ? 'opacity-80' : 'opacity-100';

    switch (variant) {
      case 'primary':
        bg = 'bg-primary dark:bg-primary'; 
        text = 'text-background-dark dark:text-background-dark';
        break;
      case 'secondary':
        bg = 'bg-secondary dark:bg-secondary';
        text = 'text-background-dark dark:text-background-dark';
        break;
      case 'accent':
        bg = 'bg-accent dark:bg-accent';
        text = 'text-background-dark dark:text-background-dark';
        break;
      case 'text':
        bg = 'bg-transparent';
        text = 'text-primary dark:text-secondary';
        opacity = pressedState ? 'opacity-50' : 'opacity-100';
        break;
    }

    if (disabled || loading) { opacity = 'opacity-50'; }

    return `${bg} ${text} ${opacity}`;
  }, [variant, disabled, loading]);

  const getTextColorClass = useCallback(() => {
      return getVariantClasses(false).split(' ').find(cls => cls.startsWith('text-')) || 'text-white';
  }, [getVariantClasses]);

  return (
    <Pressable
      onPressIn={() => setIsPressed(true)}
      onPressOut={() => setIsPressed(false)}
      className={`${fullWidth ? 'w-full' : ''} h-12 rounded-lg flex items-center justify-center transition-opacity ${getVariantClasses(isPressed)} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'text' ? '#5bbf96' : 'white'} />
      ) : (
        <Text className={`text-lg font-semibold ${getTextColorClass()}`}>
          {label}
        </Text>
      )}
      {children}
    </Pressable>
  );
};

export default ThemeButton;