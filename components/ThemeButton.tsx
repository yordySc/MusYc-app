import React, { PropsWithChildren, useState, useCallback } from 'react';
import { Pressable, Text, PressableProps, ActivityIndicator, StyleProp, ViewStyle } from 'react-native';
import { useTheme } from './Theme';

type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'text' | 'danger';

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
  const { isDark } = useTheme();

  const getVariantClasses = useCallback((pressedState: boolean) => {
    let bg = '';
    let text = 'text-white';
    let opacity = pressedState ? 'opacity-80' : 'opacity-100';

    switch (variant) {
      case 'primary':
        bg = 'bg-primary dark:bg-primary'; 
        text = 'text-white dark:text-white';
        break;
      case 'secondary':
        bg = 'bg-secondary dark:bg-secondary';
        text = 'text-primary dark:text-primary';
        break;
      case 'accent':
        bg = 'bg-accent dark:bg-accent-dark';
        text = 'text-primary dark:text-primary';
        break;
      case 'danger':
        bg = 'bg-danger dark:bg-danger';
        text = 'text-white dark:text-white';
        break;
      case 'text':
        bg = 'bg-transparent';
        text = 'text-primary dark:text-secondary';
        opacity = pressedState ? 'opacity-60' : 'opacity-100';
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
        <ActivityIndicator color={isDark ? '#FFFFFF' : '#132E32'} />
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