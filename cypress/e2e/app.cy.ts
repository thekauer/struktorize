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
      cy.get("body").findByRole("heading", { name: /Cheat Sheet/ });
    });

    it("enter should become blue in Cheat Sheet menu when pressed", () => {
      root.type("{enter}");
      cy.contains("Enter").should(
        "have.css",
        "background-color",
        "rgb(0, 122, 204)"
      );
    });

    it("&& should become blue in Cheat Sheet menu when pressed", () => {
      root.type("&&");
      cy.contains("mark", "&&").should(
        "have.css",
        "background-color",
        "rgb(0, 122, 204)"
      );
    });

    it("<= should become blue in Cheat Sheet menu when pressed", () => {
      root.type("<=");
      cy.contains("mark", "<=").should(
        "have.css",
        "background-color",
        "rgb(0, 122, 204)"
      );
    });
  });

  describe("Code Completion", () => {
    it("should be visible when ctrl+space is pressed", () => {
      root.type("{enter}");
      root.type("{ctrl} ");
      cy.contains("if").should("be.visible");
    });

    it("should complete misstyped args to correct args", () => {
      root.type("{enter}");
      root.type("ag");
      cy.contains("span", "args").should("be.visible");
      root.tab();
      root.find(".hovered .katex-html").first().should("have.text", "args");
    });

    it.only("should create branch when completing if", () => {
      root.type("{enter}");
      root.type("if");
      cy.contains("span", "if").should("be.visible");
      root.tab();
      const condition = root
        .find("div[class*=Branch-atoms__Condition]")
        .should("be.visible");

      root.type("{downArrow}");
      const trueBranch = condition.next().children().eq(0).children().first();
      trueBranch.should("have.class", "hovered");
      root.type("a");
      trueBranch
        .children()
        .find(".katex-html")
        .first()
        .should("have.text", "a");
    });
  });
});

export const __test = 3;
