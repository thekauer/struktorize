'use client';

import { Editor, MultiEditor } from '@/components/Editor/Editor';
import { useAst } from '@/hooks/useAST';
import { useEffect } from 'react';
import * as S from '@/components/Layout/Layout.atoms';
import { useTheme } from '@/hooks/useTheme';
import { File, getSharedFile } from '@/lib/repository';

type SharedNodetype = Awaited<ReturnType<typeof getSharedFile>>;

interface PageProps {
  sharedNode?: SharedNodetype;
}

export default function Page({ sharedNode }: PageProps) {
  const { theme } = useTheme();

  const file = sharedNode?.file;
  console.log(sharedNode);

  const { load } = useAst();
  useEffect(() => {
    if (!file) return;
    load(file.ast, file.path);
  }, [file]);

  return (
    <>
      <S.Container className={theme}>
        <S.MainContainer>
          <S.Main>
            {sharedNode ? (
              file ? (
                <Editor readonly />
              ) : (
                <MultiEditor files={sharedNode.children} />
              )
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
