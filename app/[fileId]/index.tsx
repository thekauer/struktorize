'use client';

import { Editor } from '@/components/Editor/Editor';
import { useAst } from '@/hooks/useAST';
import { useEffect } from 'react';
import * as S from '@/components/Layout/Layout.atoms';
import { useTheme } from '@/hooks/useTheme';
import { File } from '@/lib/repository';

interface PageProps {
  file?: File | null;
}

export default function Page({ file }: PageProps) {
  const { theme } = useTheme();

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
