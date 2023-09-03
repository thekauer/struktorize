'use client';

import { useMemo } from 'react';
import KaTeX, { TrustContext } from 'katex';

const trustHandler = ({ command }: TrustContext) => {
  return command === '\\htmlStyle' || command === '\\htmlId';
};

const createMathComponent = (Component: any, { displayMode }: any): any => {
  /**
   *
   * @param {MathComponentProps} props
   * @returns {ReactNode}
   */
  const MathComponent = ({ children, errorColor, math, renderError }: any) => {
    const formula = math ?? children;

    const { html, error } = useMemo(() => {
      try {
        const html = KaTeX.renderToString(formula, {
          displayMode,
          errorColor,
          trust: trustHandler,
          throwOnError: !!renderError,
        });

        return { html, error: undefined };
      } catch (error) {
        if (error instanceof KaTeX.ParseError || error instanceof TypeError) {
          return { error };
        }

        throw error;
      }
    }, [formula, errorColor, renderError]);

    if (error) {
      return renderError ? (
        renderError(error)
      ) : (
        <Component html={`${(error as any).message}`} />
      );
    }

    return <Component html={html} />;
  };

  return MathComponent;
};

const InternalInlineMath = ({ html }: any) => {
  return (
    <span
      data-testid="react-katex"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};

const InlineMath = createMathComponent(InternalInlineMath, {
  displayMode: false,
});

interface LatexProps {
  children?: string;
}

export const Latex = ({ children }: LatexProps) => {
  return (
    <InlineMath>
      {children === ' ' || children === '' ? '\\;' : children}
    </InlineMath>
  );
};
