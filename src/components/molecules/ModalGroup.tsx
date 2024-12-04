import React, { ChangeEvent } from 'react';
import { OrderItemField } from '@/types/order';
import DateRangePickerModal from '@/components/molecules/DateRangePickerModal/DateRangePickerModal';
import OrderModal from '@/components/organisms/OrderModal/OrderModal';
import DeleteConfirmModal from '@/components/organisms/DeleteConfirmModal/DeleteConfirmModal';

interface ModalGroupProps {
  isOpen: boolean;
  onClose: () => void;
  isDeleteAlertOpen: boolean;
  isMobile: boolean;
  modalSize: string | undefined;
  modalMode: 'detail' | 'add' | 'edit';
  activeOrder: any;
  newOrder: any;
  formErrors: any;
  statusColorScheme: Record<string, string>;
  statusDisplayText: Record<string, string>;
  handleInputChange: (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => void;
  handleOrderItemChange: (
    index: number,
    field: OrderItemField,
    value: string | number,
  ) => void;
  handleAddOrderItem: () => void;
  handleRemoveOrderItem: (index: number) => void;
  handleSubmit: () => void;
  cancelDelete: () => void;
  confirmDelete: () => void;
  orderToDelete: any;
  isDatePickerOpen: boolean;
  onDatePickerClose: () => void;
  handleDateRangeFilter: (
    range: 'custom' | 'today' | 'week' | 'month',
    customStart?: Date | null,
    customEnd?: Date | null,
  ) => Promise<void>;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
}

export const ModalGroup: React.FC<ModalGroupProps> = ({
  isOpen,
  onClose,
  isDeleteAlertOpen,
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
  cancelDelete,
  confirmDelete,
  orderToDelete,
  isDatePickerOpen,
  onDatePickerClose,
  handleDateRangeFilter,
  dateRange,
}) => {
  return (
    <>
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
    </>
  );
};

export default ModalGroup;
