import { parse } from "./textTransform";

describe("textTransform", () => {
  it.each([
    ["in", "\\in"],
    [" ", ""],
    ["pi", "\\pi"],
    ["n:=1", "\\text{n}:=1"],
    ["/S /S", "\\mathbb{S}\\mathbb{S}"],
    [
      "main(a/1 in /R)",
      "\\text{main}\\left(\\text{a}/1\\in\\mathbb{R}\\right)",
    ],
  ])("parse %s", (given, expected) => {
    expect(parse(given)).toBe(expected);
  });
});
