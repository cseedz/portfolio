function getValueByPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatRichText(value) {
  const escaped = escapeHtml(value);

  return escaped
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeLongDashes(value) {
  return String(value || "").replace(/\s-\s/g, " — ");
}

function formatCreditsHtml(value) {
  const normalized = normalizeLongDashes(value);
  const blocks = normalized
    .split("—")
    .map((block) => block.trim())
    .filter(Boolean);

  if (!blocks.length) {
    return "";
  }

  const formatted = blocks.map((block) => {
    const parts = block.split(".");
    const rolePart = (parts.shift() || "").replace(/\s+/g, " ").trim();
    const namesPart = parts
      .map((part) => part.replace(/\./g, " ").replace(/\s+/g, " ").trim())
      .filter(Boolean)
      .join(", ");

    if (!namesPart) {
      const cleaned = rolePart.replace(/\./g, " ").replace(/\s+/g, " ").trim();
      return `<strong>${escapeHtml(cleaned)}</strong>`;
    }

    return `<strong>${escapeHtml(rolePart)}</strong> ${escapeHtml(namesPart)}`;
  });

  return formatted.join(" — ");
}

function normalizeProjectCreditRoles(creditRoles) {
  if (Array.isArray(creditRoles)) {
    return creditRoles
      .map((entry) => ({
        role: String(entry?.role || "").replace(/\s+/g, " ").trim(),
        names: String(entry?.names || "").trim(),
      }))
      .filter((entry) => entry.role || entry.names);
  }

  if (creditRoles && typeof creditRoles === "object") {
    return Object.entries(creditRoles)
      .map(([role, names]) => ({
        role: String(role || "").replace(/\s+/g, " ").trim(),
        names: String(names || "").trim(),
      }))
      .filter((entry) => entry.role || entry.names);
  }

  return [];
}

function buildCreditsTextFromRoleEntries(entries) {
  return (entries || [])
    .map((entry) => ({
      role: String(entry?.role || "").replace(/\s+/g, " ").trim(),
      names: String(entry?.names || "").trim(),
    }))
    .filter((entry) => entry.role && entry.names)
    .map((entry) => `${entry.role}. ${entry.names}.`)
    .join(" — ");
}

function resolveProjectCreditsText(project) {
  const roleEntries = normalizeProjectCreditRoles(project?.creditRoles);
  const fromRoles = buildCreditsTextFromRoleEntries(roleEntries);
  if (fromRoles) {
    return fromRoles;
  }

  return project?.credits || "";
}

function isImageUrl(value) {
  if (!value) {
    return false;
  }

  return /\.(jpg|jpeg|png|webp|gif|avif)(\?.*)?$/i.test(value);
}

function isDirectVideoUrl(value) {
  if (!value) {
    return false;
  }

  if (value.startsWith("blob:") || value.startsWith("data:video/")) {
    return true;
  }

  return /\.(mp4|webm|ogg|m4v|mov)(\?.*)?$/i.test(value);
}

// Médias (previews, posters, masters) servis depuis Supabase Storage.
const MEDIA_BASE = "https://dvivafrldxzhkactsvve.supabase.co/storage/v1/object/public/portfolio";

const MEDIA_CACHE_BUST_TOKEN = String(Date.now());

function appendMediaCacheBust(url) {
  if (!url || /^blob:|^data:/i.test(url)) {
    return url;
  }

  // Storage URLs are immutable and CDN-cached: a per-load cache-bust token
  // would defeat the CDN and multiply egress.
  if (url.startsWith(MEDIA_BASE)) {
    return url;
  }

  const hashIndex = url.indexOf("#");
  const hash = hashIndex >= 0 ? url.slice(hashIndex) : "";
  const base = hashIndex >= 0 ? url.slice(0, hashIndex) : url;
  const separator = base.includes("?") ? "&" : "?";
  return `${base}${separator}v=${MEDIA_CACHE_BUST_TOKEN}${hash}`;
}

function normalizeMontagesPublicitesPath(value) {
  const source = String(value || "").trim();
  if (!source) {
    return "";
  }

  const parts = source.split("/");
  const montageIndex = parts.findIndex((segment) => segment.toLowerCase() === "montages");
  if (montageIndex < 0 || montageIndex + 1 >= parts.length) {
    return source;
  }

  const rawSegment = parts[montageIndex + 1];
  let decodedSegment = rawSegment;
  try {
    decodedSegment = decodeURIComponent(rawSegment);
  } catch (error) {
    decodedSegment = rawSegment;
  }

  const normalizedSegment = decodedSegment
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  if (normalizedSegment === "publicite" || normalizedSegment === "publicites" || normalizedSegment === "spots") {
    parts[montageIndex + 1] = "spots";
    return parts.join("/");
  }

  return source;
}

function toPlaybackUrl(value) {
  const source = String(value || "").trim();
  if (!source) {
    return "";
  }

  const normalizedSource = normalizeMontagesPublicitesPath(source);
  const encoded = /^https?:|^blob:|^data:/i.test(normalizedSource) ? normalizedSource : encodeURI(normalizedSource);
  return appendMediaCacheBust(encoded);
}

function isPreviewMediaUrl(value) {
  return isImageUrl(value) || isDirectVideoUrl(value);
}

function supportsHoverPreview() {
  return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
}

function isLocalVideoPath(value) {
  return /^(\.\/)?videos\//.test(String(value || "").trim()) && isDirectVideoUrl(value);
}

/**
 * Storage keys are sanitized to plain ASCII at upload time; this MUST stay
 * identical to sanitize_key() in the upload script.
 */
function sanitizeMediaKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9./_-]+/g, "_");
}

function mediaRelativePath(value) {
  const source = String(value || "").trim();
  if (!isLocalVideoPath(source)) {
    return "";
  }

  const normalized = normalizeMontagesPublicitesPath(source);
  const match = normalized.match(/^(?:\.\/)?videos\/(?:previews\/)?(.+)$/);
  return match ? match[1] : "";
}

/**
 * Map a CMS video path to its lightweight hover-preview variant in Supabase
 * Storage. Remote URLs pass through untouched.
 */
function toPreviewAssetUrl(value) {
  const rel = mediaRelativePath(value);
  if (!rel) {
    return String(value || "").trim();
  }
  return `${MEDIA_BASE}/previews/${sanitizeMediaKey(rel)}`;
}

/** Full-quality master variant, used as fallback when a preview is missing. */
function toMasterAssetUrl(value) {
  const rel = mediaRelativePath(value);
  if (!rel) {
    return "";
  }
  return `${MEDIA_BASE}/masters/${sanitizeMediaKey(rel)}`;
}

/** Poster image for a CMS video path. Returns "" when no poster can exist. */
function toPosterAssetUrl(value) {
  const rel = mediaRelativePath(value);
  if (!rel) {
    return "";
  }
  return `${MEDIA_BASE}/posters/${sanitizeMediaKey(rel.replace(/\.[a-z0-9]+$/i, ""))}.jpg`;
}

