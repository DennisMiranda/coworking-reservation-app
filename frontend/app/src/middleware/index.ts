import { defineMiddleware } from "astro:middleware";
import { verifySessionCookie } from "../services/auth/auth.server";

export const onRequest = defineMiddleware(async (context, next) => {
  const token = context.cookies.get("__session");

  if (["/login", "/register"].includes(context.url.pathname)) {
    if (token) return context.redirect("/");
    return next();
  }

  const decodedToken = await verifySessionCookie(token?.value || "");

  if (decodedToken) {
    context.locals.user = {
      name: decodedToken.name,
      email: decodedToken.email || "",
      picture: decodedToken.picture || "",
    };
  }

  return next();
});
