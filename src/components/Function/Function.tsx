import { ReactNode, useEffect } from "react";

interface FunctionProps {
  signature: ReactNode;
  body: ReactNode[];
}

export const Function = ({ signature, body }: FunctionProps) => {
  const keydownHandler = (e: KeyboardEvent) => {
    console.log(e.key);
  };

  useEffect(() => {
    document.addEventListener("keydown", keydownHandler);
    return () => {
      document.removeEventListener("keydown", keydownHandler);
    };
  }, []);

  return (
    <>
      {signature}
      {body.map((node) => node)}
    </>
  );
};
