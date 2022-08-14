const transformations = new Map<string, string>([
  ["in", "\\in"],
  ["pi", "\\pi"],
  [" ", ";"],
  ["/ ", "/ "],
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

const getLastTag = (text: string) => {
  const index = text.lastIndexOf("\\");
  const sub = text.substring(index);

  const tag = sub.substring(1, sub.indexOf("{"));
  const content = sub.substring(sub.indexOf("{") + 1, sub.indexOf("}"));
  return { tag, content };
};

const doesEndWithExpression = (text: string) =>
  text.endsWith("}") ||
  text.endsWith("\\in") ||
  text.endsWith("\\pi") ||
  text.endsWith("\\;");

export const addText =
  (char: string) =>
  (text: string = "") => {
    const isTypeExpression =
      text.endsWith(":") || text.endsWith("\\in") || text.endsWith("×");
    const isType = ["N", "R", "B", "S"].includes(char);

    if (isTypeExpression && isType) {
      return text + `\\mathbb{${char}}`;
    }

    const { tag, content } = getLastTag(text);
    if (doesEndWithExpression(text) && tag === "text") {
      const head = text.substring(0, text.lastIndexOf("\\"));
      return head + parse(content + char);
    }

    return text + parse(char);
  };

export const deleteLast = (input: string = ""): string => {
  const { tag, content } = getLastTag(input);

  if (input.endsWith("}") && tag === "text" && content.length > 1) {
    const head = input.substring(0, input.lastIndexOf("\\"));
    return head + `\\text{${content.substring(0, content.length - 1)}}`;
  }

  if (doesEndWithExpression(input)) {
    const head = input.substring(0, input.lastIndexOf("\\"));
    return head;
  }

  if (input.endsWith(":=")) {
    return input.substring(0, input.length - 2);
  }

  return input.substring(0, input.length - 1);
};
