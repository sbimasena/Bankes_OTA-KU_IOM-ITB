import { Checkbox } from "@/components/ui/checkbox";
// @ts-expect-error // Ignore TS error for importing Cypress
import React from "react";

describe("<Checkbox />", () => {
  it("renders", () => {
    cy.mount(<Checkbox />);
    cy.get('[data-slot="checkbox"]').should("exist"); // Check if the checkbox exists
  });

  it("is unchecked by default", () => {
    cy.mount(<Checkbox />);
    cy.get('[data-slot="checkbox"]').should(
      "not.have.attr",
      "data-state",
      "checked",
    ); // Ensure it's unchecked
  });

  it("checks and unchecks when clicked", () => {
    cy.mount(<Checkbox />);
    cy.get('[data-slot="checkbox"]').click(); // Check the checkbox
    cy.get('[data-slot="checkbox"]').should(
      "have.attr",
      "data-state",
      "checked",
    ); // Ensure it's checked
    cy.get('[data-slot="checkbox-indicator"]').should("exist"); // Ensure the check icon is visible

    cy.get('[data-slot="checkbox"]').click(); // Uncheck the checkbox
    cy.get('[data-slot="checkbox"]').should(
      "not.have.attr",
      "data-state",
      "checked",
    ); // Ensure it's unchecked
    cy.get('[data-slot="checkbox-indicator"]').should("not.exist"); // Ensure the check icon is hidden
  });

  it("is disabled when disabled prop is true", () => {
    cy.mount(<Checkbox disabled />);
    cy.get('[data-slot="checkbox"]').should("have.attr", "disabled"); // Ensure it's disabled
    cy.get('[data-slot="checkbox"]').should(
      "have.class",
      "disabled:opacity-50",
    ); // Ensure disabled opacity class is applied
    cy.get('[data-slot="checkbox"]').should(
      "have.class",
      "disabled:cursor-not-allowed",
    ); // Ensure disabled cursor class is applied
  });

  it("does not check when disabled", () => {
    cy.mount(<Checkbox disabled />);
    cy.get('[data-slot="checkbox"]').click({ force: true }); // Try to check the checkbox
    cy.get('[data-slot="checkbox"]').should(
      "not.have.attr",
      "data-state",
      "checked",
    ); // Ensure it's still unchecked
  });

  it("applies custom className", () => {
    const customClassName = "custom-checkbox";
    cy.mount(<Checkbox className={customClassName} />);
    cy.get('[data-slot="checkbox"]').should("have.class", customClassName); // Ensure custom class is applied
  });
});
