import { defineMiddleware } from "astro:middleware";
import { verifySessionCookie } from "../services/auth/auth.server";

export const onRequest = defineMiddleware(async (context, next) => {
  let token = context.cookies.get("__session");
  context.locals.user = undefined;

  if (token?.value) {
    const decodedToken = await verifySessionCookie(token.value);

    if (decodedToken) {
      context.locals.user = {
        uid: decodedToken.uid,
        name: decodedToken.name,
        email: decodedToken.email || "",
        picture: decodedToken.picture || "",
      };
    }
  } else {
    context.cookies.delete("__session");
    token = undefined;
  }

  if (["/login", "/register"].includes(context.url.pathname)) {
    if (token) return context.redirect("/");
    return next();
  }

  return next();
});
