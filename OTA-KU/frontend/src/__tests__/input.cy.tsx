import { Input } from "@/components/ui/input";
// @ts-expect-error // Ignore TS error for importing Cypress
import React from "react";

describe("<Input />", () => {
  it("renders", () => {
    cy.mount(<Input />);
    cy.get('[data-slot="input"]').should("exist"); // Ensure the input exists
  });

  it("renders with default props", () => {
    cy.mount(<Input />);
    cy.get('[data-slot="input"]')
      .should("have.class", "h-9") // Default height
      .should("have.class", "px-3") // Default padding
      .should("have.class", "py-1"); // Default padding
  });

  it("renders with custom type", () => {
    cy.mount(<Input type="password" />);
    cy.get('[data-slot="input"]').should("have.attr", "type", "password"); // Ensure type is "password"
  });

  it("renders with placeholder", () => {
    const placeholder = "Enter your name";
    cy.mount(<Input placeholder={placeholder} />);
    cy.get('[data-slot="input"]').should(
      "have.attr",
      "placeholder",
      placeholder,
    ); // Ensure placeholder is set
  });

  it("renders with custom className", () => {
    const customClassName = "custom-input";
    cy.mount(<Input className={customClassName} />);
    cy.get('[data-slot="input"]').should("have.class", customClassName); // Ensure custom class is applied
  });

  it("disables input when disabled prop is true", () => {
    cy.mount(<Input disabled />);
    cy.get('[data-slot="input"]').should("have.attr", "disabled"); // Ensure input is disabled
    cy.get('[data-slot="input"]').should("have.attr", "disabled"); // Ensure input is disabled
    cy.get('[data-slot="input"]').should(
      "have.class",
      "disabled:cursor-not-allowed",
    ); // Ensure disabled styles are applied
  });

  it("focuses and applies focus styles", () => {
    cy.mount(<Input />);
    cy.get('[data-slot="input"]')
      .focus() // Focus the input
      .should("have.class", "focus-visible:border-ring") // Ensure focus border style
      .should("have.class", "focus-visible:ring-ring/50") // Ensure focus ring style
      .should("have.class", "focus-visible:ring-[3px]"); // Ensure focus ring style
  });

  it("renders file input type", () => {
    cy.mount(<Input type="file" />);
    cy.get('[data-slot="input"]')
      .should("have.attr", "type", "file") // Ensure type is "file"
      .should("have.class", "file:inline-flex"); // Ensure file input styles are applied
  });
});