function slugifyTitle(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function sanitizeExternalUrl(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) {
    return "";
  }

  let candidate = value;
  const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(candidate);
  const looksLikeDomain = /^(?:www\.)?[a-z0-9][a-z0-9.-]*\.[a-z]{2,}(?:[/:?#].*)?$/i.test(candidate);

  // Accept common pasted forms like "vimeo.com/123456" by adding https.
  if (!hasScheme && looksLikeDomain) {
    candidate = `https://${candidate}`;
  }

  try {
    const parsed = new URL(candidate);
    const isHttp = parsed.protocol === "http:" || parsed.protocol === "https:";
    if (!isHttp) {
      return "";
    }
    return parsed.href;
  } catch (error) {
    return "";
  }
}

function sanitizeEmailAddress(rawValue) {
  const value = String(rawValue || "").trim();
  if (!value) {
    return "";
  }

  // Pragmatic email check: reject control chars and obvious invalids.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return "";
  }
  return value;
}

function getPresentationEmbedUrl(rawValue) {
  const safeUrl = sanitizeExternalUrl(rawValue);
  if (!safeUrl) {
    return "";
  }

  try {
    const parsed = new URL(safeUrl);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("vimeo.com")) {
      const decodedPath = decodeURIComponent(parsed.pathname || "");
      const combined = `${decodedPath}${parsed.search || ""}${parsed.hash || ""}`;
      const idCandidates = combined.match(/\d{6,12}/g);
      const id = idCandidates && idCandidates.length ? idCandidates[idCandidates.length - 1] : "";
      if (!id) {
        return "";
      }

      let hashToken = String(parsed.searchParams.get("h") || "").trim();
      if (!hashToken) {
        const pathSegments = decodedPath.split("/").filter(Boolean);
        const maybeToken = pathSegments.find((segment) => /^[a-f0-9]{8,}$/i.test(segment));
        if (maybeToken && maybeToken !== id) {
          hashToken = maybeToken;
        }
      }

      const params = new URLSearchParams({
        dnt: "1",
        autoplay: "1",
        muted: "1",
        controls: "0",
        title: "0",
        byline: "0",
        portrait: "0",
      });
      if (hashToken) {
        params.set("h", hashToken);
      }
      return `https://player.vimeo.com/video/${id}?${params.toString()}`;
    }

    if (host.includes("youtube.com")) {
      const id = parsed.searchParams.get("v");
      if (!id) {
        return "";
      }
      return `https://www.youtube.com/embed/${id}`;
    }

    if (host.includes("youtu.be")) {
      const id = parsed.pathname.split("/").filter(Boolean).pop();
      if (!id) {
        return "";
      }
      return `https://www.youtube.com/embed/${id}`;
    }
  } catch (error) {
    return "";
  }

  return "";
}

function isVimeoEmbedUrl(value) {
  return String(value || "").includes("player.vimeo.com/video/");
}

const VIMEO_EMBED_CACHE_KEY = "cg:vimeo-embed-cache:v1";
const vimeoEmbedCache = new Map();

function loadVimeoEmbedCache() {
  try {
    const raw = localStorage.getItem(VIMEO_EMBED_CACHE_KEY);
    if (!raw) {
      return;
    }

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return;
    }

    Object.entries(parsed).forEach(([key, value]) => {
      const safeKey = String(key || "").trim();
      const safeValue = String(value || "").trim();
      if (safeKey && safeValue && isVimeoEmbedUrl(safeValue)) {
        vimeoEmbedCache.set(safeKey, safeValue);
      }
    });
  } catch (error) {
    // no-op
  }
}

function persistVimeoEmbedCache() {
  try {
    const serialized = {};
    vimeoEmbedCache.forEach((value, key) => {
      serialized[key] = value;
    });
    localStorage.setItem(VIMEO_EMBED_CACHE_KEY, JSON.stringify(serialized));
  } catch (error) {
    // no-op
  }
}

loadVimeoEmbedCache();

function enrichVimeoEmbedUrl(url) {
  try {
    const parsed = new URL(String(url || ""));
    if (!parsed.hostname.toLowerCase().includes("player.vimeo.com")) {
      return "";
    }

    parsed.searchParams.set("dnt", "1");
    parsed.searchParams.set("autoplay", "1");
    parsed.searchParams.set("muted", "1");
    parsed.searchParams.set("controls", "0");
    parsed.searchParams.set("title", "0");
    parsed.searchParams.set("byline", "0");
    parsed.searchParams.set("portrait", "0");
    return parsed.toString();
  } catch (error) {
    return "";
  }
}

async function resolvePresentationEmbedUrl(rawValue) {
  const direct = getPresentationEmbedUrl(rawValue);
  if (direct) {
    const directKey = String(rawValue || "").trim();
    if (directKey && isVimeoEmbedUrl(direct)) {
      vimeoEmbedCache.set(directKey, direct);
      persistVimeoEmbedCache();
    }
    return direct;
  }

  const safeUrl = sanitizeExternalUrl(rawValue);
  if (!safeUrl) {
    return "";
  }

  let host = "";
  try {
    host = new URL(safeUrl).hostname.toLowerCase();
  } catch (error) {
    return "";
  }

  if (!host.includes("vimeo.com")) {
    return "";
  }

  const cachedEmbed = vimeoEmbedCache.get(safeUrl) || vimeoEmbedCache.get(String(rawValue || "").trim());
  if (cachedEmbed && isVimeoEmbedUrl(cachedEmbed)) {
    return cachedEmbed;
  }

  try {
    const oembedUrl = `https://vimeo.com/api/oembed.json?url=${encodeURIComponent(safeUrl)}`;
    const response = await fetch(oembedUrl, { method: "GET" });
    if (!response.ok) {
      return "";
    }

    const payload = await response.json().catch(() => ({}));
    const html = String(payload?.html || "");
    const srcMatch = html.match(/src="([^"]+)"/i);
    const src = srcMatch?.[1] || "";
    if (!src) {
      return "";
    }

    const enriched = enrichVimeoEmbedUrl(src);
    if (enriched) {
      const rawKey = String(rawValue || "").trim();
      vimeoEmbedCache.set(safeUrl, enriched);
      if (rawKey) {
        vimeoEmbedCache.set(rawKey, enriched);
      }
      persistVimeoEmbedCache();
    }
    return enriched;
  } catch (error) {
    return "";
  }
}

let projectPageMap = new Map();
let projectPageBound = false;
let routerBound = false;
const routeApis = { project: null, about: null };
let backToTopBound = false;
let desktopChromeBound = false;
let aboutOverlayBound = false;
let projectInlineBound = false;
let desktopHomeBound = false;
let lockedDirectorRole = null;
let directorRoleAnimationTimer = null;
let desktopLabelAnimationTimer = null;

function resolveMoriWeight(value, fallback) {
  const weights = {
    thin: "100",
    extralight: "200",
    regular: "400",
    bold: "700",
    semibold: "600",
    black: "900",
  };

  if (!value) {
    return fallback;
  }

  return weights[value] || value;
}

function applyTypography(content) {
  const typography = content.typography || {};
  const root = document.documentElement;

  root.style.setProperty("--body-size", `${typography.bodySize || 12}px`);
  root.style.setProperty("--menu-size", `${typography.menuSize || 14}px`);
  root.style.setProperty("--title-size", `${typography.titleSize || 24}px`);
  root.style.setProperty("--section-title-size", `${typography.sectionTitleSize || 14}px`);
  root.style.setProperty("--footer-size", `${typography.footerSize || 11}px`);
  root.style.setProperty(
    "--location-size",
    `${typography.locationSize || typography.footerSize || typography.kickerSize || 10}px`
  );
  root.style.setProperty("--kicker-size", `${typography.kickerSize || 10}px`);
  root.style.setProperty("--body-weight", resolveMoriWeight(typography.bodyWeight, "400"));
  root.style.setProperty("--kicker-weight", resolveMoriWeight(typography.kickerWeight, "400"));
  root.style.setProperty(
    "--section-title-weight",
    resolveMoriWeight(typography.sectionTitleWeight || typography.bodyWeight, "400")
  );
  root.style.setProperty("--hero-title-weight", resolveMoriWeight(typography.heroTitleWeight, "400"));
  root.style.setProperty("--work-title-weight", resolveMoriWeight(typography.workTitleWeight, "400"));
  root.style.setProperty("--footer-weight", resolveMoriWeight(typography.footerWeight, "400"));
}

function renderTextFields(content) {
  document.querySelectorAll("[data-field]").forEach((element) => {
    const value = getValueByPath(content, element.dataset.field) ?? "";

    if (element.dataset.linkType === "email") {
      const email = sanitizeEmailAddress(value);
      if (!email) {
        element.style.display = "none";
        return;
      }

      element.style.display = "";
      element.href = `mailto:${email}`;
      element.target = "_blank";
      element.rel = "noopener noreferrer";
      return;
    }

    if (element.dataset.linkType === "url") {
      const url = sanitizeExternalUrl(value);
      if (!url) {
        element.style.display = "none";
        return;
      }

      element.style.display = "";
      element.href = url;
      element.target = "_blank";
      element.rel = "noopener noreferrer";
      return;
    }

    if (element.dataset.richText === "true") {
      element.innerHTML = formatRichText(value);
      return;
    }

    element.textContent = value;
  });
}

