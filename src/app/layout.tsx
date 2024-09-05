import { ChakraProvider } from "@chakra-ui/react";
import { Metadata } from "next";
import { Providers } from "../lib/providers";
import AuthCheck from "../components/AuthCheck";

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
        <Providers>
          <AuthCheck />
          <ChakraProvider>{children}</ChakraProvider>
        </Providers>
      </body>
    </html>
  );
}
