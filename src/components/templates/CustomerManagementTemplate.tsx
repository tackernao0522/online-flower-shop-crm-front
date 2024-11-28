import React from 'react';
import {
  Box,
  Flex,
  Heading,
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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  IconButton,
  VStack,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon } from '@chakra-ui/icons';
import { format, parseISO } from 'date-fns';
import { useCustomerManagement } from '@/hooks/useCustomerManagement';
import CustomerBasicInfo from '@/components/molecules/CustomerBasicInfo';
import CustomerTable from '@/components/organisms/CustomerTable';
import BackToDashboardButton from '../atoms/BackToDashboardButton';
import ScrollToTopButton from '../atoms/ScrollToTopButton';
import CommonButton from '../atoms/CommonButton';
import CustomerSearchForm from '../molecules/CustomerSearchForm';
import DeleteAlertDialog from '../molecules/DeleteAlertDialog';

const CustomerManagementTemplate: React.FC = () => {
  const {
    isOpen,
    onClose,
    activeCustomer,
    modalMode,
    customers,
    status,
    error,
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
    lastElementRef,
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

      <CustomerSearchForm
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        onSearch={handleSearch}
        onKeyDown={handleKeyDown}
      />

      <CustomerTable
        customers={customers}
        status={status}
        error={error}
        hasMore={hasMore}
        onCustomerClick={handleCustomerClick}
        onEditCustomer={handleEditCustomer}
        onDeleteCustomer={handleDeleteCustomer}
        isMobile={isMobile ?? false}
        lastElementRef={lastElementRef}
      />

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

      <DeleteAlertDialog
        isOpen={isDeleteAlertOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        itemName={customerToDelete?.name || ''}
        itemType="顧客"
      />
    </Box>
  );
};

export default CustomerManagementTemplate;
