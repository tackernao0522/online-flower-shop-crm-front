'use client';

import React from 'react';
import {
  Box,
  Flex,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  VStack,
  HStack,
  Badge,
  Text,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Spinner,
  Container,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue,
  useToast,
  DrawerProps,
  ModalProps,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Stack,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, WarningIcon } from '@chakra-ui/icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { OrderStatus } from '@/types/order';
import { useDisclosure } from '@chakra-ui/react';
import DateRangePickerModal from '@/components/molecules/DateRangePickerModal/DateRangePickerModal';
import BackToDashboardButton from '@/components/atoms/BackToDashboardButton';
import ScrollToTopButton from '@/components/atoms/ScrollToTopButton';
import CommonButton from '@/components/atoms/CommonButton';
import PageHeader from '@/components/molecules/PageHeader';
import CommonInput from '@/components/atoms/CommonInput';
import { OrderSearchFilter } from '@/components/molecules/OrderSearchFilter';
import OrderTable from '@/components/organisms/OrderTable';
import { formatDate } from '@/utils/dateFormatter';

const OrdersPage = () => {
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? false;
  const modalSize = useBreakpointValue({ base: 'full', md: '4xl' });

  const {
    isOpen: isDatePickerOpen,
    onOpen: onDatePickerOpen,
    onClose: onDatePickerClose,
  } = useDisclosure();

  const {
    orders,
    totalCount,
    status,
    error,
    activeOrder,
    modalMode,
    isDeleteAlertOpen,
    orderToDelete,
    newOrder,
    formErrors,
    searchTerm,
    dateRange,
    isOpen,
    onClose,
    handleSearchChange,
    handleSearchSubmit,
    handleSearchKeyDown,
    handleOrderClick,
    handleAddOrder,
    handleEditOrder,
    handleDeleteOrder,
    confirmDelete,
    cancelDelete,
    handleInputChange,
    handleSubmit,
    handleStatusFilter,
    handleDateRangeFilter,
    handleAddOrderItem,
    handleRemoveOrderItem,
    handleOrderItemChange,
    clearFilters,
    isSearching,
    lastElementRef,
    hasMore,
  } = useOrderManagement();

  const statusColorScheme: Record<OrderStatus, string> = {
    PENDING: 'yellow',
    PROCESSING: 'blue',
    CONFIRMED: 'purple',
    SHIPPED: 'cyan',
    DELIVERED: 'green',
    CANCELLED: 'red',
  } as const;

  const statusDisplayText: Record<OrderStatus, string> = {
    PENDING: '保留中',
    PROCESSING: '処理中',
    CONFIRMED: '確認済',
    SHIPPED: '発送済',
    DELIVERED: '配達完了',
    CANCELLED: 'キャンセル済',
  } as const;

  type ModalComponentProps = {
    isOpen: boolean;
    onClose: () => void;
  } & (
    | {
        placement: DrawerProps['placement'];
        size: DrawerProps['size'];
      }
    | {
        size: ModalProps['size'];
      }
  );

  const ModalComponent = isMobile ? Drawer : Modal;
  const ModalProps: ModalComponentProps = isMobile
    ? {
        isOpen,
        onClose,
        placement: 'right',
        size: 'full',
      }
    : {
        isOpen,
        onClose,
        size: modalSize,
      };

  const renderOrderForm = () => (
    <VStack spacing={6} align="stretch">
      <FormControl isRequired isInvalid={!!formErrors.customerId}>
        <FormLabel>顧客ID</FormLabel>
        <CommonInput
          name="customerId"
          value={newOrder.customerId}
          onChange={handleInputChange}
          placeholder="顧客IDを入力"
        />
        <FormErrorMessage>{formErrors.customerId}</FormErrorMessage>
      </FormControl>

      <FormControl isRequired isInvalid={!!formErrors.orderItems}>
        <FormLabel>注文商品</FormLabel>
        <VStack spacing={4} align="stretch">
          {newOrder.orderItems.map((item, index) => (
            <HStack key={`new-order-item-${index}`} spacing={4}>
              <FormControl isRequired>
                <CommonInput
                  name={`orderItems.${index}.productId`}
                  placeholder="商品ID"
                  value={item.productId}
                  onChange={e =>
                    handleOrderItemChange(index, 'productId', e.target.value)
                  }
                />
              </FormControl>
              <FormControl isRequired>
                <NumberInput
                  min={1}
                  value={item.quantity}
                  onChange={(valueString, valueNumber) =>
                    handleOrderItemChange(index, 'quantity', valueNumber || 1)
                  }>
                  <NumberInputField
                    name={`orderItems.${index}.quantity`}
                    placeholder="数量"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>
              <IconButton
                aria-label="商品を削除"
                icon={<DeleteIcon />}
                colorScheme="red"
                onClick={() => handleRemoveOrderItem(index)}
              />
            </HStack>
          ))}
          <CommonButton
            variant="outline"
            withIcon={<AddIcon />}
            onClick={handleAddOrderItem}>
            商品を追加
          </CommonButton>
        </VStack>
        <FormErrorMessage>{formErrors.orderItems}</FormErrorMessage>
      </FormControl>

      {modalMode === 'edit' && (
        <FormControl>
          <FormLabel>ステータス</FormLabel>
          <Select
            name="status"
            value={newOrder.status}
            onChange={handleInputChange}>
            {Object.entries(statusDisplayText).map(([value, label]) => (
              <option key={`status-${value}`} value={value}>
                {label}
              </option>
            ))}
          </Select>
        </FormControl>
      )}
    </VStack>
  );

  const renderOrderDetails = () => {
    if (!activeOrder) {
      return (
        <Alert status="info">
          <AlertIcon />
          注文情報を読み込んでいます...
        </Alert>
      );
    }

    const items = activeOrder.order_items;

    if (!items || items.length === 0) {
      return (
        <Alert status="warning">
          <AlertIcon />
          注文商品情報が見つかりません
        </Alert>
      );
    }

    const basicInfoItems = [
      {
        id: 'userName',
        label: '担当者',
        value: activeOrder.user?.username || '未割り当て',
      },
      { id: 'orderNumber', label: '注文番号', value: activeOrder.orderNumber },
      {
        id: 'productIds',
        label: '商品ID',
        value: (
          <VStack
            align="stretch"
            spacing={2}
            border="1px solid"
            borderColor="gray.200"
            borderRadius="md"
            p={2}
            maxH="100px"
            overflowY="auto">
            {items.map((item, index) => (
              <Text key={`product-id-${item.id || index}`}>
                {item.product.id}
              </Text>
            ))}
          </VStack>
        ),
      },
      {
        id: 'orderDate',
        label: '注文日時',
        value:
          activeOrder.orderDate &&
          format(new Date(activeOrder.orderDate), 'yyyy/MM/dd HH:mm'),
      },
      {
        id: 'totalAmount',
        label: '合計金額',
        value: `¥${activeOrder.totalAmount.toLocaleString()}`,
      },
      ...(activeOrder.discountApplied > 0
        ? [
            {
              id: 'discount',
              label: '適用割引',
              value: `¥${activeOrder.discountApplied.toLocaleString()}`,
            },
          ]
        : []),
    ];

    return (
      <VStack align="stretch" spacing={6} py={2}>
        <Box
          borderWidth="1px"
          borderRadius="lg"
          p={4}
          maxH="300px"
          overflowY="auto">
          <VStack align="stretch" spacing={4}>
            <Flex justifyContent="space-between" alignItems="center">
              <Text fontWeight="bold" fontSize="lg">
                基本情報
              </Text>
              <Badge colorScheme={statusColorScheme[activeOrder.status]}>
                {statusDisplayText[activeOrder.status]}
              </Badge>
            </Flex>
            {basicInfoItems.map(item => (
              <Box key={`basicInfo-${item.id}`}>
                <Text fontWeight="semibold">{item.label}</Text>
                {typeof item.value === 'string' ? (
                  <Text>{item.value}</Text>
                ) : (
                  item.value
                )}
              </Box>
            ))}
          </VStack>
        </Box>

        <Box
          borderWidth="1px"
          borderRadius="lg"
          p={4}
          overflowX="auto"
          maxHeight="300px"
          overflowY="auto">
          <Text fontWeight="bold" fontSize="lg" mb={4}>
            注文商品
          </Text>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th width="40%" whiteSpace="nowrap">
                    商品名
                  </Th>
                  <Th width="20%" whiteSpace="nowrap" textAlign="center">
                    数量
                  </Th>
                  <Th width="20%" whiteSpace="nowrap" textAlign="right">
                    単価
                  </Th>
                  <Th width="20%" whiteSpace="nowrap" textAlign="right">
                    小計
                  </Th>
                </Tr>
              </Thead>
              <Tbody>
                {items.map((item, index) => (
                  <Tr key={`detail-order-item-${item.id || index}`}>
                    <Td
                      width="40%"
                      sx={{
                        maxWidth: '200px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                      onClick={() => {
                        if (isMobile) {
                          toast({
                            title: '商品名',
                            description: item.product.name,
                            status: 'info',
                            duration: 3000,
                            isClosable: true,
                            position: 'top',
                          });
                        }
                      }}>
                      {isMobile ? (
                        <Text
                          sx={{
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            width: '100%',
                          }}>
                          {item.product.name}
                        </Text>
                      ) : (
                        <Tooltip
                          label={item.product.name}
                          placement="top-start"
                          hasArrow
                          bg="gray.900"
                          color="white">
                          <Text
                            whiteSpace="nowrap"
                            overflow="hidden"
                            textOverflow="ellipsis">
                            {item.product.name}
                          </Text>
                        </Tooltip>
                      )}
                    </Td>
                    <Td width="20%" textAlign="center" whiteSpace="nowrap">
                      {item.quantity}
                    </Td>
                    <Td width="20%" textAlign="right" whiteSpace="nowrap">
                      ¥{item.unitPrice.toLocaleString()}
                    </Td>
                    <Td width="20%" textAlign="right" whiteSpace="nowrap">
                      ¥{(item.quantity * item.unitPrice).toLocaleString()}
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </VStack>
    );
  };

  const renderCustomerInfo = () => {
    if (!activeOrder?.customer) {
      return (
        <Alert status="info">
          <AlertIcon />
          顧客情報が見つかりません
        </Alert>
      );
    }

    const customerInfoItems = [
      { id: 'customerId', label: '顧客ID', value: activeOrder.customer.id },
      { id: 'name', label: '名前', value: activeOrder.customer.name },
      {
        id: 'email',
        label: 'メールアドレス',
        value: activeOrder.customer.email,
      },
      {
        id: 'phone',
        label: '電話番号',
        value: activeOrder.customer.phoneNumber,
      },
      { id: 'address', label: '住所', value: activeOrder.customer.address },
    ];

    return (
      <VStack align="stretch" spacing={4} py={2}>
        <Box borderWidth="1px" borderRadius="lg" p={4}>
          <VStack align="stretch" spacing={4}>
            <Text fontWeight="bold" fontSize="lg">
              顧客情報
            </Text>
            {customerInfoItems.map(item => (
              <Box key={`customerInfo-${item.id}`}>
                <Text fontWeight="semibold">{item.label}</Text>
                <Text>{item.value}</Text>
              </Box>
            ))}
          </VStack>
        </Box>
      </VStack>
    );
  };

  const renderShipmentInfo = () => {
    return (
      <Alert status="info" mt={4}>
        <AlertIcon />
        配送情報は実装予定です
      </Alert>
    );
  };

  if (status === 'loading' && orders.length === 0) {
    return (
      <Flex justify="center" align="center" height="200px">
        <Spinner />
      </Flex>
    );
  }

  if (status === 'failed') {
    return (
      <Alert status="error">
        <AlertIcon />
        {error}
      </Alert>
    );
  }

  return (
    <Container maxW="container.xl" py={5}>
      <PageHeader
        title="注文管理"
        buttons={
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={2}
            width={{ base: '100%', md: 'auto' }}>
            <CommonButton
              variant="primary"
              withIcon={<AddIcon />}
              onClick={handleAddOrder}
              isFullWidthMobile>
              新規注文作成
            </CommonButton>
            <BackToDashboardButton />
          </Stack>
        }
        mobileStack
      />

      <OrderSearchFilter
        searchTerm={searchTerm}
        dateRange={dateRange}
        isSearching={isSearching}
        status={status}
        statusColorScheme={statusColorScheme}
        statusDisplayText={statusDisplayText}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onSearchKeyDown={handleSearchKeyDown}
        onStatusFilter={handleStatusFilter}
        onDateRangeFilter={handleDateRangeFilter}
        onDatePickerOpen={onDatePickerOpen}
        clearFilters={clearFilters}
      />

      <Text mb={4} color="gray.600">
        総注文リスト数: {totalCount.toLocaleString()}
      </Text>

      <OrderTable
        orders={orders}
        statusColorScheme={statusColorScheme}
        statusDisplayText={statusDisplayText}
        isMobile={isMobile}
        lastElementRef={lastElementRef}
        handleOrderClick={handleOrderClick}
        handleEditOrder={handleEditOrder}
        handleDeleteOrder={handleDeleteOrder}
        formatDate={formatDate}
      />

      <Flex justify="center" my={4}>
        <Text color="red">
          {orders.length >= totalCount
            ? `全 ${totalCount.toLocaleString()} 件を表示中`
            : `${orders.length.toLocaleString()} 件を表示中 (全 ${totalCount.toLocaleString()} 件)`}
        </Text>
      </Flex>

      {hasMore && status === 'loading' && (
        <Flex justify="center" my={4}>
          <Spinner />
        </Flex>
      )}

      <ScrollToTopButton />

      <ModalComponent {...ModalProps}>
        {isMobile && <DrawerOverlay />}
        {!isMobile && <ModalOverlay />}
        {isMobile ? (
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>
              {modalMode === 'detail'
                ? '注文詳細'
                : modalMode === 'add'
                  ? '新規注文作成'
                  : '注文編集'}
            </DrawerHeader>
            <DrawerBody>
              <Tabs isLazy>
                <TabList>
                  <Tab>注文情報</Tab>
                  <Tab>顧客情報</Tab>
                  <Tab>配送情報</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    {modalMode === 'detail'
                      ? renderOrderDetails()
                      : renderOrderForm()}
                  </TabPanel>
                  <TabPanel>{renderCustomerInfo()}</TabPanel>
                  <TabPanel>{renderShipmentInfo()}</TabPanel>
                </TabPanels>
              </Tabs>
            </DrawerBody>
            <DrawerFooter>
              {modalMode !== 'detail' && (
                <CommonButton variant="primary" mr={3} onClick={handleSubmit}>
                  {modalMode === 'add' ? '作成' : '更新'}
                </CommonButton>
              )}
              <CommonButton variant="ghost" onClick={onClose}>
                閉じる
              </CommonButton>
            </DrawerFooter>
          </DrawerContent>
        ) : (
          <ModalContent>
            <ModalCloseButton />
            <ModalHeader>
              {modalMode === 'detail'
                ? '注文詳細'
                : modalMode === 'add'
                  ? '新規注文作成'
                  : '注文編集'}
            </ModalHeader>
            <ModalBody>
              <Tabs isLazy>
                <TabList>
                  <Tab>注文情報</Tab>
                  <Tab>顧客情報</Tab>
                  <Tab>配送情報</Tab>
                </TabList>
                <TabPanels>
                  <TabPanel>
                    {modalMode === 'detail'
                      ? renderOrderDetails()
                      : renderOrderForm()}
                  </TabPanel>
                  <TabPanel>{renderCustomerInfo()}</TabPanel>
                  <TabPanel>{renderShipmentInfo()}</TabPanel>
                </TabPanels>
              </Tabs>
            </ModalBody>
            <ModalFooter>
              {modalMode !== 'detail' && (
                <CommonButton variant="primary" mr={3} onClick={handleSubmit}>
                  {modalMode === 'add' ? '作成' : '更新'}
                </CommonButton>
              )}
              <CommonButton variant="ghost" onClick={onClose}>
                閉じる
              </CommonButton>
            </ModalFooter>
          </ModalContent>
        )}
      </ModalComponent>

      <Modal
        isOpen={isDeleteAlertOpen}
        onClose={cancelDelete}
        isCentered
        size="sm">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>注文の削除</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4} align="stretch">
              <HStack spacing={2}>
                <WarningIcon color="red.500" />
                <Text>この操作は取り消せません。</Text>
              </HStack>
              <Text>
                注文番号: {orderToDelete?.orderNumber}{' '}
                を削除してもよろしいですか？
              </Text>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <CommonButton variant="danger" mr={3} onClick={confirmDelete}>
              削除
            </CommonButton>
            <CommonButton variant="ghost" onClick={cancelDelete}>
              キャンセル
            </CommonButton>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <DateRangePickerModal
        isOpen={isDatePickerOpen}
        onClose={onDatePickerClose}
        onApply={(start, end) => {
          handleDateRangeFilter('custom', start, end);
          onDatePickerClose();
        }}
        initialStartDate={dateRange.start}
        initialEndDate={dateRange.end}
      />
    </Container>
  );
};

export default OrdersPage;
