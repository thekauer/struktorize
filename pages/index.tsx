import Head from "next/head";
import { Editor } from "@/components/Editor/Editor";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { Layout } from "@/components/Layout/Layout";
import { getSession, useSession } from "next-auth/react";
import { GetServerSideProps, InferGetServerSidePropsType } from "next";
import { File, getUserData } from "@/lib/repository";
import { SSRConfig } from "next-i18next";
import { useEffect } from "react";
import { useAst } from "@/hooks/useAST";

export const getServerSideProps: GetServerSideProps<
  {
    recent?: File;
  } & SSRConfig
> = async ({ req, locale }) => {
  const translations = await serverSideTranslations(locale!, [
    "common",
    "footer",
  ]);
  const session = await getSession({ req });
  if (!session || !session.user) {
    return {
      props: {
        ...translations,
      },
    };
  }

  //@ts-ignore
  const userId: string = session.user.id;
  const userData = await getUserData(userId);
  if (!userData) {
    return {
      props: {
        ...translations,
      },
    };
  }

  const recent = userData.files[userData.recent];
  return {
    props: {
      recent,
      ...translations,
    },
  };
};

type HomeProps = InferGetServerSidePropsType<typeof getServerSideProps>;
export default function Home({ recent }: HomeProps) {
  const { load } = useAst();
  const { status } = useSession();

  useEffect(() => {
    if (!recent) return;

    load(recent.ast, recent.path);
  }, [recent]);

  if (status === "loading") return null;

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
