import { deleteLast, parse } from "./textTransform";

describe("textTransform", () => {
  it.each([
    ["in", "\\in"],
    [" ", ""],
    ["pi", "\\pi"],
    ["n:=1", "\\text{n}:=1"],
  ])("parse %s", (given, expected) => {
    expect(parse(given)).toBe(expected);
  });
});
