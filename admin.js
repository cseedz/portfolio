function getValueByPath(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function setValueByPath(object, path, nextValue) {
  const keys = path.split(".");
  const lastKey = keys.pop();
  const target = keys.reduce((value, key) => value[key], object);
  target[lastKey] = nextValue;
}

function localDeepClone(value) {
  return JSON.parse(JSON.stringify(value));
}

function getPrimaryStorageKey() {
  return typeof window.CMS_STORAGE_KEY === "string"
    ? window.CMS_STORAGE_KEY
    : "charles-portfolio-content";
}

function getCompatStorageKeys() {
  const fromContent = Array.isArray(window.CMS_COMPAT_KEYS) ? window.CMS_COMPAT_KEYS : [];
  return [...new Set([getPrimaryStorageKey(), ...fromContent, "charles-portfolio-content-clean-v1"])];
}

const ADMIN_FALLBACK_CONTENT = {
  typography: {
    bodySize: "12",
    titleSize: "24",
    sectionTitleSize: "14",
    footerSize: "11",
    locationSize: "10",
    kickerSize: "10",
    bodyWeight: "regular",
    kickerWeight: "regular",
    sectionTitleWeight: "regular",
    heroTitleWeight: "regular",
    workTitleWeight: "regular",
    footerWeight: "regular",
  },
  sidebar: {
    email: "",
    agentEmail: "",
    location: "",
    instagram: "",
    letterboxd: "",
  },
  hero: {
    text: "",
  },
  directing: {
    label: "Realisation",
    items: [],
  },
  editing: {
    label: "Montage",
    items: [],
  },
  awards: {
    label: "Prix et distinctions",
    items: [],
  },
  studies: {
    label: "Etudes",
    items: [],
  },
  collaborators: {
    label: "Collaborateurs-ices & amis-es",
    items: [],
  },
  imdbExclusions: {
    directing: [],
    editing: [],
  },
};

function getDefaultContentSafe() {
  if (typeof window.DEFAULT_SITE_CONTENT !== "undefined") {
    return localDeepClone(window.DEFAULT_SITE_CONTENT);
  }

  return localDeepClone(ADMIN_FALLBACK_CONTENT);
}

function loadSiteContentSafe() {
  if (typeof window.loadSiteContent === "function") {
    return window.loadSiteContent();
  }

  try {
    const raw = localStorage.getItem(getPrimaryStorageKey());
    if (!raw) {
      return getDefaultContentSafe();
    }
    return {
      ...getDefaultContentSafe(),
      ...JSON.parse(raw),
    };
  } catch (error) {
    return getDefaultContentSafe();
  }
}

function saveSiteContentSafe(content) {
  if (typeof window.saveSiteContent === "function") {
    window.saveSiteContent(content);
    return;
  }

  getCompatStorageKeys().forEach((key) => {
    localStorage.setItem(key, JSON.stringify(content));
  });
}

function serializeLines(items) {
  return items.join("\n");
}

function serializeProjects(items) {
  return (items || [])
    .map((item) => {
      if (item?.break) {
        return "";
      }

      const title = item.title || "";
      const video = item.video || "";
      return video ? `${title} | ${video}` : title;
    })
    .join("\n");
}

function parseLines(value) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function parseProjects(value) {
  return value
    .split("\n")
    .map((line) => {
      if (!line.trim()) {
        return { title: "", video: "", break: true };
      }

      const [title = "", video = ""] = line.split("|").map((part) => part.trim());
      return { title, video };
    });
}

const DEFAULT_PROJECT_CREDIT_ROLES = [
  "PRODUCTION",
  "SCÉNARIO",
  "ASSISTANTE RÉALISATRICE",
  "DIRECTION PHOTO",
  "PREMIER ASSISTANT-CAMÉRA",
  "DIRECTION ARTISTIQUE",
  "COSTUMES",
  "MAQUILLAGE",
  "CHEF ÉLECTRO",
  "CHEF MACHINO",
  "RÉGIE",
  "MONTAGE",
  "PRISE DE SON",
  "ÉTALONNAGE",
  "MIX & DESIGN SONORE",
  "FOURNISSEURS",
];

function buildDefaultCreditRoleEntries() {
  return DEFAULT_PROJECT_CREDIT_ROLES.map((role) => ({ role, names: "" }));
}

function normalizeCreditRoleLabel(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function parseCreditsToRoleEntries(value) {
  const blocks = String(value || "")
    .replace(/\s-\s/g, " — ")
    .split("—")
    .map((block) => block.trim())
    .filter(Boolean);

  return blocks
    .map((block) => {
      const firstDot = block.indexOf(".");
      if (firstDot === -1) {
        return { role: normalizeCreditRoleLabel(block), names: "" };
      }

      return {
        role: normalizeCreditRoleLabel(block.slice(0, firstDot)),
        names: block
          .slice(firstDot + 1)
          .replace(/\.$/, "")
          .replace(/\.\s+/g, ", ")
          .replace(/\s+/g, " ")
          .trim(),
      };
    })
    .filter((entry) => entry.role || entry.names);
}

function normalizeCreditRoles(creditRoles, creditsText) {
  if (Array.isArray(creditRoles)) {
    const normalized = creditRoles
      .map((entry) => ({
        role: normalizeCreditRoleLabel(entry?.role),
        names: String(entry?.names || "").trim(),
      }))
      .filter((entry) => entry.role || entry.names);

    if (normalized.length) {
      return normalized;
    }
  }

  if (creditRoles && typeof creditRoles === "object") {
    const keys = Object.keys(creditRoles);
    if (keys.length > 80 && keys.every((key) => /^\d+$/.test(key))) {
      const parsed = parseCreditsToRoleEntries(creditsText);
      if (parsed.length) {
        return parsed;
      }
    }

    const normalized = Object.entries(creditRoles)
      .map(([role, names]) => ({
        role: normalizeCreditRoleLabel(role),
        names: String(names || "").trim(),
      }))
      .filter((entry) => entry.role || entry.names);

    if (normalized.length) {
      return normalized;
    }
  }

  const parsed = parseCreditsToRoleEntries(creditsText);
  if (parsed.length) {
    return parsed;
  }

  return [];
}

function buildCreditsFromRoleEntries(entries) {
  return (entries || [])
    .map((entry) => ({
      role: normalizeCreditRoleLabel(entry?.role),
      names: String(entry?.names || "").trim(),
    }))
    .filter((entry) => entry.role && entry.names)
    .map((entry) => `${entry.role}. ${entry.names}.`)
    .join(" — ");
}

function setProjectHiddenState(row, hidden) {
  const hiddenField = row.querySelector('[data-project-item-field="hidden"]');
  const visibilityButton = row.querySelector("[data-project-visibility-toggle]");
  if (!hiddenField || !visibilityButton) {
    return;
  }

  const isHidden = Boolean(hidden);
  hiddenField.value = isHidden ? "true" : "false";
  visibilityButton.setAttribute("aria-pressed", isHidden ? "true" : "false");
  visibilityButton.setAttribute("aria-label", isHidden ? "Afficher ce projet" : "Masquer ce projet");
  visibilityButton.setAttribute("title", isHidden ? "Afficher" : "Masquer");
}

function createCreditRoleRow(entry = { role: "", names: "" }) {
  const roleRow = document.createElement("div");
  roleRow.className = "admin-credit-role-row";
  roleRow.innerHTML = `
    <input data-project-credit-role-name type="text" placeholder="Role (ex. Production)" />
    <textarea data-project-credit-role-names rows="2" placeholder="Noms (separes par des virgules)"></textarea>
    <button type="button" class="admin-credit-role-row__remove" data-project-credit-remove aria-label="Supprimer ce role" title="Supprimer ce role">×</button>
  `;

  roleRow.querySelector("[data-project-credit-role-name]").value = normalizeCreditRoleLabel(entry.role);
  roleRow.querySelector("[data-project-credit-role-names]").value = String(entry.names || "").trim();
  return roleRow;
}

function createProjectRow(
  item = {
    title: "",
    backgroundVideo: "",
    description: "",
    credits: "",
    creditRoles: [],
    presentationVideo: "",
  }
) {
  const row = document.createElement("article");
  row.className = "admin-project-row";
  const isInitiallyCollapsed = true;
  row.innerHTML = `
    <header class="admin-project-row__header">
      <div class="admin-project-row__title-wrap">
        <button type="button" class="admin-project-row__drag" data-project-drag-handle draggable="true" aria-label="Reordonner" title="Reordonner">
          <span class="admin-project-row__drag-dots" aria-hidden="true"></span>
        </button>
        <strong class="admin-project-row__title"></strong>
      </div>
      <div class="admin-project-row__header-actions">
        <button
          type="button"
          class="admin-project-row__visibility"
          data-project-visibility-toggle
          aria-pressed="false"
          aria-label="Masquer ce projet"
          title="Masquer"
        >
          <svg class="icon-eye" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" fill="none" stroke="currentColor" stroke-width="1.6"></path>
            <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"></circle>
          </svg>
          <svg class="icon-eye-off" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M2 12s3.5-6 10-6c2.4 0 4.4.8 6 1.9M22 12s-3.5 6-10 6c-2.4 0-4.4-.8-6-1.9" fill="none" stroke="currentColor" stroke-width="1.6"></path>
            <circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.6"></circle>
            <path d="m4 4 16 16" fill="none" stroke="currentColor" stroke-width="1.6"></path>
          </svg>
        </button>
        <input data-project-item-field="hidden" type="hidden" value="false" />
        <button
          type="button"
          class="admin-project-row__delete"
          data-project-item-remove
          aria-label="Supprimer ce projet"
          title="Supprimer"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" focusable="false">
            <path d="M4 7h16" fill="none" stroke="currentColor" stroke-width="1.6"></path>
            <path d="M9 7V5h6v2" fill="none" stroke="currentColor" stroke-width="1.6"></path>
            <path d="M7 7l1 12h8l1-12" fill="none" stroke="currentColor" stroke-width="1.6"></path>
            <path d="M10 10v6M14 10v6" fill="none" stroke="currentColor" stroke-width="1.6"></path>
          </svg>
        </button>
        <button type="button" class="admin-project-row__collapse" data-project-collapse-toggle aria-expanded="${isInitiallyCollapsed ? "false" : "true"}">${isInitiallyCollapsed ? "Ouvrir" : "Fermer"}</button>
      </div>
    </header>
    <div class="admin-project-row__body ${isInitiallyCollapsed ? "is-collapsed" : ""}" data-project-row-body>
      <label>
        Titre
        <input data-project-item-field="title" type="text" />
      </label>
      <label>
        Background video
        <input data-project-item-field="backgroundVideo" type="text" />
      </label>
      <label>
        Description
        <textarea data-project-item-field="description" rows="3"></textarea>
      </label>
      <div class="admin-credits">
        <p class="admin-credits__label">Credits (roles + noms)</p>
        <div class="admin-credits__grid" data-project-credits-grid></div>
        <button type="button" class="admin-credits__add" data-project-credit-add>+ Ajouter un role</button>
      </div>
      <label>
        Video de presentation (URL ou lien)
        <input data-project-item-field="presentationVideo" type="text" />
      </label>
    </div>
  `;

  row.querySelector('[data-project-item-field="title"]').value = item.title || "";
  row.querySelector('[data-project-item-field="backgroundVideo"]').value = item.backgroundVideo || item.video || "";
  row.querySelector('[data-project-item-field="description"]').value = item.description || "";
  const normalizedCreditRoles = normalizeCreditRoles(item.creditRoles, item.credits || "");
  const creditRolesToRender = normalizedCreditRoles.length
    ? normalizedCreditRoles
    : buildDefaultCreditRoleEntries();
  const creditsGrid = row.querySelector("[data-project-credits-grid]");
  creditRolesToRender.forEach((entry) => {
    creditsGrid.appendChild(createCreditRoleRow(entry));
  });
  row.querySelector('[data-project-item-field="presentationVideo"]').value = item.presentationVideo || "";
  setProjectHiddenState(row, Boolean(item.hidden));
  const updateRowTitle = () => {
    const titleValue = row.querySelector('[data-project-item-field="title"]').value.trim();
    row.querySelector(".admin-project-row__title").textContent = titleValue || "Nouveau projet";
  };
  row.querySelector('[data-project-item-field="title"]').addEventListener("input", updateRowTitle);
  updateRowTitle();
  return row;
}

function getDragAfterElement(container, y) {
  const rows = [...container.querySelectorAll(".admin-project-row:not(.is-dragging)")];
  let closest = null;
  let closestOffset = Number.NEGATIVE_INFINITY;

  rows.forEach((row) => {
    const box = row.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closestOffset) {
      closestOffset = offset;
      closest = row;
    }
  });

  return closest;
}

function renderProjectListEditor(container, items) {
  container.innerHTML = "";

  (items || [])
    .filter((item) => !item?.break)
    .forEach((item) => {
      container.appendChild(createProjectRow(item));
    });
}

function readProjectListEditor(container) {
  return [...container.querySelectorAll(".admin-project-row")]
    .map((row) => {
      const creditRoles = [...row.querySelectorAll(".admin-credit-role-row")]
        .map((roleRow) => ({
          role: normalizeCreditRoleLabel(
            roleRow.querySelector("[data-project-credit-role-name]")?.value || ""
          ),
          names: String(
            roleRow.querySelector("[data-project-credit-role-names]")?.value || ""
          ).trim(),
        }))
        .filter((entry) => entry.role || entry.names);

      return {
        title: row.querySelector('[data-project-item-field="title"]').value.trim(),
        backgroundVideo: row.querySelector('[data-project-item-field="backgroundVideo"]').value.trim(),
        description: row.querySelector('[data-project-item-field="description"]').value.trim(),
        credits: buildCreditsFromRoleEntries(creditRoles),
        creditRoles,
        presentationVideo: row.querySelector('[data-project-item-field="presentationVideo"]').value.trim(),
        hidden: row.querySelector('[data-project-item-field="hidden"]').value === "true",
      };
    })
    .filter((item) => item.title || item.backgroundVideo || item.description || item.credits || item.presentationVideo);
}

function formatFieldValue(value, format) {
  if (format === "projects") {
    return serializeProjects(value);
  }

  if (format === "lines") {
    return serializeLines(value);
  }

  return value ?? "";
}

function parseFieldValue(value, format) {
  if (format === "projects") {
    return parseProjects(value);
  }

  if (format === "lines") {
    return parseLines(value);
  }

  return value;
}

function normalizeFieldValue(field, value) {
  if (field.type === "number") {
    return value === "" ? "" : String(Number(value));
  }

  return value;
}

const form = document.querySelector("#cms-form");
const status = document.querySelector("#save-status");
const resetButton = document.querySelector("#reset-content");
const saveButton = document.querySelector("#save-content");
const loginPanel = document.querySelector("#admin-login");
const loginUsername = document.querySelector("#login-username");
const loginPassword = document.querySelector("#login-password");
const loginSubmit = document.querySelector("#login-submit");
const loginStatus = document.querySelector("#login-status");
const logoutAdminButton = document.querySelector("#logout-admin");
const directingEditor = document.querySelector("#directing-editor");
const editingEditor = document.querySelector("#editing-editor");
const addDirectingProjectButton = document.querySelector("#add-directing-project");
const addEditingProjectButton = document.querySelector("#add-editing-project");
const navLinks = [...document.querySelectorAll('.admin-nav a[href^="#"]')];
const projectTabs = [...document.querySelectorAll(".admin-tab")];
const projectPanels = [...document.querySelectorAll(".admin-tab-panel")];
const CMS_AUTH_TOKEN_STORAGE = "charles-portfolio-cms-auth-token";
const CMS_AUTH_USER_STORAGE = "charles-portfolio-cms-auth-user";

function getStoredAuthToken() {
  try {
    return String(sessionStorage.getItem(CMS_AUTH_TOKEN_STORAGE) || "");
  } catch (error) {
    return "";
  }
}

function setAuthToken(nextToken) {
  const value = String(nextToken || "").trim();
  window.CMS_AUTH_TOKEN = value;
  try {
    if (value) {
      sessionStorage.setItem(CMS_AUTH_TOKEN_STORAGE, value);
    } else {
      sessionStorage.removeItem(CMS_AUTH_TOKEN_STORAGE);
    }
  } catch (error) {
    // no-op
  }
}

function setAuthUser(nextUser) {
  const value = String(nextUser || "").trim();
  try {
    if (value) {
      sessionStorage.setItem(CMS_AUTH_USER_STORAGE, value);
    } else {
      sessionStorage.removeItem(CMS_AUTH_USER_STORAGE);
    }
  } catch (error) {
    // no-op
  }
}

function lockAdminUi() {
  document.body.classList.add("admin-locked");
}

function unlockAdminUi() {
  document.body.classList.remove("admin-locked");
}

async function loginCms(username, password) {
  const response = await fetch(`${window.SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: window.SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({
      email: username,
      password,
    }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.access_token) {
    throw new Error(payload?.error_description || payload?.msg || "Connexion refusee.");
  }
  return payload.access_token;
}

function showAdminFatalError(error) {
  const shell = document.querySelector(".admin-shell");
  if (!shell) {
    return;
  }

  const pre = document.createElement("pre");
  pre.style.marginTop = "16px";
  pre.style.padding = "12px";
  pre.style.border = "1px solid #d00";
  pre.style.whiteSpace = "pre-wrap";
  pre.style.fontSize = "12px";
  pre.style.color = "#d00";
  pre.textContent = `Erreur CMS: ${error?.message || error}`;
  shell.prepend(pre);
}

function setupAdminNav() {
  if (!navLinks.length) {
    return;
  }

  const sections = navLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        navLinks.forEach((link) => {
          const active = link.getAttribute("href") === `#${entry.target.id}`;
          link.classList.toggle("is-active", active);
        });
      });
    },
    {
      rootMargin: "-25% 0px -65% 0px",
      threshold: 0.1,
    }
  );

  sections.forEach((section) => observer.observe(section));
}

