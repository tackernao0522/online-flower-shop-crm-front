"use client";

import React from "react";
import {
  chakra,
  Box,
  Text,
  HStack,
  ScaleFade,
  BoxProps,
  forwardRef,
} from "@chakra-ui/react";
import { ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import {
  motion,
  HTMLMotionProps,
  isValidMotionProp,
  Variant,
} from "framer-motion";

// 基本的な型定義
type Merge<P, T> = Omit<P, keyof T> & T;
type MotionBoxProps = Merge<BoxProps, HTMLMotionProps<"div">>;

// ChakraとMotionを組み合わせた新しいコンポーネントの定義
const ChakraBox = chakra(motion.div, {
  shouldComponentUpdate: true,
  baseStyle: {},
  shouldForwardProp: (prop) => isValidMotionProp(prop) || prop === "children",
}) as React.ForwardRefExoticComponent<Merge<BoxProps, HTMLMotionProps<"div">>>;

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  isLoading?: boolean;
  hasError?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isLoading = false,
  hasError = false,
}) => {
  // アニメーション設定
  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    update: {
      scale: [1, 1.1, 1],
      transition: { duration: 0.3 },
    },
  };

  return (
    <ScaleFade in={!isLoading} initialScale={0.9}>
      <ChakraBox
        bg="white"
        p={5}
        borderRadius="md"
        boxShadow="sm"
        initial="hidden"
        animate="visible"
        variants={variants}
        whileHover={{ scale: 1.02 }}
        _hover={{ cursor: "pointer" }}
        position="relative"
        role="group"
        sx={{
          transition: "0.3s",
        }}>
        {/* エラー表示用のオーバーレイ */}
        {hasError && (
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="red.50"
            borderRadius="md"
            display="flex"
            alignItems="center"
            justifyContent="center">
            <Text color="red.500" fontSize="sm">
              データの取得に失敗しました
            </Text>
          </Box>
        )}

        {/* 通常のコンテンツ */}
        <Box opacity={hasError ? 0.5 : 1}>
          <Text fontSize="lg" mb={2} color="gray.600">
            {title}
          </Text>
          <ChakraBox animate="update" variants={variants} key={value}>
            <Text fontSize="3xl" fontWeight="bold" mb={2}>
              {value}
            </Text>
          </ChakraBox>
          <HStack spacing={2}>
            {change > 0 ? (
              <ArrowUpIcon color="green.500" data-testid="arrow-up" />
            ) : (
              <ArrowDownIcon color="red.500" data-testid="arrow-down" />
            )}
            <Text
              color={change > 0 ? "green.500" : "red.500"}
              fontSize="sm"
              fontWeight="medium">
              {Math.abs(change)}%
            </Text>
          </HStack>
        </Box>
      </ChakraBox>
    </ScaleFade>
  );
};

export default StatCard;
