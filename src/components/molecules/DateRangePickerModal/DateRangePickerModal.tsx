import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Text,
  VStack,
  Box,
  useToast,
} from '@chakra-ui/react';
import { format, isValid, parseISO, startOfDay, endOfDay } from 'date-fns';
import ja from 'date-fns/locale/ja';
import CommonButton from '@/components/atoms/CommonButton';
import CommonInput from '@/components/atoms/CommonInput';

interface DateRangePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (start: Date, end: Date) => void;
  initialStartDate?: Date | null;
  initialEndDate?: Date | null;
}

const DateRangePickerModal: React.FC<DateRangePickerModalProps> = ({
  isOpen,
  onClose,
  onApply,
  initialStartDate = null,
  initialEndDate = null,
}) => {
  // State management
  const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
  const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
  const [error, setError] = useState<string>('');
  const toast = useToast();

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStartDate(initialStartDate);
      setEndDate(initialEndDate);
      setError('');
    }
  }, [isOpen, initialStartDate, initialEndDate]);

  // Handle date input changes
  const handleDateChange = (
    type: 'start' | 'end',
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const inputDate = event.target.value;

    try {
      if (!inputDate) {
        type === 'start' ? setStartDate(null) : setEndDate(null);
        setError('');
        return;
      }

      const parsedDate = parseISO(inputDate);

      if (!isValid(parsedDate)) {
        throw new Error('無効な日付形式です');
      }

      if (type === 'start') {
        const newStartDate = startOfDay(parsedDate);
        if (endDate && newStartDate > endDate) {
          setError('開始日は終了日より前の日付を選択してください');
        } else {
          setStartDate(newStartDate);
          setError('');
        }
      } else {
        const newEndDate = endOfDay(parsedDate);
        if (startDate && newEndDate < startDate) {
          setError('終了日は開始日より後の日付を選択してください');
        } else {
          setEndDate(newEndDate);
          setError('');
        }
      }
    } catch (err) {
      setError('正しい日付形式で入力してください');
      toast({
        title: 'エラー',
        description: '日付の入力形式が正しくありません',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Handle apply button click
  const handleApply = (): void => {
    if (!startDate || !endDate) {
      setError('開始日と終了日を選択してください');
      return;
    }

    if (endDate < startDate) {
      setError('終了日は開始日より後の日付を選択してください');
      return;
    }

    try {
      onApply(startDate, endDate);
      onClose();
      setError('');
    } catch (err) {
      console.error('日付範囲の適用中にエラーが発生しました:', err);
      toast({
        title: 'エラー',
        description: '日付範囲の適用に失敗しました',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Format date for input value
  const formatDateForInput = (date: Date | null): string => {
    if (!date) return '';
    try {
      return format(date, 'yyyy-MM-dd');
    } catch (err) {
      console.error('日付のフォーマット中にエラーが発生しました:', err);
      return '';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      isCentered
      closeOnOverlayClick={false}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>期間を指定</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={4}>
            <FormControl isRequired>
              <FormLabel htmlFor="start-date">開始日</FormLabel>
              <CommonInput
                id="start-date"
                type="date"
                value={formatDateForInput(startDate)}
                onChange={e => handleDateChange('start', e)}
                max={endDate ? formatDateForInput(endDate) : undefined}
                aria-describedby={error ? 'date-range-error' : undefined}
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel htmlFor="end-date">終了日</FormLabel>
              <CommonInput
                id="end-date"
                type="date"
                value={formatDateForInput(endDate)}
                onChange={e => handleDateChange('end', e)}
                min={startDate ? formatDateForInput(startDate) : undefined}
                aria-describedby={error ? 'date-range-error' : undefined}
              />
            </FormControl>

            {error && (
              <Box id="date-range-error" role="alert">
                <Text color="red.500" fontSize="sm">
                  {error}
                </Text>
              </Box>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <CommonButton
            variant="primary"
            mr={3}
            onClick={handleApply}
            isDisabled={!startDate || !endDate || !!error}>
            適用
          </CommonButton>
          <CommonButton variant="ghost" onClick={onClose}>
            キャンセル
          </CommonButton>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default DateRangePickerModal;
