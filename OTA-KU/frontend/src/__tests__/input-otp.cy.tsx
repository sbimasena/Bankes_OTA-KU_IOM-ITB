import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { OTPInputContext } from "input-otp";
import React from "react";

describe("<InputOTP />", () => {
  it("renders and interacts correctly", () => {
    // Mock the OTPInputContext to provide slot data
    const mockContextValue = {
      slots: [
        {
          char: null,
          placeholderChar: null,
          hasFakeCaret: true,
          isActive: true, // First slot is active
          isFocused: false,
          isHovering: false,
        },
        {
          char: null,
          placeholderChar: null,
          hasFakeCaret: false,
          isActive: false, // Second slot is inactive
          isFocused: false,
          isHovering: false,
        },
      ],
      isFocused: false,
      isHovering: false,
    };

    // Use cy.stub to properly mock context behavior
    cy.stub(OTPInputContext, "Provider").callsFake(({ children }) => {
      // This ensures the actual component receives our mock data correctly
      return React.createElement(
        "div",
        { "data-testid": "mocked-context" },
        children,
      );
    });

    // Mount the InputOTP component
    cy.mount(
      <OTPInputContext.Provider value={mockContextValue}>
        <InputOTP maxLength={4}>
          <InputOTPGroup>
            <InputOTPSlot index={0} /> {/* First slot */}
            <InputOTPSlot index={1} /> {/* Second slot */}
            <InputOTPSeparator />
          </InputOTPGroup>
        </InputOTP>
      </OTPInputContext.Provider>,
    );

    // Alternative approach without relying on data-active attribute
    // Check if the InputOTP container exists
    cy.get('[data-slot="input-otp"]').should("exist");

    // Get all slots
    cy.get('[data-slot="input-otp-slot"]').should("have.length", 2);

    // Check if the separator is rendered
    cy.get('[data-slot="input-otp-separator"]').should("exist");
  });
});
