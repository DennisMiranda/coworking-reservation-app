import { auth } from "/src/services/firebase/firebase.server";

export const verifySessionCookie = async (cookie: string) => {
  return auth.verifySessionCookie(cookie);
};
