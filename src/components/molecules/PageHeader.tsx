import { Heading, HStack, Flex } from '@chakra-ui/react';
import { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  buttons: ReactNode;
}

const PageHeader = ({ title, buttons }: PageHeaderProps) => (
  <Flex justifyContent="space-between" alignItems="center" mb={5}>
    <Heading as="h1" size="x1">
      {title}
    </Heading>
    <HStack>{buttons}</HStack>
  </Flex>
);

export default PageHeader;
