(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Theme ---------- */
  const store = {
    get(k, s = localStorage) { try { return s.getItem(k); } catch { return null; } },
    set(k, v, s = localStorage) { try { s.setItem(k, v); } catch { /* ignore */ } },
  };
  const setThemeColor = (t) => document.querySelectorAll('meta[name="theme-color"]').forEach((m) => {
    m.setAttribute("content", t === "dark" ? "#141413" : "#f2efe8");
    m.removeAttribute("media");
  });
  setThemeColor(root.dataset.theme);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
    if (store.get("bm-theme")) return;
    root.dataset.theme = e.matches ? "dark" : "light";
    setThemeColor(root.dataset.theme);
  });
  document.getElementById("theme-toggle")?.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    store.set("bm-theme", next);
    setThemeColor(next);
  });

  /* ---------- Intro ---------- */
  const intro = root.classList.contains("intro");
  if (intro) {
    store.set("bm-intro", "1", sessionStorage);
    setTimeout(() => root.classList.add("is-ready"), 2100);
    setTimeout(() => root.classList.remove("intro"), 2900);
  } else {
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-ready")));
  }

  /* ---------- Manifesto: split into characters ---------- */
  const manifesto = document.getElementById("manifesto");
  let chars = [];
  if (manifesto && !reduce) {
    const text = manifesto.textContent;
    manifesto.setAttribute("aria-label", text);
    manifesto.textContent = "";
    for (const ch of text) {
      const s = document.createElement("span");
      s.className = "w";
      s.setAttribute("aria-hidden", "true");
      s.textContent = ch;
      manifesto.appendChild(s);
    }
    chars = [...manifesto.children];
  }

  /* ---------- Story rail ---------- */
  const chapters = [...document.querySelectorAll(".chapter")];
  const digits = document.getElementById("rail-digits");
  const names = [...document.querySelectorAll("#rail-names span")];
  const dots = [...document.querySelectorAll(".rail__dot")];
  const fill = document.getElementById("rail-fill");
  const story = document.getElementById("story");
  let active = -1;
  const setChapter = (i) => {
    if (i === active) return;
    active = i;
    if (digits) digits.style.transform = `translateY(${-i}em)`;
    names.forEach((n, k) => { n.classList.toggle("is-on", k === i); n.classList.toggle("is-past", k < i); });
    dots.forEach((d, k) => d.classList.toggle("is-on", k <= i));
  };
  setChapter(0);

  /* ---------- Scroll loop ---------- */
  const nav = document.querySelector(".nav");
  let lastY = scrollY;
  let ticking = false;
  const onScroll = () => {
    ticking = false;
    const y = scrollY;
    const vh = innerHeight;
    nav.classList.toggle("is-scrolled", y > 16);
    nav.classList.toggle("is-hidden", y > lastY && y > vh * 0.8);
    lastY = y;

    if (chars.length) {
      const r = manifesto.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = Math.round(p * chars.length);
      for (let i = 0; i < chars.length; i++) chars[i].classList.toggle("is-lit", i < lit);
    }

    if (story && chapters.length) {
      let idx = 0;
      chapters.forEach((c, i) => { if (c.getBoundingClientRect().top < vh * 0.55) idx = i; });
      setChapter(idx);
      const r = story.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.5 - r.top) / (r.height - vh * 0.6)));
      if (fill) {
        fill.style.height = `${p * 100}%`;
        fill.parentElement.style.setProperty("--fill", `${p * 100}%`);
      }
    }
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Reveal ---------- */
  const items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
    }), { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
    items.forEach((el) => io.observe(el));
  } else {
    items.forEach((el) => el.classList.add("is-in"));
  }

  /* ---------- Mood demo ---------- */
  const moods = document.querySelectorAll(".mood");
  moods.forEach((b) => b.addEventListener("click", () => moods.forEach((m) => m.setAttribute("aria-pressed", String(m === b)))));

  /* ---------- Countdown ---------- */
  const cd = document.getElementById("countdown");
  if (cd) {
    const target = new Date(cd.dataset.unlock).getTime();
    const out = {};
    cd.querySelectorAll("[data-k]").forEach((el) => { out[el.dataset.k] = el; });
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
      out.d.textContent = Math.floor(s / 86400).toLocaleString("zh-CN");
      out.h.textContent = pad(Math.floor((s % 86400) / 3600));
      out.m.textContent = pad(Math.floor((s % 3600) / 60));
      out.s.textContent = pad(s % 60);
    };
    tick();
    setInterval(tick, 1000);
  }

  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());
})();
