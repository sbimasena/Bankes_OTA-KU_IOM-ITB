import { Label } from "@/components/ui/label";
// @ts-expect-error // Ignore TS error for importing Cypress
import React from "react";

describe("<Label />", () => {
  it("renders", () => {
    cy.mount(<Label>Test Label</Label>);
    cy.get("[data-slot='label']").should("exist"); // Ensure the label exists
  });

  it("renders with default styles", () => {
    cy.mount(<Label>Test Label</Label>);
    cy.get("[data-slot='label']")
      .should("have.class", "flex")
      .should("have.class", "items-center")
      .should("have.class", "gap-2")
      .should("have.class", "text-sm")
      .should("have.class", "leading-none")
      .should("have.class", "font-medium")
      .should("have.class", "select-none");
  });

  it("renders with custom className", () => {
    const customClass = "custom-label";
    cy.mount(<Label className={customClass}>Test Label</Label>);
    cy.get("[data-slot='label']").should("have.class", customClass); // Ensure custom class is applied
  });

  it("disables label when inside a disabled group", () => {
    cy.mount(
      <div data-disabled="true">
        <Label>Disabled Label</Label>
      </div>,
    );
    cy.get("[data-slot='label']")
      .should("have.class", "group-data-[disabled=true]:pointer-events-none")
      .should("have.class", "group-data-[disabled=true]:opacity-50");
  });

  it("disables label when associated with a disabled peer", () => {
    cy.mount(
      <div>
        <input type="text" disabled className="peer" />
        <Label htmlFor="input">Disabled Label</Label>
      </div>,
    );
    cy.get("[data-slot='label']")
      .should("have.class", "peer-disabled:cursor-not-allowed")
      .should("have.class", "peer-disabled:opacity-50");
  });
});
