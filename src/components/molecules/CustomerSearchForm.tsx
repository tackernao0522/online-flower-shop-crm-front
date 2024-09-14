import React, { useState } from "react";
import { Flex, Input, Button } from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

interface CustomerSearchFormProps {
  onSearch: (searchTerm: string) => void;
}

const CustomerSearchForm: React.FC<CustomerSearchFormProps> = ({
  onSearch,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <Flex mb={5} flexDirection={["column", "row"]}>
      <Input
        placeholder="顧客名または電話番号( - は除く)"
        mr={[0, 3]}
        mb={[2, 0]}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      <Button
        leftIcon={<SearchIcon />}
        onClick={handleSearch}
        width={["100%", "auto"]}>
        検索
      </Button>
    </Flex>
  );
};

export default CustomerSearchForm;
