'use client';

import React from 'react';
import {
  Flex,
  Alert,
  AlertIcon,
  Spinner,
  Container,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useDisclosure } from '@chakra-ui/react';
import { OrderStatus } from '@/types/order';
import { useOrderManagement } from '@/hooks/useOrderManagement';
import { OrderManagementHeader } from '@/components/molecules/OrderManagementHeader';
import { OrderSearchFilter } from '@/components/molecules/OrderSearchFilter';
import { OrderCountDisplay } from '@/components/molecules/OrderCountDisplay';
import { ModalGroup } from '@/components/molecules/ModalGroup';
import ScrollToTopButton from '@/components/atoms/ScrollToTopButton';
import { formatDate } from '@/utils/dateFormatter';
import OrderTable from '../organisms/OrderTable';

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
      <OrderManagementHeader onAddOrder={handleAddOrder} />

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

      <OrderCountDisplay
        totalCount={totalCount}
        currentCount={orders.length}
        showTotalCountOnly={true}
      />

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

      <OrderCountDisplay totalCount={totalCount} currentCount={orders.length} />

      {hasMore && status === 'loading' && (
        <Flex justify="center" my={4}>
          <Spinner />
        </Flex>
      )}

      <ScrollToTopButton />

      <ModalGroup
        isOpen={isOpen}
        onClose={onClose}
        isDeleteAlertOpen={isDeleteAlertOpen}
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
        cancelDelete={cancelDelete}
        confirmDelete={confirmDelete}
        orderToDelete={orderToDelete}
        isDatePickerOpen={isDatePickerOpen}
        onDatePickerClose={onDatePickerClose}
        handleDateRangeFilter={handleDateRangeFilter}
        dateRange={dateRange}
      />
    </Container>
  );
};

export default OrderManagementTemplate;
