"use client";

import React from "react";
import {
  chakra,
  Box,
  Text,
  HStack,
  ScaleFade,
  BoxProps,
  Tooltip,
  VStack,
} from "@chakra-ui/react";
import { ArrowUpIcon, ArrowDownIcon } from "@chakra-ui/icons";
import {
  motion,
  HTMLMotionProps,
  isValidMotionProp,
  Transition,
} from "framer-motion";
import { formatDistance } from "date-fns";
import { ja } from "date-fns/locale";

// 型定義
type Merge<P, T> = Omit<P, keyof T> & T;
type MotionBoxProps = Merge<BoxProps, HTMLMotionProps<"div">>;

// ChakraとMotionを組み合わせたコンポーネント
const ChakraBox = chakra(motion.div, {
  shouldComponentUpdate: true,
  baseStyle: {},
  shouldForwardProp: (prop) => isValidMotionProp(prop) || prop === "children",
}) as React.ForwardRefExoticComponent<MotionBoxProps>;

interface StatCardProps {
  title: string;
  value: string;
  change: number;
  isLoading?: boolean;
  hasError?: boolean;
  lastUpdated?: string;
  format?: "default" | "currency";
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  change,
  isLoading = false,
  hasError = false,
  lastUpdated,
  format = "default",
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

  const transition: Transition = {
    type: "spring",
    stiffness: 200,
    damping: 20,
  };

  // 最終更新時刻のフォーマット
  const formattedLastUpdated = lastUpdated
    ? formatDistance(new Date(lastUpdated), new Date(), {
        locale: ja,
        addSuffix: true,
      })
    : undefined;

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
        transition={transition}
        _hover={{ cursor: "pointer" }}
        position="relative"
        role="group">
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

        {/* メインコンテンツ */}
        <VStack spacing={3} align="stretch" opacity={hasError ? 0.5 : 1}>
          <Text fontSize="lg" color="gray.600">
            {title}
          </Text>

          <ChakraBox
            animate="update"
            variants={variants}
            key={value}
            transition={transition}>
            <Text fontSize="3xl" fontWeight="bold">
              {value}
            </Text>
          </ChakraBox>

          <HStack spacing={2} align="center">
            <Tooltip
              label={`${Math.abs(change)}% ${change >= 0 ? "増加" : "減少"}`}
              placement="bottom">
              <HStack spacing={1}>
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
            </Tooltip>

            {formattedLastUpdated && (
              <Text fontSize="xs" color="gray.500" ml="auto">
                {formattedLastUpdated}
              </Text>
            )}
          </HStack>
        </VStack>
      </ChakraBox>
    </ScaleFade>
  );
};

export default React.memo(StatCard);
