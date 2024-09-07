import React from "react";
import { render, screen } from "@testing-library/react";
import Button from "../Button";

describe("Button", () => {
  it("renders the button with the correct text", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });
});
