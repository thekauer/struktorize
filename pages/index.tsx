import Head from "next/head";
import { Editor } from "@/components/Editor/Editor";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Layout } from "@/components/Layout/Layout";

export async function getStaticProps({ locale }: { locale: string }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "footer"])),
    },
  };
}

export default function Home() {
  return (
    <>
      <Head>
        <title>Structorizer</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Layout>
        <Editor />
      </Layout>
    </>
  );
}
