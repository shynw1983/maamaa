import { cookies } from "next/headers";

const { getSessionFromCookieStore } = require("../../../../server/admin-auth");

export async function GET() {
  const cookieStore = await cookies();
  const session = getSessionFromCookieStore(cookieStore);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  return Response.json({
    key: process.env.PUSHER_KEY || "",
    cluster: process.env.PUSHER_CLUSTER || "",
    channels: process.env.PUSHER_KEY ? ["private-admin-orders-maamaa"] : [],
  });
}
