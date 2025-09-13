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
        role: decodedToken.role || "user",
      };
    }
  } else {
    context.cookies.delete("__session");
    token = undefined;
  }

  // Protección de rutas de administración
  if (context.url.pathname.startsWith("/admin")) {
    if (!token?.value) {
      return context.redirect(
        "/login?redirect=" + encodeURIComponent(context.url.pathname)
      );
    }

    // TODO: Verificar rol de administrador aquí
    // Por ahora permitimos a cualquier usuario autenticado
    if (context.locals.user?.role !== "admin") {
      return context.redirect("/");
    }
  }

  if (["/login", "/register"].includes(context.url.pathname)) {
    if (token) return context.redirect("/");
    return next();
  }

  return next();
});
