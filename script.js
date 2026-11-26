(() => {
  const root = document.documentElement;
  root.classList.add("js");

  /* Theme: system by default, remembered once toggled. */
  const store = {
    get() { try { return localStorage.getItem("bm-theme"); } catch { return null; } },
    set(v) { try { localStorage.setItem("bm-theme", v); } catch { /* ignore */ } },
  };
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const apply = (t) => {
    root.dataset.theme = t;
    document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
      m.setAttribute("content", t === "dark" ? "#111113" : "#f7f5f1");
      m.removeAttribute("media");
    });
  };
  apply(store.get() || (media.matches ? "dark" : "light"));
  media.addEventListener("change", (e) => { if (!store.get()) apply(e.matches ? "dark" : "light"); });
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    store.set(next);
    apply(next);
  });

  /* Nav border after scrolling. */
  const nav = document.querySelector(".nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  /* Reveal on scroll. */
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-in"));
  }

  /* Mood picker demo. */
  const moods = document.querySelectorAll(".mood");
  moods.forEach((btn) => btn.addEventListener("click", () => {
    moods.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  }));

  /* Sealed-letter countdown. */
  const cd = document.getElementById("countdown");
  if (cd) {
    const target = new Date(cd.dataset.unlock).getTime();
    const out = { d: cd.querySelector('[data-k="d"]'), h: cd.querySelector('[data-k="h"]'), m: cd.querySelector('[data-k="m"]') };
    const tick = () => {
      const left = Math.max(0, target - Date.now());
      const mins = Math.floor(left / 60000);
      out.d.textContent = Math.floor(mins / 1440).toLocaleString("zh-CN");
      out.h.textContent = String(Math.floor((mins % 1440) / 60)).padStart(2, "0");
      out.m.textContent = String(mins % 60).padStart(2, "0");
    };
    tick();
    setInterval(tick, 30000);
  }

  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
