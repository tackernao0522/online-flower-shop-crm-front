"use client";

import React from "react";
import { Checkbox as ChakraCheckbox, CheckboxProps } from "@chakra-ui/react";

const Checkbox: React.FC<CheckboxProps> = (props) => {
  return <ChakraCheckbox {...props} />;
};

export default Checkbox;