function setupProjectTabs() {
  if (!projectTabs.length || !projectPanels.length) {
    return;
  }

  const activateTab = (key) => {
    projectTabs.forEach((tab) => {
      const active = tab.dataset.projectTab === key;
      tab.classList.toggle("is-active", active);
      tab.setAttribute("aria-selected", active ? "true" : "false");
    });

    projectPanels.forEach((panel) => {
      panel.classList.toggle("is-active", panel.dataset.projectPanel === key);
    });
  };

  projectTabs.forEach((tab) => {
    tab.addEventListener("click", () => activateTab(tab.dataset.projectTab));
  });
}

function populateForm(content) {
  const defaults = getDefaultContentSafe();
  form.querySelectorAll("[name]").forEach((field) => {
    const format = field.dataset.format;
    const currentValue = getValueByPath(content, field.name);
    const fallbackValue = getValueByPath(defaults, field.name);
    const nextValue = currentValue ?? fallbackValue ?? "";
    const formattedValue = formatFieldValue(nextValue, format);

    if (field.tagName === "SELECT") {
      const hasOption = [...field.options].some((option) => option.value === String(formattedValue));
      field.value = hasOption ? String(formattedValue) : String(fallbackValue ?? field.options?.[0]?.value ?? "");
      return;
    }

    field.value = formattedValue;
  });

  try {
    renderProjectListEditor(directingEditor, content?.directing?.items || []);
  } catch (error) {
    console.error("Failed to render directing editor.", error);
    renderProjectListEditor(directingEditor, defaults?.directing?.items || []);
  }

  try {
    renderProjectListEditor(editingEditor, content?.editing?.items || []);
  } catch (error) {
    console.error("Failed to render editing editor.", error);
    renderProjectListEditor(editingEditor, defaults?.editing?.items || []);
  }
}

