const {
  authenticateReservationUser,
  cookieName,
  createReservationSessionValue,
  maxAgeSeconds,
} = require("../../../../../server/shimizu-reservation-auth");

export async function POST(request) {
  const body = await request.json().catch(() => ({}));
  const username = String(body.username || "").trim();
  const password = String(body.password || "");

  if (!authenticateReservationUser({ username, password })) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const response = Response.json({ ok: true });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  response.headers.append(
    "Set-Cookie",
    `${cookieName}=${createReservationSessionValue(username)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAgeSeconds}${secure}`,
  );
  return response;
}
