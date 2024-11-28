'use client';

import React from 'react';
import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  useBreakpointValue,
} from '@chakra-ui/react';
import CommonInput from '../atoms/CommonInput';

interface FormFieldProps {
  label: string;
  name: string;
  type: string;
  placeholder?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
}

const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type,
  placeholder,
  value,
  onChange,
  error,
}) => {
  const inputSize = useBreakpointValue({ base: 'sm', md: 'md' });

  return (
    <FormControl isInvalid={!!error} mb={4}>
      <FormLabel htmlFor={name} fontSize={['sm', 'md']}>
        {label}
      </FormLabel>
      <CommonInput
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        size={inputSize}
      />
      {error && (
        <FormErrorMessage fontSize={['xs', 'sm']}>{error}</FormErrorMessage>
      )}
    </FormControl>
  );
};

export default FormField;
