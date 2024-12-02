'use client';

import React from 'react';
import {
  Flex,
  Text,
  Alert,
  AlertIcon,
  Spinner,
  Container,
  useBreakpointValue,
  Stack,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import { OrderStatus } from '@/types/order';
import { useDisclosure } from '@chakra-ui/react';
import DateRangePickerModal from '@/components/molecules/DateRangePickerModal/DateRangePickerModal';
import BackToDashboardButton from '@/components/atoms/BackToDashboardButton';
import ScrollToTopButton from '@/components/atoms/ScrollToTopButton';
import CommonButton from '@/components/atoms/CommonButton';
import PageHeader from '@/components/molecules/PageHeader';
import { OrderSearchFilter } from '@/components/molecules/OrderSearchFilter';
import OrderTable from '@/components/organisms/OrderTable';
import OrderModal from '@/components/organisms/OrderModal/OrderModal';
import { formatDate } from '@/utils/dateFormatter';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import DeleteConfirmModal from '../organisms/DeleteConfirmModal/DeleteConfirmModal';

const OrderManagementTemplate = () => {
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

      <OrderModal
        isOpen={isOpen}
        onClose={onClose}
        isMobile={isMobile}
        modalSize={modalSize}
        modalMode={modalMode}
        activeOrder={activeOrder}
        newOrder={newOrder}
        formErrors={formErrors}
        statusColorScheme={statusColorScheme}
        statusDisplayText={statusDisplayText}
        handleInputChange={handleInputChange}
        handleOrderItemChange={handleOrderItemChange}
        handleAddOrderItem={handleAddOrderItem}
        handleRemoveOrderItem={handleRemoveOrderItem}
        handleSubmit={handleSubmit}
      />

      <DeleteConfirmModal
        isOpen={isDeleteAlertOpen}
        onClose={cancelDelete}
        onConfirm={confirmDelete}
        title="注文の削除"
        targetName={`注文番号: ${orderToDelete?.orderNumber}`}
      />

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

export default OrderManagementTemplate;
