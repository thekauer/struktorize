import { Editor } from "@/components/Editor/Editor";
import { useAst } from "@/hooks/useAST";
import { getSharedFile } from "lib/repository";
import { InferGetServerSidePropsType, NextPageContext } from "next";
import { useEffect } from "react";
import * as S from "@/components/Layout/Layout.atoms";
import { useTheme } from "@/hooks/useTheme";
import Head from "next/head";

export const getServerSideProps = async ({
  query,
}: {
  query: NextPageContext["query"];
}) => {
  const { fileId } = query;
  const file = await getSharedFile(fileId as string);

  return {
    props: {
      file,
    },
  };
};

export default function Page({
  file,
}: InferGetServerSidePropsType<typeof getServerSideProps>) {
  const { theme } = useTheme();

  const { load } = useAst();
  useEffect(() => {
    if (!file) return;
    load(file.ast, file.path);
  }, [file]);

  const name = file?.path.split("/").pop();

  return (
    <>
      <Head>
        <title>{name} - Structorize</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <S.Container theme={theme}>
        <S.MainContainer>
          <S.Main>
            {file ? (
              <Editor readonly />
            ) : (
              <S.Center>
                <h1>Structogram not found</h1>
              </S.Center>
            )}
          </S.Main>
        </S.MainContainer>
      </S.Container>
    </>
  );
}
