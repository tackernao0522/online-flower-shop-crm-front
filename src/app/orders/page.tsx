'use client';

import React, { useEffect, useState } from 'react';
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
  InputGroup,
  InputLeftElement,
  InputRightElement,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
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
} from '@chakra-ui/react';
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ArrowBackIcon,
  ViewIcon,
  SearchIcon,
  ChevronDownIcon,
  WarningIcon,
  ArrowUpIcon,
  CalendarIcon,
} from '@chakra-ui/icons';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
import { useRouter } from 'next/navigation';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { useLoading } from '@/hooks/useLoading';
import { useInfiniteScroll } from '@/hooks/useInfiniteScroll';
import { OrderStatus } from '@/types/order';
import { formatDate } from '@/utils/dateFormatter';
import { useDisclosure } from '@chakra-ui/react';
import DateRangePickerModal from '@/components/molecules/DateRangePickerModal/DateRangePickerModal';

const OrdersPage = () => {
  const router = useRouter();
  const toast = useToast();
  const isMobile = useBreakpointValue({ base: true, md: false });
  const modalSize = useBreakpointValue({ base: 'full', md: '4xl' });

  // DateRangePicker用のディスクロージャー
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
    hasMore,
    loadMore,
  } = useOrderManagement();

  const isLoadingVisible = useLoading(2000);
  const { lastElementRef } = useInfiniteScroll(loadMore, hasMore);

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.pageYOffset > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

  const renderSearchAndFilter = () => (
    <VStack spacing={4} w="full" mb={6}>
      <Flex w="full" gap={2} flexWrap="wrap">
        <InputGroup flex={1} minW={{ base: 'full', md: '320px' }}>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="注文番号、顧客名で検索..."
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleSearchKeyDown}
          />
          <InputRightElement width="4.5rem">
            <Button
              h="1.75rem"
              size="sm"
              onClick={handleSearchSubmit}
              isLoading={
                isSearching || (status === 'loading' && isLoadingVisible)
              }
              loadingText="検索中">
              検索
            </Button>
          </InputRightElement>
        </InputGroup>

        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            ステータス
          </MenuButton>
          <MenuList>
            {Object.entries(statusDisplayText).map(([value, label]) => (
              <MenuItem
                key={value}
                onClick={() => handleStatusFilter(value as OrderStatus)}>
                <Badge
                  colorScheme={statusColorScheme[value as OrderStatus]}
                  mr={2}>
                  {label}
                </Badge>
              </MenuItem>
            ))}
            <MenuItem onClick={clearFilters}>フィルタをクリア</MenuItem>
          </MenuList>
        </Menu>

        <Menu>
          <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
            期間
          </MenuButton>
          <MenuList>
            <MenuItem onClick={() => handleDateRangeFilter('today')}>
              本日
            </MenuItem>
            <MenuItem onClick={() => handleDateRangeFilter('week')}>
              今週
            </MenuItem>
            <MenuItem onClick={() => handleDateRangeFilter('month')}>
              今月
            </MenuItem>
            <MenuItem onClick={onDatePickerOpen}>
              <HStack>
                <CalendarIcon />
                <Text>期間を指定...</Text>
              </HStack>
            </MenuItem>
            {(dateRange.start || dateRange.end) && (
              <MenuItem
                onClick={() => handleDateRangeFilter('custom', null, null)}>
                期間指定をクリア
              </MenuItem>
            )}
          </MenuList>
        </Menu>

        {/* 選択中の期間表示 */}
        {dateRange.start && dateRange.end && (
          <Text color="gray.600" fontSize="sm">
            期間: {format(dateRange.start, 'yyyy/MM/dd', { locale: ja })} -{' '}
            {format(dateRange.end, 'yyyy/MM/dd', { locale: ja })}
          </Text>
        )}
      </Flex>
    </VStack>
  );

  const renderOrderForm = () => (
    <VStack spacing={6} align="stretch">
      <FormControl isRequired isInvalid={!!formErrors.customerId}>
        <FormLabel>顧客ID</FormLabel>
        <Input
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
                <Input
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
          <Button
            leftIcon={<AddIcon />}
            onClick={handleAddOrderItem}
            colorScheme="teal"
            variant="outline">
            商品を追加
          </Button>
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
          <Table variant="simple" size="sm">
            <Thead>
              <Tr>
                <Th>商品名</Th>
                <Th width="80px" textAlign="center">
                  数量
                </Th>
                <Th width="100px" textAlign="center">
                  単価
                </Th>
                <Th width="100px" textAlign="right">
                  小計
                </Th>
              </Tr>
            </Thead>
            <Tbody>
              {items.map((item, index) => (
                <Tr key={`detail-order-item-${item.id || index}`}>
                  <Td whiteSpace="normal">{item.product.name}</Td>
                  <Td textAlign="center">{item.quantity}</Td>
                  <Td textAlign="center">¥{item.unitPrice.toLocaleString()}</Td>
                  <Td textAlign="right">
                    ¥{(item.quantity * item.unitPrice).toLocaleString()}
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
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
        <Spinner size="xl" />
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
      <Flex
        justifyContent="space-between"
        alignItems="center"
        mb={5}
        flexDirection={{ base: 'column', md: 'row' }}
        gap={4}>
        <Heading as="h1" size="xl">
          注文管理
        </Heading>
        <HStack spacing={2}>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={handleAddOrder}
            w={{ base: 'full', md: 'auto' }}>
            新規注文作成
          </Button>
          <Button
            leftIcon={<ArrowBackIcon />}
            onClick={() => router.push('/dashboard')}
            w={{ base: 'full', md: 'auto' }}>
            ダッシュボードへ戻る
          </Button>
        </HStack>
      </Flex>

      {renderSearchAndFilter()}

      <Text mb={4} color="gray.600">
        総注文リスト数: {totalCount.toLocaleString()}
      </Text>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>注文番号</Th>
              <Th>顧客名</Th>
              <Th>注文日</Th>
              <Th>合計金額</Th>
              <Th>ステータス</Th>
              <Th>アクション</Th>
            </Tr>
          </Thead>
          <Tbody>
            {orders.map((order, index) => (
              <Tr
                key={`${order.id}-${order.orderNumber}-${index}`}
                ref={index === orders.length - 1 ? lastElementRef : undefined}>
                <Td>{order.orderNumber}</Td>
                <Td>{order.customer.name}</Td>
                <Td>{formatDate(order.orderDate)}</Td>
                <Td>¥{order.totalAmount.toLocaleString()}</Td>
                <Td>
                  <Badge colorScheme={statusColorScheme[order.status]}>
                    {statusDisplayText[order.status]}
                  </Badge>
                </Td>
                <Td>
                  {isMobile ? (
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="詳細を表示"
                        icon={<ViewIcon />}
                        size="sm"
                        onClick={() => handleOrderClick(order)}
                      />
                      <IconButton
                        aria-label="注文を編集"
                        icon={<EditIcon />}
                        size="sm"
                        isDisabled={
                          order.status === 'DELIVERED' ||
                          order.status === 'CANCELLED'
                        }
                        onClick={() => handleEditOrder(order)}
                      />
                      <IconButton
                        aria-label="注文を削除"
                        icon={<DeleteIcon />}
                        size="sm"
                        colorScheme="red"
                        isDisabled={order.status === 'DELIVERED'}
                        onClick={() => handleDeleteOrder(order)}
                      />
                    </HStack>
                  ) : (
                    <HStack spacing={2}>
                      <Button
                        size="sm"
                        leftIcon={<ViewIcon />}
                        onClick={() => handleOrderClick(order)}>
                        詳細
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<EditIcon />}
                        isDisabled={
                          order.status === 'DELIVERED' ||
                          order.status === 'CANCELLED'
                        }
                        onClick={() => handleEditOrder(order)}>
                        編集
                      </Button>
                      <Button
                        size="sm"
                        leftIcon={<DeleteIcon />}
                        colorScheme="red"
                        isDisabled={order.status === 'DELIVERED'}
                        onClick={() => handleDeleteOrder(order)}>
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

      {/* 注文リストの表示件数 */}
      <Flex justify="center" my={4}>
        <Text color="red">
          {orders.length >= totalCount
            ? `全 ${totalCount.toLocaleString()} 件を表示中`
            : `${orders.length.toLocaleString()} 件を表示中 (全 ${totalCount.toLocaleString()} 件)`}
        </Text>
      </Flex>

      {/* ローディングインジケーター */}
      {(status === 'loading' || isSearching) && (
        <Flex justify="center" py={4}>
          <Spinner />
        </Flex>
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
                <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                  {modalMode === 'add' ? '作成' : '更新'}
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                閉じる
              </Button>
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
                <Button colorScheme="blue" mr={3} onClick={handleSubmit}>
                  {modalMode === 'add' ? '作成' : '更新'}
                </Button>
              )}
              <Button variant="ghost" onClick={onClose}>
                閉じる
              </Button>
            </ModalFooter>
          </ModalContent>
        )}
      </ModalComponent>

      {/* 削除確認モーダル */}
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
            <Button colorScheme="red" mr={3} onClick={confirmDelete}>
              削除
            </Button>
            <Button variant="ghost" onClick={cancelDelete}>
              キャンセル
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* DateRangePickerModal */}
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
