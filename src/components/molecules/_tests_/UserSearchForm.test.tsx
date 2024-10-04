import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";
import UserSearchForm from "../UserSearchForm";
import { ChakraProvider } from "@chakra-ui/react";

// モック関数を作成
const mockSetSearchTerm = jest.fn();
const mockSetSearchRole = jest.fn();
const mockHandleSearch = jest.fn();
const mockHandleKeyPress = jest.fn();
const mockHandleResetSearch = jest.fn();

const defaultProps = {
  searchTerm: "",
  setSearchTerm: mockSetSearchTerm,
  searchRole: "",
  setSearchRole: mockSetSearchRole,
  handleSearch: mockHandleSearch,
  handleKeyPress: mockHandleKeyPress,
  handleResetSearch: mockHandleResetSearch,
  isSearchTermEmpty: true,
  isSearchRoleEmpty: true,
  isMobile: false,
};

const renderWithChakra = (props = defaultProps) =>
  render(
    <ChakraProvider>
      <UserSearchForm {...props} />
    </ChakraProvider>
  );

describe("UserSearchFormのテスト", () => {
  test("初期状態で検索ボタンが無効になっていることを確認", () => {
    renderWithChakra();

    const termSearchButton = screen.getByText("名前またはメール検索");
    const roleSearchButton = screen.getByText("役割検索");

    expect(termSearchButton).toBeDisabled();
    expect(roleSearchButton).toBeDisabled();
  });

  test("ユーザー名を入力すると検索ボタンが有効になることを確認", () => {
    renderWithChakra({
      ...defaultProps,
      searchTerm: "テストユーザー",
      isSearchTermEmpty: false,
    });

    const termSearchButton = screen.getByText("名前またはメール検索");

    expect(termSearchButton).not.toBeDisabled();
  });

  test("役割を選択すると役割検索ボタンが有効になることを確認", () => {
    renderWithChakra({
      ...defaultProps,
      searchRole: "STAFF",
      isSearchRoleEmpty: false,
    });

    const roleSearchButton = screen.getByText("役割検索");

    expect(roleSearchButton).not.toBeDisabled();
  });

  test("リセットボタンをクリックするとリセットハンドラが呼ばれる", () => {
    renderWithChakra();

    const resetButton = screen.getByText("検索結果をリセット");

    fireEvent.click(resetButton);

    expect(mockHandleResetSearch).toHaveBeenCalled();
  });

  test("モバイルビューで正しくレンダリングされるか確認", () => {
    renderWithChakra({
      ...defaultProps,
      isMobile: true,
    });

    const searchTermInput =
      screen.getByPlaceholderText("ユーザー名またはメールアドレスで検索");
    const roleSearchButton = screen.getByText("役割検索");

    expect(searchTermInput).toBeInTheDocument();
    expect(roleSearchButton).toBeInTheDocument();
  });

  test("Enterキーを押すとhandleKeyPressが呼ばれる", () => {
    renderWithChakra({
      ...defaultProps,
      searchTerm: "テストユーザー",
      isSearchTermEmpty: false,
    });

    const searchTermInput =
      screen.getByPlaceholderText("ユーザー名またはメールアドレスで検索");

    fireEvent.keyPress(searchTermInput, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });

    expect(mockHandleKeyPress).toHaveBeenCalledWith(expect.any(Object), "term");
  });

  test("役割選択後、Enterキーを押すとhandleKeyPressが呼ばれる", () => {
    renderWithChakra({
      ...defaultProps,
      searchRole: "STAFF",
      isSearchRoleEmpty: false,
    });

    const roleSelect = screen.getByRole("combobox");

    fireEvent.keyPress(roleSelect, {
      key: "Enter",
      code: "Enter",
      charCode: 13,
    });

    expect(mockHandleKeyPress).toHaveBeenCalledWith(expect.any(Object), "role");
  });
});
