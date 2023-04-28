import {
  AbstractChar,
  AbstractText,
  Ast,
  AstNode,
  InsertInsideAvailable,
  Operator,
  Subscript,
  SuperScript,
  Symbol,
  traverse,
  Variable,
} from "./ast";

const getLast = <T extends AbstractChar>(text: AbstractText) => {
  return text.at(-1) as T | undefined;
};

const doesEndWithScript = (text: AbstractText) => {
  const last = getLast(text);
  if (!last) return false;

  return last.type === "subscript" || last.type === "superscript";
};

const doesEndWithVariable = (text: AbstractText) => {
  return getLast(text)?.type === "variable";
};

export type InsertMode = "normal" | "inside";

const isInsertInsideAvaiable = (char: AbstractChar) => {
  switch (char.type) {
    case "subscript":
    case "superscript":
      return true;
  }
  return false;
};

const OPERATOR_MAP: Record<string, Operator> = {
  "&": { type: "and" },
  "|": { type: "or" },
  "=": { type: "eq" },
  "<": { type: "lt" },
  ">": { type: "gt" },
  ":": { type: "colon" },
  ",": { type: "comma" },
  ";": { type: "semicolon" },
  "(": { type: "lp" },
  ")": { type: "rp" },
  "[": { type: "lb" },
  "]": { type: "rb" },
  "{": { type: "lc" },
  "}": { type: "rc" },
  "*": { type: "star" },
  "!": { type: "bang" },
  " ": { type: "space" },
};

const DOUBLE_OPERATOR_MAP: Record<string, Symbol | Operator> = {
  "&&": { type: "land" },
  "||": { type: "lor" },
  "!=": { type: "neq" },
  "<=": { type: "le" },
  ">=": { type: "ge" },
  ":=": { type: "coloneq" },
  "  ": { type: "space" },
};

const operatorToChar = (op: AbstractChar) => {
  return (
    Object.entries(OPERATOR_MAP).find(
      ([_, value]) => value.type === op.type
    )?.[0] || "undefined"
  );
};

const transformDoubleOperator = (first: AbstractChar, second: AbstractChar) => {
  const hash = operatorToChar(first) + operatorToChar(second);

  return hash in DOUBLE_OPERATOR_MAP
    ? [DOUBLE_OPERATOR_MAP[hash]]
    : [first, second];
};

const isOperator = (char: string) => {
  return char.length === 1 && char[0] in OPERATOR_MAP;
};

const isOperatorType = (char: AbstractChar) => {
  return Object.values(OPERATOR_MAP).some((op) => op.type === char.type);
};

const isBannedFirstChar = (char: AbstractChar) => {
  return ["space", "superscript", "subscript"].includes(char.type);
};

const isSpaceScript = (first: AbstractChar, second: AbstractChar) => {
  if (first.type !== "space") return false;
  return second.type === "superscript" || second.type === "subscript";
};

const isSameScriptTwice = (first: AbstractChar, second: AbstractChar) => {
  const script = ["superscript", "subscript"];
  return script.includes(first.type) && first.type === second.type;
};

export const addText =
  (newText: string, insertMode: InsertMode = "normal") =>
  (currentText: AbstractText): AbstractText => {
    const last = getLast(currentText);

    if (isOperator(newText)) {
      return addAbstractChar(OPERATOR_MAP[newText], insertMode)(currentText);
    }

    if (!last) return [{ type: "variable", name: newText }];
    if (insertMode === "inside" && isInsertInsideAvaiable(last)) {
      const lastInsertable = last as InsertInsideAvailable;
      return currentText.slice(0, -1).concat({
        ...lastInsertable,
        text: addText(newText, "normal")(lastInsertable.text),
      });
    }

    if (last.type === "variable") {
      return currentText.slice(0, -1).concat({
        ...last,
        name: last.name + newText,
      });
    }

    return currentText.concat({ type: "variable", name: newText });
  };

export const addAbstractChar =
  (char: AbstractChar, insertMode: InsertMode) =>
  (currentText: AbstractText): AbstractText => {
    const last = getLast(currentText);
    if (!last) return isBannedFirstChar(char) ? [] : [char];

    if (isSameScriptTwice(last, char)) return currentText;
    if (isSpaceScript(last, char)) return currentText;
    const isDoubleOperator = isOperatorType(char) && isOperatorType(last);
    if (isDoubleOperator) {
      return currentText
        .slice(0, -1)
        .concat(transformDoubleOperator(last, char));
    }

    if (insertMode === "inside" && isInsertInsideAvaiable(last)) {
      const lastInsertable = last as InsertInsideAvailable;

      return currentText.slice(0, -1).concat({
        ...lastInsertable,
        text: addAbstractChar(char, "normal")(lastInsertable.text),
      });
    }

    return currentText.concat(char);
  };

export const deleteLast = (text: AbstractText): AbstractText => {
  if (doesEndWithScript(text)) {
    return text.slice(0, -1);
  }

  if (doesEndWithVariable(text)) {
    const lastText = getLast<Variable>(text)!.name;
    if (lastText.length > 1) {
      const newLastVariable: Variable = {
        type: "variable",
        name: lastText.substring(0, lastText.length - 1),
      };
      return text.slice(0, -1).concat([newLastVariable]);
    }

    return text.slice(0, -1);
  }

  return text.slice(0, -1);
};

export const deleteLastVariable = (text: AbstractText): AbstractText => {
  if (doesEndWithVariable(text)) {
    return text.slice(0, -1);
  }
  if (doesEndWithScript(text)) {
    const last = getLast<Subscript | SuperScript>(text)!;
    const newText = last.text.slice(0, -1);
    const newLast = { type: last.type, text: newText };
    return text.slice(0, -1).concat(newLast);
  }
  return text;
};

const getAllVariablesInNode = (node: AstNode) => {
  return node.text.reduce((acc, curr) => {
    switch (curr.type) {
      case "subscript":
      case "superscript":
        return acc.concat(
          curr.text.filter((char) => char.type === "variable") as Variable[]
        );
      case "variable":
        acc.push(curr);
        return acc;
      default:
        return acc;
    }
  }, [] as Variable[]);
};

const getAllVariableNames = (body: Ast) => {
  const variables = traverse(body, (node) => getAllVariablesInNode(node));
  return Array.from(new Set(variables.map((variable) => variable.name)));
};

export const getLastText = (current: AstNode) => {
  return getAllVariablesInNode(current).at(-1)?.name;
};

export const getAllVariablesExceptCurrent = (body: Ast, current: AstNode) => {
  return getAllVariableNames(body).filter(
    (variable) => variable !== getLastText(current)
  );
};

export const getFunctionName = (text: AbstractText): string => {
  return text[0]?.type === "variable" ? text[0]?.name : "";
};

export const doesEndWithSpace = (text: AbstractText) => {
  return text.at(-1)?.type === "space";
};
