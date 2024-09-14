import React from "react";
import { FormControl, FormLabel, Textarea } from "@chakra-ui/react";
import { Customer } from "@/types/customer";

interface CustomerNotesProps {
  customer: Customer | null;
  modalMode: "detail" | "add" | "edit";
}

const CustomerNotes: React.FC<CustomerNotesProps> = ({
  customer,
  modalMode,
}) => {
  return (
    <FormControl>
      <FormLabel>メモ</FormLabel>
      <Textarea
        placeholder="顧客に関する特記事項を入力"
        isReadOnly={modalMode === "detail"}
        defaultValue={customer?.notes || ""}
      />
    </FormControl>
  );
};

export default CustomerNotes;
