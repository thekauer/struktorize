import * as SM from "../SideMenu.atoms";
import * as S from "./Profile.atoms";
import { useSession, signOut } from "next-auth/react";

export const Profile = () => {
  const { data: session } = useSession();

  return (
    <SM.Container>
      <SM.Title>Profile</SM.Title>
      <S.Container>
        <S.Profile src={session!.user?.image!} />
        <SM.Span>{session!.user?.name}</SM.Span>
        <SM.Button onClick={() => signOut()}>Sign out</SM.Button>
      </S.Container>
    </SM.Container>
  );
};