function renderTitleList(selector, items) {
  const containers = [...document.querySelectorAll(selector)];
  if (!containers.length) {
    return;
  }

  containers.forEach((container) => {
    container.innerHTML = "";
    const withDashSeparator = container.dataset.separator === "dash";
    const withProjectOverlay = container.dataset.projectOverlay === "true";
    const withExternalLinks = container.dataset.linkable === "external";
    const withVideoPreview = withProjectOverlay || container.dataset.videoPreview === "true";
    const visibleItems = (items || []).filter((item) => !item?.hidden);

    visibleItems.forEach((item, index) => {
      if (item?.break) {
        const breakLine = document.createElement("span");
        breakLine.className = "title-list__break";
        breakLine.setAttribute("aria-hidden", "true");
        container.appendChild(breakLine);
        return;
      }

      const linkHref = withExternalLinks
        ? sanitizeExternalUrl(item.video || item.presentationVideo || item.backgroundVideo || "")
        : "";
      const previewSrc = (
        item.backgroundVideo ||
        item.video ||
        item.presentationVideo ||
        ""
      ).trim();
      const isActionable = withProjectOverlay && !linkHref;
      const title = document.createElement(linkHref ? "a" : isActionable ? "button" : "span");
      title.className = "title-list__item";
      if (!withDashSeparator) {
        title.classList.add("title-list__item--stacked");
      }
      if (linkHref) {
        title.classList.add("title-list__item--link");
        title.href = linkHref;
        title.target = "_blank";
        title.rel = "noopener noreferrer";
      }
      if (isActionable) {
        title.type = "button";
        const posterSrc = toPosterAssetUrl(previewSrc);
        if (posterSrc) {
          const thumb = document.createElement("img");
          thumb.className = "title-list__thumb";
          thumb.src = posterSrc;
          thumb.alt = "";
          thumb.loading = "lazy";
          thumb.decoding = "async";
          thumb.addEventListener("error", () => thumb.remove(), { once: true });
          title.appendChild(thumb);
        }
        const label = document.createElement("span");
        label.className = "title-list__label";
        label.textContent = item.title;
        title.appendChild(label);
      } else {
        title.textContent = item.title;
        if (!linkHref) {
          title.tabIndex = 0;
        }
      }
      if (withVideoPreview && isPreviewMediaUrl(previewSrc)) {
        title.dataset.video = previewSrc;
        title.dataset.videoPreview = "true";
      }
      title.dataset.projectOverlay = withProjectOverlay ? "true" : "false";
      container.appendChild(title);

      if (!withDashSeparator || index === visibleItems.length - 1) {
        return;
      }

      const nextItem = visibleItems[index + 1];
      if (nextItem?.break || nextItem?.hidden) {
        return;
      }

      const separator = document.createElement("span");
      separator.className = "title-list__separator";
      separator.textContent = " — ";
      container.appendChild(separator);
    });
  });
}

function enhanceProjectMentions(content) {
  const projectMap = new Map();
  [...(content.directing.items || []), ...(content.editing.items || [])].forEach((item) => {
    if (item?.hidden) {
      return;
    }

    const previewVideo = (
      item?.backgroundVideo ||
      item?.video ||
      item?.presentationVideo ||
      ""
    ).trim();
    if (!item?.title || !isPreviewMediaUrl(previewVideo)) {
      return;
    }

    projectMap.set(item.title, previewVideo);
  });

  if (!projectMap.size) {
    return;
  }

  const titles = [...projectMap.keys()].sort((a, b) => b.length - a.length);
  const richTextFields = document.querySelectorAll("[data-rich-text='true']");

  richTextFields.forEach((field) => {
    const walker = document.createTreeWalker(field, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.nodeValue.trim()) {
        continue;
      }

      if (node.parentElement?.closest("[data-video-preview='true']")) {
        continue;
      }

      textNodes.push(node);
    }

    textNodes.forEach((node) => {
      const original = node.nodeValue;
      let remaining = original;
      let changed = false;
      const fragment = document.createDocumentFragment();

      while (remaining.length) {
        let matchIndex = -1;
        let matchedTitle = "";

        titles.forEach((title) => {
          const index = remaining.toLowerCase().indexOf(title.toLowerCase());
          if (index === -1) {
            return;
          }

          if (matchIndex === -1 || index < matchIndex) {
            matchIndex = index;
            matchedTitle = title;
          }
        });

        if (matchIndex === -1) {
          fragment.appendChild(document.createTextNode(remaining));
          break;
        }

        if (matchIndex > 0) {
          fragment.appendChild(document.createTextNode(remaining.slice(0, matchIndex)));
        }

        const matchedText = remaining.slice(matchIndex, matchIndex + matchedTitle.length);
        const trigger = document.createElement("span");
        trigger.className = "project-mention";
        trigger.textContent = matchedText;
        trigger.tabIndex = 0;
        trigger.dataset.video = projectMap.get(matchedTitle);
        trigger.dataset.videoPreview = "true";
        fragment.appendChild(trigger);

        remaining = remaining.slice(matchIndex + matchedTitle.length);
        changed = true;
      }

      if (changed) {
        node.parentNode.replaceChild(fragment, node);
      }
    });
  });
}

function enhanceBioNameMention() {
  const imageSrc = "./images/IMG_1373.JPG";
  const targetName = "charles grenier";
  const richTextFields = document.querySelectorAll("[data-rich-text='true']");

  richTextFields.forEach((field) => {
    const walker = document.createTreeWalker(field, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.nodeValue.trim()) {
        continue;
      }

      if (node.parentElement?.closest("[data-video-preview='true']")) {
        continue;
      }

      textNodes.push(node);
    }

    textNodes.forEach((node) => {
      const original = node.nodeValue;
      const lower = original.toLowerCase();
      let index = lower.indexOf(targetName);
      if (index === -1) {
        return;
      }

      const fragment = document.createDocumentFragment();
      let cursor = 0;

      while (index !== -1) {
        if (index > cursor) {
          fragment.appendChild(document.createTextNode(original.slice(cursor, index)));
        }

        const mentionText = original.slice(index, index + targetName.length);
        const mention = document.createElement("span");
        mention.className = "bio-mention";
        mention.textContent = mentionText;
        mention.tabIndex = 0;
        mention.dataset.video = imageSrc;
        mention.dataset.videoPreview = "true";
        fragment.appendChild(mention);

        cursor = index + targetName.length;
        index = lower.indexOf(targetName, cursor);
      }

      if (cursor < original.length) {
        fragment.appendChild(document.createTextNode(original.slice(cursor)));
      }

      node.parentNode.replaceChild(fragment, node);
    });
  });
}

