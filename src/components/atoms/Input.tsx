"use client";

import React from "react";
import { Input as ChakraInput, InputProps } from "@chakra-ui/react";

const Input: React.FC<InputProps> = (props) => {
  return <ChakraInput {...props} />;
};

export default Input;
