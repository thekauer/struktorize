const transformations = new Map<string, string>([
  ["is", "\\in{}"],
  ["pi", "\\pi{}"],
  ["epsilon", "\\varepsilon{}"],
  ["&", "\\&{}"],
  [" ", ";"],
  ["/ ", "/ "],
  ["for", "\\forall{}"],
  ["exists", "\\exists{}"],
  ["not", "\\neg{}"],
  ["and", "\\land{}"],
  ["or", "\\lor{}"],
  ["return", "\\bold{return}\\;"],
  ["skip", "\\text{SKIP}\\;"],
  ["inf", "\\infty{}"],
]);

const mathOperators = new Map<string, string>([
  ["&&", "\\land{}"],
  ["||", "\\lor{}"],
  ["<=", "\\le{}"],
  [">=", "\\ge{}"],
  ["!=", "\\neq{}"],
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
  text.endsWith("}") || text.endsWith("\\;");

const endsWithTextExpression = (text: string) => {
  const lastIsText =
    text.indexOf("\\text{") > text.indexOf("^{") &&
    text.indexOf("\\text{") > text.indexOf("_{");
  const { tag } = getLastTag(text);
  return lastIsText && doesEndWithExpression(text) && tag === "text";
};

const isType = (text: string) => {
  return ["N", "R", "B", "S"].includes(text);
};

const isTypeExpression = (text: string) => {
  return (
    text.endsWith(":") ||
    text.endsWith("\\in{}") ||
    text.endsWith("×") ||
    text.endsWith(":\\;") ||
    text.endsWith("\\in{}\\;") ||
    text.endsWith("×\\;")
  );
};

const doesEndWithMathOperator = (text: string, char: string) => {
  const lastTwo = text.at(-1) + char;
  return mathOperators.has(lastTwo);
};

const doesEndWithScript = (text: string) => {
  const scriptTag = text.lastIndexOf("_") > text.lastIndexOf("^") ? "_" : "^";

  return text.includes("htmlStyle")
    ? text.endsWith("}}")
    : !text.substring(text.lastIndexOf(scriptTag) + 2).includes("{");
};

export const addText =
  (char: string, insertMode = "normal") =>
  (text: string = "") => {
    const style =
      "\\htmlStyle{background-color: #252526; padding: 2px; border-radius: 3px;}";
    const exceptions = ["_", "^"];

    if (exceptions.includes(char)) {
      return text;
    }

    if (text.endsWith("\\&{}") && char === "&") {
      return text.substring(0, text.length - 4) + "\\land{}";
    }

    if (insertMode === "normal" && text.includes("htmlStyle")) {
      const head = text.replace(style + "{", "");
      return head.substring(0, head.length - 1);
    }

    if (insertMode === "subscript" || insertMode === "superscript") {
      if (text.endsWith("\\;}}")) {
        const head = text.substring(0, text.length - 4);
        return head + char + "}}";
      }
      if (text.endsWith("}}")) {
        const head = text.substring(0, text.length - 2);
        return head + char + "}}";
      }
      const lead = insertMode === "subscript" ? "_" : "^";
      return text + `${lead}{${style}{\\;}}`;
    }

    if (doesEndWithMathOperator(text, char)) {
      const head = text.substring(0, text.length - 1);
      const lastTwo = text.at(-1) + char;
      const operator = mathOperators.get(lastTwo);
      return head + operator;
    }

    if (!text.endsWith("\\;") && char === " ") {
      return text + "\\;";
    }

    if (isTypeExpression(text) && isType(char)) {
      return text + `\\mathbb{${char}}`;
    }

    if (endsWithTextExpression(text)) {
      const { content } = getLastTag(text);
      const head = text.substring(0, text.lastIndexOf("\\"));

      return head + parse(content + char);
    }

    return text + parse(char);
  };

export const deleteLast = (input: string = ""): string => {
  const { tag, content } = getLastTag(input);

  if (doesEndWithScript(input)) {
    const scriptTag =
      input.lastIndexOf("_") > input.lastIndexOf("^") ? "_" : "^";
    return input.substring(0, input.lastIndexOf(scriptTag));
  }

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
