import React from 'react';
import {
  Box,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
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
import PageHeader from '../molecules/PageHeader';
import CustomerPurchaseHistory from '../molecules/CustomerPurchaseHistory';
import CommonInput from '../atoms/CommonInput';
import CustomerNotes from '../molecules/CustomerNotes';

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
                <CommonInput defaultValue={purchase.id} size="sm" />
              )}
            </Td>
            <Td>
              {modalMode === 'detail' ? (
                purchase.date
              ) : (
                <CommonInput defaultValue={purchase.date} size="sm" />
              )}
            </Td>
            <Td>
              {modalMode === 'detail' ? (
                `¥${purchase.amount.toLocaleString()}`
              ) : (
                <CommonInput defaultValue={purchase.amount} size="sm" />
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
      <PageHeader
        title="顧客管理"
        buttons={
          <>
            <CommonButton
              variant="primary"
              withIcon={<AddIcon />}
              onClick={handleAddCustomer}
              isFullWidthMobile>
              新規顧客登録
            </CommonButton>
            <BackToDashboardButton />
          </>
        }
      />

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
                  <CustomerNotes
                    customer={activeCustomer}
                    modalMode={modalMode}
                  />
                </TabPanel>
                <TabPanel>
                  <CustomerPurchaseHistory
                    customer={activeCustomer}
                    modalMode={modalMode}
                    isMobile={isMobile ?? false}
                  />
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
