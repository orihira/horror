/* ==========================================================================
 *  main.js — 監視カメラチェックの進行を管理するエンジン本体。
 * ========================================================================== */

const app = document.getElementById("app");
const root = document.documentElement;
const muteBtn = document.getElementById("mute-btn");

const state = {
  index: 0,
  muted: false,
  audioCtx: null,
  doneCams: new Set()
};

/* -------------------- audio -------------------- */

function getAudioCtx() {
  if (!state.audioCtx) {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    state.audioCtx = new Ctx();
  }
  return state.audioCtx;
}

function playBeep(freq = 720) {
  if (state.muted) return;
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.32);
  } catch (e) { /* ignore */ }
}

function playAlert() {
  if (state.muted) return;
  try {
    const ctx = getAudioCtx();
    [880, 660].forEach((f, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = f;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0.0001, t);
      gain.gain.exponentialRampToValueAtTime(0.09, t + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.35);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t);
      osc.stop(t + 0.4);
    });
  } catch (e) { /* ignore */ }
}

function playNoiseBurst(duration = 1.4, peak = 0.16) {
  if (state.muted) return;
  try {
    const ctx = getAudioCtx();
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.frequency.value = 1100;
    filter.Q.value = 0.5;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(peak, ctx.currentTime + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
    noise.connect(filter).connect(gain).connect(ctx.destination);
    noise.start();
    noise.stop(ctx.currentTime + duration);
  } catch (e) { /* ignore */ }
}

muteBtn.addEventListener("click", () => {
  state.muted = !state.muted;
  muteBtn.textContent = state.muted ? "SOUND: OFF" : "SOUND: ON";
});
muteBtn.textContent = "SOUND: ON";

/* -------------------- corruption -------------------- */

function applyCorruption(level, alert) {
  root.style.setProperty("--corruption", level ? (level.corruption || 0) : 0);
  document.body.classList.toggle("alert-mode", !!alert);
}

/* -------------------- typewriter -------------------- */

function typewriter(el, text, onDone) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) { el.textContent = text; if (onDone) onDone(); return; }
  el.textContent = "";
  const cursor = document.createElement("span");
  cursor.className = "cursor";
  let i = 0;
  const speed = 26;
  function step() {
    if (i <= text.length) {
      el.textContent = text.slice(0, i);
      el.appendChild(cursor);
      i++;
      setTimeout(step, text[i - 1] === "\n" ? speed * 4 : speed);
    } else {
      cursor.remove();
      if (onDone) onDone();
    }
  }
  step();
}

/* -------------------- sidebar -------------------- */

function renderSidebarHTML(currentCam) {
  const items = window.CAM_LIST.map(c => {
    let cls = "";
    if (state.doneCams.has(c.cam)) cls = "done";
    else if (c.cam === currentCam) cls = "current";
    return `<li class="${cls}"><span class="dot"></span>CAM ${c.cam} <span style="opacity:.6">${c.label}</span></li>`;
  }).join("");

  return `
    <aside id="sidebar">
      <p class="sidebar-heading"><span>監視カメラ</span><span>${state.doneCams.size} / ${window.CAM_LIST.length}</span></p>
      <ul id="cam-list">${items}</ul>
      <div class="status-box">
        <div class="label">ステータス</div>
        <div class="value" id="status-value">監視中</div>
      </div>
    </aside>`;
}

/* -------------------- screens -------------------- */

function clearApp() { app.innerHTML = ""; }

