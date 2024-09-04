import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading:
      '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
    body: '"Helvetica Neue", Arial, "Hiragino Kaku Gothic ProN", "Hiragino Sans", Meiryo, sans-serif',
  },
  colors: {
    brand: {
      50: "#f0f9ff",
      100: "#e0f2fe",
      500: "#0ea5e9",
      600: "#0284c7",
      700: "#0369a1",
    },
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: "bold",
      },
      variants: {
        solid: (props: { colorScheme: string }) => ({
          bg: `${props.colorScheme}.500`,
          color: "white",
          _hover: {
            bg: `${props.colorScheme}.600`,
          },
        }),
      },
    },
  },
});

export default theme;
