import { InlineMath } from "react-katex";
import { parse } from "../../lib/textTransform";

interface LatexProps {
  children?: string;
}

export const Latex = ({ children }: LatexProps) => {
  return <InlineMath>{parse(children)}</InlineMath>;
};