function renderTitle() {
  applyCorruption(null, false);
  clearApp();
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="center-panel">
      <h1 class="mono">監視カメラシステム</h1>
      <p>ある集合住宅、深夜の定時巡回記録。<br>
         全12台のカメラを1台ずつ確認し、映像内の異常を見つけてください。</p>
      <div class="actions"><button class="primary" id="start-btn">巡回を開始する</button></div>
    </div>`;
  app.appendChild(wrap);
  document.getElementById("start-btn").addEventListener("click", () => {
    getAudioCtx();
    state.index = 0;
    state.doneCams = new Set();
    playLevel(0, "before");
  });
}

function renderCheckBefore(level, onContinue) {
  applyCorruption(level, false);
  clearApp();
  const camMeta = window.CAM_LIST.find(c => c.cam === level.cam) || { label: "" };
  app.innerHTML = `
    ${renderSidebarHTML(level.cam)}
    <section id="main-view">
      <div class="cam-heading">
        <span class="cam-id mono">CAM ${level.cam}</span>
        <h1>${camMeta.label}</h1>
      </div>
      <p class="cam-sub mono">巡回チェック中……</p>
      <p class="log-text" id="log-text"></p>
      <div class="actions"><button class="primary hidden" id="continue-btn">映像を確認する</button></div>
    </section>`;
  const textEl = document.getElementById("log-text");
  const btn = document.getElementById("continue-btn");
  typewriter(textEl, level.log.before, () => btn.classList.remove("hidden"));
  btn.addEventListener("click", onContinue);
}

function renderCheckGame(level, onComplete) {
  applyCorruption(level, false);
  clearApp();
  const camMeta = window.CAM_LIST.find(c => c.cam === level.cam) || { label: "" };
  let found = false;

  app.innerHTML = `
    ${renderSidebarHTML(level.cam)}
    <section id="main-view">
      <div class="cam-heading">
        <span class="cam-id mono">CAM ${level.cam}</span>
        <h1>${camMeta.label}</h1>
      </div>
      <p class="cam-sub mono">2枚の映像を見比べて、異常な箇所をタップしてください</p>

      <div class="frame-row">
        <p class="frame-label mono">基準映像（正常時の記録）</p>
        <div class="board" id="board-ref">
          <img src="${level.images.normal}" alt="基準映像">
        </div>
      </div>

      <div class="frame-row">
        <p class="frame-label mono">現在の映像</p>
        <div class="board tappable" id="board-live">
          <img src="${level.images.anomaly}" alt="現在の映像">
          <span class="rec"><span class="dot"></span>REC</span>
        </div>
      </div>
      <p class="hint mono" id="hint">気になる箇所があれば、タップしてください</p>
      <div class="actions"><button class="primary hidden" id="next-btn">次のカメラへ</button></div>
    </section>`;

  const boardLive = document.getElementById("board-live");
  const hint = document.getElementById("hint");
  const nextBtn = document.getElementById("next-btn");
  const statusValue = document.getElementById("status-value");

  function markFound(diff) {
    const m = document.createElement("div");
    m.className = "mark";
    m.style.left = diff.x + "%";
    m.style.top = diff.y + "%";
    boardLive.appendChild(m);
  }

  function flashMiss() {
    const f = document.createElement("div");
    f.className = "miss-flash";
    boardLive.appendChild(f);
    setTimeout(() => f.remove(), 260);
  }

  function handleTap(evt) {
    if (found) return;
    const rect = boardLive.getBoundingClientRect();
    const clientX = evt.touches ? evt.touches[0].clientX : evt.clientX;
    const clientY = evt.touches ? evt.touches[0].clientY : evt.clientY;
    const xPct = ((clientX - rect.left) / rect.width) * 100;
    const yPct = ((clientY - rect.top) / rect.height) * 100;

    let hit = null;
    level.diffs.forEach(d => {
      const dist = Math.hypot(d.x - xPct, d.y - yPct);
      if (dist <= d.r) hit = d;
    });

    if (hit) {
      found = true;
      markFound(hit);
      boardLive.classList.add("flagged");
      playAlert();
      document.body.classList.add("alert-mode");
      statusValue.textContent = "異常を検知";
      hint.innerHTML = '<span class="found">異常を検知しました。</span>';
      state.doneCams.add(level.cam);
      document.querySelectorAll("#cam-list li").forEach((li, i) => {
        if (window.CAM_LIST[i].cam === level.cam) li.className = "done";
      });
      setTimeout(() => nextBtn.classList.remove("hidden"), 500);
    } else {
      playBeep(300);
      flashMiss();
    }
  }

  boardLive.addEventListener("click", handleTap);
  nextBtn.addEventListener("click", onComplete);
}

function renderCheckAfter(level, onContinue) {
  applyCorruption(level, true);
  clearApp();
  const camMeta = window.CAM_LIST.find(c => c.cam === level.cam) || { label: "" };
  app.innerHTML = `
    ${renderSidebarHTML(null)}
    <section id="main-view">
      <div class="cam-heading">
        <span class="cam-id mono">CAM ${level.cam}</span>
        <h1>${camMeta.label}</h1>
      </div>
      <p class="cam-sub mono" style="color:var(--red)">⚠ 異常を検知</p>
      <p class="log-text" id="log-text"></p>
      <div class="actions"><button class="primary hidden" id="continue-btn">次のカメラへ</button></div>
    </section>`;
  document.getElementById("status-value").textContent = "異常を検知";
  const textEl = document.getElementById("log-text");
  const btn = document.getElementById("continue-btn");
  typewriter(textEl, level.log.after, () => btn.classList.remove("hidden"));
  btn.addEventListener("click", onContinue);
}

function renderFinale(level, onDone) {
  applyCorruption(level, true);
  clearApp();

  app.innerHTML = `
    ${renderSidebarHTML(null)}
    <section id="main-view">
      <div class="cam-heading">
        <span class="cam-id mono">ALL CAM</span>
        <h1>全カメラ同時表示</h1>
      </div>
      <p class="log-text" id="log-text"></p>
      <div class="actions"><button class="primary hidden" id="continue-btn">映像を表示する</button></div>
    </section>`;
  document.getElementById("status-value").textContent = "異常を検知";

  const textEl = document.getElementById("log-text");
  const btn = document.getElementById("continue-btn");
  typewriter(textEl, level.log.before, () => btn.classList.remove("hidden"));
  btn.addEventListener("click", () => {
    clearApp();
    const rWrap = document.createElement("div");
    rWrap.id = "reveal-screen";
    rWrap.innerHTML = `
      <img id="reveal-img" src="${level.image}" alt="全カメラ">
      <div class="tap-hint" id="tap-hint">タップ</div>
      <div class="reveal-caption hidden" id="reveal-caption">
        <p class="log-text" id="reveal-text"></p>
        <div class="actions"><button class="primary hidden" id="reveal-continue">つづける</button></div>
      </div>`;
    app.appendChild(rWrap);

    const img = document.getElementById("reveal-img");
    const hint = document.getElementById("tap-hint");
    const caption = document.getElementById("reveal-caption");
    let revealed = false;

    function doReveal() {
      if (revealed) return;
      revealed = true;
      hint.classList.add("hidden");
      img.classList.add("corrupted");
      playNoiseBurst(1.6, 0.18);
      if (navigator.vibrate) navigator.vibrate([40, 30, 60]);
      setTimeout(() => {
        caption.classList.remove("hidden");
        const t2 = document.getElementById("reveal-text");
        const b2 = document.getElementById("reveal-continue");
        typewriter(t2, level.log.after, () => b2.classList.remove("hidden"));
        b2.addEventListener("click", onDone);
      }, 1400);
    }
    rWrap.addEventListener("click", doReveal);
    rWrap.addEventListener("touchend", doReveal, { passive: true });
  });
}

function renderEnd() {
  applyCorruption({ corruption: 0.3 }, true);
  clearApp();
  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="center-panel">
      <h1 class="mono" style="color:var(--red)">SIGNAL LOST</h1>
      <p>監視カメラシステムとの通信が切断されました。<br>復旧までしばらくお待ちください。</p>
      <div class="actions"><button class="primary" id="restart-btn">巡回記録をはじめから見る</button></div>
    </div>`;
  app.appendChild(wrap);
  document.getElementById("restart-btn").addEventListener("click", renderTitle);
}

/* -------------------- sequencing -------------------- */

function playLevel(index, phase) {
  const level = window.LEVELS[index];
  if (!level) { renderEnd(); return; }

  if (level.type === "check") {
    if (phase === "before") {
      renderCheckBefore(level, () => renderCheckGame(level, () => playLevel(index, "after")));
    } else {
      renderCheckAfter(level, () => goNext(index));
    }
    return;
  }

  if (level.type === "finale") {
    renderFinale(level, () => goNext(index));
  }
}

function goNext(index) {
  const next = index + 1;
  if (window.LEVELS[next]) {
    state.index = next;
    playLevel(next, "before");
  } else {
    renderEnd();
  }
}

/* -------------------- boot -------------------- */

renderTitle();
