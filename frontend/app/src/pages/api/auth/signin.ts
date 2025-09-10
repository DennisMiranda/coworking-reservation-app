import type { APIRoute } from "astro";
import { auth } from "/src/services/firebase/firebase.server";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  /* Get token from request headers */
  const idToken = request.headers.get("Authorization")?.split("Bearer ")[1];
  if (!idToken) {
    return new Response(
      JSON.stringify({ success: false, message: "No token found" }),
      { status: 401 }
    );
  }

  /* Verify id token */
  try {
    const decodedToken = await auth.verifyIdToken(idToken);
    const user = await auth.getUser(decodedToken.uid);
  } catch (error) {
    return new Response("Invalid token", { status: 401 });
  }

  /* Create and set session cookie */
  const fiveDays = 60 * 60 * 24 * 5 * 1000;
  const sessionCookie = await auth.createSessionCookie(idToken, {
    expiresIn: fiveDays,
  });

  cookies.set("__session", sessionCookie, {
    path: "/",
  });

  return new Response(
    JSON.stringify({ success: true, message: "User signed in", data: {} }),
    { status: 200 }
  );
};
