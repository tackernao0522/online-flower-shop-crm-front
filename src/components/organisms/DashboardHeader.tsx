import React from "react";
import {
  HStack,
  Heading,
  InputGroup,
  InputLeftElement,
  Input,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Avatar,
  AvatarBadge,
} from "@chakra-ui/react";
import { SearchIcon, BellIcon, HamburgerIcon } from "@chakra-ui/icons";
import LogoutButton from "../molecules/LogoutButton";

const DashboardHeader: React.FC = () => (
  <HStack justifyContent="space-between" mb={5}>
    <Heading as="h1" size="xl">
      ダッシュボード
    </Heading>
    <HStack spacing={4}>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <SearchIcon color="gray.300" />
        </InputLeftElement>
        <Input type="text" placeholder="検索..." />
      </InputGroup>
      <IconButton aria-label="通知" icon={<BellIcon />} variant="outline" />
      <Menu>
        <MenuButton
          as={IconButton}
          aria-label="Options"
          icon={<HamburgerIcon />}
          variant="outline"
        />
        <MenuList>
          <MenuItem>配送管理</MenuItem>
          <MenuItem>顧客対応履歴</MenuItem>
          <MenuItem>キャンペーン管理</MenuItem>
          <MenuItem>ユーザー管理</MenuItem>
          <MenuItem>レポート・分析</MenuItem>
          <MenuItem>eコマース連携</MenuItem>
          <MenuItem>API管理</MenuItem>
          <MenuItem>セキュリティ監査</MenuItem>
          <MenuItem>バックアップと復旧</MenuItem>
          <MenuItem>設定</MenuItem>
          <MenuItem>ヘルプ・サポート</MenuItem>
        </MenuList>
      </Menu>
      <Menu>
        <MenuButton as={Avatar} size={"sm"} cursor={"pointer"}>
          <AvatarBadge boxSize="1.25em" bg="green.500" />
        </MenuButton>
        <MenuList>
          <MenuItem>プロフィール</MenuItem>
          <MenuItem>設定</MenuItem>
          <MenuItem>パスワード変更</MenuItem>
          <LogoutButton />
        </MenuList>
      </Menu>
    </HStack>
  </HStack>
);

export default DashboardHeader;
