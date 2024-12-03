import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface PageTemplateProps extends BoxProps {
  children: ReactNode;
}

export const PageTemplate = ({ children, ...props }: PageTemplateProps) => {
  return (
    <Box p={5} {...props}>
      {children}
    </Box>
  );
};