function buildContentFromForm() {
  const content = getDefaultContentSafe();

  form.querySelectorAll("[name]").forEach((field) => {
    const parsedValue = parseFieldValue(field.value, field.dataset.format);
    setValueByPath(content, field.name, normalizeFieldValue(field, parsedValue));
  });

  content.directing.items = readProjectListEditor(directingEditor);
  content.editing.items = readProjectListEditor(editingEditor);
  return content;
}

function saveFromCmsForm() {
  try {
    const content = buildContentFromForm();
    saveSiteContentSafe(content);
    populateForm(content);
    if (status) {
      status.textContent = `Contenu enregistre. Cle: ${getPrimaryStorageKey()}`;
    }
  } catch (error) {
    if (status) {
      status.textContent = `Erreur sauvegarde: ${error?.message || error}`;
    }
    console.error("CMS save error:", error);
  }
}

if (form) {
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    saveFromCmsForm();
  });
}

saveButton?.addEventListener("click", () => {
  saveFromCmsForm();
});

loginSubmit?.addEventListener("click", async () => {
  const username = String(loginUsername?.value || "").trim();
  const password = String(loginPassword?.value || "");
  if (!username || !password) {
    if (loginStatus) {
      loginStatus.textContent = "Identifiant et mot de passe requis.";
    }
    return;
  }

  if (loginStatus) {
    loginStatus.textContent = "Connexion en cours...";
  }

  try {
    const token = await loginCms(username, password);
    setAuthToken(token);
    setAuthUser(username);
    unlockAdminUi();
    if (loginPassword) {
      loginPassword.value = "";
    }
    if (loginStatus) {
      loginStatus.textContent = "";
    }
    if (status) {
      status.textContent = "Connecte. Edition cloud active.";
    }
  } catch (error) {
    if (loginStatus) {
      loginStatus.textContent = `Echec connexion: ${error?.message || error}`;
    }
  }
});

