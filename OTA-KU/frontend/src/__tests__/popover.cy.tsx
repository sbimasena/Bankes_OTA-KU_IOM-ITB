import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
// @ts-expect-error // Ignore TS error for importing Cypress
import React from "react";

describe("<Popover />", () => {
  it("renders", () => {
    cy.mount(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>,
    );
    cy.get('[data-slot="popover-trigger"]').should("exist");
  });

  it("opens and closes the popover", () => {
    cy.mount(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>,
    );
    cy.get('[data-slot="popover-trigger"]').click();
    cy.get('[data-slot="popover-content"]').should("exist");
    cy.get("body").click(0, 0, { force: true });
    cy.get('[data-slot="popover-content"]').should("not.exist");
  });

  it("renders popover content", () => {
    cy.mount(
      <Popover>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>,
    );
    cy.get('[data-slot="popover-trigger"]').click();
    cy.get('[data-slot="popover-content"]').should(
      "contain.text",
      "Popover Content",
    );
  });

  it("renders a popover anchor", () => {
    cy.mount(
      <Popover>
        <PopoverAnchor>Popover Anchor</PopoverAnchor>
        <PopoverTrigger>Open Popover</PopoverTrigger>
        <PopoverContent>Popover Content</PopoverContent>
      </Popover>,
    );
    cy.get('[data-slot="popover-anchor"]').should("exist");
  });
});
