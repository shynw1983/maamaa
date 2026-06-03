const crypto = require("crypto");

const KOMOJU_API_BASE = "https://komoju.com/api/v1";

const envKeyForStore = (storeId, name) => {
  const storePrefix = String(storeId || "")
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
  return storePrefix ? `KOMOJU_${storePrefix}_${name}` : `KOMOJU_${name}`;
};

const getStoreConfig = (storeId) => ({
  secretKey: process.env[envKeyForStore(storeId, "SECRET_KEY")] || process.env.KOMOJU_SECRET_KEY || "",
  webhookSecret: process.env[envKeyForStore(storeId, "WEBHOOK_SECRET")] || process.env.KOMOJU_WEBHOOK_SECRET || "",
  paymentTypes: process.env[envKeyForStore(storeId, "PAYMENT_TYPES")] || process.env.KOMOJU_PAYMENT_TYPES || "",
});

const getSecretKey = (storeId) => {
  const { secretKey } = getStoreConfig(storeId);
  if (!secretKey) {
    throw new Error(`KOMOJU secret key is not configured for store: ${storeId || "default"}.`);
  }
  return secretKey;
};

const getAuthHeader = (storeId) => `Basic ${Buffer.from(`${getSecretKey(storeId)}:`).toString("base64")}`;

const komojuRequest = async (path, options = {}) => {
  const response = await fetch(`${KOMOJU_API_BASE}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: getAuthHeader(options.storeId),
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = body?.error?.message || body?.message || `KOMOJU request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.body = body;
    throw error;
  }

  return body;
};

const configuredPaymentTypes = (storeId) =>
  getStoreConfig(storeId)
    .paymentTypes
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const createPaymentSession = async ({ order, returnUrl, locale = "ja" }) => {
  const paymentTypes = configuredPaymentTypes(order.storeId);
  const body = {
    mode: "payment",
    amount: order.amount,
    currency: order.currency || "JPY",
    return_url: returnUrl,
    default_locale: ["ja", "en", "ko"].includes(locale) ? locale : "ja",
    metadata: {
      order_id: order.orderId,
      pickup_code: order.pickupCode,
      store_id: order.storeId,
    },
    payment_data: {
      name: order.temperature,
      capture: "auto",
    },
  };

  if (paymentTypes.length) body.payment_types = paymentTypes;

  return komojuRequest("/sessions", {
    method: "POST",
    storeId: order.storeId,
    body: JSON.stringify(body),
  });
};

const showSession = async (sessionId, { storeId } = {}) => komojuRequest(`/sessions/${encodeURIComponent(sessionId)}`, { storeId });

const configuredWebhookSecrets = (storeId) => {
  const storeSecret = getStoreConfig(storeId).webhookSecret;
  if (storeSecret) return [storeSecret];

  return [...new Set(Object.entries(process.env)
    .filter(([key, value]) => key.startsWith("KOMOJU_") && key.endsWith("_WEBHOOK_SECRET") && value)
    .map(([, value]) => value))];
};

const signatureMatchesSecret = (rawBody, signature, secret) => {
  if (!signature) return false;

  const computed = crypto.createHmac("sha256", secret).update(rawBody).digest("hex");
  const signatureBuffer = Buffer.from(signature, "hex");
  const computedBuffer = Buffer.from(computed, "hex");

  return signatureBuffer.length === computedBuffer.length && crypto.timingSafeEqual(signatureBuffer, computedBuffer);
};

const verifyWebhookSignature = (rawBody, signature, { storeId } = {}) => {
  const secrets = configuredWebhookSecrets(storeId);
  if (!secrets.length) {
    throw new Error(`KOMOJU webhook secret is not configured for store: ${storeId || "any"}.`);
  }

  return secrets.some((secret) => signatureMatchesSecret(rawBody, signature, secret));
};

module.exports = {
  createPaymentSession,
  getStoreConfig,
  showSession,
  verifyWebhookSignature,
};
