import Head from 'next/head';
import { getUserData } from '@/lib/repository';
import { Home } from './index';
import { auth } from '@/auth/auth';

export default async function Index() {
  const session = await auth();

  const userId = session?.user?.id;
  const userData = await getUserData(userId);

  const recent =
    userData?.files[userData.recent] || Object.values(userData?.files || {})[0];

  return (
    <>
      <Head>
        <title>Structorize</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Home recent={recent} />
    </>
  );
}
