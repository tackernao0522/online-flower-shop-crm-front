"use client";

import React from "react";
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  useBreakpointValue,
} from "@chakra-ui/react";
import Input from "../atoms/Input";

interface FormFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  value: string; // 追加: value プロパティを定義
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; // 追加: onChange プロパティを定義
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type,
  placeholder,
  value, // 追加: value プロパティを使用
  onChange, // 追加: onChange プロパティを使用
  error,
}) => {
  const inputSize = useBreakpointValue({ base: "sm", md: "md" });

  return (
    <FormControl isInvalid={!!error} mb={4}>
      <FormLabel htmlFor={name} fontSize={["sm", "md"]}>
        {label}
      </FormLabel>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value} // 追加: value を指定
        onChange={onChange} // 追加: onChange を指定
        size={inputSize}
      />
      {error && (
        <FormErrorMessage fontSize={["xs", "sm"]}>{error}</FormErrorMessage>
      )}
    </FormControl>
  );
};

export default FormField;
