import { ChakraProvider } from "@chakra-ui/react";
import { Metadata } from "next";
import { Providers } from "../lib/providers";
import AuthCheck from "../components/AuthCheck";
import RootLayoutClient from "./RootLayoutClient";

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
          <ChakraProvider>
            <RootLayoutClient>
              <AuthCheck />
              {children}
            </RootLayoutClient>
          </ChakraProvider>
        </Providers>
      </body>
    </html>
  );
}
