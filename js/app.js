/* ═══════════════════════════════════════════════════════════
   TC Révision — App JS
   Covers: theme, nav, mobile sidebar, swipe,
           reading progress, copy-code buttons
═══════════════════════════════════════════════════════════ */

/* ─── Page & Chapter name map ───────────────────────────── */
const PAGE_TITLES = {
  home: "Accueil",
  ch1: "Ch.1 — Concepts & Architecture",
  ch2: "Ch.2 — Installation & Config",
  ch3: "Ch.3 — Gestion des Images",
  ch4: "Ch.4 — Gestion des Volumes",
  ch5_1: "Ch.5.1 — Réseaux",
  ch5_2: "Ch.5.2 — Docker Compose",
  ch5_3: "Ch.5.3 — Docker Swarm",
  exams: "Examens & Corrections",
};

/* ─── Theme ─────────────────────────────────────────────── */
function setThemeIcon(theme) {
  document
    .querySelectorAll(".icon-moon")
    .forEach((el) => (el.style.display = theme === "light" ? "none" : "block"));
  document
    .querySelectorAll(".icon-sun")
    .forEach((el) => (el.style.display = theme === "light" ? "block" : "none"));
}

function toggleTheme() {
  const html = document.documentElement;
  const next = html.getAttribute("data-theme") === "light" ? "dark" : "light";
  html.setAttribute("data-theme", next);
  localStorage.setItem("theme", next);
  setThemeIcon(next);
}

// Apply saved theme immediately (before DOMContentLoaded to avoid flash)
(function () {
  const saved = localStorage.getItem("theme");
  if (saved) document.documentElement.setAttribute("data-theme", saved);
})();

/* ─── Page navigation ───────────────────────────────────── */
let _currentPage = "home";

function showPage(id) {
  // Hide all chapters
  document
    .querySelectorAll(".chapter")
    .forEach((c) => c.classList.remove("active", "page-enter"));

  const target = document.getElementById(id);
  if (target) {
    target.classList.add("active");
    // Trigger enter animation
    requestAnimationFrame(() => target.classList.add("page-enter"));
  }

  _currentPage = id;

  // Close mobile sidebar + overlay
  closeSidebar();

  // Scroll to top
  window.scrollTo({ top: 0, behavior: "smooth" });

  // Update mobile app-bar title
  const titleEl = document.getElementById("app-bar-title");
  if (titleEl) titleEl.textContent = PAGE_TITLES[id] || "TC Révision";

  // Update sidebar nav active item
  document.querySelectorAll(".nav-item[data-page]").forEach((el) => {
    el.classList.toggle("active", el.getAttribute("data-page") === id);
  });

  // Reset reading progress
  updateReadingProgress();
}

/* ─── Sidebar open/close ────────────────────────────────── */
function openSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const btn = document.getElementById("app-bar-hamburger");
  sidebar.classList.add("open");
  if (overlay) overlay.classList.add("visible");
  if (btn) btn.classList.add("open");
}

function closeSidebar() {
  const sidebar = document.querySelector(".sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  const btn = document.getElementById("app-bar-hamburger");
  sidebar.classList.remove("open");
  if (overlay) overlay.classList.remove("visible");
  if (btn) btn.classList.remove("open");
}

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");
  if (sidebar.classList.contains("open")) {
    closeSidebar();
  } else {
    openSidebar();
  }
}

/* ─── Desktop sidebar collapse ─────────────────────────── */
function syncDesktopSidebarToggleButton() {
  const btn = document.getElementById("desktop-sidebar-toggle");
  if (!btn) return;

  const collapsed = document.body.classList.contains("sidebar-collapsed");
  btn.classList.toggle("collapsed", collapsed);
  btn.title = collapsed ? "Agrandir le menu" : "Réduire le menu";
  btn.setAttribute(
    "aria-label",
    collapsed ? "Agrandir le menu latéral" : "Réduire le menu latéral",
  );
}

