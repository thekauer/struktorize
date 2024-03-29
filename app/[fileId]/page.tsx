import { getSharedFile } from '@/lib/repository';
import Head from 'next/head';
import FilePage from './index';

interface PageProps {
  params: {
    fileId: string;
  };
}

export const runtime = 'edge';

export default async function Page({ params: { fileId } }: PageProps) {
  const sharedNode = await getSharedFile(fileId);

  const name =
    sharedNode?.type === 'file'
      ? sharedNode?.file?.path.split('/').pop()
      : sharedNode?.path?.split('/').pop();

  return (
    <>
      <Head>
        <title>{name} - Structorize</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <FilePage sharedNode={sharedNode} />
    </>
  );
}
