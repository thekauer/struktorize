import * as SM from "../SideMenu.atoms";
import * as S from "./Files.atoms";
import { useSession, signIn } from "next-auth/react";

export const Files = () => {
  const { status } = useSession();
  return (
    <SM.Container>
      <SM.Title>Files</SM.Title>
      <S.Menu>
        <S.MenuItem src={"/new_file.png"} />
        <S.MenuItem src={"/new_folder.png"} />
        <S.MenuItem src={"/refresh.png"} />
        <S.MenuItem src={"/collapse_all.png"} />
      </S.Menu>
      {status === "unauthenticated" && (
        <>
          <SM.Span>Sign in to save your structograms:</SM.Span>
          <SM.Button onClick={() => signIn("google")}>Google</SM.Button>
          <SM.Button onClick={() => signIn("github")}>Github</SM.Button>
        </>
      )}
      {status === "authenticated" && <span>Your files will be here</span>}
    </SM.Container>
  );
};
