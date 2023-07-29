import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react';

interface ThemeProps {
  theme: string;
  setTheme: Dispatch<SetStateAction<string>>;

  astTheme: string;
  setAstTheme: Dispatch<SetStateAction<string>>;

  showScope: boolean;
  setShowScope: Dispatch<SetStateAction<boolean>>;
}

export const ThemeContext = createContext<ThemeProps>(null as any);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState('dark');
  const [astTheme, setAstTheme] = useState('dark');
  const [showScope, setShowScope] = useState(true);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        astTheme,
        setAstTheme,
        showScope,
        setShowScope,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  return useContext(ThemeContext);
};
