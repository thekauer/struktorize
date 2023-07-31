'use client';

import { Editor } from '@/components/Editor/Editor';
import { Layout } from '@/components/Layout/Layout';
import { useEffect } from 'react';
import { useAst } from '@/hooks/useAST';
import { File } from '@/lib/repository';

interface HomeProps {
  recent?: File;
}

export function Home({ recent }: HomeProps) {
  const { load } = useAst();
  useEffect(() => {
    if (!recent) return;

    load(recent.ast, recent.path);
  }, [recent]);

  return (
    <>
      <Layout>
        <Editor />
      </Layout>
    </>
  );
}
