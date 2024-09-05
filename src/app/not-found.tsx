"use client";

import { Box, Heading, Text, Button } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  return (
    <Box textAlign="center" py={10} px={6}>
      <Heading
        display="inline-block"
        as="h2"
        size="2xl"
        bgGradient="linear(to-r, teal.400, teal.600)"
        backgroundClip="text">
        404
      </Heading>
      <Text fontSize="18px" mt={3} mb={2}>
        ページが見つかりません
      </Text>
      <Text color={"gray.500"} mb={6}>
        お探しのページは存在しないか、移動した可能性があります。
      </Text>

      <Button
        colorScheme="teal"
        bgGradient="linear(to-r, teal.400, teal.500, teal.600)"
        color="white"
        variant="solid"
        onClick={() => router.push("/")}>
        ホームに戻る
      </Button>
    </Box>
  );
}
