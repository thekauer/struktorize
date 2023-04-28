describe("App", () => {
  let root: Cypress.Chainable<JQuery<HTMLElement>>;

  beforeEach(() => {
    cy.visit("/");
    root = cy.get("#root-container");
    cy.focused().click();
  });

  describe("general", () => {
    it("should navigate to the frontpage", () => {
      root.contains("main").should("exist");
      cy.focused().should("have.attr", "id", "root-container");
      root.focused().click();
      root.type("{enter}");
    });

    it("should display pi", () => {
      root.type("{enter}");
      root.type("pi");
      root.contains("π").should("exist");
    });

    it("should display epsilon", () => {
      root.type("{enter}");
      root.type("epsilon");
      root.contains("ε").should("exist");
    });

    it("should display infinity", () => {
      root.type("{enter}");
      root.type("inf");
      root.contains("∞").should("exist");
    });

    it("should display not equal", () => {
      root.type("{enter}");
      root.type("!=");
      root.contains("≠").should("exist");
    });
    it("should dispay :=", () => {
      root.type("{enter}");
      root.type(":=");
      root.contains(":=").should("exist");
    });
  });
  describe("Cheat Sheet", () => {
    beforeEach(() => {
      root.type("{ctrl}i");
    });

    it("should display Cheat sheet when pressing ctrl + i", () => {
      cy.get("body").findByText(/Cheat Sheet/);
    });

    it("enter should become blue in Cheat Sheet menu when pressed", () => {
      root.type("{enter}");
      cy.contains("Enter").should(
        "have.css",
        "background-color",
        "rgb(0, 122, 204)"
      );
    });

    it("if should become blue in Cheat Sheet menu when if is typed in", () => {
      root.type("if");
      cy.contains("if").should(
        "have.css",
        "background-color",
        "rgb(0, 122, 204)"
      );
    });

    it("loop should become blue in Cheat Sheet menu when loop is typed in", () => {
      root.type("loop");
      cy.contains("loop").should(
        "have.css",
        "background-color",
        "rgb(0, 122, 204)"
      );
    });
  });
});

export const __test = 3;
