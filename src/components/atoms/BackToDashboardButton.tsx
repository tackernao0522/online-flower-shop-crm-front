import React from 'react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';
import CommonButton from './CommonButton';

interface BackToDashboardButtonProps {
  mb?: any;
  w?: any;
  fontSize?: any;
  onClick?: () => void;
  customText?: string;
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

const BackToDashboardButton: React.FC<BackToDashboardButtonProps> = ({
  mb = [2, 0],
  w = { base: 'full', md: 'auto' },
  fontSize = ['sm', 'md'],
  onClick,
  customText,
  variant = 'secondary',
  size = 'md',
}) => {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.push('/dashboard');
    }
  };

  return (
    <CommonButton
      variant={variant}
      size={size}
      withIcon={<ArrowBackIcon />}
      onClick={handleClick}
      mb={mb}
      isFullWidthMobile={w.base === 'full'}
      fontSize={fontSize}>
      {customText || 'ダッシュボードへ戻る'}
    </CommonButton>
  );
};

BackToDashboardButton.displayName = 'BackToDashboardButton';

export default BackToDashboardButton;
