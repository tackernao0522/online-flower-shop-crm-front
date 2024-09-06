import { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { wrapper } from "../lib/redux";
import theme from "../styles/theme";
import { Providers } from "../lib/providers";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </Providers>
  );
}

export default wrapper.withRedux(MyApp);
