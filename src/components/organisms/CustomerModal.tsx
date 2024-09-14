import React from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
} from "@chakra-ui/react";
import { Customer } from "@/types/customer";
import CustomerBasicInfo from "@/components/molecules/CustomerBasicInfo";
import CustomerPurchaseHistory from "@/components/molecules/CustomerPurchaseHistory";
import CustomerNotes from "@/components/molecules/CustomerNotes";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  modalMode: "detail" | "add" | "edit";
  activeCustomer: Customer | null;
  onSubmit: (
    customerData: Omit<
      Customer,
      "id" | "created_at" | "updated_at" | "purchaseHistory"
    >
  ) => void;
  isMobile: boolean;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  modalMode,
  activeCustomer,
  onSubmit,
  isMobile,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={isMobile ? "full" : "xl"}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {modalMode === "detail"
            ? "顧客詳細"
            : modalMode === "add"
            ? "新規顧客登録"
            : "顧客情報編集"}
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
                <CustomerBasicInfo
                  customer={activeCustomer}
                  modalMode={modalMode}
                  onSubmit={onSubmit}
                />
              </TabPanel>
              <TabPanel>
                <CustomerPurchaseHistory
                  customer={activeCustomer}
                  modalMode={modalMode}
                  isMobile={isMobile}
                />
              </TabPanel>
              <TabPanel>
                <CustomerNotes
                  customer={activeCustomer}
                  modalMode={modalMode}
                />
              </TabPanel>
            </TabPanels>
          </Tabs>
        </ModalBody>
        <ModalFooter>
          {modalMode !== "detail" && (
            <Button
              colorScheme="blue"
              mr={3}
              onClick={() => onSubmit(activeCustomer as Customer)}>
              {modalMode === "add" ? "登録" : "更新"}
            </Button>
          )}
          <Button variant="ghost" onClick={onClose}>
            閉じる
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default CustomerModal;
