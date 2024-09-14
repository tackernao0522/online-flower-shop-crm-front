import React from "react";
import {
  Box,
  Flex,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Input,
  VStack,
  HStack,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Text,
  IconButton,
  Spinner,
  Alert,
  AlertIcon,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  FormErrorMessage,
  useBreakpointValue,
} from "@chakra-ui/react";
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ArrowBackIcon,
  SearchIcon,
  ArrowUpIcon,
} from "@chakra-ui/icons";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useCustomerManagement } from "@/hooks/useCustomerManagement";
import CustomerBasicInfo from "@/components/molecules/CustomerBasicInfo";
import { Customer } from "@/types/customer";

const CustomerManagementTemplate: React.FC = () => {
  const {
    isOpen,
    onOpen,
    onClose,
    activeCustomer,
    modalMode,
    customers,
    status,
    error,
    loading,
    page,
    hasMore,
    isDeleteAlertOpen,
    customerToDelete,
    searchTerm,
    showScrollTop,
    newCustomer,
    formErrors,
    isMobile,
    handleCustomerClick,
    handleAddCustomer,
    handleEditCustomer,
    handleDeleteCustomer,
    confirmDelete,
    cancelDelete,
    handleSearch,
    handleKeyDown,
    handleInputChange,
    handleSubmit,
    scrollToTop,
    ref,
    setSearchTerm,
  } = useCustomerManagement();

  const router = useRouter();

  const renderCustomerInfo = () => (
    <VStack align="stretch" spacing={4}>
      <Box>
        <Text fontWeight="bold">名前:</Text>
        <Text>{activeCustomer?.name}</Text>
      </Box>
      <Box>
        <Text fontWeight="bold">メールアドレス:</Text>
        <Text>{activeCustomer?.email}</Text>
      </Box>
      <Box>
        <Text fontWeight="bold">電話番号:</Text>
        <Text>{activeCustomer?.phoneNumber}</Text>
      </Box>
      <Box>
        <Text fontWeight="bold">住所:</Text>
        <Text>{activeCustomer?.address || "未登録"}</Text>
      </Box>
      <Box>
        <Text fontWeight="bold">生年月日:</Text>
        <Text>
          {activeCustomer?.birthDate
            ? format(parseISO(activeCustomer.birthDate), "yyyy-MM-dd")
            : "未登録"}
        </Text>
      </Box>
    </VStack>
  );

  const renderPurchaseHistory = () => (
    <Table variant="simple" size={isMobile ? "sm" : "md"}>
      <Thead>
        <Tr>
          <Th>注文ID</Th>
          <Th>日付</Th>
          <Th>金額</Th>
          {modalMode !== "detail" && <Th>アクション</Th>}
        </Tr>
      </Thead>
      <Tbody>
        {activeCustomer?.purchaseHistory?.map((purchase) => (
          <Tr key={purchase.id}>
            <Td>
              {modalMode === "detail" ? (
                purchase.id
              ) : (
                <Input defaultValue={purchase.id} size="sm" />
              )}
            </Td>
            <Td>
              {modalMode === "detail" ? (
                purchase.date
              ) : (
                <Input defaultValue={purchase.date} size="sm" />
              )}
            </Td>
            <Td>
              {modalMode === "detail" ? (
                `¥${purchase.amount.toLocaleString()}`
              ) : (
                <Input defaultValue={purchase.amount} size="sm" />
              )}
            </Td>
            {modalMode !== "detail" && (
              <Td>
                <IconButton
                  aria-label="Delete purchase"
                  icon={<DeleteIcon />}
                  size="sm"
                  colorScheme="red"
                />
              </Td>
            )}
          </Tr>
        ))}
      </Tbody>
    </Table>
  );

  const renderCustomerTable = () => (
    <Box overflowX="auto">
      <Table variant="simple" size="md">
        <Thead>
          <Tr>
            <Th>ID</Th>
            <Th>名前</Th>
            <Th>メールアドレス</Th>
            <Th>電話番号</Th>
            <Th>生年月日</Th>
            <Th>アクション</Th>
          </Tr>
        </Thead>
        <Tbody>
          {customers
            .filter(
              (customer, index, self) =>
                index === self.findIndex((t) => t.id === customer.id)
            )
            .map((customer: Customer, index: number) => (
              <Tr key={`${customer.id}-${index}`}>
                <Td>{customer.id}</Td>
                <Td>
                  <Button
                    variant="link"
                    onClick={() => handleCustomerClick(customer)}>
                    {customer.name}
                  </Button>
                </Td>
                <Td>{customer.email}</Td>
                <Td whiteSpace="nowrap">{customer.phoneNumber}</Td>
                <Td whiteSpace="nowrap">
                  {customer.birthDate
                    ? format(parseISO(customer.birthDate), "yyyy-MM-dd")
                    : "未登録"}
                </Td>
                <Td>
                  {isMobile ? (
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit customer"
                        icon={<EditIcon />}
                        size="sm"
                        onClick={() => handleEditCustomer(customer)}
                      />
                      <IconButton
                        aria-label="Delete customer"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        onClick={() => handleDeleteCustomer(customer)}
                      />
                    </HStack>
                  ) : (
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        leftIcon={<EditIcon />}
                        onClick={() => handleEditCustomer(customer)}>
                        編集
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<DeleteIcon />}
                        colorScheme="red"
                        onClick={() => handleDeleteCustomer(customer)}>
                        削除
                      </Button>
                    </HStack>
                  )}
                </Td>
              </Tr>
            ))}
        </Tbody>
      </Table>
    </Box>
  );

  return (
    <Box>
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb={5}
        flexDirection={["column", "row"]}>
        <Heading as="h1" size="xl" mb={[4, 0]}>
          顧客管理
        </Heading>
        <HStack
          spacing={2}
          flexWrap="wrap"
          justifyContent={["center", "flex-end"]}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleAddCustomer}
            mb={[2, 0]}
            w={["100%", "auto"]}>
            新規顧客登録
          </Button>
          <Button
            leftIcon={<ArrowBackIcon />}
            onClick={() => router.push("/dashboard")}
            mb={[2, 0]}
            w={["100%", "auto"]}
            fontSize={["sm", "md"]}>
            ダッシュボードへ戻る
          </Button>
        </HStack>
      </Flex>

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

      {status === "loading" && page === 1 ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : status === "failed" ? (
        <Alert status="error">
          <AlertIcon />
          {error}
        </Alert>
      ) : (
        <>
          {renderCustomerTable()}
          {!hasMore && customers.length > 0 && (
            <Flex justify="center" my={4}>
              <Text color="red">
                すべての顧客を表示しました ({customers.length}名)
              </Text>
            </Flex>
          )}
          {hasMore && (
            <Flex justify="center" my={4} ref={ref}>
              <Spinner />
            </Flex>
          )}
        </>
      )}

      {showScrollTop && (
        <IconButton
          icon={<ArrowUpIcon />}
          position="fixed"
          bottom="50px"
          right="50px"
          colorScheme="blue"
          onClick={scrollToTop}
          aria-label="トップに戻る"
        />
      )}

      <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "xl"}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {modalMode === "detail"
              ? "顧客詳細"
              : modalMode === "add"
              ? "新規顧客登録"
              : "顧客情報編集"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Tabs>
              <TabList>
                <Tab>基本情報</Tab>
                <Tab>購入履歴</Tab>
                <Tab>メモ</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  {modalMode === "detail" ? (
                    renderCustomerInfo()
                  ) : (
                    <CustomerBasicInfo
                      customer={activeCustomer}
                      modalMode={modalMode}
                      newCustomer={newCustomer}
                      formErrors={formErrors}
                      handleInputChange={handleInputChange}
                    />
                  )}
                </TabPanel>
                <TabPanel>
                  <Box overflowX="auto">{renderPurchaseHistory()}</Box>
                  {modalMode !== "detail" && (
                    <Button leftIcon={<AddIcon />} mt={4} size="sm">
                      購入履歴を追加
                    </Button>
                  )}
                </TabPanel>
                <TabPanel>
                  <FormControl>
                    <FormLabel>メモ</FormLabel>
                    <Textarea
                      placeholder="顧客に関する特記事項を入力"
                      isReadOnly={modalMode === "detail"}
                    />
                  </FormControl>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            {modalMode !== "detail" && (
              <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                {modalMode === "add" ? "登録" : "更新"}
              </Button>
            )}
            <Button variant="ghost" onClick={onClose}>
              閉じる
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={React.useRef(null)}
        onClose={cancelDelete}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              顧客を削除
            </AlertDialogHeader>

            <AlertDialogBody>
              本当に{customerToDelete?.name}
              を削除しますか？この操作は取り消せません。
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button onClick={cancelDelete}>キャンセル</Button>
              <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                削除
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default CustomerManagementTemplate;
