import { screen, render, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home } from '../app/index';
import { AstProvider } from '@/hooks/useAST';
import { DEFAULT_FUNCTION } from '@/constants/defaultFunction';

jest.mock('@/components/Layout/Layout.tsx', () => ({
  Layout: ({ children }: any) => children,
}));

jest.mock('@/hooks/useTheme.tsx', () => ({
  useTheme: () => ({ showScope: true }),
}));

jest.mock('@/components/SideMenu/Files/Explorer/useTempFiles.tsx', () => ({
  useSaveTempFile: () => null,
}));

describe('editor', () => {
  describe('completion', () => {
    it('should complete once', async () => {
      const user = userEvent.setup();

      render(
        <AstProvider>
          <Home
            recent={{ ast: DEFAULT_FUNCTION, type: 'file', path: '/main' }}
          />
        </AstProvider>,
      );
      const root = await screen.findByTestId('root-container');
      fireEvent.focus(root);
      await user.type(root, '{enter}');
      const katexInstances = await screen.findAllByTestId('react-katex');
      expect(katexInstances.length).toBe(2);

      fireEvent.keyDown(root, { key: 'a' });

      const cc = await screen.findByTestId('CodeCompletion');
      expect(cc).toBeInTheDocument();

      fireEvent.keyDown(root, { key: 'Tab' });
      const text = await screen.findByText(
        '\\text{a}\\text{r}\\text{g}\\text{s}',
      );
      expect(text).not.toBeNull();
    });

    it('should complete three times in edit mode', async () => {
      const user = userEvent.setup();

      render(
        <AstProvider>
          <Home
            recent={{ ast: DEFAULT_FUNCTION, type: 'file', path: '/main' }}
          />
        </AstProvider>,
      );
      const root = await screen.findByTestId('root-container');
      fireEvent.focus(root);
      await user.type(root, '{enter}');
      const katexInstances = await screen.findAllByTestId('react-katex');
      expect(katexInstances.length).toBe(2);

      await user.type(root, '{Control>}e{/Control}a_a');
      // await user.type(root, '{Control>}e{/Control}');
      // await user.type(root, 'a');
      // await user.type(root, '_');

      const cc = await screen.findByTestId('CodeCompletion');
      expect(cc).toBeInTheDocument();

      await user.type(root, '{Tab}');

      await user.type(root, ' a');
      const cc2 = await screen.findByTestId('CodeCompletion');
      expect(cc2).toBeInTheDocument();
      await user.type(root, '{Tab}');

      await user.type(root, ' a');
      const cc3 = await screen.findByTestId('CodeCompletion');
      expect(cc3).toBeInTheDocument();
      await user.type(root, '{Tab}');

      const error = await screen.findByText('ParseError: KaTeX parse error');
      expect(error).not.toBeInTheDocument();
    });
  });
});