function toggleDesktopSidebar(forceState) {
  if (window.innerWidth <= 768) return;

  const shouldCollapse =
    typeof forceState === "boolean"
      ? forceState
      : !document.body.classList.contains("sidebar-collapsed");

  document.body.classList.toggle("sidebar-collapsed", shouldCollapse);
  localStorage.setItem("desktopSidebarCollapsed", shouldCollapse ? "1" : "0");
  syncDesktopSidebarToggleButton();
}

function initDesktopSidebarState() {
  const saved = localStorage.getItem("desktopSidebarCollapsed");
  if (window.innerWidth > 768 && saved === "1") {
    document.body.classList.add("sidebar-collapsed");
  }
  syncDesktopSidebarToggleButton();
}

/* ─── Reading progress bar ──────────────────────────────── */
function updateReadingProgress() {
  const bar = document.getElementById("reading-progress");
  if (!bar) return;
  const scrollTop = window.scrollY || document.documentElement.scrollTop;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  const pct = docHeight > 0 ? Math.min(100, (scrollTop / docHeight) * 100) : 0;
  bar.style.width = pct + "%";
}

/* ─── Copy-code buttons ─────────────────────────────────── */
function addCopyButtons() {
  document.querySelectorAll("pre").forEach((pre) => {
    if (pre.querySelector(".copy-btn")) return; // already added
    const btn = document.createElement("button");
    btn.className = "copy-btn";
    btn.textContent = "Copier";
    btn.addEventListener("click", function () {
      const code = pre.querySelector("code");
      const text = code ? code.innerText : pre.innerText;
      navigator.clipboard
        .writeText(text)
        .then(() => {
          btn.textContent = "✓ Copié";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = "Copier";
            btn.classList.remove("copied");
          }, 2000);
        })
        .catch(() => {
          // Fallback for older browsers
          const sel = window.getSelection();
          const range = document.createRange();
          range.selectNodeContents(code || pre);
          sel.removeAllRanges();
          sel.addRange(range);
          try {
            document.execCommand("copy");
          } catch (e) {
            /* ignore */
          }
          sel.removeAllRanges();
          btn.textContent = "✓ Copié";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = "Copier";
            btn.classList.remove("copied");
          }, 2000);
        });
    });
    pre.appendChild(btn);
  });
}

/* ─── Copy-column buttons for tables ────────────────────── */
function showCopyToast(message) {
  // Create toast container if it doesn't exist
  let toastContainer = document.getElementById("copy-toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "copy-toast-container";
    document.body.appendChild(toastContainer);
  }

  // Create toast element
  const toast = document.createElement("div");
  toast.className = "copy-toast";
  toast.textContent = message;
  toastContainer.appendChild(toast);

  // Trigger animation
  requestAnimationFrame(() => {
    toast.classList.add("show");
  });

  // Remove after delay
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 2000);
}

function addTableColumnCopyButtons() {
  document.querySelectorAll("table").forEach((table) => {
    const headers = table.querySelectorAll("thead th");
    headers.forEach((th, colIndex) => {
      // Setup header styling
      th.classList.add("copy-column-header");
      th.style.position = "relative";
      th.title = "Survolez pour copier";
      const columnTitle = th.textContent.trim();

      // Create copy button with SVG icon
      const copyBtn = document.createElement("button");
      copyBtn.className = "copy-column-btn";
      copyBtn.innerHTML =
        '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>';
      copyBtn.title = "Copier cette colonne";
      copyBtn.setAttribute("aria-label", "Copier la colonne");
      th.appendChild(copyBtn);

      // Handle button click
      copyBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        // Get all cells in this column
        const columnData = [];

        // Get header text
        const headerText = columnTitle;
        if (headerText) columnData.push(headerText);

        // Get all body rows for this column
        const rows = table.querySelectorAll("tbody tr");
        rows.forEach((row) => {
          const cell = row.cells[colIndex];
          if (cell) {
            columnData.push(cell.innerText.trim());
          }
        });

        // Join with newlines and copy to clipboard
        const text = columnData.join("\n");
        navigator.clipboard
          .writeText(text)
          .then(() => {
            // Add copied class for visual feedback
            copyBtn.classList.add("copied");
            copyBtn.innerHTML =
              '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            setTimeout(() => {
              copyBtn.classList.remove("copied");
              copyBtn.innerHTML =
                '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>';
            }, 1000);
            // Show toast notification
            showCopyToast("✓ Colonne copiée");
          })
          .catch(() => {
            // Fallback
            const sel = window.getSelection();
            const range = document.createRange();
            range.selectNodeContents(th);
            sel.removeAllRanges();
            sel.addRange(range);
            document.execCommand("copy");
            sel.removeAllRanges();
            copyBtn.classList.add("copied");
            copyBtn.innerHTML =
              '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
            setTimeout(() => {
              copyBtn.classList.remove("copied");
              copyBtn.innerHTML =
                '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>';
            }, 1000);
            showCopyToast("✓ Colonne copiée");
          });
      });

      // Show/hide button on hover
      th.addEventListener("mouseenter", function () {
        copyBtn.classList.add("visible");
      });

      th.addEventListener("mouseleave", function () {
        copyBtn.classList.remove("visible");
      });
    });
  });
}

