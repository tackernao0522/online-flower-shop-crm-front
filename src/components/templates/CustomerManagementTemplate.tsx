import React from 'react';
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
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon } from '@chakra-ui/icons';
import { format, parseISO } from 'date-fns';
import { useCustomerManagement } from '@/hooks/useCustomerManagement';
import CustomerBasicInfo from '@/components/molecules/CustomerBasicInfo';
import { Customer } from '@/types/customer';
import BackToDashboardButton from '../atoms/BackToDashboardButton';
import ScrollToTopButton from '../atoms/ScrollToTopButton';
import CommonButton from '../atoms/CommonButton';

const CustomerManagementTemplate: React.FC = () => {
  const {
    isOpen,
    onClose,
    activeCustomer,
    modalMode,
    customers,
    status,
    error,
    page,
    hasMore,
    isDeleteAlertOpen,
    customerToDelete,
    searchTerm,
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
    ref,
    setSearchTerm,
  } = useCustomerManagement();

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
        <Text>{activeCustomer?.address || '未登録'}</Text>
      </Box>
      <Box>
        <Text fontWeight="bold">生年月日:</Text>
        <Text>
          {activeCustomer?.birthDate
            ? format(parseISO(activeCustomer.birthDate), 'yyyy-MM-dd')
            : '未登録'}
        </Text>
      </Box>
    </VStack>
  );

  const renderPurchaseHistory = () => (
    <Table variant="simple" size={isMobile ? 'sm' : 'md'}>
      <Thead>
        <Tr>
          <Th>注文ID</Th>
          <Th>日付</Th>
          <Th>金額</Th>
          {modalMode !== 'detail' && <Th>アクション</Th>}
        </Tr>
      </Thead>
      <Tbody>
        {activeCustomer?.purchaseHistory?.map(purchase => (
          <Tr key={purchase.id}>
            <Td>
              {modalMode === 'detail' ? (
                purchase.id
              ) : (
                <Input defaultValue={purchase.id} size="sm" />
              )}
            </Td>
            <Td>
              {modalMode === 'detail' ? (
                purchase.date
              ) : (
                <Input defaultValue={purchase.date} size="sm" />
              )}
            </Td>
            <Td>
              {modalMode === 'detail' ? (
                `¥${purchase.amount.toLocaleString()}`
              ) : (
                <Input defaultValue={purchase.amount} size="sm" />
              )}
            </Td>
            {modalMode !== 'detail' && (
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
                index === self.findIndex(t => t.id === customer.id),
            )
            .map((customer: Customer, index: number) => (
              <Tr key={`${customer.id}-${index}`}>
                <Td>{customer.id}</Td>
                <Td>
                  <CommonButton
                    variant="ghost"
                    onClick={() => handleCustomerClick(customer)}>
                    {customer.name}
                  </CommonButton>
                </Td>
                <Td>{customer.email}</Td>
                <Td whiteSpace="nowrap">{customer.phoneNumber}</Td>
                <Td whiteSpace="nowrap">
                  {customer.birthDate
                    ? format(parseISO(customer.birthDate), 'yyyy-MM-dd')
                    : '未登録'}
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
                      <CommonButton
                        variant="secondary"
                        size="sm"
                        withIcon={<EditIcon />}
                        onClick={() => handleEditCustomer(customer)}>
                        編集
                      </CommonButton>
                      <CommonButton
                        variant="danger"
                        size="sm"
                        withIcon={<DeleteIcon />}
                        onClick={() => handleDeleteCustomer(customer)}>
                        削除
                      </CommonButton>
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
        flexDirection={['column', 'row']}>
        <Heading as="h1" size="xl" mb={[4, 0]}>
          顧客管理
        </Heading>
        <HStack
          spacing={2}
          flexWrap="wrap"
          justifyContent={['center', 'flex-end']}>
          <CommonButton
            variant="primary"
            withIcon={<AddIcon />}
            onClick={handleAddCustomer}
            isFullWidthMobile>
            新規顧客登録
          </CommonButton>
          <BackToDashboardButton />
        </HStack>
      </Flex>

      <Flex mb={5} flexDirection={['column', 'row']}>
        <Input
          placeholder="顧客名または電話番号( - は除く)"
          mr={[0, 3]}
          mb={[2, 0]}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <CommonButton
          variant="secondary"
          withIcon={<SearchIcon />}
          onClick={() => handleSearch(searchTerm)}
          isFullWidthMobile>
          検索
        </CommonButton>
      </Flex>

      {status === 'loading' && page === 1 ? (
        <Flex justify="center" align="center" height="200px">
          <Spinner size="xl" />
        </Flex>
      ) : status === 'failed' ? (
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

      <ScrollToTopButton />

      <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? 'full' : 'xl'}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {modalMode === 'detail'
              ? '顧客詳細'
              : modalMode === 'add'
                ? '新規顧客登録'
                : '顧客情報編集'}
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
                  {modalMode === 'detail' ? (
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
                  {modalMode !== 'detail' && (
                    <CommonButton
                      variant="secondary"
                      size="sm"
                      withIcon={<AddIcon />}
                      mt={4}>
                      購入履歴を追加
                    </CommonButton>
                  )}
                </TabPanel>
                <TabPanel>
                  <FormControl>
                    <FormLabel>メモ</FormLabel>
                    <Textarea
                      placeholder="顧客に関する特記事項を入力"
                      isReadOnly={modalMode === 'detail'}
                    />
                  </FormControl>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </ModalBody>

          <ModalFooter>
            {modalMode !== 'detail' && (
              <CommonButton variant="primary" mr={3} onClick={handleSubmit}>
                {modalMode === 'add' ? '登録' : '更新'}
              </CommonButton>
            )}
            <CommonButton variant="ghost" onClick={onClose}>
              閉じる
            </CommonButton>
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
              <CommonButton variant="ghost" onClick={cancelDelete}>
                キャンセル
              </CommonButton>
              <CommonButton variant="danger" onClick={confirmDelete} ml={3}>
                削除
              </CommonButton>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default CustomerManagementTemplate;
