import { defineMiddleware } from "astro:middleware";
import { verifySessionCookie } from "../../services/auth/auth.server";

export const adminMiddleware = defineMiddleware(async (context, next) => {
  const { url, cookies, redirect } = context;

  // Solo aplicar middleware a rutas /admin
  if (!url.pathname.startsWith("/admin")) {
    return next();
  }

  // Verificar si el usuario está autenticado
  const token = cookies.get("__session");

  if (!token?.value) {
    return redirect("/login?redirect=" + encodeURIComponent(url.pathname));
  }

  try {
    const decodedToken = await verifySessionCookie(token.value);

    if (!decodedToken) {
      return redirect("/login?redirect=" + encodeURIComponent(url.pathname));
    }

    if (decodedToken.role !== "admin") {
      return redirect("/");
    }

    // TODO: Verificar rol de administrador en Firestore
    // Por ahora, cualquier usuario autenticado puede acceder al admin
    // En producción, deberías verificar si el usuario tiene rol 'admin'

    context.locals.user = {
      uid: decodedToken.uid,
      name: decodedToken.name || "Admin",
      email: decodedToken.email || "",
      picture: decodedToken.picture || "",
      role: "admin",
    };

    return next();
  } catch (error) {
    console.error("Error verifying admin access:", error);
    return redirect("/login?redirect=" + encodeURIComponent(url.pathname));
  }
});
