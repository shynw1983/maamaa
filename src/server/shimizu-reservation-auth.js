const { createHmac, timingSafeEqual } = require("crypto");

const cookieName = "maamaa_shimizu_reservation";
const maxAgeSeconds = 60 * 60 * 24 * 7;

const devUsername = "review";
const devPassword = "maamaa";

const getCredentials = () => ({
  username:
    process.env.SHIMIZU_RESERVATION_USERNAME ||
    process.env.RESERVATION_USERNAME ||
    (process.env.NODE_ENV === "production" ? "" : devUsername),
  password:
    process.env.SHIMIZU_RESERVATION_PASSWORD ||
    process.env.RESERVATION_PASSWORD ||
    (process.env.NODE_ENV === "production" ? "" : devPassword),
});

const getSecret = () =>
  process.env.SHIMIZU_RESERVATION_AUTH_SECRET ||
  process.env.SHIMIZU_RESERVATION_PASSWORD ||
  process.env.RESERVATION_PASSWORD ||
  "";

const safeEqual = (left = "", right = "") => {
  const leftBuffer = Buffer.from(String(left));
  const rightBuffer = Buffer.from(String(right));
  if (leftBuffer.length !== rightBuffer.length) return false;
  return timingSafeEqual(leftBuffer, rightBuffer);
};

const sign = (value) => createHmac("sha256", getSecret()).update(value).digest("hex");

const createReservationSessionValue = (username = "") => {
  const payload = Buffer.from(
    JSON.stringify({
      sub: "shimizu-reservation",
      username,
      exp: Date.now() + maxAgeSeconds * 1000,
    }),
  ).toString("base64url");
  return `${payload}.${sign(payload)}`;
};

const isValidReservationSession = (value = "") => {
  if (!value || !getSecret()) return false;
  const [payload, signature] = value.split(".");
  if (!payload || !signature) return false;

  const expected = sign(payload);
  if (signature.length !== expected.length) return false;
  if (!safeEqual(signature, expected)) return false;

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return decoded.sub === "shimizu-reservation" && Number(decoded.exp) > Date.now();
  } catch {
    return false;
  }
};

const isReservationAuthenticated = (cookieStore) =>
  isValidReservationSession(cookieStore.get(cookieName)?.value);

const authenticateReservationUser = ({ username, password }) => {
  const credentials = getCredentials();
  if (!credentials.username || !credentials.password) return false;
  return safeEqual(String(username || "").trim(), credentials.username) && safeEqual(String(password || ""), credentials.password);
};

module.exports = {
  cookieName,
  maxAgeSeconds,
  createReservationSessionValue,
  isReservationAuthenticated,
  authenticateReservationUser,
};
