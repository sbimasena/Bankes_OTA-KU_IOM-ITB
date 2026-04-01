import { Textarea } from "@/components/ui/textarea";
// @ts-expect-error // Ignore TS error for importing Cypress
import React from "react";

describe("<Textarea />", () => {
  it("renders", () => {
    cy.mount(<Textarea placeholder="Type here..." />);
    cy.get('[data-slot="textarea"]').should("exist");
  });

  it("allows typing", () => {
    cy.mount(<Textarea placeholder="Type here..." />);
    cy.get('[data-slot="textarea"]')
      .type("Hello, world!")
      .should("have.value", "Hello, world!");
  });

  it("disables input when disabled", () => {
    cy.mount(<Textarea placeholder="Disabled" disabled />);
    cy.get('[data-slot="textarea"]').should("be.disabled");
  });

  it("shows placeholder text", () => {
    cy.mount(<Textarea placeholder="Enter text..." />);
    cy.get('[data-slot="textarea"]').should(
      "have.attr",
      "placeholder",
      "Enter text...",
    );
  });

  it("handles invalid state", () => {
    cy.mount(<Textarea aria-invalid="true" />);
    cy.get('[data-slot="textarea"]').should(
      "have.attr",
      "aria-invalid",
      "true",
    );
  });

  it("applies custom class names", () => {
    cy.mount(<Textarea className="custom-class" />);
    cy.get('[data-slot="textarea"]').should("have.class", "custom-class");
  });
});
