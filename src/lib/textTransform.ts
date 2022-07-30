const transformations = new Map<string, string>([
  ["in", "\\in"],
  ["R", "\\mathbb{R} "],
  ["N", "\\mathbb{N} "],
  ["return", "\\bold{return}\\;"],
  [" ", "\\;"],
  ["pi", "\\pi"],
]);

export const parse = (input?: string): string => {
  if (!input) {
    return "";
  }

  const splits = input.split(/\s+/);
  const transformed = splits
    .map((s) => {
      if (transformations.has(s)) {
        return transformations.get(s);
      }

      return `\\text{${s}}`;
    })
    .join(" ");

  return transformed;
};

export const deleteLast = (input?: string): string | undefined => {
  if (!input) {
    return undefined;
  }

  for (const key of transformations.keys()) {
    if (input.endsWith(key)) {
      return input.slice(0, input.lastIndexOf(key));
    }
  }

  return input.slice(0, -1);
};