function setupProjectPreview() {
  if (!isDesktopLayout()) {
    document.body.classList.remove("video-active");
    return;
  }

  const preview = document.querySelector(".project-preview");
  const videos = [...document.querySelectorAll(".project-preview__video")];
  const images = [...document.querySelectorAll(".project-preview__image")];
  const items = document.querySelectorAll("[data-video-preview='true']");

  if (!preview || videos.length < 2 || images.length < 2 || !items.length) {
    return;
  }

  const layers = [
    { video: videos[0], image: images[0] },
    { video: videos[1], image: images[1] },
  ];

  let activeSrc = "";
  let activeLayerIndex = 0;
  let switchVersion = 0;
  let isPreviewLocked = false;
  let hasUserInteracted = false;
  let introPreviewActive = false;
  let introShowTimer = null;
  const HOVER_FADE_MS = 360;
  let cleanupTimer = null;

  const syncVideoActiveState = () => {
    const hasActiveVideoLayer = layers.some(
      (layer) => layer.video.classList.contains("is-active") && Boolean(layer.video.getAttribute("src")),
    );
    const hasActiveImageLayer = layers.some(
      (layer) => layer.image.classList.contains("is-active") && Boolean(layer.image.getAttribute("src")),
    );
    const hasRenderablePreview = hasActiveVideoLayer || hasActiveImageLayer;
    const hasVisiblePreview = preview.classList.contains("is-visible") && hasRenderablePreview;

    if (!hasRenderablePreview) {
      preview.classList.remove("is-visible");
    }

    document.body.classList.toggle("video-active", hasVisiblePreview);
  };

  const resetLayerMedia = (layer) => {
    if (!layer) {
      return;
    }
    layer.video.pause();
    layer.video.removeAttribute("src");
    layer.video.load();
    layer.video.classList.remove("is-active");
    layer.image.removeAttribute("src");
    layer.image.classList.remove("is-active");
  };

  const cleanupInactiveLayer = () => {
    const inactiveIndex = activeLayerIndex === 0 ? 1 : 0;
    resetLayerMedia(layers[inactiveIndex]);
  };

  const hidePreview = (force = false) => {
    if (document.body.classList.contains("project-page-open")) {
      return;
    }

    switchVersion += 1;
    activeSrc = "";
    preview.classList.remove("is-visible");
    syncVideoActiveState();
    if (cleanupTimer) {
      clearTimeout(cleanupTimer);
    }
    cleanupTimer = setTimeout(() => {
      if (!force && preview.classList.contains("is-visible")) {
        return;
      }
      layers.forEach((layer) => resetLayerMedia(layer));
      syncVideoActiveState();
      cleanupTimer = null;
    }, HOVER_FADE_MS);
  };

  const setActiveLayer = (layerIndex, src) => {
    const activeLayer = layers[layerIndex];
    const inactiveLayer = layers[layerIndex === 0 ? 1 : 0];
    if (!activeLayer || !inactiveLayer) {
      return;
    }

    activeSrc = src;
    activeLayerIndex = layerIndex;
    // Seamless crossfade: the new layer fades in ABOVE the previous one, which
    // stays fully opaque until cleanup. Fading both at once lets the white
    // page bleed through mid-transition (visible flash).
    [activeLayer.video, activeLayer.image].forEach((el) => {
      el.style.zIndex = "2";
    });
    [inactiveLayer.video, inactiveLayer.image].forEach((el) => {
      el.style.zIndex = "1";
    });
    activeLayer.video.classList.toggle("is-active", !isImageUrl(src));
    activeLayer.image.classList.toggle("is-active", isImageUrl(src));
    preview.classList.add("is-visible");
    syncVideoActiveState();

    if (!isImageUrl(src)) {
      activeLayer.video.play().catch(() => {});
    }

    if (cleanupTimer) {
      clearTimeout(cleanupTimer);
    }
    cleanupTimer = setTimeout(() => {
      cleanupInactiveLayer();
      cleanupTimer = null;
    }, HOVER_FADE_MS);
  };

  const showPreview = (src, force = false) => {
    if (isPreviewLocked && !force) {
      return;
    }

    if (cleanupTimer) {
      clearTimeout(cleanupTimer);
      cleanupTimer = null;
    }

    if (!src) {
      return;
    }

    if (activeSrc === src) {
      return;
    }

    const nextLayerIndex = activeLayerIndex === 0 ? 1 : 0;
    const nextLayer = layers[nextLayerIndex];
    if (!nextLayer) {
      return;
    }

    switchVersion += 1;
    const currentSwitchVersion = switchVersion;

    if (isImageUrl(src)) {
      nextLayer.video.pause();
      nextLayer.video.removeAttribute("src");
      nextLayer.video.load();
      nextLayer.image.src = toPlaybackUrl(src);
      setActiveLayer(nextLayerIndex, src);
      return;
    }

    const previewAssetSrc = toPreviewAssetUrl(src);
    nextLayer.image.removeAttribute("src");
    nextLayer.video.src = toPlaybackUrl(previewAssetSrc);
    nextLayer.video.load();

    const activateVideoLayer = () => {
      if (currentSwitchVersion !== switchVersion) {
        return;
      }
      setActiveLayer(nextLayerIndex, src);
    };

    if (nextLayer.video.readyState >= 2) {
      activateVideoLayer();
      return;
    }

    nextLayer.video.addEventListener("loadeddata", activateVideoLayer, { once: true });
    nextLayer.video.addEventListener(
      "error",
      () => {
        if (currentSwitchVersion !== switchVersion) {
          return;
        }
        const masterSrc = toMasterAssetUrl(src);
        if (previewAssetSrc !== src && masterSrc) {
          // The compressed preview variant is missing: fall back to the master file.
          nextLayer.video.src = toPlaybackUrl(masterSrc);
          nextLayer.video.load();
          nextLayer.video.addEventListener("loadeddata", activateVideoLayer, { once: true });
        }
        // Otherwise keep the current preview visible if the next media fails to load.
      },
      { once: true },
    );
  };

  const stopIntroPreview = (forceHide = false) => {
    if (introShowTimer) {
      clearTimeout(introShowTimer);
      introShowTimer = null;
    }
    if (forceHide && introPreviewActive && !isPreviewLocked) {
      hidePreview(true);
    }
    introPreviewActive = false;
  };

  const markUserInteraction = () => {
    hasUserInteracted = true;
    stopIntroPreview(false);
  };

  const runIntroPreview = (delayMs = 420) => {
    if (!introCandidates.length) {
      return;
    }

    stopIntroPreview(false);
    hasUserInteracted = false;
    introShowTimer = window.setTimeout(() => {
      if (hasUserInteracted || isPreviewLocked) {
        return;
      }
      if (document.body.classList.contains("about-open")) {
        return;
      }
      if (document.querySelector(".project-inline")?.classList.contains("is-open")) {
        return;
      }

      const pool = [...introCandidates];
      for (let i = pool.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1));
        [pool[i], pool[j]] = [pool[j], pool[i]];
      }

      const tryShowIntroAt = (index) => {
        if (hasUserInteracted || isPreviewLocked) {
          return;
        }
        if (index >= pool.length) {
          return;
        }

        const candidate = pool[index];
        const introSrc = String(candidate?.dataset.video || "").trim();
        if (!introSrc) {
          tryShowIntroAt(index + 1);
          return;
        }

        introPreviewActive = true;
        showPreview(introSrc, true);

        window.setTimeout(() => {
          if (hasUserInteracted || isPreviewLocked) {
            return;
          }
          if (!preview.classList.contains("is-visible")) {
            tryShowIntroAt(index + 1);
          }
        }, 900);
      };

      tryShowIntroAt(0);
    }, Math.max(0, Number(delayMs) || 0));
  };

  layers.forEach((layer) => {
    layer.image.addEventListener("error", () => {
      if (activeSrc && isImageUrl(activeSrc)) {
        // Keep previous active layer state instead of forcing a white flash.
      }
    });
  });

  document.addEventListener("project-page-closed", () => {
    isPreviewLocked = false;
    stopIntroPreview(true);
    if (cleanupTimer) {
      clearTimeout(cleanupTimer);
      cleanupTimer = null;
    }
    hidePreview(true);
  });

  document.addEventListener("project-preview-lock", (event) => {
    markUserInteraction();
    const src = String(event?.detail?.src || "").trim();
    if (!src) {
      isPreviewLocked = false;
      hidePreview(true);
      return;
    }
    isPreviewLocked = true;
    showPreview(src, true);
  });

  document.addEventListener("project-preview-unlock", () => {
    isPreviewLocked = false;
  });

  document.addEventListener("project-preview-reset", () => {
    isPreviewLocked = false;
    stopIntroPreview(true);
    if (cleanupTimer) {
      clearTimeout(cleanupTimer);
      cleanupTimer = null;
    }
    hidePreview(true);
  });

  items.forEach((item) => {
    if (supportsHoverPreview()) {
      item.addEventListener("mouseenter", () => {
        markUserInteraction();
        showPreview(item.dataset.video);
      });
    }
    item.addEventListener("focus", () => {
      markUserInteraction();
      showPreview(item.dataset.video);
    });
  });

  const introCandidates = [
    ...document.querySelectorAll("#realis .title-list[data-project-overlay='true'] .title-list__item[data-video]"),
  ].filter((item) => isPreviewMediaUrl(item.dataset.video));

  document.addEventListener("project-preview-intro", () => {
    isPreviewLocked = false;
    hidePreview(true);
    runIntroPreview(120);
  });

  runIntroPreview(420);

  syncVideoActiveState();
}

function buildProjectPageMap(content) {
  const map = new Map();
  const register = (items, section) => {
    (items || []).forEach((item) => {
      if (!item?.title) {
        return;
      }

      if (item?.hidden) {
        return;
      }

      const previewCandidate = String(
        item.backgroundVideo || item.video || item.presentationVideo || "",
      ).trim();
      const previewMedia = isPreviewMediaUrl(previewCandidate)
        ? previewCandidate
        : String(item.backgroundVideo || item.video || "").trim();

      map.set(item.title, {
        title: item.title,
        section,
        previewMedia,
        backgroundVideo: item.backgroundVideo || item.video || "",
        description: item.description || "",
        creditRoles: normalizeProjectCreditRoles(item.creditRoles),
        credits: item.credits || "",
        presentationVideo: item.presentationVideo || "",
      });
    });
  };

  register(content.directing.items, "directing");
  register(content.editing.items, "editing");

  return map;
}

