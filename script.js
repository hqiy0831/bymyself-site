(() => {
  const root = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const G = window.gsap;
  const ST = window.ScrollTrigger;
  const useGsap = !reduce && G && ST;
  if (useGsap) root.classList.add("gsap-ok");

  /* ================= Diagnostics: open the site with ?debug ================= */
  if (/[?&]debug(?:[=&]|$)/.test(location.search)) {
    const v = (document.querySelector('script[src*="script.js"]') || {}).src || "";
    const badge = document.createElement("div");
    badge.style.cssText = "position:fixed;right:12px;bottom:12px;z-index:999;padding:10px 14px;border-radius:10px;background:#111;color:#fff;font:13px/1.6 system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.3);max-width:320px";
    const ver = (v.match(/v=([0-9a-f]+)/) || [])[1] || "未带版本号";
    const mode = reduce ? "静态版（系统设置了减少动画）" : (G && ST ? "完整动效" : "动画库没加载成功");
    badge.innerHTML = `<b>网站诊断</b><br>版本：${ver}<br>动画模式：${mode}<br>浏览器：${navigator.userAgent.match(/(Edg|Chrome|Firefox|Safari)\/[\d.]+/g)?.slice(-1)[0] || "未知"}`;
    addEventListener("DOMContentLoaded", () => document.body.appendChild(badge));
    if (document.readyState !== "loading") document.body.appendChild(badge);
  }

  /* ================= Theme ================= */
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
    const swap = () => { root.dataset.theme = next; store.set("bm-theme", next); setThemeColor(next); };
    if (document.startViewTransition && !reduce) document.startViewTransition(swap); else swap();
  });

  /* ================= Helpers ================= */
  // Wrap every visible character of an element in <span class="ch"> (keeps child elements).
  const splitChars = (el) => {
    const out = [];
    const walk = (node) => {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          for (const c of n.textContent) {
            if (/\s/.test(c)) { frag.appendChild(document.createTextNode(c)); continue; }
            const s = document.createElement("span");
            s.className = "ch";
            s.textContent = c;
            frag.appendChild(s);
            out.push(s);
          }
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && !n.classList.contains("tick")) {
          walk(n);
        }
      });
    };
    walk(el);
    return out;
  };
  // Wrap <br>-separated segments of a heading in masked lines.
  const maskLines = (el) => {
    const parts = el.innerHTML.split(/<br\s*\/?>/i);
    el.innerHTML = parts.map((p) => `<span class="ml"><span class="ml__in">${p}</span></span>`).join("");
    return [...el.querySelectorAll(".ml__in")];
  };

  /* ================= Intro timing ================= */
  const intro = root.classList.contains("intro");
  const quick = root.classList.contains("intro-quick");
  if (intro) store.set("bm-intro", "1", sessionStorage);
  const introDelay = intro ? (quick ? 0.95 : 2.05) : 0.1;
  if (intro) setTimeout(() => root.classList.remove("intro", "intro-quick"), quick ? 1700 : 2900);

  /* ================= Countdown / mood / year ================= */
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
  const moods = document.querySelectorAll(".mood");
  moods.forEach((b) => b.addEventListener("click", () => {
    moods.forEach((m) => m.setAttribute("aria-pressed", String(m === b)));
    if (useGsap) G.fromTo(b, { scale: 0.7 }, { scale: 1, duration: 0.6, ease: "elastic.out(1, 0.45)" });
  }));
  const y = document.getElementById("year");
  if (y) y.textContent = String(new Date().getFullYear());

  /* ================= Showcase tabs (shared) ================= */
  const showcase = document.querySelector(".showcase");
  if (showcase) {
    const tabs = [...showcase.querySelectorAll(".sc-tab")];
    const shots = [...showcase.querySelectorAll(".sc-shot")];
    const caps = [...showcase.querySelectorAll(".sc-cap")];
    const DUR = 6000;
    showcase.style.setProperty("--sc-dur", `${DUR}ms`);
    let cur = 0, timer = null, inView = false, hovering = false, userPicked = false;
    const swap = (prev, dir) => {
      const inS = shots[cur], outS = shots[prev];
      if (!useGsap || prev === cur) {
        shots.forEach((s, k) => { const on = k === cur; s.classList.toggle("is-on", on); s.hidden = !on; });
        return;
      }
      const G2 = window.gsap;
      shots.forEach((s, k) => { if (k !== cur && k !== prev) { G2.killTweensOf([s, ...s.querySelectorAll("img")]); s.classList.remove("is-on"); s.hidden = true; G2.set(s, { clearProps: "all" }); } });
      G2.killTweensOf([inS, outS, ...inS.querySelectorAll("img"), ...outS.querySelectorAll("img")]);
      inS.hidden = false;
      inS.classList.add("is-on");
      G2.set(inS, { zIndex: 2 });
      G2.set(outS, { zIndex: 1 });
      // incoming screen wipes in from the side you are heading to, settling from a slight zoom
      G2.fromTo(inS, { clipPath: dir > 0 ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" },
        { clipPath: "inset(0% 0% 0% 0%)", duration: 1.05, ease: "expo.inOut", clearProps: "clipPath,zIndex" });
      G2.fromTo(inS.querySelectorAll("img"), { scale: 1.08, xPercent: dir * 6 },
        { scale: 1, xPercent: 0, duration: 1.4, ease: "expo.out", clearProps: "transform" });
      // outgoing screen drifts the other way and dims
      G2.to(outS.querySelectorAll("img"), {
        xPercent: -dir * 8, scale: 0.97, opacity: 0.35, duration: 1.05, ease: "expo.inOut",
        onComplete: () => {
          if (shots[cur] === outS) return;
          outS.classList.remove("is-on"); outS.hidden = true;
          G2.set([outS, ...outS.querySelectorAll("img")], { clearProps: "all" });
        },
      });
    };
    const show = (i, focus, forcedDir) => {
      const prev = cur;
      const target = (i + tabs.length) % tabs.length;
      const dir = forcedDir || (target >= prev ? 1 : -1);
      cur = target;
      tabs.forEach((t, k) => { const on = k === cur; t.classList.toggle("is-on", on); t.setAttribute("aria-selected", String(on)); t.tabIndex = on ? 0 : -1; });
      swap(prev, dir);
      caps.forEach((c, k) => c.classList.toggle("is-on", k === cur));
      if (useGsap && prev !== cur) window.gsap.fromTo(caps[cur], { y: 18, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, delay: 0.25, ease: "expo.out", clearProps: "transform,opacity" });
      // restart the progress bar animation on the active tab
      const bar = tabs[cur].querySelector(".sc-tab__bar");
      bar.style.animation = "none"; void bar.offsetWidth; bar.style.animation = "";
      if (focus) tabs[cur].focus();
      // preload the next screen so the crossfade never shows a blank frame
      const next = shots[(cur + 1) % shots.length];
      next.querySelectorAll("img").forEach((im) => { im.loading = "eager"; });
    };
    const stop = () => { clearInterval(timer); timer = null; showcase.classList.remove("is-playing"); };
    const play = () => {
      stop();
      if (reduce || userPicked || !inView) return;
      showcase.classList.add("is-playing");
      timer = setInterval(() => { if (!hovering) show(cur + 1, false, 1); }, DUR);
    };
    tabs.forEach((t, i) => {
      t.addEventListener("click", () => { userPicked = true; stop(); show(i); });
      t.addEventListener("keydown", (e) => {
        const k = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (k) { e.preventDefault(); userPicked = true; stop(); show(cur + k, true, k); }
        if (e.key === "Home") { e.preventDefault(); userPicked = true; stop(); show(0, true); }
        if (e.key === "End") { e.preventDefault(); userPicked = true; stop(); show(tabs.length - 1, true); }
      });
    });
    const stage = showcase.querySelector(".sc-stage");
    stage.addEventListener("pointerenter", () => { hovering = true; showcase.classList.add("is-paused"); });
    stage.addEventListener("pointerleave", () => { hovering = false; showcase.classList.remove("is-paused"); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) { if (!timer) play(); } else stop(); }, { threshold: 0.35 }).observe(stage);
    }
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else if (inView) play(); });
  }

  /* ================= Story rail (shared) ================= */
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
    if (digits) {
      if (useGsap) G.to(digits, { y: `${-i}em`, duration: 0.9, ease: "expo.out" });
      else digits.style.transform = `translateY(${-i}em)`;
    }
    names.forEach((n, k) => { n.classList.toggle("is-on", k === i); n.classList.toggle("is-past", k < i); });
    dots.forEach((d, k) => d.classList.toggle("is-on", k <= i));
  };
  setChapter(0);

  /* ================= Nav + rail + manifesto (fallback) on scroll ================= */
  const nav = document.querySelector(".nav");
  const manifesto = document.getElementById("manifesto");
  let manifestoChars = [];
  if (manifesto && !reduce) {
    manifesto.setAttribute("aria-label", manifesto.textContent);
    manifestoChars = splitChars(manifesto);
    manifestoChars.forEach((c) => { c.classList.add("w"); c.setAttribute("aria-hidden", "true"); });
  }
  let lastY = scrollY;
  const onScroll = () => {
    const sy = scrollY;
    const vh = innerHeight;
    nav.classList.toggle("is-scrolled", sy > 16);
    nav.classList.toggle("is-hidden", sy > lastY && sy > vh * 0.8);
    lastY = sy;
    if (story && chapters.length) {
      let idx = 0;
      chapters.forEach((c, i) => { if (c.getBoundingClientRect().top < vh * 0.55) idx = i; });
      setChapter(idx);
      const r = story.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.5 - r.top) / (r.height - vh * 0.6)));
      if (fill) { fill.style.height = `${p * 100}%`; fill.parentElement.style.setProperty("--fill", `${p * 100}%`); }
    }
    if (!useGsap && manifestoChars.length) {
      const r = manifesto.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const lit = Math.round(p * manifestoChars.length);
      manifestoChars.forEach((c, i) => c.classList.toggle("is-lit", i < lit));
    }
  };
  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; onScroll(); }); } }, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ================= Fallback path (no GSAP / reduced motion) ================= */
  if (!useGsap) {
    if (intro) setTimeout(() => root.classList.add("is-ready"), quick ? 1000 : 2100);
    else requestAnimationFrame(() => requestAnimationFrame(() => root.classList.add("is-ready")));
    const items = document.querySelectorAll(".reveal");
    if ("IntersectionObserver" in window && !reduce) {
      const io = new IntersectionObserver((entries) => entries.forEach((e) => {
        if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
      }), { rootMargin: "0px 0px -10% 0px", threshold: 0.1 });
      items.forEach((el) => io.observe(el));
    } else {
      items.forEach((el) => el.classList.add("is-in"));
    }
    return;
  }

  /* =====================================================================
     GSAP path
     ===================================================================== */
  G.registerPlugin(ST);
  // Sections animate in, and animate in again after you scroll back up past them.
  ST.defaults({ toggleActions: "play none none reverse" });
  const EXPO = "expo.out";

  /* ---------- Smooth scroll ---------- */
  let lenis = null;
  if (window.Lenis) {
    lenis = new window.Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    lenis.on("scroll", ST.update);
    G.ticker.add((t) => lenis.raf(t * 1000));
    G.ticker.lagSmoothing(0);
    if (intro) { lenis.stop(); setTimeout(() => lenis.start(), quick ? 1100 : 2300); }
    document.querySelectorAll('a[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      const t = id === "#top" ? 0 : document.querySelector(id);
      if (t === null) return;
      e.preventDefault();
      lenis.scrollTo(t, { offset: id === "#top" ? 0 : -72, duration: 1.6 });
    }));
  }

  /* ---------- Hero ---------- */
  const heroChars = [];
  document.querySelectorAll(".hero__title .line__in").forEach((l) => heroChars.push(splitChars(l)));
  const ticks = document.querySelectorAll(".hero__title .tick");
  const metaBits = document.querySelectorAll(".hero__meta span");
  const footBits = document.querySelectorAll(".hero__lede, .hero__cta .btn");
  G.set(".hero__foot", { opacity: 1, y: 0 });
  G.set(heroChars.flat(), { yPercent: 115, rotate: 6, opacity: 0, filter: "blur(6px)", transformOrigin: "0% 100%" });
  G.set(ticks, { scale: 0 });
  G.set(metaBits, { y: 14, opacity: 0 });
  G.set(footBits, { y: 24, opacity: 0 });
  G.set(".spine__line", { scaleX: 0, transformOrigin: "0% 50%" });
  G.set(".spine__dot", { scale: 0, xPercent: -50, yPercent: -50, x: 0, y: 0, top: "50%" });
  G.set(".spine__dot em", { opacity: 0, y: -6 });

  const heroTl = G.timeline({ delay: introDelay, defaults: { ease: EXPO } });
  heroTl
    .to(metaBits, { y: 0, opacity: 1, duration: 1, stagger: 0.08 }, 0)
    .to(heroChars.flat(), { yPercent: 0, rotate: 0, opacity: 1, filter: "blur(0px)", duration: 1.4, stagger: 0.035, clearProps: "filter,rotate" }, 0.1)
    .to(ticks, { scale: 1, duration: 0.9, ease: "back.out(2.4)", stagger: 0.15 }, 0.5)
    .to(footBits, { y: 0, opacity: 1, duration: 1.1, stagger: 0.08 }, 0.75)
    .to(".spine__line", { scaleX: 1, duration: 2, ease: "expo.inOut" }, 0.5)
    .to(".spine__dot", { scale: 1, duration: 0.9, ease: "back.out(2)", stagger: 0.22 }, 1.2)
    .to(".spine__dot em", { opacity: 1, y: 0, duration: 0.8, stagger: 0.22 }, 1.35);

  // Hero leaves with depth: lines drift apart and fade as you scroll.
  const heroLines = document.querySelectorAll(".hero__title .line");
  heroLines.forEach((line, i) => {
    G.to(line, {
      yPercent: -40 - i * 35, opacity: 0.15, ease: "none",
      scrollTrigger: { trigger: ".hero", start: "top top", end: "bottom top", scrub: true },
    });
  });
  G.to(".hero__foot", { y: -60, opacity: 0, ease: "none", scrollTrigger: { trigger: ".hero", start: "40% top", end: "bottom top", scrub: true } });
  G.to(".spine__dot--past", { x: -60, ease: "none", scrollTrigger: { trigger: ".spine", start: "top 70%", end: "bottom top", scrub: true } });
  G.to(".spine__dot--future", { x: 60, ease: "none", scrollTrigger: { trigger: ".spine", start: "top 70%", end: "bottom top", scrub: true } });

  /* ---------- Showcase: the window settles flat as it arrives ---------- */
  G.fromTo(".sc-window",
    { rotateX: 16, scale: 0.92, y: 40 },
    { rotateX: 0, scale: 1, y: 0, ease: "none", scrollTrigger: { trigger: ".sc-stage", start: "top 95%", end: "top 30%", scrub: 0.5 } });
  G.from(".sc-tab", { y: 20, opacity: 0, duration: 0.9, ease: EXPO, stagger: 0.06, scrollTrigger: { trigger: ".sc-tabs", start: "top 90%" } });
  G.from(".showcase__sub, .sc-caps", { y: 24, opacity: 0, duration: 1.1, ease: EXPO, scrollTrigger: { trigger: ".showcase__head", start: "top 85%" } });

  /* ---------- Manifesto: scrubbed reading light ---------- */
  if (manifestoChars.length) {
    G.set(manifestoChars, { opacity: 0.14 });
    G.to(manifestoChars, {
      opacity: 1, ease: "none", stagger: 0.05,
      scrollTrigger: { trigger: manifesto, start: "top 80%", end: "bottom 45%", scrub: 0.6 },
    });
  }
  G.from(".manifesto .meta-label", { opacity: 0, x: -20, duration: 1, ease: EXPO, scrollTrigger: { trigger: ".manifesto", start: "top 80%" } });

  /* ---------- Headings: masked line reveal ---------- */
  document.querySelectorAll(".chapter__title, .display-2").forEach((h) => {
    const lines = maskLines(h);
    G.from(lines, {
      yPercent: 110, rotate: 2, duration: 1.3, ease: EXPO, stagger: 0.09,
      scrollTrigger: { trigger: h, start: "top 85%" },
    });
  });
  document.querySelectorAll(".meta-label, .chapter__en").forEach((el) => {
    if (el.closest(".manifesto")) return;
    G.from(el, { opacity: 0, x: -24, duration: 1.1, ease: EXPO, scrollTrigger: { trigger: el, start: "top 88%" } });
  });
  document.querySelectorAll(".chapter__body, .letter-sec__body, .download__sub").forEach((el) => {
    G.from(el, { opacity: 0, y: 28, duration: 1.2, ease: EXPO, scrollTrigger: { trigger: el, start: "top 88%" } });
  });

  /* ---------- Chapter panels ---------- */
  document.querySelectorAll(".chapter .panel").forEach((panel) => {
    const tl = G.timeline({ scrollTrigger: { trigger: panel, start: "top 80%" } });
    tl.fromTo(panel,
      { clipPath: "inset(14% 8% 14% 8% round 28px)", y: 60, opacity: 0 },
      { clipPath: "inset(0% 0% 0% 0% round 20px)", y: 0, opacity: 1, duration: 1.4, ease: "expo.inOut", clearProps: "clipPath" });

    const tlItems = panel.querySelectorAll(".tl__year, .tl__item");
    if (tlItems.length) tl.from(tlItems, { x: -24, opacity: 0, duration: 0.9, ease: EXPO, stagger: 0.09 }, "-=0.6");

    const text = panel.querySelector(".journal__text");
    if (text) {
      const caret = text.querySelector(".caret");
      const chars = splitChars(text);
      if (caret) text.appendChild(caret);
      tl.from(panel.querySelector(".journal__head"), { opacity: 0, y: 10, duration: 0.6 }, "-=0.6")
        .from(chars, { opacity: 0, duration: 0.01, stagger: 0.028, ease: "none" }, "-=0.2")
        .fromTo(panel.querySelectorAll(".mood"), { scale: 0 }, { scale: 1, duration: 0.7, ease: "back.out(2.2)", stagger: 0.06, clearProps: "transform" }, "-=0.4")
        .fromTo(panel.querySelectorAll(".thumbs span"), { y: 16, opacity: 0, rotate: -8 }, { y: 0, opacity: 1, rotate: 0, duration: 0.8, ease: EXPO, stagger: 0.08 }, "<0.1")
        .from(panel.querySelector(".journal__saved"), { opacity: 0, x: 8, duration: 0.5 }, ">-0.2");
    }

    const bar = panel.querySelector(".progress span");
    if (bar) {
      G.set(bar, { width: "0%" });
      tl.to(bar, { width: "60%", duration: 1.6, ease: "expo.inOut" }, "-=0.7")
        .from(panel.querySelectorAll(".steps li"), { x: -16, opacity: 0, duration: 0.8, ease: EXPO, stagger: 0.1 }, "<0.1")
        .fromTo(panel.querySelectorAll(".steps .icon"), { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.6, ease: "back.out(2.5)", stagger: 0.12 }, "<0.3");
    }
  });
  document.querySelectorAll(".facts").forEach((f) => {
    G.from(f.children, { y: 30, opacity: 0, duration: 1.1, ease: EXPO, stagger: 0.1, scrollTrigger: { trigger: f, start: "top 88%" } });
  });

  /* ---------- Sealed letter: ink curtain + sealing sequence ---------- */
  G.fromTo(".letter-sec__bg",
    { clipPath: "inset(0% 5% 0% 5% round 48px)" },
    { clipPath: "inset(0% 0% 0% 0% round 0px)", ease: "none", scrollTrigger: { trigger: ".letter-sec", start: "top bottom", end: "top 25%", scrub: true } });

  const env = document.getElementById("envelope");
  if (env) {
    const seal = env.querySelector(".envelope__seal");
    const ring = env.querySelector(".envelope__ring");
    const count = env.querySelectorAll(".countdown > div");
    env.style.setProperty("--veil", "100%");
    G.set(seal, { scale: 2.6, rotate: -40, opacity: 0 });
    G.set(count, { y: 30, opacity: 0 });
    const tl = G.timeline({ scrollTrigger: { trigger: env, start: "top 75%" } });
    tl.from(env, { y: 60, opacity: 0, duration: 1.2, ease: EXPO })
      .from(env.querySelectorAll(".envelope__to, .envelope__line"), { opacity: 0, x: -16, duration: 0.8, ease: EXPO, stagger: 0.08 }, "-=0.7")
      .to(env, { "--veil": "0%", duration: 1.1, ease: "expo.inOut" }, "+=0.15")
      .to(seal, { scale: 1, rotate: 0, opacity: 1, duration: 0.55, ease: "power4.in" }, "-=0.35")
      .to(env, { keyframes: [{ x: -4 }, { x: 3 }, { x: -2 }, { x: 0 }], duration: 0.3, ease: "none" })
      .fromTo(ring, { scale: 1, opacity: 0.9 }, { scale: 2.4, opacity: 0, duration: 1.1, ease: EXPO }, "<")
      .to(count, { y: 0, opacity: 1, duration: 1, ease: EXPO, stagger: 0.08 }, "-=0.8")
      .from(env.querySelector(".envelope__meta"), { opacity: 0, duration: 0.8 }, "-=0.5");
  }

  /* ---------- Ledgers: lines draw, rows rise ---------- */
  document.querySelectorAll(".ledger, .dl-list, .faq__list").forEach((list) => {
    const line = document.createElement("span");
    line.className = "draw-line";
    line.setAttribute("aria-hidden", "true");
    list.prepend(line);
    G.from(line, { scaleX: 0, duration: 1.6, ease: "expo.inOut", scrollTrigger: { trigger: list, start: "top 85%" } });
    G.from(list.querySelectorAll(":scope > li, :scope > .dl, :scope > details"), {
      y: 40, opacity: 0, duration: 1.1, ease: EXPO, stagger: 0.09,
      scrollTrigger: { trigger: list, start: "top 82%" },
    });
  });
  document.querySelectorAll(".ledger__no").forEach((n) => {
    const to = parseInt(n.textContent, 10);
    const o = { v: 0 };
    G.to(o, { v: to, duration: 1.2, ease: "power2.out", scrollTrigger: { trigger: n, start: "top 85%" }, onUpdate: () => { n.textContent = String(Math.round(o.v)).padStart(2, "0"); } });
  });
  G.from(".detail-grid li", { y: 30, opacity: 0, duration: 1.1, ease: EXPO, stagger: 0.08, scrollTrigger: { trigger: ".detail-grid", start: "top 88%" } });
  G.from(".note", { opacity: 0, y: 16, duration: 1, ease: EXPO, scrollTrigger: { trigger: ".note", start: "top 92%" } });

  /* ---------- Footer: wordmark rises ---------- */
  const wm = [...document.querySelectorAll(".wordmark span:not(.sp)")];
  G.from(wm, { yPercent: 110, duration: 1.4, ease: EXPO, stagger: 0.05, scrollTrigger: { trigger: ".wordmark", start: "top 92%" } });
  G.from(".footer__tag, .footer__top .btn", { y: 30, opacity: 0, duration: 1.1, ease: EXPO, stagger: 0.1, scrollTrigger: { trigger: ".footer", start: "top 85%" } });

  /* ---------- Keep triggers correct after fonts / images settle ---------- */
  document.fonts?.ready.then(() => ST.refresh());
  addEventListener("load", () => ST.refresh());
})();
