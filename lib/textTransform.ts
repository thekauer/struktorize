const transformations = new Map<string, string>([
  ["in", "\\in"],
  ["pi", "\\pi"],
  ["(", "\\left("],
  [")", "\\right)"],
  ["/ ", "/ "],
  ["/R", "\\mathbb{R}"],
  ["/N", "\\mathbb{N}"],
  ["/B", "\\mathbb{B}"],
  ["/S", "\\mathbb{S}"],
  ["return", "\\bold{return}\\;"],
]);

const split = (input: string): string[] =>
  input
    .split(/\s+/)
    .flatMap((x) => x.split(/(\(|\))/g))
    .filter((y) => y !== "");

export const parse = (input: string = ""): string => {
  const splits = split(input);

  const transformed = splits
    .map((s) => {
      if (transformations.has(s)) {
        return transformations.get(s);
      }

      const variableRegex = /[a-zA-Z_$][a-zA-Z_$0-9]*/g;
      return s.replace(variableRegex, (match) => {
        return `\\text{${match}}`;
      });
    })
    .join("");

  return transformed;
};

export const addText =
  (char: string) =>
  (text: string = "") => {
    if (text.at(-1)! === " " && char === " ") {
      return text;
    }
    return text + char;
  };

export const deleteLast = (input: string = ""): string => {
  const splits = split(parse(input));
  if (splits.at(-1)?.includes("\\")) {
    return splits.slice(0, -1).join(" ") + "\\;";
  }

  return input.slice(0, -1) + "\\;";
};