function isDesktopLayout() {
  return window.matchMedia("(min-width: 641px)").matches;
}

function setDesktopPageLabel(value) {
  const desktopLabel = document.querySelector("[data-page-label]");
  if (desktopLabel) {
    const nextValue = String(value || "");
    const currentValue = desktopLabel.dataset.currentLabel || desktopLabel.textContent.trim();

    const applyFinalDesktopLabel = () => {
      desktopLabel.classList.remove("is-rolling");
      desktopLabel.textContent = nextValue;
      desktopLabel.dataset.currentLabel = nextValue;
      desktopLabel.style.width = "";
      desktopLabel.style.minWidth = "";
    };

    if (desktopLabelAnimationTimer) {
      clearTimeout(desktopLabelAnimationTimer);
      desktopLabelAnimationTimer = null;
    }

    if (!isDesktopLayout() || !currentValue || currentValue === nextValue) {
      applyFinalDesktopLabel();
    } else {
      const probe = document.createElement("span");
      probe.style.position = "absolute";
      probe.style.visibility = "hidden";
      probe.style.pointerEvents = "none";
      probe.style.whiteSpace = "nowrap";
      probe.style.font = "inherit";
      probe.style.letterSpacing = "inherit";
      desktopLabel.appendChild(probe);
      probe.textContent = currentValue;
      const currentWidth = probe.getBoundingClientRect().width;
      probe.textContent = nextValue;
      const nextWidth = probe.getBoundingClientRect().width;
      probe.remove();

      const safeWidth = Math.ceil(Math.max(currentWidth, nextWidth));
      desktopLabel.style.width = `${safeWidth}px`;
      desktopLabel.style.minWidth = `${safeWidth}px`;
      desktopLabel.classList.remove("is-rolling");
      desktopLabel.innerHTML = "";

      const out = document.createElement("span");
      out.className = "label-word label-word--out";
      out.textContent = currentValue;
      const incoming = document.createElement("span");
      incoming.className = "label-word label-word--in";
      incoming.textContent = nextValue;
      desktopLabel.appendChild(out);
      desktopLabel.appendChild(incoming);
      desktopLabel.dataset.currentLabel = nextValue;

      void desktopLabel.offsetHeight;
      desktopLabel.classList.add("is-rolling");
      desktopLabelAnimationTimer = window.setTimeout(() => {
        applyFinalDesktopLabel();
        desktopLabelAnimationTimer = null;
      }, 260);
    }
  }

  const mobileLabel = document.querySelector("[data-page-label-mobile]");
  if (mobileLabel) {
    mobileLabel.textContent = value;
  }

  const aboutLabel = document.querySelector("[data-page-label-about]");
  if (aboutLabel) {
    aboutLabel.textContent = value;
  }
}

function stabilizeDirectorRoleWidth(roleElement) {
  if (!roleElement) {
    return;
  }

  const candidates = ["RÉALISATEUR", "MONTEUR"];
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.visibility = "hidden";
  probe.style.pointerEvents = "none";
  probe.style.whiteSpace = "nowrap";
  probe.style.font = "inherit";
  probe.style.letterSpacing = "inherit";

  roleElement.appendChild(probe);
  let maxWidth = 0;
  candidates.forEach((text) => {
    probe.textContent = text;
    maxWidth = Math.max(maxWidth, probe.getBoundingClientRect().width);
  });
  probe.remove();

  const safeWidth = Math.ceil(maxWidth);
  roleElement.style.width = `${safeWidth}px`;
  roleElement.style.minWidth = `${safeWidth}px`;
}

function setDirectorRoleText(nextRole, animate = true) {
  const role = document.querySelector("[data-director-label]");
  if (!role || !nextRole) {
    return;
  }

  stabilizeDirectorRoleWidth(role);

  const currentRole = role.dataset.currentRole || role.textContent.trim();
  if (currentRole === nextRole) {
    return;
  }

  if (directorRoleAnimationTimer) {
    clearTimeout(directorRoleAnimationTimer);
    directorRoleAnimationTimer = null;
  }

  if (!animate || !isDesktopLayout() || !currentRole) {
    role.textContent = nextRole;
    role.dataset.currentRole = nextRole;
    role.classList.remove("is-rolling");
    return;
  }

  role.classList.remove("is-rolling");
  role.innerHTML = `
    <span class="role-word role-word--out">${currentRole}</span>
    <span class="role-word role-word--in">${nextRole}</span>
  `;
  role.dataset.currentRole = nextRole;
  // Force style flush before toggling rolling class.
  void role.offsetHeight;
  role.classList.add("is-rolling");

  directorRoleAnimationTimer = window.setTimeout(() => {
    role.classList.remove("is-rolling");
    role.textContent = nextRole;
    directorRoleAnimationTimer = null;
  }, 260);
}

function applyDirectorRoleFromContext() {
  const role = document.querySelector("[data-director-label]");
  if (!role) {
    return;
  }

  if (!isDesktopLayout()) {
    setDirectorRoleText("RÉALISATEUR", false);
    return;
  }

  if (lockedDirectorRole) {
    setDirectorRoleText(lockedDirectorRole, true);
    return;
  }

  const isHoveringMontage = Boolean(document.querySelector("#montage:hover"));
  setDirectorRoleText(isHoveringMontage ? "MONTEUR" : "RÉALISATEUR", true);
}

function lockDirectorRole(nextRole) {
  lockedDirectorRole = nextRole || null;
  applyDirectorRoleFromContext();
}

function unlockDirectorRole() {
  lockedDirectorRole = null;
  applyDirectorRoleFromContext();
}

function updateRoleHoverBehavior() {
  const montageSection = document.querySelector("#montage");
  if (!montageSection) {
    return;
  }

  if (desktopChromeBound) {
    applyDirectorRoleFromContext();
    return;
  }

  desktopChromeBound = true;

  montageSection.addEventListener("mouseenter", () => {
    if (lockedDirectorRole) {
      return;
    }
    applyDirectorRoleFromContext();
  });
  montageSection.addEventListener("mouseleave", () => {
    if (lockedDirectorRole) {
      return;
    }
    applyDirectorRoleFromContext();
  });

  applyDirectorRoleFromContext();
}

function setupAboutOverlay() {
  const openButtons = [
    ...document.querySelectorAll(".desktop-chrome__about, .mobile-about-toggle"),
  ];
  const overlay = document.querySelector(".about-overlay");
  const closeButton = document.querySelector(".about-overlay__close");
  if (!openButtons.length || !overlay || !closeButton) {
    return;
  }

  const closeAbout = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("about-open");
    if (document.querySelector(".project-inline")?.classList.contains("is-open")) {
      const inlineTitle = document.querySelector(".project-inline__title")?.textContent || "";
      setDesktopPageLabel(inlineTitle.toLocaleUpperCase("fr-CA"));
    } else {
      setDesktopPageLabel("SÉLECTIONS");
    }
  };

  const openAbout = () => {
    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("about-open");
    setDesktopPageLabel("À PROPOS");
  };

  routeApis.about = { open: openAbout, close: closeAbout };

  if (aboutOverlayBound) {
    return;
  }

  aboutOverlayBound = true;

  openButtons.forEach((openButton) => {
    openButton.addEventListener("click", () => {
      if (overlay.classList.contains("is-open")) {
        navigateHome();
        return;
      }
      navigateToHash("#/a-propos");
    });
  });

  closeButton.addEventListener("click", () => navigateHome());
  overlay.querySelector(".about-overlay__backdrop")?.addEventListener("click", () => navigateHome());
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      navigateHome();
    }
  });
}

