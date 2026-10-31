/* overlay — imleç, tık halkası, ok + etiket, spot, başlık kartı. Hepsi #ov-kok içinde, pointer-events:none.
 * Ayar: sayfa yüklenmeden window.OV_AYAR = { marka, rozet, renk: { koyu, koyu2, vurgu, vurgu2 }, font } (kaydet.mjs senaryo.ayar'dan verir).
 * Tüm parıltı/gölge tonları bu dört renkten color-mix ile türetilir.
 * Settings: window.OV_AYAR = { marka (brand), rozet (badge), renk: { koyu, koyu2, vurgu, vurgu2 } (dark, dark2, accent, accent2), font }. */
window.Ov = (function () {
  const AYAR = window.OV_AYAR || {};
  const RENK = Object.assign({ koyu: "#111827", koyu2: "#1e293b", vurgu: "#3b82f6", vurgu2: "#93c5fd" }, AYAR.renk || {});
  const karis = (r, y) => `color-mix(in srgb, ${r} ${y}%, transparent)`;
  const LACI = RENK.koyu, LACI2 = RENK.koyu2, AMBER = RENK.vurgu, AMBER2 = RENK.vurgu2;
  // varsayılan: sayfanın kendi fontu (--font-sans / Geist) varsa o, yoksa yaygın sans-serif'ler
  const FONT = AYAR.font || 'var(--font-sans, var(--font-geist-sans, "Inter")), "Inter", "Helvetica Neue", Arial, "Noto Sans", "DejaVu Sans", sans-serif';
  const MARKA = AYAR.marka ?? "";
  const ROZET = AYAR.rozet ?? "Demo";
  const NS = "http://www.w3.org/2000/svg";
  const mobil = () => window.innerWidth <= 640;
  const bekle = (ms) => new Promise((r) => setTimeout(r, ms));
  const kok = () => {
    let k = document.getElementById("ov-kok");
    if (!k && document.body) {
      k = document.createElement("div");
      k.id = "ov-kok";
      k.style.cssText = "position:fixed;inset:0;pointer-events:none;z-index:2147483000";
      document.body.appendChild(k);
    }
    return k;
  };

  const css = `
#ov-kok{font-family:${FONT};-webkit-font-smoothing:antialiased}
#ov-kok *{box-sizing:border-box;pointer-events:none}
.ov-imlec{position:fixed;left:0;top:0;z-index:40;will-change:transform;transition-property:transform,opacity;transition-timing-function:cubic-bezier(.45,.05,.2,1)}
.ov-imlec svg{display:block;transform-origin:3px 2px;transition:transform .18s;filter:drop-shadow(0 4px 6px rgba(0,0,0,.35)) drop-shadow(0 1px 1px rgba(0,0,0,.4))}
.ov-imlec.ov-basili svg{transform:scale(.86);transition:transform .1s}
.ov-parmak{width:46px;height:46px;margin:-23px 0 0 -23px;border-radius:50%;background:rgba(255,255,255,.55);border:2.5px solid ${karis(LACI, 75)};box-shadow:0 3px 10px rgba(0,0,0,.35);transition:transform .15s}
.ov-imlec.ov-basili .ov-parmak{transform:scale(.8)}
.ov-halka{position:fixed;z-index:39;border-radius:50%;border:4px solid ${AMBER};width:24px;height:24px;margin:-12px 0 0 -12px;animation:ov-halka .7s cubic-bezier(.2,.7,.3,1) forwards}
.ov-halka.ov-h2{border-color:#fff;animation-delay:.08s;opacity:0}
@keyframes ov-halka{0%{transform:scale(.4);opacity:1}100%{transform:scale(3.4);opacity:0}}
.ov-ok-grup{position:fixed;inset:0;z-index:30;transition:opacity .3s}
.ov-ok-grup svg{position:absolute;inset:0;width:100%;height:100%;overflow:visible}
.ov-cizgi{fill:none;stroke-linecap:round;stroke-linejoin:round;animation:ov-ciz .55s cubic-bezier(.5,0,.2,1) .18s forwards}
@keyframes ov-ciz{to{stroke-dashoffset:0}}
.ov-bas{opacity:0;animation:ov-gel .18s ease-out .68s forwards}
@keyframes ov-gel{to{opacity:1}}
.ov-etiket{position:absolute;left:0;top:0;white-space:nowrap;background:${LACI};color:#fff;font-weight:650;letter-spacing:-.01em;border-radius:14px;border:2px solid ${AMBER};box-shadow:0 10px 30px rgba(6,15,34,.45),0 2px 6px rgba(0,0,0,.25);opacity:0;transform:scale(.85);animation:ov-etiket .38s cubic-bezier(.2,1.3,.4,1) forwards}
.ov-etiket::before{content:"";display:inline-block;width:.55em;height:.55em;border-radius:50%;background:${AMBER};margin-right:.5em;vertical-align:.08em;box-shadow:0 0 0 4px ${karis(AMBER, 25)}}
@keyframes ov-etiket{to{opacity:1;transform:scale(1)}}
.ov-cerceve{position:fixed;z-index:29;border:3px solid ${AMBER};border-radius:12px;animation:ov-nabiz 1.3s ease-in-out infinite;transition:opacity .3s}
@keyframes ov-nabiz{0%,100%{box-shadow:0 0 0 0 ${karis(AMBER, 55)},0 0 18px ${karis(AMBER, 35)}}50%{box-shadow:0 0 0 9px ${karis(AMBER, 0)},0 0 26px ${karis(AMBER, 55)}}}
.ov-isik{position:fixed;z-index:20;border-radius:16px;box-shadow:0 0 0 9999px rgba(4,10,24,.55),0 0 0 3px ${karis(AMBER2, 95)},0 0 40px 6px ${karis(AMBER2, 45)};opacity:0;transition:opacity .45s ease,left .45s ease,top .45s ease,width .45s ease,height .45s ease}
.ov-isik.ov-acik{opacity:1}
.ov-baslik{position:fixed;inset:0;z-index:60;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;color:#fff;background:radial-gradient(ellipse at 20% 10%,${karis(AMBER, 16)},transparent 55%),linear-gradient(135deg,color-mix(in srgb, ${LACI} 70%, #000) 0%,${LACI} 45%,${LACI2} 100%);opacity:0;transition:opacity .55s ease}
.ov-baslik.ov-acik{opacity:1}
.ov-baslik .ov-ic{transform:translateY(28px) scale(.97);opacity:0;transition:transform .8s cubic-bezier(.2,.8,.2,1) .1s,opacity .7s ease .1s;padding:0 6vw;max-width:100%}
.ov-baslik.ov-acik .ov-ic{transform:none;opacity:1}
.ov-baslik.ov-cikis .ov-ic{transform:translateY(-18px);opacity:0;transition-delay:0s}
.ov-marka{display:inline-flex;align-items:center;gap:.6em;font-weight:600;letter-spacing:.18em;text-transform:uppercase;color:${AMBER2};font-size:var(--ov-k);margin-bottom:1.6em}
.ov-marka i{display:inline-block;width:2.4em;height:3px;border-radius:2px;background:${AMBER}}
.ov-ust{font-size:var(--ov-b);font-weight:750;letter-spacing:-.025em;line-height:1.08}
.ov-alt{margin-top:.9em;font-size:var(--ov-a);color:rgba(255,255,255,.78);font-weight:450}
.ov-cubuk{width:5.5em;height:5px;border-radius:3px;background:${AMBER};margin:1.1em auto 0;transform-origin:left;transform:scaleX(0);transition:transform .9s cubic-bezier(.2,.8,.2,1) .5s;font-size:var(--ov-a)}
.ov-baslik.ov-acik .ov-cubuk{transform:scaleX(1)}
.ov-sema{display:flex;align-items:stretch;justify-content:center;gap:var(--ov-g);margin-top:var(--ov-s)}
.ov-sema.ov-dikey{flex-direction:column;align-items:center}
.ov-dugum{background:rgba(255,255,255,.07);border:1.5px solid rgba(255,255,255,.18);border-radius:18px;padding:1em 1.3em;font-size:var(--ov-a);min-width:8.5em;opacity:0;transform:translateY(16px);transition:opacity .5s ease,transform .6s cubic-bezier(.2,.8,.2,1)}
.ov-dugum b{display:block;font-weight:700;color:#fff}
.ov-dugum span{display:block;margin-top:.25em;font-size:.72em;color:rgba(255,255,255,.7)}
.ov-dugum .ov-no{display:inline-flex;align-items:center;justify-content:center;width:1.6em;height:1.6em;border-radius:50%;background:${AMBER};color:${LACI};font-weight:800;font-size:.8em;margin-bottom:.5em}
.ov-baslik.ov-acik .ov-dugum{opacity:1;transform:none}
.ov-akis{align-self:center;color:${AMBER};font-size:var(--ov-a);font-weight:800;opacity:0;transition:opacity .4s ease .4s}
.ov-baslik.ov-acik .ov-akis{opacity:1}
.ov-demo{position:fixed;left:14px;bottom:14px;z-index:70;background:${karis(LACI, 82)};color:#fff;font:600 13px/1 ${FONT};letter-spacing:.04em;padding:7px 11px;border-radius:999px;border:1px solid ${karis(AMBER, 60)};display:flex;align-items:center;gap:6px}
.ov-demo::before{content:"";width:7px;height:7px;border-radius:50%;background:${AMBER}}
`;

  let imlec = null, imX = 0, imY = 0, okGrup = null, cerceve = null, isikEl = null, hazir = false;

  function kur() {
    if (hazir || !kok()) return;
    hazir = true;
    const st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
    if (!ROZET) return;
    const d = document.createElement("div");
    d.className = "ov-demo";
    d.textContent = ROZET;
    if (mobil()) Object.assign(d.style, { fontSize: "10px", padding: "5px 8px", left: "8px", bottom: "72px" });
    kok().appendChild(d);
  }

  function imlecYap() {
    kur();
    if (imlec) return imlec;
    imlec = document.createElement("div");
    imlec.className = "ov-imlec";
    imlec.innerHTML = mobil()
      ? '<div class="ov-parmak"></div>'
      : '<svg width="38" height="48" viewBox="0 0 19 24"><path d="M2 1.5 L2 19.5 L6.6 15.4 L9.6 22.2 L12.6 20.9 L9.7 14.2 L15.8 14.2 Z" fill="#fff" stroke="#111" stroke-width="1.3" stroke-linejoin="round"/></svg>';
    imX = window.innerWidth / 2; imY = window.innerHeight * 0.6;
    imlec.style.transitionDuration = "0ms";
    imlec.style.transform = `translate3d(${imX}px,${imY}px,0)`;
    kok().appendChild(imlec);
    return imlec;
  }

  /** İmleci (x,y)'ye easing ile süzdürür. ms verilmezse mesafeye göre 450–1100 ms. */
  function imlecGit(x, y, ms) {
    const el = imlecYap();
    if (ms == null) {
      const d = Math.hypot(x - imX, y - imY);
      ms = Math.round(Math.min(1100, Math.max(450, 350 + d * 0.55)));
    }
    el.style.opacity = "1";
    el.style.transitionDuration = ms + "ms";
    void el.offsetWidth;
    el.style.transform = `translate3d(${x}px,${y}px,0)`;
    imX = x; imY = y;
    return bekle(ms + 30);
  }

  function imlecGizle(g) { imlecYap().style.opacity = g ? "0" : "1"; }

  function tikHalkasi(x, y) {
    kur();
    if (x == null) { x = imX; y = imY; }
    const im = imlecYap();
    im.classList.add("ov-basili");
    setTimeout(() => im.classList.remove("ov-basili"), 160);
    for (const ek of ["", " ov-h2"]) {
      const h = document.createElement("div");
      h.className = "ov-halka" + ek;
      h.style.left = x + "px"; h.style.top = y + "px";
      kok().appendChild(h);
      setTimeout(() => h.remove(), 900);
    }
    return bekle(180);
  }

  const kis = (v, a, b) => Math.max(a, Math.min(b, v));
  const ters = { ust: "alt", alt: "ust", sol: "sag", sag: "sol" };

  function okKaldir() {
    const g = okGrup, c = cerceve;
    okGrup = null; cerceve = null;
    for (const e of [g, c]) if (e) { e.style.opacity = "0"; setTimeout(() => e.remove(), 320); }
    return bekle(0);
  }

  /** rect hedefine kavisli ok + etiket. yon: etiketin hedefe göre tarafı (ust|alt|sol|sag). */
  function ok(rect, etiket, yon) {
    kur();
    okKaldir();
    yon = yon || "sag";
    const m = mobil();
    const W = window.innerWidth, H = window.innerHeight;
    const kenar = m ? 10 : 24, bosluk = m ? 46 : 110, pad = m ? 4 : 6;
    const r = { left: rect.left ?? rect.x, top: rect.top ?? rect.y, width: rect.width, height: rect.height };
    r.right = r.left + r.width; r.bottom = r.top + r.height;
    const cx = r.left + r.width / 2, cy = r.top + r.height / 2;

    const c = document.createElement("div");
    c.className = "ov-cerceve";
    Object.assign(c.style, { left: r.left - pad + "px", top: r.top - pad + "px", width: r.width + 2 * pad + "px", height: r.height + 2 * pad + "px" });
    kok().appendChild(c);
    cerceve = c;

    const g = document.createElement("div");
    g.className = "ov-ok-grup";
    const lb = document.createElement("div");
    lb.className = "ov-etiket";
    lb.textContent = etiket || "";
    Object.assign(lb.style, m ? { fontSize: "16px", padding: "9px 13px", borderRadius: "11px" } : { fontSize: "26px", padding: "14px 22px" });
    g.appendChild(lb);
    kok().appendChild(g);
    if (lb.offsetWidth > W - 2 * kenar) { lb.style.whiteSpace = "normal"; lb.style.maxWidth = W - 2 * kenar + "px"; }
    const lw = lb.offsetWidth, lh = lb.offsetHeight;

    const yer = {
      sol: () => r.left - bosluk - lw >= kenar,
      sag: () => r.right + bosluk + lw <= W - kenar,
      ust: () => r.top - bosluk - lh >= kenar,
      alt: () => r.bottom + bosluk + lh <= H - kenar,
    };
    if (!yer[yon]()) {
      if (yer[ters[yon]]()) yon = ters[yon];
      else if (yer.alt()) yon = "alt";
      else if (yer.ust()) yon = "ust";
    }
    let lx, ly;
    if (yon === "sol") { lx = r.left - bosluk - lw; ly = cy - lh / 2 - (m ? 0 : 40); }
    else if (yon === "sag") { lx = r.right + bosluk; ly = cy - lh / 2 - (m ? 0 : 40); }
    else if (yon === "ust") { lx = cx - lw / 2 + (m ? 0 : 60); ly = r.top - bosluk - lh; }
    else { lx = cx - lw / 2 + (m ? 0 : 60); ly = r.bottom + bosluk; }
    lx = kis(lx, kenar, W - kenar - lw);
    ly = kis(ly, kenar, H - kenar - lh);
    lb.style.left = lx + "px"; lb.style.top = ly + "px";
    lb.style.transformOrigin = { sol: "right center", sag: "left center", ust: "center bottom", alt: "center top" }[yon];

    // başlangıç: etiketin hedefe bakan kenarı; bitiş: hedefin etikete bakan kenarı
    const lcx = lx + lw / 2, lcy = ly + lh / 2;
    const ar = m ? 6 : 12;
    let x0, y0, x1, y1;
    if (yon === "sol") { x0 = lx + lw + 4; y0 = lcy; x1 = r.left - pad - ar; y1 = kis(lcy, r.top + 4, r.bottom - 4); }
    else if (yon === "sag") { x0 = lx - 4; y0 = lcy; x1 = r.right + pad + ar; y1 = kis(lcy, r.top + 4, r.bottom - 4); }
    else if (yon === "ust") { x0 = lcx; y0 = ly + lh + 4; x1 = kis(lcx, r.left + 8, r.right - 8); y1 = r.top - pad - ar; }
    else { x0 = lcx; y0 = ly - 4; x1 = kis(lcx, r.left + 8, r.right - 8); y1 = r.bottom + pad + ar; }
    // etiket hedefle örtüşüyorsa (yer yok) ok çizme, yalnız etiket + çerçeve
    const ortusme = lx < r.right && lx + lw > r.left && ly < r.bottom && ly + lh > r.top;
    const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1;
    if (!ortusme && L > 14) {
      const bk = Math.min(L * 0.32, m ? 40 : 90);
      const sgn = yon === "sol" || yon === "ust" ? -1 : 1;
      const qx = (x0 + x1) / 2 + (-dy / L) * bk * sgn, qy = (y0 + y1) / 2 + (dx / L) * bk * sgn;
      const d = `M${x0},${y0} Q${qx},${qy} ${x1},${y1}`;
      const tx = x1 - qx, ty = y1 - qy, tl = Math.hypot(tx, ty) || 1, ux = tx / tl, uy = ty / tl;
      const hs = m ? 13 : 26, hw = m ? 8 : 15;
      const tipX = x1 + ux * ar * 0.9, tipY = y1 + uy * ar * 0.9;
      const bx = tipX - ux * hs, by = tipY - uy * hs;
      const bas = `M${tipX},${tipY} L${bx - uy * hw},${by + ux * hw} L${bx + uy * hw},${by - ux * hw} Z`;
      const sw = m ? 4.5 : 8;
      const svg = document.createElementNS(NS, "svg");
      const cizgi = (renk, w) => {
        const p = document.createElementNS(NS, "path");
        p.setAttribute("d", d); p.setAttribute("class", "ov-cizgi");
        p.setAttribute("stroke", renk); p.setAttribute("stroke-width", w);
        svg.appendChild(p);
        return p;
      };
      const p1 = cizgi(LACI, sw + (m ? 3 : 6));
      const p2 = cizgi(AMBER, sw);
      const hp = document.createElementNS(NS, "path");
      hp.setAttribute("d", bas); hp.setAttribute("class", "ov-bas");
      hp.setAttribute("fill", AMBER); hp.setAttribute("stroke", LACI);
      hp.setAttribute("stroke-width", m ? 2 : 3); hp.setAttribute("stroke-linejoin", "round");
      svg.appendChild(hp);
      g.insertBefore(svg, lb);
      for (const p of [p1, p2]) { const len = p.getTotalLength() + 1; p.style.strokeDasharray = len; p.style.strokeDashoffset = len; }
    }
    okGrup = g;
    return bekle(750);
  }

  /** Spot: hedef dışı %55 karartılır. */
  function isik(rect) {
    kur();
    const m = mobil(), p = m ? 6 : 10;
    const r = { left: rect.left ?? rect.x, top: rect.top ?? rect.y, width: rect.width, height: rect.height };
    let el = isikEl;
    if (!el) { el = document.createElement("div"); el.className = "ov-isik"; kok().appendChild(el); isikEl = el; }
    Object.assign(el.style, { left: r.left - p + "px", top: r.top - p + "px", width: r.width + 2 * p + "px", height: r.height + 2 * p + "px" });
    void el.offsetWidth;
    el.classList.add("ov-acik");
    return bekle(450);
  }

  function isikKaldir() {
    const el = isikEl;
    isikEl = null;
    if (el) { el.classList.remove("ov-acik"); setTimeout(() => el.remove(), 500); }
    return bekle(0);
  }

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /** Tam ekran başlık kartı; ms toplam süre (giriş+çıkış dahil).
   *  ek.sema   = [["Başlık","alt satır"], ...] → numaralı akış şeması (ust başlık + düğümler)
   *  ek.cipler = true → ust metni "·" ile bölünür, numaralı adım çipleri olur (kapanış kartı) */
  async function baslik(ust, alt, ms, ek) {
    kur();
    ek = ek || {};
    ms = ms || 4000;
    const m = mobil();
    const el = document.createElement("div");
    el.className = "ov-baslik";
    const v = { "--ov-b": m ? "38px" : "84px", "--ov-a": m ? "17px" : "34px", "--ov-k": m ? "12px" : "20px", "--ov-g": m ? "10px" : "26px", "--ov-s": m ? "28px" : "64px" };
    for (const k in v) el.style.setProperty(k, v[k]);
    const akis = `<div class="ov-akis">${m ? "↓" : "→"}</div>`;
    let govde;
    if (Array.isArray(ek.sema) && ek.sema.length) {
      govde = `<div class="ov-ust">${esc(ust)}</div><div class="ov-cubuk"></div>
        <div class="ov-sema${m ? " ov-dikey" : ""}">${ek.sema
          .map((d, i) => `<div class="ov-dugum" style="transition-delay:${0.55 + i * 0.35}s"><div class="ov-no">${i + 1}</div><b>${esc(d[0])}</b>${d[1] ? `<span>${esc(d[1])}</span>` : ""}</div>`)
          .join(akis)}</div>`;
    } else if (ek.cipler) {
      const parcalar = String(ust).split("·").map((s) => s.trim()).filter(Boolean);
      govde = `<div class="ov-sema${m ? " ov-dikey" : ""}" style="margin-top:0">${parcalar
        .map((s, i) => `<div class="ov-dugum" style="min-width:${m ? "9em" : "6em"};transition-delay:${0.3 + i * 0.3}s"><div class="ov-no">${i + 1}</div><b style="font-size:1.35em">${esc(s)}</b></div>`)
        .join(akis)}</div>
        ${alt ? `<div class="ov-alt" style="margin-top:1.4em;color:#fff;font-weight:650">${esc(alt)}</div>` : ""}<div class="ov-cubuk"></div>`;
    } else {
      govde = `<div class="ov-ust">${esc(ust)}</div><div class="ov-cubuk"></div>${alt ? `<div class="ov-alt">${esc(alt)}</div>` : ""}`;
    }
    const marka = MARKA ? `<div class="ov-marka"><i></i>${esc(MARKA)}<i></i></div>` : "";
    el.innerHTML = `<div class="ov-ic">${marka}${govde}</div>`;
    kok().appendChild(el);
    void el.offsetWidth;
    el.classList.add("ov-acik");
    await bekle(Math.max(600, ms - 600));
    el.classList.add("ov-cikis");
    el.classList.remove("ov-acik");
    await bekle(600);
    el.remove();
  }

  function temizle() {
    okKaldir();
    isikKaldir();
    const k = kok();
    if (k) k.querySelectorAll(".ov-baslik,.ov-halka").forEach((e) => e.remove());
    return bekle(0);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", kur);
  else kur();

  return { imlecGit, imlecGizle, tikHalkasi, ok, okKaldir, isik, isikKaldir, baslik, temizle, konum: () => ({ x: imX, y: imY }) };
})();