loginPassword?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    loginSubmit?.click();
  }
});

logoutAdminButton?.addEventListener("click", () => {
  setAuthToken("");
  setAuthUser("");
  lockAdminUi();
  if (status) {
    status.textContent = "Deconnecte.";
  }
});

resetButton?.addEventListener("click", () => {
  getCompatStorageKeys().forEach((key) => {
    localStorage.removeItem(key);
  });
  populateForm(getDefaultContentSafe());
  if (status) {
    status.textContent = "Contenu reinitialise.";
  }
});

function bindProjectListEditor(container) {
  let draggingRow = null;

  container.addEventListener("click", (event) => {
    const collapseToggle = event.target.closest("[data-project-collapse-toggle]");
    if (collapseToggle) {
      const row = collapseToggle.closest(".admin-project-row");
      const body = row?.querySelector("[data-project-row-body]");
      if (!body) {
        return;
      }

      const collapsed = body.classList.toggle("is-collapsed");
      collapseToggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
      collapseToggle.textContent = collapsed ? "Ouvrir" : "Fermer";
      return;
    }

    if (!event.target.closest("[data-project-item-remove]")) {
      const addCreditRole = event.target.closest("[data-project-credit-add]");
      if (addCreditRole) {
        const row = addCreditRole.closest(".admin-project-row");
        const creditsGrid = row?.querySelector("[data-project-credits-grid]");
        if (!creditsGrid) {
          return;
        }

        creditsGrid.appendChild(createCreditRoleRow());
        return;
      }

      const removeCreditRole = event.target.closest("[data-project-credit-remove]");
      if (removeCreditRole) {
        const roleRow = removeCreditRole.closest(".admin-credit-role-row");
        roleRow?.remove();
        return;
      }

      const visibilityToggle = event.target.closest("[data-project-visibility-toggle]");
      if (!visibilityToggle) {
        return;
      }

      const row = visibilityToggle.closest(".admin-project-row");
      if (!row) {
        return;
      }

      const hiddenField = row.querySelector('[data-project-item-field="hidden"]');
      setProjectHiddenState(row, hiddenField?.value !== "true");
      return;
    }

    const row = event.target.closest(".admin-project-row");
    row?.remove();
  });

  container.addEventListener("dragstart", (event) => {
    const handle = event.target.closest("[data-project-drag-handle]");
    if (!handle) {
      event.preventDefault();
      return;
    }

    const row = handle.closest(".admin-project-row");
    if (!row) {
      event.preventDefault();
      return;
    }

    draggingRow = row;
    row.classList.add("is-dragging");
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", row.querySelector('[data-project-item-field="title"]').value || "project");
  });

  container.addEventListener("dragover", (event) => {
    if (!draggingRow) {
      return;
    }

    event.preventDefault();
    const afterElement = getDragAfterElement(container, event.clientY);
    if (!afterElement) {
      container.appendChild(draggingRow);
      return;
    }

    if (afterElement !== draggingRow) {
      container.insertBefore(draggingRow, afterElement);
    }
  });

  container.addEventListener("drop", (event) => {
    if (!draggingRow) {
      return;
    }

    event.preventDefault();
  });

  container.addEventListener("dragend", () => {
    if (!draggingRow) {
      return;
    }

    draggingRow.classList.remove("is-dragging");
    draggingRow = null;
  });
}