function setupProjectPages(content) {
  const overlay = document.querySelector(".project-page");
  const closeButton = document.querySelector(".project-page__close");
  const title = document.querySelector(".project-page__title");
  const video = document.querySelector(".project-page__video");
  const embed = document.querySelector(".project-page__embed");
  const externalLink = document.querySelector(".project-page__external");
  const description = document.querySelector(".project-page__description");
  const credits = document.querySelector(".project-page__credits");

  if (!overlay || !closeButton || !title || !video || !embed || !externalLink || !description || !credits) {
    return;
  }

  projectPageMap = buildProjectPageMap(content);

  const inline = document.querySelector(".project-inline");
  const inlineClose = document.querySelector(".project-inline__close");
  const inlineTitle = document.querySelector(".project-inline__title");
  const inlineVideo = document.querySelector(".project-inline__video");
  const inlineEmbed = document.querySelector(".project-inline__embed");
  const inlineExternal = document.querySelector(".project-inline__external");
  const inlineDescription = document.querySelector(".project-inline__description");
  const inlineCredits = document.querySelector(".project-inline__credits");
  const inlinePlayer = document.querySelector(".project-inline__player");
  const inlineControls = document.querySelector(".project-inline__controls");
  const inlinePlayControl = inlineControls?.querySelector("[data-player-action='play']");
  const inlineMuteControl = inlineControls?.querySelector("[data-player-action='mute']");
  const inlineFullscreenControl = inlineControls?.querySelector("[data-player-action='fullscreen']");
  const inlineProgressFill = inlineControls?.querySelector(".project-inline__progress-fill");
  let inlineCloseStateTimer = null;
  let inlineVimeoPlayer = null;
  let inlineProgressTimer = null;
  let inlinePlayerMode = "none";
  let inlineOpenRequestId = 0;
  let inlineUiState = {
    playing: false,
    muted: true,
    current: 0,
    duration: 0,
  };

  const closeInlineProject = () => {
    if (!inline || !inlineVideo || !inlineEmbed) {
      return;
    }
    inlineOpenRequestId += 1;
    inline.classList.remove("is-open");
    inline.setAttribute("aria-hidden", "true");
    inlinePlayer?.classList.remove("is-fake-fullscreen");
    inlineVideo.pause();
    inlineVideo.removeAttribute("src");
    inlineVideo.load();
    if (inlineVideo.onplay) {
      inlineVideo.onplay = null;
    }
    if (inlineVideo.onpause) {
      inlineVideo.onpause = null;
    }
    if (inlineVideo.onvolumechange) {
      inlineVideo.onvolumechange = null;
    }
    if (inlineVideo.ontimeupdate) {
      inlineVideo.ontimeupdate = null;
    }
    if (inlineVideo.onloadedmetadata) {
      inlineVideo.onloadedmetadata = null;
    }
    if (inlineVideo.onended) {
      inlineVideo.onended = null;
    }
    inlineEmbed.removeAttribute("src");
    inlineEmbed.style.display = "none";
    const playerToDispose = inlineVimeoPlayer;
    inlineVimeoPlayer = null;
    if (playerToDispose) {
      if (typeof playerToDispose.unload === "function") {
        playerToDispose.unload().catch(() => {});
      } else if (typeof playerToDispose.destroy === "function") {
        playerToDispose.destroy().catch(() => {});
      }
    }
    inlinePlayerMode = "none";
    if (inlineProgressTimer) {
      clearInterval(inlineProgressTimer);
      inlineProgressTimer = null;
    }
    if (inlineControls) {
      inlineControls.classList.add("is-hidden");
    }
    if (inlineProgressFill) {
      inlineProgressFill.style.width = "0%";
    }
    if (inlineCloseStateTimer) {
      clearTimeout(inlineCloseStateTimer);
      inlineCloseStateTimer = null;
    }
    inlineCloseStateTimer = window.setTimeout(() => {
      document.body.classList.remove("project-inline-open");
      inlineCloseStateTimer = null;
    }, 280);
    document.dispatchEvent(new CustomEvent("project-preview-unlock"));
    unlockDirectorRole();
    if (document.body.classList.contains("about-open")) {
      setDesktopPageLabel("À PROPOS");
    } else {
      setDesktopPageLabel("SÉLECTIONS");
    }
  };

  const disposeInlineVimeoPlayer = async () => {
    const playerToDispose = inlineVimeoPlayer;
    inlineVimeoPlayer = null;
    if (!playerToDispose) {
      return;
    }

    try {
      if (typeof playerToDispose.unload === "function") {
        await playerToDispose.unload();
      } else if (typeof playerToDispose.destroy === "function") {
        await playerToDispose.destroy();
      }
    } catch (error) {
      // no-op
    }
  };

  const updateInlineControls = ({ playing, muted, current, duration } = {}) => {
    if (!inlinePlayControl || !inlineMuteControl || !inlineProgressFill) {
      return;
    }

    if (typeof playing === "boolean") {
      inlineUiState.playing = playing;
    }
    if (typeof muted === "boolean") {
      inlineUiState.muted = muted;
    }
    if (typeof current === "number" && Number.isFinite(current)) {
      inlineUiState.current = current;
    }
    if (typeof duration === "number" && Number.isFinite(duration)) {
      inlineUiState.duration = duration;
    }

    inlinePlayControl.textContent = inlineUiState.playing ? "Pause" : "Jouer";
    if (inlineMuteControl) {
      inlineMuteControl.classList.toggle("is-muted", inlineUiState.muted);
      inlineMuteControl.setAttribute(
        "aria-label",
        inlineUiState.muted ? "Activer le son" : "Desactiver le son",
      );
      inlineMuteControl.title = inlineUiState.muted ? "Activer le son" : "Desactiver le son";
    }

    const safeDuration = Number(inlineUiState.duration) || 0;
    const safeCurrent = Number(inlineUiState.current) || 0;
    const progress = safeDuration > 0 ? Math.max(0, Math.min(100, (safeCurrent / safeDuration) * 100)) : 0;
    inlineProgressFill.style.width = `${progress}%`;
  };

  const beginInlineProgressLoop = (getState) => {
    if (!inlineControls) {
      return;
    }
    if (inlineProgressTimer) {
      clearInterval(inlineProgressTimer);
    }
    inlineProgressTimer = window.setInterval(() => {
      getState()
        .then((state) => updateInlineControls(state))
        .catch(() => {});
    }, 250);
  };

  const setupInlineNativeVideoControls = () => {
    if (inlineProgressTimer) {
      clearInterval(inlineProgressTimer);
      inlineProgressTimer = null;
    }
    inlinePlayerMode = "video";
    if (inlineControls) {
      inlineControls.classList.remove("is-hidden");
    }

    const sync = () =>
      updateInlineControls({
        playing: !inlineVideo.paused && !inlineVideo.ended,
        muted: inlineVideo.muted || inlineVideo.volume === 0,
        current: inlineVideo.currentTime || 0,
        duration: inlineVideo.duration || 0,
      });

    inlineVideo.onplay = sync;
    inlineVideo.onpause = sync;
    inlineVideo.onvolumechange = sync;
    inlineVideo.ontimeupdate = sync;
    inlineVideo.onloadedmetadata = sync;
    inlineVideo.onended = sync;
    sync();
  };

  const setupInlineVimeoControls = () => {
    if (!window.Vimeo || typeof window.Vimeo.Player !== "function") {
      if (inlineControls) {
        inlineControls.classList.add("is-hidden");
      }
      return;
    }

    if (inlineProgressTimer) {
      clearInterval(inlineProgressTimer);
      inlineProgressTimer = null;
    }
    inlinePlayerMode = "vimeo";
    if (inlineControls) {
      inlineControls.classList.remove("is-hidden");
    }

    try {
      inlineVimeoPlayer = new window.Vimeo.Player(inlineEmbed);
    } catch (error) {
      inlineVimeoPlayer = null;
      if (inlineControls) {
        inlineControls.classList.add("is-hidden");
      }
      return;
    }
    const sync = () =>
      Promise.all([
        inlineVimeoPlayer.getPaused(),
        inlineVimeoPlayer.getMuted(),
        inlineVimeoPlayer.getCurrentTime(),
        inlineVimeoPlayer.getDuration(),
      ]).then(([paused, muted, current, duration]) => ({
        playing: !paused,
        muted,
        current,
        duration,
      }));

    inlineVimeoPlayer.on("play", () => {
      sync().then(updateInlineControls).catch(() => {});
    });
    inlineVimeoPlayer.on("pause", () => {
      sync().then(updateInlineControls).catch(() => {});
    });
    inlineVimeoPlayer.on("timeupdate", (event) => {
      updateInlineControls({
        playing: true,
        current: event?.seconds || 0,
        duration: event?.duration || 0,
      });
    });
    inlineVimeoPlayer.on("volumechange", (event) => {
      updateInlineControls({
        playing: true,
        muted: event?.muted ?? false,
      });
    });

    beginInlineProgressLoop(sync);
    sync().then(updateInlineControls).catch(() => {});
  };

  const exitFakeFullscreen = () => {
    inlinePlayer?.classList.remove("is-fake-fullscreen");
  };

  const enterFallbackFullscreen = () => {
    if (inlinePlayerMode === "video" && typeof inlineVideo.webkitEnterFullscreen === "function") {
      // iPhone: only native <video> fullscreen exists.
      try {
        inlineVideo.webkitEnterFullscreen();
        return;
      } catch (error) {
        // fall through to the CSS fallback
      }
    }
    // CSS fallback (e.g. iPhone + Vimeo, where no fullscreen API is available).
    inlinePlayer?.classList.add("is-fake-fullscreen");
  };

  const requestInlineFullscreen = () => {
    const currentFullscreen = document.fullscreenElement || document.webkitFullscreenElement;
    if (currentFullscreen) {
      const exit = document.exitFullscreen || document.webkitExitFullscreen;
      exit?.call(document)?.catch?.(() => {});
      return;
    }

    if (inlinePlayer?.classList.contains("is-fake-fullscreen")) {
      exitFakeFullscreen();
      return;
    }

    // Fullscreen the player wrapper synchronously from this click so the
    // user-activation requirement is met in THIS document. Asking the Vimeo
    // iframe to do it fails: the click's activation does not propagate into
    // cross-origin frames, so the browser rejects the request.
    const target = inlinePlayer || inlineVideo;
    if (target && typeof target.requestFullscreen === "function") {
      target.requestFullscreen().catch(() => {
        enterFallbackFullscreen();
      });
      return;
    }
    if (target && typeof target.webkitRequestFullscreen === "function") {
      target.webkitRequestFullscreen();
      return;
    }
    enterFallbackFullscreen();
  };

  const openInlineProject = async (projectTitle, roleToLock) => {
    if (!inline || !inlineTitle || !inlineVideo || !inlineEmbed || !inlineExternal || !inlineDescription || !inlineCredits) {
      return;
    }

    const project = projectPageMap.get(projectTitle);
    if (!project) {
      return;
    }

    const requestId = inlineOpenRequestId + 1;
    inlineOpenRequestId = requestId;

    await disposeInlineVimeoPlayer();
    if (requestId !== inlineOpenRequestId) {
      return;
    }
    if (inlineProgressTimer) {
      clearInterval(inlineProgressTimer);
      inlineProgressTimer = null;
    }
    inlinePlayerMode = "none";
    inlineUiState = {
      playing: false,
      muted: true,
      current: 0,
      duration: 0,
    };

    inlineTitle.textContent = project.title;
    inlineDescription.textContent = project.description || "";
    inlineCredits.innerHTML = formatCreditsHtml(resolveProjectCreditsText(project));
    inlineExternal.style.display = "none";
    inlineExternal.removeAttribute("href");
    inlineExternal.textContent = "";
    inlineEmbed.removeAttribute("src");
    inlineEmbed.style.display = "none";

    if (project.presentationVideo) {
      const embedUrl = await resolvePresentationEmbedUrl(project.presentationVideo);
      if (requestId !== inlineOpenRequestId) {
        return;
      }
      if (embedUrl) {
        inlineVideo.pause();
        inlineVideo.removeAttribute("src");
        inlineVideo.load();
        inlineVideo.style.display = "none";
        inlineEmbed.src = embedUrl;
        inlineEmbed.style.display = "block";
        if (isVimeoEmbedUrl(embedUrl)) {
          setupInlineVimeoControls();
        } else if (inlineControls) {
          inlineControls.classList.add("is-hidden");
        }
      } else {
        const safePresentationLink = sanitizeExternalUrl(project.presentationVideo);
        if (!safePresentationLink) {
          inlineVideo.pause();
          inlineVideo.removeAttribute("src");
          inlineVideo.load();
          inlineVideo.style.display = "none";
          inlineExternal.style.display = "none";
          inlineExternal.removeAttribute("href");
          inlineExternal.textContent = "";
          if (inlineControls) {
            inlineControls.classList.add("is-hidden");
          }
        } else {
          inlineVideo.pause();
          inlineVideo.removeAttribute("src");
          inlineVideo.load();
          inlineVideo.style.display = "none";
          inlineExternal.href = safePresentationLink;
          inlineExternal.textContent = "Voir la video de presentation";
          inlineExternal.style.display = "inline-block";
          if (inlineControls) {
            inlineControls.classList.add("is-hidden");
          }
        }
      }
    } else {
      inlineVideo.pause();
      inlineVideo.removeAttribute("src");
      inlineVideo.load();
      inlineVideo.style.display = "none";
      inlineEmbed.removeAttribute("src");
      inlineEmbed.style.display = "none";
      if (inlineControls) {
        inlineControls.classList.add("is-hidden");
      }
    }

    if (requestId !== inlineOpenRequestId) {
      return;
    }
    inline.classList.add("is-open");
    inline.setAttribute("aria-hidden", "false");
    if (inlineCloseStateTimer) {
      clearTimeout(inlineCloseStateTimer);
      inlineCloseStateTimer = null;
    }
    document.body.classList.add("project-inline-open");
    inline.scrollTop = 0;
    lockDirectorRole(roleToLock);
    setDesktopPageLabel((project.title || "").toLocaleUpperCase("fr-CA"));
  };

  const closeProjectPage = () => {
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("project-page-open");
    video.pause();
    video.removeAttribute("src");
    video.load();
    embed.removeAttribute("src");
    embed.style.display = "none";
    document.dispatchEvent(new CustomEvent("project-preview-unlock"));
    document.dispatchEvent(new CustomEvent("project-page-closed"));
  };

  const openProjectPage = async (projectTitle) => {
    const project = projectPageMap.get(projectTitle);
    if (!project) {
      return;
    }

    title.textContent = project.title;
    description.textContent = project.description || "";
    credits.innerHTML = formatCreditsHtml(resolveProjectCreditsText(project));
    externalLink.style.display = "none";
    externalLink.removeAttribute("href");
    externalLink.textContent = "";
    embed.removeAttribute("src");
    embed.style.display = "none";

    if (project.presentationVideo) {
      const embedUrl = await resolvePresentationEmbedUrl(project.presentationVideo);
      if (embedUrl) {
        video.pause();
        video.removeAttribute("src");
        video.load();
        video.style.display = "none";
        embed.src = embedUrl;
        embed.style.display = "block";
      } else {
        const safePresentationLink = sanitizeExternalUrl(project.presentationVideo);
        if (!safePresentationLink) {
          video.pause();
          video.removeAttribute("src");
          video.load();
          video.style.display = "none";
          externalLink.style.display = "none";
          externalLink.removeAttribute("href");
          externalLink.textContent = "";
        } else {
          video.pause();
          video.removeAttribute("src");
          video.load();
          video.style.display = "none";
          externalLink.href = safePresentationLink;
          externalLink.textContent = "Voir la video de presentation";
          externalLink.style.display = "inline-block";
        }
      }
    } else {
      video.pause();
      video.removeAttribute("src");
      video.load();
      video.style.display = "none";
      embed.removeAttribute("src");
      embed.style.display = "none";
    }

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("project-page-open");
  };

  routeApis.project = { open: openInlineProject, close: closeInlineProject };

  if (projectPageBound) {
    return;
  }

  projectPageBound = true;

  document.addEventListener("click", (event) => {
    const trigger = event.target.closest(".title-list__item[data-project-overlay='true']");
    if (trigger) {
      event.preventDefault();
      const projectTitle = trigger.textContent.trim();
      navigateToHash(`#/projet/${slugifyTitle(projectTitle)}`);
      return;
    }

    if (event.target.closest(".project-page__close") || event.target.classList.contains("project-page__backdrop")) {
      closeProjectPage();
    }

    if (
      isDesktopLayout() &&
      inline?.classList.contains("is-open") &&
      !event.target.closest(".project-inline")
    ) {
      navigateHome();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      closeProjectPage();
    }
    if (event.key === "Escape" && inline?.classList.contains("is-open")) {
      const fakeFullscreenPlayer = document.querySelector(".project-inline__player.is-fake-fullscreen");
      if (fakeFullscreenPlayer) {
        fakeFullscreenPlayer.classList.remove("is-fake-fullscreen");
        return;
      }
      navigateHome();
    }
  });

  closeButton.addEventListener("click", closeProjectPage);
  if (!projectInlineBound && inlineClose) {
    projectInlineBound = true;
    inlineClose.addEventListener("click", () => navigateHome());
    // Both buttons update the icon immediately from the UI's own tracked
    // state, then fire the Vimeo API call in the background. Waiting on the
    // postMessage round-trip before updating the icon is what made the
    // button look "stuck" whenever that round-trip was slow or never
    // resolved (flaky network, blocked embed, ad/privacy blocker).
    inlinePlayControl?.addEventListener("click", () => {
      if (inlinePlayerMode === "video") {
        if (inlineVideo.paused || inlineVideo.ended) {
          inlineVideo.play().catch(() => {});
        } else {
          inlineVideo.pause();
        }
        return;
      }

      if (inlinePlayerMode === "vimeo" && inlineVimeoPlayer) {
        const nextPlaying = !inlineUiState.playing;
        updateInlineControls({ playing: nextPlaying });
        (nextPlaying ? inlineVimeoPlayer.play() : inlineVimeoPlayer.pause()).catch(() => {});
      }
    });

    inlineMuteControl?.addEventListener("click", () => {
      if (inlinePlayerMode === "video") {
        inlineVideo.muted = !inlineVideo.muted;
        updateInlineControls({
          playing: !inlineVideo.paused && !inlineVideo.ended,
          muted: inlineVideo.muted || inlineVideo.volume === 0,
          current: inlineVideo.currentTime || 0,
          duration: inlineVideo.duration || 0,
        });
        return;
      }

      if (inlinePlayerMode === "vimeo" && inlineVimeoPlayer) {
        const nextMuted = !inlineUiState.muted;
        updateInlineControls({ muted: nextMuted });
        inlineVimeoPlayer.setMuted(nextMuted).catch(() => {});
      }
    });

    inlineFullscreenControl?.addEventListener("click", requestInlineFullscreen);
  }
}