/* ─── Exams PDF viewer ─────────────────────────────────── */
function initExamViewer() {
  const frame = document.getElementById("exam-pdf-frame");
  const titleEl = document.getElementById("exam-viewer-title");
  const openNewLink = document.getElementById("exam-open-new");
  const buttons = Array.from(
    document.querySelectorAll(".exam-open-btn[data-pdf]"),
  );

  if (!frame || !titleEl || !openNewLink || buttons.length === 0) return;

  function selectExam(btn) {
    const pdfPath = btn.getAttribute("data-pdf");
    const label = btn.getAttribute("data-label") || "Document";
    if (!pdfPath) return;

    buttons.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");

    frame.src = `${pdfPath}#view=FitH`;
    titleEl.textContent = label;
    openNewLink.href = pdfPath;
  }

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => selectExam(btn));
  });

  const defaultBtn =
    document.querySelector(".exam-open-btn.default[data-pdf]") || buttons[0];
  if (defaultBtn) selectExam(defaultBtn);
}

/* ─── Touch swipe gesture for sidebar ───────────────────── */
(function initSwipe() {
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let swipeIntent = null; // 'open' | 'close' | null

  // Swipe right from anywhere in left 35% of screen to open
  // Swipe left from anywhere to close when sidebar is open
  const OPEN_ZONE_RATIO = 0.35; // % of screen width that triggers open-swipe
  const SWIPE_THRESHOLD = 48; // min px horizontal travel to commit

  document.addEventListener(
    "touchstart",
    function (e) {
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
      isDragging = false;
      swipeIntent = null;
    },
    { passive: true },
  );

  document.addEventListener(
    "touchmove",
    function (e) {
      const dx = e.touches[0].clientX - startX;
      const dy = e.touches[0].clientY - startY;
      const sidebar = document.querySelector(".sidebar");
      const isOpen = sidebar.classList.contains("open");

      if (!isDragging) {
        // Only commit to horizontal drag when it clearly dominates vertical
        if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
          isDragging = true;
          // Decide intent once at the start of the drag
          const openZone = window.innerWidth * OPEN_ZONE_RATIO;
          if (!isOpen && dx > 0 && startX < openZone) {
            swipeIntent = "open";
          } else if (isOpen && dx < 0) {
            swipeIntent = "close";
          } else {
            swipeIntent = null;
          }
        }
      }

      if (!isDragging || !swipeIntent) return;

      if (swipeIntent === "open") {
        // Follow finger from left edge — sidebar slides with touch
        const translateX = Math.min(0, -290 + dx);
        sidebar.style.transform = `translateX(${translateX}px)`;
        sidebar.classList.add("dragging");
      } else if (swipeIntent === "close") {
        // Slide sidebar back to the left with finger
        const translateX = Math.max(-290, dx);
        sidebar.style.transform = `translateX(${translateX}px)`;
        sidebar.classList.add("dragging");
      }
    },
    { passive: true },
  );

  document.addEventListener(
    "touchend",
    function (e) {
      const dx = e.changedTouches[0].clientX - startX;
      const sidebar = document.querySelector(".sidebar");
      sidebar.classList.remove("dragging");
      sidebar.style.transform = "";

      if (!isDragging || !swipeIntent) {
        isDragging = false;
        swipeIntent = null;
        return;
      }
      isDragging = false;

      if (swipeIntent === "open" && dx > SWIPE_THRESHOLD) {
        openSidebar();
      } else if (swipeIntent === "close" && dx < -SWIPE_THRESHOLD) {
        closeSidebar();
      }
      swipeIntent = null;
    },
    { passive: true },
  );
})();

