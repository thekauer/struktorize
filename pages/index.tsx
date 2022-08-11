import Head from "next/head";
import { Editor } from "@/components/Editor/Editor";

export default function Home() {
  return (
    <>
      <Head>
        <title>Structorizer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="dark app">
        <Editor />
      </div>
    </>
  );
}
