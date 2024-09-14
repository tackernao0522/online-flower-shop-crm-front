import React from "react";
import { IconButton } from "@chakra-ui/react";
import { ArrowUpIcon } from "@chakra-ui/icons";

const ScrollToTopButton: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <IconButton
      icon={<ArrowUpIcon />}
      position="fixed"
      bottom="50px"
      right="50px"
      colorScheme="blue"
      onClick={scrollToTop}
      aria-label="トップに戻る"
    />
  );
};

export default ScrollToTopButton;
