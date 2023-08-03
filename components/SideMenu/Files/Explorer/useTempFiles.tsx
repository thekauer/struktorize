import { useAst, useAstState } from '@/hooks/useAST';
import { getFunctionName } from '@/lib/abstractText';
import { Ast, FunctionAst } from '@/lib/ast';
import { File } from '@/lib/repository';
import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useCreateFile } from './useCreateFile';
import { useFiles } from './useFiles';

export const useTempFiles = () => {
  const { status } = useSession();
  const { ast, changed } = useAstState();
  const { load } = useAst();
  const { files, isLoading } = useFiles();
  const createFile = useCreateFile();
  const ran = useRef(false);

  const TEMP_FILE_KEY = 'tempFile';

  useEffect(() => {
    if (ran.current) return;
    if (status === 'authenticated') {
      const getFile = () => {
        const tempAst = localStorage.getItem(TEMP_FILE_KEY);
        if (tempAst)
          try {
            const ast = JSON.parse(tempAst);
            const path = `/${getFunctionName(
              (ast as FunctionAst).signature.text,
            )}`;
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
      if (!ogFile) {
        if (files.length === 0 && !isLoading) {
          createFile.mutate({
            type: 'file',
            path: '/main',
          });
        }
        return;
      }

      const file = maybeRenameFile(ogFile);
      if (files.length === 0) load(file.ast, file.path);
      createFile.mutate(file);
      localStorage.removeItem(TEMP_FILE_KEY);
    }

    return () => {
      ran.current = true;
    };
  }, [status, ast, files, isLoading]);

  useEffect(() => {
    if (status === 'unauthenticated' && changed) {
      localStorage.setItem(TEMP_FILE_KEY, JSON.stringify(ast));
    }
  }, [status, ast, changed]);
};
