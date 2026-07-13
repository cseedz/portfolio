const { getStore } = require("@netlify/blobs");
const crypto = require("crypto");

const STORE_NAME = "portfolio-cms";
const CONTENT_KEY = "content";

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

function getHeader(headers, key) {
  if (!headers || typeof headers !== "object") {
    return "";
  }
  const direct = headers[key];
  if (typeof direct === "string") {
    return direct;
  }
  const lowerKey = key.toLowerCase();
  for (const [name, value] of Object.entries(headers)) {
    if (String(name).toLowerCase() === lowerKey && typeof value === "string") {
      return value;
    }
  }
  return "";
}

function signData(data, secret) {
  return crypto.createHmac("sha256", secret).update(data).digest("base64url");
}

function verifyCmsToken(rawToken, secret) {
  const token = String(rawToken || "").trim();
  if (!token || !secret) {
    return false;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return false;
  }

  const [encodedPayload, signature] = parts;
  const expectedSignature = signData(encodedPayload, secret);
  if (signature !== expectedSignature) {
    return false;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
    const exp = Number(payload?.exp || 0);
    if (!Number.isFinite(exp)) {
      return false;
    }
    const now = Math.floor(Date.now() / 1000);
    return exp > now;
  } catch (error) {
    return false;
  }
}

exports.handler = async (event, context) => {
  const siteID = process.env.SITE_ID || process.env.NETLIFY_SITE_ID || "";
  const token = process.env.CMS_NETLIFY_TOKEN || process.env.NETLIFY_BLOBS_TOKEN || process.env.NETLIFY_AUTH_TOKEN || "";
  let store =
    context?.blobs && typeof context.blobs.getStore === "function"
      ? context.blobs.getStore(STORE_NAME)
      : null;

  if (!store && siteID && token) {
    store = getStore({
      name: STORE_NAME,
      siteID,
      token,
    });
  }
  const method = String(event.httpMethod || "GET").toUpperCase();

  if (!store) {
    return json(500, { ok: false, error: "Cloud store unavailable." });
  }

  if (method === "GET") {
    try {
      const content = await store.get(CONTENT_KEY, { type: "json" });
      return json(200, {
        ok: true,
        content: content && typeof content === "object" ? content : null,
      });
    } catch (error) {
      return json(500, { ok: false, error: "Failed to read CMS content." });
    }
  }

  if (method === "POST") {
    const authSecret = String(process.env.CMS_AUTH_SECRET || "").trim();
    const bearerHeader = getHeader(event.headers, "authorization");
    const bearerToken = bearerHeader.toLowerCase().startsWith("bearer ")
      ? bearerHeader.slice(7).trim()
      : "";
    if (!verifyCmsToken(bearerToken, authSecret)) {
      return json(401, { ok: false, error: "Unauthorized." });
    }

    const body = parseBody(event.body);
    if (!body || !body.content || typeof body.content !== "object") {
      return json(400, { ok: false, error: "Missing `content` object." });
    }

    try {
      const previous = await store.get(CONTENT_KEY, { type: "json" });
      if (previous && typeof previous === "object") {
        const backupKey = `backup-${Date.now()}`;
        await store.setJSON(backupKey, previous);
      }
      await store.setJSON(CONTENT_KEY, body.content);
      return json(200, { ok: true });
    } catch (error) {
      return json(500, { ok: false, error: "Failed to write CMS content." });
    }
  }

  return json(405, { ok: false, error: "Method not allowed." });
};
