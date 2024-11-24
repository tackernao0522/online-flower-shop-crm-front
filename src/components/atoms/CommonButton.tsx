'use client';

import React, { forwardRef } from 'react';
import {
  Button as ChakraButton,
  ButtonProps as ChakraButtonProps,
  useBreakpointValue,
} from '@chakra-ui/react';

export interface CommonButtonProps extends ChakraButtonProps {
  variant?:
    | 'primary'
    | 'secondary'
    | 'danger'
    | 'ghost'
    | 'success'
    | 'outline';
  size?: 'sm' | 'md' | 'lg';
  withIcon?: React.ReactElement;
  iconPosition?: 'left' | 'right';
  isFullWidthMobile?: boolean;
}

const CommonButton = forwardRef<HTMLButtonElement, CommonButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      withIcon,
      iconPosition = 'left',
      isFullWidthMobile = false,
      children,
      ...props
    },
    ref,
  ) => {
    const isMobile = useBreakpointValue({ base: true, md: false });

    const variantStyles = {
      primary: {
        colorScheme: 'blue',
        variant: 'solid',
      },
      secondary: {
        colorScheme: 'gray',
        variant: 'solid',
      },
      danger: {
        colorScheme: 'red',
        variant: 'solid',
      },
      ghost: {
        variant: 'ghost',
      },
      success: {
        colorScheme: 'green',
        variant: 'solid',
      },
      outline: {
        colorScheme: 'teal',
        variant: 'outline',
      },
    };

    const sizeStyles = {
      sm: {
        height: { base: '32px', md: '36px' },
        fontSize: { base: 'sm', md: 'sm' },
        px: { base: 2, md: 3 },
      },
      md: {
        height: { base: '40px', md: '44px' },
        fontSize: { base: 'md', md: 'md' },
        px: { base: 4, md: 6 },
      },
      lg: {
        height: { base: '48px', md: '52px' },
        fontSize: { base: 'lg', md: 'lg' },
        px: { base: 6, md: 8 },
      },
    };

    const mobileStyles = isMobile
      ? {
          width: isFullWidthMobile ? '100%' : 'auto',
          py: size === 'sm' ? 1 : 2,
          minWidth: size === 'sm' ? '60px' : '80px',
        }
      : {
          width: 'auto',
        };

    const iconSize = isMobile
      ? {
          boxSize: size === 'sm' ? 3 : size === 'md' ? 4 : 5,
        }
      : {
          boxSize: size === 'sm' ? 4 : size === 'md' ? 5 : 6,
        };

    let buttonProps: Partial<ChakraButtonProps> = {
      ...variantStyles[variant],
      ...sizeStyles[size],
      ...mobileStyles,
      ...(withIcon && {
        leftIcon:
          iconPosition === 'left'
            ? React.cloneElement(withIcon, { ...iconSize })
            : undefined,
        rightIcon:
          iconPosition === 'right'
            ? React.cloneElement(withIcon, { ...iconSize })
            : undefined,
      }),
      ...props,
    };

    if ('colorScheme' in props || 'variant' in props) {
      const { colorScheme: _, variant: __, ...restProps } = buttonProps;
      buttonProps = restProps;
    }

    return (
      <ChakraButton ref={ref} {...buttonProps}>
        {children}
      </ChakraButton>
    );
  },
);

CommonButton.displayName = 'CommonButton';

export default CommonButton;
