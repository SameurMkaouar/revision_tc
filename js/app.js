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

/* ─── Touch swipe gesture for sidebar ───────────────────── */
(function initSwipe() {
  let startX = 0;
  let startY = 0;
  let isDragging = false;
  let swipeIntent = null; // 'open' | 'close' | null

  // Swipe right from anywhere in left 35% of screen to open
  // Swipe left from anywhere to close when sidebar is open
  const OPEN_ZONE_RATIO = 0.35; // % of screen width that triggers open-swipe
  const SWIPE_THRESHOLD = 48;   // min px horizontal travel to commit

  document.addEventListener('touchstart', function (e) {
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    isDragging = false;
    swipeIntent = null;
  }, { passive: true });

  document.addEventListener('touchmove', function (e) {
    const dx = e.touches[0].clientX - startX;
    const dy = e.touches[0].clientY - startY;
    const sidebar = document.querySelector('.sidebar');
    const isOpen = sidebar.classList.contains('open');

    if (!isDragging) {
      // Only commit to horizontal drag when it clearly dominates vertical
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        isDragging = true;
        // Decide intent once at the start of the drag
        const openZone = window.innerWidth * OPEN_ZONE_RATIO;
        if (!isOpen && dx > 0 && startX < openZone) {
          swipeIntent = 'open';
        } else if (isOpen && dx < 0) {
          swipeIntent = 'close';
        } else {
          swipeIntent = null;
        }
      }
    }

    if (!isDragging || !swipeIntent) return;

    if (swipeIntent === 'open') {
      // Follow finger from left edge — sidebar slides with touch
      const translateX = Math.min(0, -290 + dx);
      sidebar.style.transform = `translateX(${translateX}px)`;
      sidebar.classList.add('dragging');
    } else if (swipeIntent === 'close') {
      // Slide sidebar back to the left with finger
      const translateX = Math.max(-290, dx);
      sidebar.style.transform = `translateX(${translateX}px)`;
      sidebar.classList.add('dragging');
    }
  }, { passive: true });

  document.addEventListener('touchend', function (e) {
    const dx = e.changedTouches[0].clientX - startX;
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.remove('dragging');
    sidebar.style.transform = '';

    if (!isDragging || !swipeIntent) {
      isDragging = false;
      swipeIntent = null;
      return;
    }
    isDragging = false;

    if (swipeIntent === 'open' && dx > SWIPE_THRESHOLD) {
      openSidebar();
    } else if (swipeIntent === 'close' && dx < -SWIPE_THRESHOLD) {
      closeSidebar();
    }
    swipeIntent = null;
  }, { passive: true });
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

  // Wire up sidebar overlay click to close
  const overlay = document.getElementById("sidebar-overlay");
  if (overlay) {
    overlay.addEventListener("click", closeSidebar);
  }
});
