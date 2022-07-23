import { Editor } from "./components/Editor/Editor";
import { AstProvider } from "./hooks/useAST";
import "./style/theme.css";
import 'katex/dist/katex.min.css';

function App() {
  return (
    <AstProvider>
      <div className="dark app">
        <Editor />
      </div>
    </AstProvider>
  );
}

export default App;
