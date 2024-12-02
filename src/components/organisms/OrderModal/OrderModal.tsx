import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Drawer,
  DrawerBody,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  VStack,
  Box,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Tooltip,
  useToast,
  Flex,
} from '@chakra-ui/react';
import { format } from 'date-fns';
import { Order, OrderStatus, OrderItemField } from '@/types/order';
import CommonButton from '@/components/atoms/CommonButton';
import OrderForm from '@/components/organisms/OrderForm';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  isMobile: boolean;
  modalSize?: string;
  modalMode: 'detail' | 'add' | 'edit';
  activeOrder: Order | null;
  newOrder: any;
  formErrors: any;
  statusColorScheme: Record<OrderStatus, string>;
  statusDisplayText: Record<OrderStatus, string>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleOrderItemChange: (
    index: number,
    field: OrderItemField,
    value: string | number,
  ) => void;
  handleAddOrderItem: () => void;
  handleRemoveOrderItem: (index: number) => void;
  handleSubmit: () => void;
}

const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  isMobile,
  modalSize,
  modalMode,
  activeOrder,
  newOrder,
  formErrors,
  statusColorScheme,
  statusDisplayText,
  handleInputChange,
  handleOrderItemChange,
  handleAddOrderItem,
  handleRemoveOrderItem,
  handleSubmit,
}) => {
  const toast = useToast();

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

  const ModalComponent = isMobile ? Drawer : Modal;
  const modalProps = isMobile
    ? {
        isOpen,
        onClose,
        placement: 'right' as const,
        size: 'full' as const,
      }
    : {
        isOpen,
        onClose,
        size: modalSize,
      };

  return (
    <ModalComponent {...modalProps}>
      {isMobile ? <DrawerOverlay /> : <ModalOverlay />}
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
                  {modalMode === 'detail' ? (
                    renderOrderDetails()
                  ) : (
                    <OrderForm
                      newOrder={newOrder}
                      formErrors={formErrors}
                      modalMode={modalMode}
                      statusDisplayText={statusDisplayText}
                      handleInputChange={handleInputChange}
                      handleOrderItemChange={handleOrderItemChange}
                      handleAddOrderItem={handleAddOrderItem}
                      handleRemoveOrderItem={handleRemoveOrderItem}
                    />
                  )}
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
                  {modalMode === 'detail' ? (
                    renderOrderDetails()
                  ) : (
                    <OrderForm
                      newOrder={newOrder}
                      formErrors={formErrors}
                      modalMode={modalMode}
                      statusDisplayText={statusDisplayText}
                      handleInputChange={handleInputChange}
                      handleOrderItemChange={handleOrderItemChange}
                      handleAddOrderItem={handleAddOrderItem}
                      handleRemoveOrderItem={handleRemoveOrderItem}
                    />
                  )}
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
  );
};

export default OrderModal;
