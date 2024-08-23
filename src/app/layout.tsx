import { ChakraProvider } from "@chakra-ui/react";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "オンラインフラワーショップ",
  description: "美しい花束やアレンジメントをお届けします",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <ChakraProvider>{children}</ChakraProvider>
      </body>
    </html>
  );
}
