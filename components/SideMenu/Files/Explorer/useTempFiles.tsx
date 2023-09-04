import { useAstState } from '@/hooks/useAST';
import { FunctionAst } from '@/lib/ast';
import { File } from '@/lib/repository';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useCreateFile } from './useCreateFile';
import { useFiles } from './useFiles';
import { parseSignatureText } from '@/lib/parser';
import { useSelectFile } from './useSelectFile';

const TEMP_FILE_KEY = 'tempFile';

export const useLoadTempFile = () => {
  const { status } = useSession();
  const { ast } = useAstState();
  const { files, isLoading } = useFiles();
  const createFile = useCreateFile();
  const selectFile = useSelectFile();
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    const getFile = () => {
      const tempAst = localStorage.getItem(TEMP_FILE_KEY);
      if (tempAst)
        try {
          const ast = JSON.parse(tempAst);
          const path = `/${
            parseSignatureText((ast as FunctionAst).signature.text)?.name ??
            'untitled'
          }`;
          const type = 'file';

          return { type, path, ast } as File;
        } catch (e) {}
    };

    const maybeRenameFile = (file: File) => {
      if (!files.some((f) => f.path === file.path)) return file;
      let i = 1;
      while (files.some((f) => f.path === `${file.path}${i}`) && i < 100) i++;

      return {
        ...file,
        path: `${file.path}${i}`,
      };
    };

    const ogFile = getFile();

    const saveFile = () => {
      if (status === 'authenticated' && !isLoading) {
        ran.current = true;
        const hasAccount = files.length > 0;
        const changed = !!ogFile;
        if (!changed) {
          if (hasAccount) return;
          createFile.mutate({
            type: 'file',
            path: '/main',
          });
          return;
        }

        const file = maybeRenameFile(ogFile);

        createFile.mutate(file);
        selectFile.mutate(file.path);
        localStorage.removeItem(TEMP_FILE_KEY);
      }
    };

    saveFile();
  }, [status, ast, files, isLoading]);
};

export const useSaveTempFile = () => {
  const { ast, changed } = useAstState();

  const { status } = useSession();
  useEffect(() => {
    if (status === 'unauthenticated' && changed) {
      localStorage.setItem(TEMP_FILE_KEY, JSON.stringify(ast));
    }
  }, [status, ast, changed]);
};
