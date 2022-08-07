import Head from "next/head";
import { Editor } from "@/components/Editor/Editor";
import { AstProvider } from "../hooks/useAST";

export default function Home() {
  return (
    <>
      <Head>
        <title>Structorizer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <AstProvider>
        <div className="dark app">
          <Editor />
        </div>
      </AstProvider>
    </>
  );
}
