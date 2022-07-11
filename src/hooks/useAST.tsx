import { createContext, ReactNode, useContext, useState } from "react";
import { useScope } from "./useScope";
import { DEFAULT_FUNCTION } from "../constants/defaultFunction";

const AstContext = createContext(null as any);

export const useAST = () => {
  const { selected, ast } = useContext(AstContext);

  const isSelected = (path: string | null) => {
    return selected.path === path;
  };

  return {
    ast,
    isSelected,
    ...selected,
  };
};

interface AstProviderProps {
  children: ReactNode;
}

export const AstProvider = ({ children }: AstProviderProps) => {
  const [ast, setAst] = useState(DEFAULT_FUNCTION);
  const selected = useScope(["signature"], ast);

  return (
    <AstContext.Provider value={{ selected, ast }}>
      {children}
    </AstContext.Provider>
  );
};
