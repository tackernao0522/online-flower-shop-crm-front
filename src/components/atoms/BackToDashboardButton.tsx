import React from 'react';
import { Button } from '@chakra-ui/react';
import { ArrowBackIcon } from '@chakra-ui/icons';
import { useRouter } from 'next/navigation';

interface BackToDashboardButtonProps {
  mb?: any;
  w?: any;
  fontSize?: any;
  onClick?: () => void;
  customText?: string;
}

const BackToDashboardButton: React.FC<BackToDashboardButtonProps> = ({
  mb = [2, 0],
  w = { base: 'full', md: 'auto' },
  fontSize = ['sm', 'md'],
  onClick,
  customText,
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
    <Button
      leftIcon={<ArrowBackIcon />}
      onClick={handleClick}
      mb={mb}
      w={w}
      fontSize={fontSize}>
      {customText || 'ダッシュボードへ戻る'}
    </Button>
  );
};

export default BackToDashboardButton;
