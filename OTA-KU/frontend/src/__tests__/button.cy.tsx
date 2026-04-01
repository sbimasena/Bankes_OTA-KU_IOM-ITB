import { Button } from "@/components/ui/button";

describe("<Button />", () => {
  it("renders", () => {
    cy.mount(<Button />);
    cy.get('[data-slot="button"]').should("exist");
  });

  it("renders with default variant and size", () => {
    cy.mount(<Button />);
    cy.get('[data-slot="button"]')
      .should("have.class", "bg-primary")
      .should("have.class", "text-primary-foreground")
      .should("have.class", "h-9")
      .should("have.class", "px-4")
      .should("have.class", "py-2");
  });

  it("renders as child element when asChild is true", () => {
    cy.mount(
      <Button asChild>
        <a href="#">Link</a>
      </Button>,
    );
    cy.get("button").should("not.exist");
    cy.get("a[data-slot='button']").should("exist");
  });
});
