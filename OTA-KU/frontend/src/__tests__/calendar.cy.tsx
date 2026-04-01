import { Calendar } from "@/components/ui/calendar";
// @ts-expect-error // Ignore TS error for importing Cypress
import React from "react";

describe("<Calendar />", () => {
  it("renders and interacts correctly", () => {
    // Mount the Calendar component
    cy.mount(<Calendar />);

    // Check if the calendar container exists
    cy.get(".rdp").should("exist");

    // Check if the current month and year are displayed
    const currentMonth = new Date().toLocaleString("default", {
      month: "long",
    });
    const currentYear = new Date().getFullYear();
    cy.get("[id^=react-day-picker-]").should(
      "contain.text",
      `${currentMonth} ${currentYear}`,
    );

    // Check if navigation buttons exist
    cy.get(".rdp-button").should("exist");
    cy.get(".rdp-button").should("exist");

    // Navigate to the next month with name='next-month'
    cy.get(".rdp-button[name='next-month']").click();
    cy.get("[id^=react-day-picker-]").should("not.contain.text", currentMonth);

    // Navigate back to the previous month
    cy.get(".rdp-button[name='previous-month']").click();
    cy.get("[id^=react-day-picker-]").should("contain.text", currentMonth);
  });
});
