import { InlineMath } from "react-katex";

interface LatexProps {
  children?: string;
}

export const Latex = ({ children }: LatexProps) => {
  return <InlineMath>{children}</InlineMath>;
};
