import React from "react";
import { Input, Button } from "@chakra-ui/react";

interface UserSearchFormProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  handleSearch: (type: "term") => void;
  handleKeyPress: (event: React.KeyboardEvent, type: "term" | "role") => void;
  isSearchTermEmpty: boolean;
  isMobile: boolean;
}

const UserSearchForm: React.FC<UserSearchFormProps> = ({
  searchTerm,
  setSearchTerm,
  handleSearch,
  handleKeyPress,
  isSearchTermEmpty,
  isMobile,
}) => {
  return (
    <>
      <Input
        placeholder="ユーザー名またはメールアドレスで検索"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyPress={(e) => handleKeyPress(e, "term")}
      />
      <Button
        onClick={() => handleSearch("term")}
        isDisabled={isSearchTermEmpty}
        width={isMobile ? "100%" : "auto"}>
        名前またはメール検索
      </Button>
    </>
  );
};

export default UserSearchForm;
