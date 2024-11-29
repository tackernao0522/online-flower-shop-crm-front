import React from 'react';
import {
  VStack,
  Flex,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Badge,
  Text,
  HStack,
} from '@chakra-ui/react';
import { SearchIcon, ChevronDownIcon, CalendarIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import CommonButton from '@/components/atoms/CommonButton';
import CommonInput from '@/components/atoms/CommonInput';
import { OrderStatus } from '@/types/order';

interface OrderSearchFilterProps {
  searchTerm: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  isSearching: boolean;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  statusColorScheme: Record<OrderStatus, string>;
  statusDisplayText: Record<OrderStatus, string>;
  onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: () => void;
  onSearchKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onStatusFilter: (status: OrderStatus) => void;
  onDateRangeFilter: (
    range: 'today' | 'week' | 'month' | 'custom',
    customStart?: Date | null,
    customEnd?: Date | null,
  ) => void;
  onDatePickerOpen: () => void;
  clearFilters: () => void;
}

export const OrderSearchFilter: React.FC<OrderSearchFilterProps> = ({
  searchTerm,
  dateRange,
  isSearching,
  status,
  statusColorScheme,
  statusDisplayText,
  onSearchChange,
  onSearchSubmit,
  onSearchKeyDown,
  onStatusFilter,
  onDateRangeFilter,
  onDatePickerOpen,
  clearFilters,
}) => {
  return (
    <VStack spacing={4} w="full" mb={6}>
      <Flex w="full" gap={2} flexWrap="wrap">
        <InputGroup flex={1} minW={{ base: 'full', md: '320px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <CommonInput
            placeholder="注文番号、顧客名で検索..."
            value={searchTerm}
            onChange={onSearchChange}
            onKeyDown={onSearchKeyDown}
            paddingLeft="40px"
          />
          <InputRightElement width="4.5rem">
            <CommonButton
              size="sm"
              variant="secondary"
              onClick={onSearchSubmit}
              isLoading={isSearching || status === 'loading'}
              loadingText="検索中">
              検索
            </CommonButton>
          </InputRightElement>
        </InputGroup>

        <Menu>
          <MenuButton
            as={CommonButton}
            variant="secondary"
            withIcon={<ChevronDownIcon />}
            iconPosition="right">
            ステータス
          </MenuButton>
          <MenuList>
            {Object.entries(statusDisplayText).map(([value, label]) => (
              <MenuItem
                key={value}
                onClick={() => onStatusFilter(value as OrderStatus)}>
                <Badge
                  colorScheme={statusColorScheme[value as OrderStatus]}
                  mr={2}>
                  {label}
                </Badge>
              </MenuItem>
            ))}
            <MenuItem onClick={clearFilters}>フィルタをクリア</MenuItem>
          </MenuList>
        </Menu>

        <Menu>
          <MenuButton
            as={CommonButton}
            variant="secondary"
            withIcon={<ChevronDownIcon />}
            iconPosition="right">
            期間
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => onDateRangeFilter('today')}>本日</MenuItem>
            <MenuItem onClick={() => onDateRangeFilter('week')}>今週</MenuItem>
            <MenuItem onClick={() => onDateRangeFilter('month')}>今月</MenuItem>
            <MenuItem onClick={onDatePickerOpen}>
              <HStack>
                <CalendarIcon />
                <Text>期間を指定...</Text>
              </HStack>
            </MenuItem>
            {dateRange.start !== null && dateRange.end !== null && (
              <MenuItem onClick={() => onDateRangeFilter('custom', null, null)}>
                期間指定をクリア
              </MenuItem>
            )}
          </MenuList>
        </Menu>

        {dateRange.start && dateRange.end && (
          <Text color="gray.600" fontSize="sm">
            期間: {format(dateRange.start, 'yyyy/MM/dd', { locale: ja })} -{' '}
            {format(dateRange.end, 'yyyy/MM/dd', { locale: ja })}
          </Text>
        )}
      </Flex>
    </VStack>
  );
};
