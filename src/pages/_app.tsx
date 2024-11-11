import type { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import theme from "../styles/theme";
import { Providers } from "../lib/providers";

type CustomAppProps = Omit<AppProps, "router"> & {
  router?: AppProps["router"];
};

function MyApp({ Component, pageProps }: CustomAppProps): JSX.Element {
  return (
    <Providers>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Providers>
  );
}

export default MyApp;
