//Api to connect github actios
import type { APIRoute } from "astro";

export const GET: APIRoute = async ({ request }) => {
  console.log("Reminder API called");
  return new Response("Reminder API called", { status: 200 });
};
