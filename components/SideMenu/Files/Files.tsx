import * as SM from "../SideMenu.atoms";
import { useSession, signIn } from "next-auth/react";
import dynamic from "next/dynamic";

const Explorer = dynamic(
  () => import("./Explorer/Explorer").then((mod) => mod.Explorer as any),
  { ssr: false }
);

export const Files = () => {
  const { status } = useSession();

  return (
    <SM.Container>
      <SM.Title>Files</SM.Title>

      {status === "unauthenticated" && (
        <>
          <SM.Span>Sign in to save your structograms:</SM.Span>
          <SM.Button onClick={() => signIn("google")}>Google</SM.Button>
          <SM.Button onClick={() => signIn("github")}>Github</SM.Button>
        </>
      )}
      {status === "authenticated" && <Explorer />}
    </SM.Container>
  );
};