function setupBackToTopButton() {
  const button = document.querySelector(".back-to-top");
  if (!button) {
    return;
  }

  const showThreshold = 220;
  const syncVisibility = () => {
    const shouldShow = window.scrollY > showThreshold;
    button.classList.toggle("is-visible", shouldShow);
  };

  if (!backToTopBound) {
    button.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
    window.addEventListener("scroll", syncVisibility, { passive: true });
    backToTopBound = true;
  }

  syncVisibility();
}

function setupDesktopHomeReset() {
  const homeButton = document.querySelector(".desktop-chrome__name");
  if (!homeButton || desktopHomeBound) {
    return;
  }

  desktopHomeBound = true;
  homeButton.addEventListener("click", () => {
    if (!isDesktopLayout()) {
      return;
    }

    if (document.body.classList.contains("about-open")) {
      document.querySelector(".desktop-chrome__about")?.click();
    }
    if (document.querySelector(".project-inline")?.classList.contains("is-open")) {
      document.querySelector(".project-inline__close")?.click();
    }
    if (document.querySelector(".project-page")?.classList.contains("is-open")) {
      document.querySelector(".project-page__close")?.click();
    }

    document.dispatchEvent(new CustomEvent("project-preview-intro"));
    window.scrollTo({ top: 0, behavior: "smooth" });
    setDesktopPageLabel("SÉLECTIONS");
  });
}

