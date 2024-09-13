"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  ChakraProvider,
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
  useDisclosure,
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
  useToast,
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
import { useInView } from "react-intersection-observer";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../store";
import {
  fetchCustomers,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../features/customers/customersSlice";
import { format, parseISO } from "date-fns";

interface PurchaseHistory {
  id: string;
  date: string;
  amount: number;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  address: string;
  birthDate: string;
  created_at: string;
  updated_at: string;
  purchaseHistory?: PurchaseHistory[];
}

const PAGE_SIZE = 20;

const CustomerManagement: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeCustomer, setActiveCustomer] = useState<Customer | null>(null);
  const [modalMode, setModalMode] = useState<"detail" | "add" | "edit">(
    "detail"
  );
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { status, error } = useSelector((state: RootState) => state.customers);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { ref, inView } = useInView();
  const toast = useToast();
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(
    null
  );
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [newCustomer, setNewCustomer] = useState<
    Omit<Customer, "id" | "created_at" | "updated_at" | "purchaseHistory">
  >({
    name: "",
    email: "",
    phoneNumber: "",
    address: "",
    birthDate: "",
  });
  const [formErrors, setFormErrors] = useState<Partial<Customer>>({});

  const isMobile = useBreakpointValue({ base: true, md: false });

  const fetchCustomersData = useCallback(async () => {
    try {
      setLoading(true);
      const result = await dispatch(
        fetchCustomers({ page, search: searchTerm })
      );
      if (fetchCustomers.fulfilled.match(result)) {
        setCustomers((prevCustomers) => {
          if (page === 1) return result.payload.data;
          return [...prevCustomers, ...result.payload.data];
        });
        setHasMore(result.payload.data.length === PAGE_SIZE);
      }
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  }, [dispatch, page, searchTerm]);

  useEffect(() => {
    fetchCustomersData();
  }, [fetchCustomersData]);

  useEffect(() => {
    if (inView && hasMore && !loading) {
      setPage((prevPage) => prevPage + 1);
    }
  }, [inView, hasMore, loading]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCustomerClick = (customer: Customer) => {
    setActiveCustomer(customer);
    setModalMode("detail");
    onOpen();
  };

  const handleAddCustomer = () => {
    setActiveCustomer(null);
    setModalMode("add");
    setNewCustomer({
      name: "",
      email: "",
      phoneNumber: "",
      address: "",
      birthDate: "",
    });
    setFormErrors({});
    onOpen();
  };

  const handleEditCustomer = (customer: Customer) => {
    setActiveCustomer(customer);
    setNewCustomer({
      name: customer.name,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      address: customer.address,
      birthDate: customer.birthDate.split("T")[0],
    });
    setModalMode("edit");
    setFormErrors({});
    onOpen();
  };

  const handleDeleteCustomer = (customer: Customer) => {
    setCustomerToDelete(customer);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (customerToDelete) {
      try {
        await dispatch(deleteCustomer(customerToDelete.id));
        setCustomers((prevCustomers) =>
          prevCustomers.filter((c) => c.id !== customerToDelete.id)
        );
        toast({
          title: "顧客を削除しました",
          description: `${customerToDelete.name} の情報が削除されました。`,
          status: "warning",
          duration: 5000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: "顧客の削除に失敗しました",
          description: "エラーが発生しました。もう一度お試しください。",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
      setIsDeleteAlertOpen(false);
      setCustomerToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteAlertOpen(false);
    setCustomerToDelete(null);
  };

  const handleSearch = () => {
    setPage(1);
    setCustomers([]);
    fetchCustomersData();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewCustomer({ ...newCustomer, [name]: value });
    setFormErrors({ ...formErrors, [name]: "" });
  };

  const validateForm = () => {
    const errors: Partial<Customer> = {};
    if (!newCustomer.name) errors.name = "名前は必須です";
    if (!newCustomer.email) errors.email = "メールアドレスは必須です";
    if (!/^\S+@\S+\.\S+$/.test(newCustomer.email))
      errors.email = "有効なメールアドレスを入力してください";
    if (!newCustomer.phoneNumber) errors.phoneNumber = "電話番号は必須です";
    if (!/^\d{2,4}-\d{2,4}-\d{3,4}$/.test(newCustomer.phoneNumber))
      errors.phoneNumber =
        "有効な電話番号を入力してください（例: 090-1234-5678）";
    if (!newCustomer.address) errors.address = "住所は必須です";
    if (!newCustomer.birthDate) errors.birthDate = "生年月日は必須です";
    return errors;
  };

  const handleSubmit = async () => {
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }
    try {
      let resultAction;
      if (modalMode === "add") {
        resultAction = await dispatch(addCustomer(newCustomer));
      } else if (modalMode === "edit" && activeCustomer) {
        resultAction = await dispatch(
          updateCustomer({ id: activeCustomer.id, customerData: newCustomer })
        );
      }

      if (
        addCustomer.fulfilled.match(resultAction) ||
        updateCustomer.fulfilled.match(resultAction)
      ) {
        toast({
          title:
            modalMode === "add"
              ? "顧客を登録しました"
              : "顧客情報を更新しました",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        onClose();
        setPage(1);
        setCustomers([]);
        fetchCustomersData();
      } else {
        toast({
          title:
            modalMode === "add"
              ? "顧客の登録に失敗しました"
              : "顧客情報の更新に失敗しました",
          description: resultAction.error.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error(
        modalMode === "add"
          ? "Failed to add customer:"
          : "Failed to update customer:",
        error
      );
      toast({
        title: "エラーが発生しました",
        description:
          modalMode === "add"
            ? "顧客の登録中に問題が発生しました。"
            : "顧客情報の更新中に問題が発生しました。",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

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

  const renderCustomerForm = () => (
    <VStack spacing={4}>
      <FormControl isInvalid={!!formErrors.name}>
        <FormLabel>名前</FormLabel>
        <Input
          name="name"
          value={newCustomer.name}
          onChange={handleInputChange}
        />
        <FormErrorMessage>{formErrors.name}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!formErrors.email}>
        <FormLabel>メールアドレス</FormLabel>
        <Input
          name="email"
          value={newCustomer.email}
          onChange={handleInputChange}
        />
        <FormErrorMessage>{formErrors.email}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!formErrors.phoneNumber}>
        <FormLabel>電話番号</FormLabel>
        <Input
          name="phoneNumber"
          value={newCustomer.phoneNumber}
          onChange={handleInputChange}
        />
        <FormErrorMessage>{formErrors.phoneNumber}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!formErrors.address}>
        <FormLabel>住所</FormLabel>
        <Input
          name="address"
          value={newCustomer.address}
          onChange={handleInputChange}
        />
        <FormErrorMessage>{formErrors.address}</FormErrorMessage>
      </FormControl>
      <FormControl isInvalid={!!formErrors.birthDate}>
        <FormLabel>生年月日</FormLabel>
        <Input
          name="birthDate"
          type="date"
          value={newCustomer.birthDate}
          onChange={handleInputChange}
        />
        <FormErrorMessage>{formErrors.birthDate}</FormErrorMessage>
      </FormControl>
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
          {customers.map((customer: Customer) => (
            <Tr key={customer.id}>
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
    <ChakraProvider>
      <Box p={5}>
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

        <Modal
          isOpen={isOpen}
          onClose={onClose}
          size={isMobile ? "full" : "xl"}>
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
                    {modalMode === "detail"
                      ? renderCustomerInfo()
                      : renderCustomerForm()}
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
          leastDestructiveRef={cancelRef}
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
                <Button ref={cancelRef} onClick={cancelDelete}>
                  キャンセル
                </Button>
                <Button colorScheme="red" onClick={confirmDelete} ml={3}>
                  削除
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </Box>
    </ChakraProvider>
  );
};

export default CustomerManagement;
