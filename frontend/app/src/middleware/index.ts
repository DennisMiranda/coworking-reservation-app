import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
  const token = context.cookies.get("__session");

  if (["/login", "/register"].includes(context.url.pathname)) {
    if (token) return context.redirect("/");
    return next();
  }

  return next();
});