/* ─── Scroll handlers ───────────────────────────────────── */
window.addEventListener("scroll", updateReadingProgress, { passive: true });

/* ─── Intersection Observer for active nav links ────────── */
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // Highlight the sidebar nav-item for the current chapter
        const chapterId = entry.target.closest(".chapter");
        if (chapterId) {
          document.querySelectorAll(".nav-item[data-page]").forEach((el) => {
            el.classList.toggle(
              "active",
              el.getAttribute("data-page") === chapterId.id,
            );
          });
        }
      }
    });
  },
  { threshold: 0.15 },
);

/* ─── DOMContentLoaded ──────────────────────────────────── */
document.addEventListener("DOMContentLoaded", function () {
  // Apply theme icon from current theme
  const theme = document.documentElement.getAttribute("data-theme") || "dark";
  setThemeIcon(theme);

  // Observe all sections for scroll-based nav highlight
  document
    .querySelectorAll(".section[id]")
    .forEach((s) => sectionObserver.observe(s));

  // Add copy buttons to all code blocks
  addCopyButtons();

  // Add copy-column buttons to all tables
  addTableColumnCopyButtons();

  // Activate exams viewer
  initExamViewer();

  // Restore desktop sidebar state
  initDesktopSidebarState();

  // Keep sidebar state sane when screen size changes
  window.addEventListener("resize", function () {
    if (window.innerWidth <= 768) {
      document.body.classList.remove("sidebar-collapsed");
    }
    syncDesktopSidebarToggleButton();
  });

  // Wire up sidebar overlay click to close
  const overlay = document.getElementById("sidebar-overlay");
  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }

  // Build search index after all content is in the DOM
  buildSearchIndex();
});

/* ═══════════════════════════════════════════════════════
   SEARCH
═══════════════════════════════════════════════════════ */

let _searchIndex = []; // { pageId, pageTitle, el, tag, text, breadcrumb }
let _searchFocusedIdx = -1;

// Tags we want to index (ordered by priority)
const SEARCH_TAGS = ["h3", "h4", "p", "li", "td", "th", "dt", "dd", "code"];

function buildSearchIndex() {
  _searchIndex = [];
  const PAGE_ORDER = Object.keys(PAGE_TITLES);

  document.querySelectorAll(".chapter").forEach((chapter) => {
    // Skip exams page — it has no indexable text (PDFs)
    if (chapter.id === "exams") return;

    const pageId = chapter.id;
    const pageTitle = PAGE_TITLES[pageId] || pageId;
    let currentH3 = "";
    let currentH4 = "";

    // Walk the chapter and harvest text nodes from target tags
    const els = chapter.querySelectorAll(SEARCH_TAGS.join(","));
    els.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const text = el.innerText ? el.innerText.trim() : "";
      if (!text || text.length < 3) return;

      // Update breadcrumb context
      if (tag === "h3") {
        currentH3 = text;
        currentH4 = "";
      } else if (tag === "h4") {
        currentH4 = text;
      }

      // Build breadcrumb string
      let breadcrumb = pageTitle;
      if (currentH3 && tag !== "h3") breadcrumb += " › " + currentH3;
      if (currentH4 && tag !== "h3" && tag !== "h4") breadcrumb += " › " + currentH4;

      _searchIndex.push({ pageId, pageTitle, el, tag, text, breadcrumb });
    });
  });
}

