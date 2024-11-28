import React from 'react';
import {
  Heading,
  Flex,
  HStack,
  Box,
  ResponsiveValue,
  FlexProps,
} from '@chakra-ui/react';

interface PageHeaderProps extends Omit<FlexProps, 'title'> {
  title: string;
  buttons?: React.ReactNode;
  titleSize?: ResponsiveValue<string>;
  spacing?: ResponsiveValue<number | string>;
  mobileStack?: boolean;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  buttons,
  titleSize = { base: 'lg', md: 'xl' },
  spacing = 5,
  mobileStack = true,
  ...flexProps
}) => {
  return (
    <Flex
      justifyContent="space-between"
      alignItems="center"
      mb={spacing}
      w="full"
      flexDirection={mobileStack ? { base: 'column', md: 'row' } : 'row'}
      gap={mobileStack ? { base: 4, md: 0 } : 0}
      {...flexProps}>
      <Heading
        as="h1"
        size={titleSize}
        mb={mobileStack ? { base: 0, md: 0 } : 0}>
        {title}
      </Heading>
      {buttons && (
        <Box w={{ base: 'full', md: 'auto' }}>
          <HStack
            spacing={2}
            justifyContent={{ base: 'stretch', md: 'flex-end' }}
            flexDirection={{ base: 'column', md: 'row' }}
            w="full">
            {buttons}
          </HStack>
        </Box>
      )}
    </Flex>
  );
};

export default PageHeader;
