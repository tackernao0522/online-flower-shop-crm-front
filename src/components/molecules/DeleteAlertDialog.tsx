import React from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from '@chakra-ui/react';
import CommonButton from '../atoms/CommonButton';

interface DeleteAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  itemType: string;
}

const DeleteAlertDialog: React.FC<DeleteAlertDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
  itemType,
}) => {
  const cancelRef = React.useRef<HTMLButtonElement>(null);

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={cancelRef}
      onClose={onClose}>
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            {itemType}を削除
          </AlertDialogHeader>

          <AlertDialogBody>
            本当に{itemName}を削除しますか？この操作は取り消せません。
          </AlertDialogBody>

          <AlertDialogFooter>
            <CommonButton ref={cancelRef} variant="ghost" onClick={onClose}>
              キャンセル
            </CommonButton>
            <CommonButton variant="danger" onClick={onConfirm} ml={3}>
              削除
            </CommonButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  );
};

export default DeleteAlertDialog;