/* ─── Open / Close ──────────────────────────────────── */
function openSearch() {
  const overlay = document.getElementById("search-overlay");
  const input = document.getElementById("search-input");
  if (!overlay || !input) return;

  overlay.classList.add("open");
  document.body.style.overflow = "hidden";

  // Reset state
  _searchFocusedIdx = -1;
  input.value = "";
  document.getElementById("search-clear-btn").style.display = "none";
  document.getElementById("search-results").innerHTML = "";

  // Focus after animation frame so element is visible
  requestAnimationFrame(() => input.focus());
}

function closeSearch() {
  const overlay = document.getElementById("search-overlay");
  if (!overlay) return;
  overlay.classList.remove("open");
  document.body.style.overflow = "";
  _searchFocusedIdx = -1;
}

function handleSearchOverlayClick(e) {
  // Close if backdrop itself was clicked (not the modal)
  if (e.target === document.getElementById("search-overlay")) {
    closeSearch();
  }
}

function clearSearch() {
  const input = document.getElementById("search-input");
  if (input) {
    input.value = "";
    input.focus();
    performSearch("");
  }
}

/* ─── Search logic ──────────────────────────────────── */
function performSearch(query) {
  const resultsEl = document.getElementById("search-results");
  const clearBtn = document.getElementById("search-clear-btn");
  if (!resultsEl) return;

  const q = query.trim();
  clearBtn.style.display = q.length > 0 ? "flex" : "none";
  _searchFocusedIdx = -1;

  if (q.length < 2) {
    resultsEl.innerHTML = "";
    return;
  }

  // Case-insensitive search, accent-insensitive via normalize
  const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const nq = normalize(q);

  // Score each result: heading match > text position
  const matches = [];
  for (const item of _searchIndex) {
    const nt = normalize(item.text);
    const pos = nt.indexOf(nq);
    if (pos === -1) continue;
    const tagWeight = { h3: 100, h4: 80, p: 40, li: 35, td: 30, th: 50, dt: 60, dd: 30, code: 25 };
    const score = (tagWeight[item.tag] || 20) + (pos === 0 ? 20 : 0) - pos * 0.01;
    matches.push({ item, pos, score });
  }

  // Sort by score desc, then deduplicate similar text from same page
  matches.sort((a, b) => b.score - a.score);

  // Limit to top 12 results
  const seen = new Set();
  const top = [];
  for (const m of matches) {
    const key = m.item.pageId + "::" + m.item.text.slice(0, 60);
    if (!seen.has(key)) {
      seen.add(key);
      top.push(m);
    }
    if (top.length >= 12) break;
  }

  if (top.length === 0) {
    resultsEl.innerHTML = `<div class="search-empty-state"><strong>Aucun résultat</strong>Essayez un autre mot-clé</div>`;
    return;
  }

  resultsEl.innerHTML = top.map((m, i) => buildResultHTML(m.item, q, i)).join("");

  // Wire up click handlers
  resultsEl.querySelectorAll(".search-result-item").forEach((el, i) => {
    el.addEventListener("click", () => navigateToResult(top[i].item));
    el.addEventListener("mouseenter", () => {
      _searchFocusedIdx = i;
      updateFocusedResult();
    });
  });
}

function buildResultHTML(item, query, idx) {
  // Choose icon based on tag type
  const isHeading = item.tag === "h3" || item.tag === "h4";
  const isCode = item.tag === "code";
  const iconSvg = isHeading
    ? `<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h10M4 18h8"/></svg>`
    : isCode
    ? `<svg viewBox="0 0 24 24"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>`
    : `<svg viewBox="0 0 24 24"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="16" y2="18"/><circle cx="3" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="3" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>`;

  // Build snippet with highlighted match
  const snippet = buildSnippet(item.text, query);

  // Title = first 80 chars of text or the heading
  const title = item.text.length > 80 ? item.text.slice(0, 80) + "…" : item.text;
  const safeTitle = escapeHtml(title);
  const safeBreadcrumb = escapeHtml(item.breadcrumb);

  return `<div class="search-result-item" role="option" tabindex="-1" data-idx="${idx}">
    <div class="search-result-icon">${iconSvg}</div>
    <div class="search-result-body">
      <div class="search-result-breadcrumb">${safeBreadcrumb}</div>
      <div class="search-result-title">${safeTitle}</div>
      <div class="search-result-snippet">${snippet}</div>
    </div>
  </div>`;
}

