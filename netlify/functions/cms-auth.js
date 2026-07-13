const crypto = require("crypto");

const DEFAULT_TTL_SECONDS = 60 * 60 * 12;

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(payload),
  };
}

function parseBody(rawBody) {
  try {
    const parsed = JSON.parse(rawBody || "{}");
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch (error) {
    return null;
  }
}

function toBase64Url(value) {
  return Buffer.from(value).toString("base64url");
}

function signData(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

exports.handler = async (event) => {
  const method = String(event.httpMethod || "GET").toUpperCase();
  if (method !== "POST") {
    return json(405, { ok: false, error: "Method not allowed." });
  }

  const adminUser = String(process.env.CMS_ADMIN_USER || "").trim();
  const adminPassword = String(process.env.CMS_ADMIN_PASSWORD || "").trim();
  const authSecret = String(process.env.CMS_AUTH_SECRET || "").trim();
  if (!adminUser || !adminPassword || !authSecret) {
    return json(500, { ok: false, error: "Authentication is not configured." });
  }

  const body = parseBody(event.body);
  const user = String(body?.username || "");
  const password = String(body?.password || "");
  if (user !== adminUser || password !== adminPassword) {
    return json(401, { ok: false, error: "Invalid credentials." });
  }

  const expiresAt = Math.floor(Date.now() / 1000) + DEFAULT_TTL_SECONDS;
  const payload = JSON.stringify({
    sub: user,
    exp: expiresAt,
  });
  const encodedPayload = toBase64Url(payload);
  const signature = signData(encodedPayload, authSecret);
  const token = `${encodedPayload}.${signature}`;

  return json(200, { ok: true, token, expiresAt });
};
