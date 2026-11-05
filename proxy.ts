import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Sends / to /en or /zh from the visitor's language, and keeps the choice.
export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