if (directingEditor) {
  bindProjectListEditor(directingEditor);
}
if (editingEditor) {
  bindProjectListEditor(editingEditor);
}

addDirectingProjectButton?.addEventListener("click", () => {
  if (directingEditor) {
    directingEditor.appendChild(createProjectRow());
  }
});

addEditingProjectButton?.addEventListener("click", () => {
  if (editingEditor) {
    editingEditor.appendChild(createProjectRow());
  }
});

try {
  lockAdminUi();
  try {
    const previousUser = String(sessionStorage.getItem(CMS_AUTH_USER_STORAGE) || "");
    if (previousUser && loginUsername) {
      loginUsername.value = previousUser;
    }
  } catch (error) {
    // no-op
  }

  const persistedAuthToken = getStoredAuthToken();
  if (persistedAuthToken) {
    setAuthToken(persistedAuthToken);
    unlockAdminUi();
  }

  if (form) {
    populateForm(getDefaultContentSafe());
    populateForm(loadSiteContentSafe());
    setupAdminNav();
    setupProjectTabs();
    window.__CMS_ADMIN_READY = true;

    if (typeof window.hydrateContentFromCloud === "function") {
      window
        .hydrateContentFromCloud()
        .then(() => {
          populateForm(loadSiteContentSafe());
          if (status) {
            status.textContent = "Contenu charge depuis le cloud.";
          }
        })
        .catch(() => {
          // keep local content silently
        });
    }
  }
} catch (error) {
  console.error("CMS admin init error:", error);
  showAdminFatalError(error);
}

window.addEventListener("cms:content-updated", () => {
  populateForm(loadSiteContentSafe());
});

window.addEventListener("cms:save-result", (event) => {
  if (!status) {
    return;
  }

  if (event?.detail?.ok) {
    status.textContent = "Contenu enregistre sur le cloud.";
    return;
  }

  if (event?.detail?.status === 401) {
    status.textContent = "Session admin expiree. Reconnecte-toi.";
    setAuthToken("");
    setAuthUser("");
    lockAdminUi();
    return;
  }

  status.textContent = "Contenu enregistre localement (cloud indisponible).";
});
