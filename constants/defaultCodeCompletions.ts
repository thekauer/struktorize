import { CodeCompletionItem } from "@/components/Editor/CodeCompletion/useCodeCompletion";

export const defaultCodeCompletions: CodeCompletionItem[] = [
  { value: "if", type: "keyword" },
  { value: "loop", type: "keyword" },
  { value: "pi", type: "symbol", symbol: { type: "pi" } },
  { value: "epsilon", type: "symbol", symbol: { type: "epsilon" } },
  { value: "in", type: "symbol", symbol: { type: "in" } },
  { value: "forall", type: "symbol", symbol: { type: "forall" } },
  { value: "exists", type: "symbol", symbol: { type: "exists" } },
  { value: "infinity", type: "symbol", symbol: { type: "infinity" } },

  { value: "S", type: "symbol", symbol: { type: "mathbb", value: "S" } },
  { value: "R", type: "symbol", symbol: { type: "mathbb", value: "R" } },
  { value: "N", type: "symbol", symbol: { type: "mathbb", value: "N" } },
  { value: "B", type: "symbol", symbol: { type: "mathbb", value: "B" } },
];
