import React from 'react';
import { Flex } from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import CommonButton from '../atoms/CommonButton';
import CommonInput from '../atoms/CommonInput';

interface CustomerSearchFormProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onSearch: (searchTerm: string) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

const CustomerSearchForm: React.FC<CustomerSearchFormProps> = ({
  searchTerm,
  setSearchTerm,
  onSearch,
  onKeyDown,
}) => {
  return (
    <Flex mb={5} flexDirection={['column', 'row']}>
      <CommonInput
        placeholder="顧客名または電話番号( - は除く)"
        mr={[0, 3]}
        mb={[2, 0]}
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <CommonButton
        variant="secondary"
        withIcon={<SearchIcon />}
        onClick={() => onSearch(searchTerm)}
        isFullWidthMobile>
        検索
      </CommonButton>
    </Flex>
  );
};

export default CustomerSearchForm;
