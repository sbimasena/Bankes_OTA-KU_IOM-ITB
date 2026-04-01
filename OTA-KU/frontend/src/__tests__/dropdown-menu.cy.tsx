import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
// @ts-expect-error // Ignore TS error for importing Cypress
import React from "react";

describe("<DropdownMenu />", () => {
  it("renders", () => {
    cy.mount(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    cy.get('[data-slot="dropdown-menu-trigger"]').should("exist"); // Ensure trigger exists
  });

  it("opens and closes the dropdown menu", () => {
    cy.mount(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    cy.get('[data-slot="dropdown-menu-trigger"]').click(); // Open the menu
    cy.get('[data-slot="dropdown-menu-content"]').should("exist"); // Ensure content is visible
    cy.get("body").click(0, 0, { force: true }); // Click outside to close
    cy.get('[data-slot="dropdown-menu-content"]').should("not.exist"); // Ensure content is hidden
  });

  it("renders dropdown menu items", () => {
    cy.mount(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>Item 1</DropdownMenuItem>
          <DropdownMenuItem>Item 2</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    cy.get('[data-slot="dropdown-menu-trigger"]').click(); // Open the menu
    cy.get('[data-slot="dropdown-menu-item"]').should("have.length", 2); // Ensure items are rendered
  });

  it("renders a checkbox item", () => {
    cy.mount(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuCheckboxItem checked>
            Checkbox Item
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    cy.get('[data-slot="dropdown-menu-trigger"]').click(); // Open the menu
    cy.get('[data-slot="dropdown-menu-checkbox-item"]').should("exist"); // Ensure checkbox item exists
    cy.get('[data-slot="dropdown-menu-checkbox-item"] svg').should("exist"); // Ensure check icon is visible
  });

  it("renders a radio group and radio items", () => {
    cy.mount(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuRadioGroup>
            <DropdownMenuRadioItem value="option1">
              Option 1
            </DropdownMenuRadioItem>
            <DropdownMenuRadioItem value="option2">
              Option 2
            </DropdownMenuRadioItem>
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    cy.get('[data-slot="dropdown-menu-trigger"]').click(); // Open the menu
    cy.get('[data-slot="dropdown-menu-radio-group"]').should("exist"); // Ensure radio group exists
    cy.get('[data-slot="dropdown-menu-radio-item"]').should("have.length", 2); // Ensure radio items are rendered
  });

  it("renders a label and separator", () => {
    cy.mount(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Label</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Item 1</DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    cy.get('[data-slot="dropdown-menu-trigger"]').click(); // Open the menu
    cy.get('[data-slot="dropdown-menu-label"]').should("exist"); // Ensure label exists
    cy.get('[data-slot="dropdown-menu-separator"]').should("exist"); // Ensure separator exists
  });

  it("renders a shortcut", () => {
    cy.mount(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem>
            Item 1 <DropdownMenuShortcut>⌘+1</DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    cy.get('[data-slot="dropdown-menu-trigger"]').click(); // Open the menu
    cy.get('[data-slot="dropdown-menu-shortcut"]').should(
      "contain.text",
      "⌘+1",
    ); // Ensure shortcut exists
  });

  it("renders a submenu", () => {
    cy.mount(
      <DropdownMenu>
        <DropdownMenuTrigger>Open Menu</DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Submenu</DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              <DropdownMenuItem>Sub Item 1</DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
        </DropdownMenuContent>
      </DropdownMenu>,
    );
    cy.get('[data-slot="dropdown-menu-trigger"]').click(); // Open the menu
    cy.get('[data-slot="dropdown-menu-sub-trigger"]').click(); // Open the submenu
    cy.get('[data-slot="dropdown-menu-sub-content"]').should("exist"); // Ensure submenu content exists
  });
});