function buildSnippet(text, query) {
  const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const nText = normalize(text);
  const nQuery = normalize(query.trim());
  const pos = nText.indexOf(nQuery);

  if (pos === -1) return escapeHtml(text.slice(0, 120));

  // Show ±60 chars around the match
  const start = Math.max(0, pos - 60);
  const end = Math.min(text.length, pos + query.length + 60);
  let snippet = (start > 0 ? "…" : "") + text.slice(start, end) + (end < text.length ? "…" : "");

  // Highlight the match (case-insensitive, preserving original case)
  const regex = new RegExp(escapeRegex(query.trim()), "gi");
  return escapeHtml(snippet).replace(
    new RegExp(escapeRegex(escapeHtml(query.trim())), "gi"),
    (m) => `<mark>${m}</mark>`
  );
}

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/* ─── Navigate to result ────────────────────────────── */
function navigateToResult(item) {
  closeSearch();

  // Switch to the right page first
  if (_currentPage !== item.pageId) {
    showPage(item.pageId);
  }

  // After page transitions / rendering, scroll to element
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const el = item.el;
      el.scrollIntoView({ behavior: "smooth", block: "center" });

      // Flash highlight
      el.classList.remove("search-highlight-flash");
      void el.offsetWidth; // trigger reflow to restart animation
      el.classList.add("search-highlight-flash");
      setTimeout(() => el.classList.remove("search-highlight-flash"), 2000);
    });
  });
}

/* ─── Keyboard navigation ───────────────────────────── */
function handleSearchKey(e) {
  const resultsEl = document.getElementById("search-results");
  const items = resultsEl ? Array.from(resultsEl.querySelectorAll(".search-result-item")) : [];

  if (e.key === "ArrowDown") {
    e.preventDefault();
    _searchFocusedIdx = Math.min(_searchFocusedIdx + 1, items.length - 1);
    updateFocusedResult();
    if (items[_searchFocusedIdx]) items[_searchFocusedIdx].scrollIntoView({ block: "nearest" });
  } else if (e.key === "ArrowUp") {
    e.preventDefault();
    _searchFocusedIdx = Math.max(_searchFocusedIdx - 1, 0);
    updateFocusedResult();
    if (items[_searchFocusedIdx]) items[_searchFocusedIdx].scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter") {
    e.preventDefault();
    if (_searchFocusedIdx >= 0 && items[_searchFocusedIdx]) {
      items[_searchFocusedIdx].click();
    }
  } else if (e.key === "Escape") {
    closeSearch();
  }
}

function updateFocusedResult() {
  const resultsEl = document.getElementById("search-results");
  if (!resultsEl) return;
  resultsEl.querySelectorAll(".search-result-item").forEach((el, i) => {
    el.classList.toggle("focused", i === _searchFocusedIdx);
  });
}

/* ─── Global keyboard shortcut ─────────────────────── */
document.addEventListener("keydown", function (e) {
  // Ctrl+K or Cmd+K → open search
  if ((e.ctrlKey || e.metaKey) && e.key === "k") {
    e.preventDefault();
    const overlay = document.getElementById("search-overlay");
    if (overlay && overlay.classList.contains("open")) {
      closeSearch();
    } else {
      openSearch();
    }
    return;
  }
  // Escape → close search if open
  if (e.key === "Escape") {
    const overlay = document.getElementById("search-overlay");
    if (overlay && overlay.classList.contains("open")) {
      closeSearch();
    }
  }
});
