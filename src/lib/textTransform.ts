const transformations = new Map<string, string>([
  ["in", "\\in"],
  ["R", "\\mathbb{R}"],
  ["N", "\\mathbb{N}"],
  ["return", "\\bold{return}\\;"],
]);

export const parse = (input?: string): string | undefined => {
  if (!input) {
    return undefined;
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

  const splits = input.split(/\s+/);
  if (splits.at(-1)?.includes("\\")) {
    return splits.slice(0, -1).join(" ");
  }

  return input.slice(0, -1);
};
