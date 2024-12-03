import { Box, BoxProps } from '@chakra-ui/react';
import { ReactNode } from 'react';
import PrivateRoute from '../PrivateRoute';

interface ProtectedPageTemplateProps extends BoxProps {
  children: ReactNode;
}

export const ProtectedPageTemplate = ({
  children,
  ...props
}: ProtectedPageTemplateProps) => {
  return (
    <PrivateRoute>
      <Box p={5} {...props}>
        {children}
      </Box>
    </PrivateRoute>
  );
};