function setupAdminEntryVisibility() {
  const adminEntry = document.querySelector(".admin-entry--floating");
  if (!adminEntry) {
    return;
  }

  const host = window.location.hostname;
  const isLocal =
    host === "localhost" ||
    host === "127.0.0.1" ||
    host === "::1" ||
    host === "";
  const hasAdminOverride = new URLSearchParams(window.location.search).get("admin") === "1";

  if (!isLocal && !hasAdminOverride) {
    adminEntry.style.display = "none";
  }
}

// --- Hash router -----------------------------------------------------------
// Routes: "" (home) | #/a-propos | #/projet/<slug>. Overlays are opened and
// closed exclusively through the URL so deep links and the browser back
// button behave as expected (especially on mobile).

function currentRoute() {
  const hash = String(window.location.hash || "");
  const projectMatch = hash.match(/^#\/projet\/(.+)$/);
  if (projectMatch) {
    let slug = projectMatch[1];
    try {
      slug = decodeURIComponent(slug);
    } catch (error) {
      // keep the raw slug
    }
    return { type: "project", slug };
  }
  if (hash === "#/a-propos") {
    return { type: "about" };
  }
  return { type: "home" };
}

function findProjectTitleBySlug(slug) {
  for (const title of projectPageMap.keys()) {
    if (slugifyTitle(title) === slug) {
      return title;
    }
  }
  return "";
}

function applyRoute() {
  const route = currentRoute();
  const aboutOpen = document.body.classList.contains("about-open");
  const inlineOpen = Boolean(
    document.querySelector(".project-inline")?.classList.contains("is-open"),
  );

  if (route.type === "about") {
    if (inlineOpen) {
      routeApis.project?.close();
    }
    if (!aboutOpen) {
      routeApis.about?.open();
    }
    return;
  }

  if (route.type === "project") {
    const projectTitle = findProjectTitleBySlug(route.slug);
    const project = projectTitle ? projectPageMap.get(projectTitle) : null;
    if (!project) {
      if (aboutOpen) {
        routeApis.about?.close();
      }
      routeApis.project?.close();
      return;
    }

    if (aboutOpen) {
      routeApis.about?.close();
    }
    const openTitle = document.querySelector(".project-inline__title")?.textContent || "";
    if (!inlineOpen || openTitle !== projectTitle) {
      document.dispatchEvent(
        new CustomEvent("project-preview-lock", {
          detail: { src: project.previewMedia || "" },
        }),
      );
      routeApis.project?.open(
        projectTitle,
        project.section === "editing" ? "MONTEUR" : "RÉALISATEUR",
      );
    }
    return;
  }

  if (aboutOpen) {
    routeApis.about?.close();
  }
  // Close unconditionally: an open may still be in flight when the user
  // navigates back, and closing is idempotent.
  routeApis.project?.close();
}

function navigateToHash(hash) {
  if (window.location.hash === hash) {
    applyRoute();
    return;
  }
  history.pushState(null, "", hash);
  applyRoute();
}

function navigateHome() {
  // Never rely on history.back() to close: embedded players (Vimeo) push
  // their own entries into the joint session history, which would swallow
  // the back() and leave the overlay stuck open. Rewrite the URL in place
  // and close synchronously instead.
  if (currentRoute().type !== "home") {
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }
  applyRoute();
}

function setupRouter() {
  if (routerBound) {
    return;
  }
  routerBound = true;
  window.addEventListener("popstate", () => applyRoute());
  applyRoute();
}

function renderSite() {
  const content = loadSiteContent();
  applyTypography(content);
  renderTextFields(content);
  renderTitleList('[data-list="directing.items"]', content.directing.items);
  renderTitleList('[data-list="editing.items"]', content.editing.items);
  renderTitleList('[data-list="awards.items"]', content.awards.items);
  renderTitleList('[data-list="studies.items"]', content.studies.items);
  renderTitleList('[data-list="collaborators.items"]', content.collaborators.items);
  enhanceProjectMentions(content);
  enhanceBioNameMention();
  setupProjectPreview();
  setupProjectPages(content);
  setupAboutOverlay();
  updateRoleHoverBehavior();
  setupBackToTopButton();
  setupDesktopHomeReset();
  setupAdminEntryVisibility();
  if (document.body.classList.contains("about-open")) {
    setDesktopPageLabel("À PROPOS");
  } else if (document.querySelector(".project-inline")?.classList.contains("is-open")) {
    const inlineTitle = document.querySelector(".project-inline__title")?.textContent || "";
    setDesktopPageLabel(inlineTitle.toLocaleUpperCase("fr-CA"));
  } else {
    setDesktopPageLabel("SÉLECTIONS");
  }
}

renderSite();
setupRouter();

window.addEventListener("storage", (event) => {
  if (event.key !== CMS_STORAGE_KEY) {
    return;
  }

  renderSite();
});

window.addEventListener("cms:content-updated", () => {
  renderSite();
});
