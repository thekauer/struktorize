import Head from "next/head";
import { Editor } from "@/components/Editor/Editor";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "footer"])),
    },
  };
}

export default function Home(props) {
  return (
    <>
      <Head>
        <title>Structorizer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Editor />
    </>
  );
}
