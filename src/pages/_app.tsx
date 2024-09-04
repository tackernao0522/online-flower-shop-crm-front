import { AppProps } from "next/app";
import { ChakraProvider } from "@chakra-ui/react";
import { wrapper } from "../lib/redux";
import theme from "../styles/theme";
import { Provider } from "react-redux";

function MyApp({ Component, pageProps }: AppProps) {
  const { store, props } = wrapper.useWrappedStore(pageProps);

  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        <Component {...props.pageProps} />
      </ChakraProvider>
    </Provider>
  );
}

export default Myapp;
