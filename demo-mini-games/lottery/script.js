(function () {
  'use strict';

  // ===== localStorage keys =====
  const LS_NAMES = 'aiteam_lottery_names';
  const LS_PRIZES = 'aiteam_lottery_prizes';
  const LS_HISTORY = 'aiteam_lottery_history';

  // ===== Prize tiers config =====
  const PRIZE_TIERS = [
    { key: 'grand', label: '大獎', emoji: '🏆', className: 'grand' },
    { key: 'mid', label: '中獎', emoji: '🥈', className: 'mid' },
    { key: 'small', label: '安慰獎', emoji: '🎈', className: 'small' }
  ];

  // Colour palette for wheel slices (cycled if more names than colours)
  const SLICE_COLORS = [
    '#ff8a65', '#ffb74d', '#4db6ac', '#ba68c8', '#64b5f6',
    '#f06292', '#aed581', '#ffd54f', '#4dd0e1', '#ff7043',
    '#9575cd', '#81c784', '#fff176', '#4fc3f7', '#e57373'
  ];

  // ===== State =====
  let names = [];        // array of strings, current participant list
  let prizePool = {       // remaining counts + configured totals
    grand: { total: 1, remaining: 1 },
    mid: { total: 3, remaining: 3 },
    small: { total: 6, remaining: 6 }
  };
  let history = [];       // array of { name, prizeKey, prizeLabel, time }

  let currentRotation = 0; // track cumulative rotation degrees applied to the wheel
  let isSpinning = false;

  // ===== DOM refs =====
  const nameInput = document.getElementById('nameInput');
  const addNamesBtn = document.getElementById('addNamesBtn');
  const clearNamesBtn = document.getElementById('clearNamesBtn');
  const nameListEl = document.getElementById('nameList');
  const nameCountEl = document.getElementById('nameCount');

  const grandCountInput = document.getElementById('grandCount');
  const midCountInput = document.getElementById('midCount');
  const smallCountInput = document.getElementById('smallCount');
  const grandRemainEl = document.getElementById('grandRemain');
  const midRemainEl = document.getElementById('midRemain');
  const smallRemainEl = document.getElementById('smallRemain');
  const applyPrizeBtn = document.getElementById('applyPrizeBtn');
  const resetPrizeBtn = document.getElementById('resetPrizeBtn');

  const drawBtn = document.getElementById('drawBtn');
  const statusMsg = document.getElementById('statusMsg');
  const resultBanner = document.getElementById('resultBanner');
  const resultText = document.getElementById('resultText');
  const historyListEl = document.getElementById('historyList');
  const confettiLayer = document.getElementById('confettiLayer');

  const canvas = document.getElementById('wheelCanvas');
  const ctx = canvas.getContext('2d');

  // ===== Persistence =====
  function saveState() {
    try {
      localStorage.setItem(LS_NAMES, JSON.stringify(names));
      localStorage.setItem(LS_PRIZES, JSON.stringify(prizePool));
      localStorage.setItem(LS_HISTORY, JSON.stringify(history));
    } catch (e) {
      // localStorage may be unavailable (e.g. private mode / quota) - fail silently
      console.warn('無法寫入 localStorage', e);
    }
  }

  function loadState() {
    try {
      const savedNames = localStorage.getItem(LS_NAMES);
      const savedPrizes = localStorage.getItem(LS_PRIZES);
      const savedHistory = localStorage.getItem(LS_HISTORY);

      if (savedNames) {
        const parsed = JSON.parse(savedNames);
        if (Array.isArray(parsed)) names = parsed;
      }
      if (savedPrizes) {
        const parsed = JSON.parse(savedPrizes);
        if (parsed && typeof parsed === 'object') {
          PRIZE_TIERS.forEach(function (tier) {
            if (parsed[tier.key] &&
                typeof parsed[tier.key].total === 'number' &&
                typeof parsed[tier.key].remaining === 'number') {
              prizePool[tier.key] = {
                total: parsed[tier.key].total,
                remaining: parsed[tier.key].remaining
              };
            }
          });
        }
      }
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) history = parsed;
      }
    } catch (e) {
      console.warn('讀取 localStorage 失敗，使用預設值', e);
    }
  }

  // ===== Rendering: name list =====
  function renderNameList() {
    nameListEl.innerHTML = '';
    if (names.length === 0) {
      const li = document.createElement('li');
      li.className = 'empty-hint';
      li.textContent = '目前沒有名單，請在上方新增';
      nameListEl.appendChild(li);
    } else {
      names.forEach(function (name) {
        const li = document.createElement('li');
        li.textContent = name;
        nameListEl.appendChild(li);
      });
    }
    nameCountEl.textContent = String(names.length);
  }

  // ===== Rendering: prize inputs / remaining badges =====
  function renderPrizeUI() {
    grandCountInput.value = prizePool.grand.total;
    midCountInput.value = prizePool.mid.total;
    smallCountInput.value = prizePool.small.total;

    grandRemainEl.textContent = String(prizePool.grand.remaining);
    midRemainEl.textContent = String(prizePool.mid.remaining);
    smallRemainEl.textContent = String(prizePool.small.remaining);
  }

  // ===== Rendering: history =====
  function renderHistory() {
    historyListEl.innerHTML = '';
    if (history.length === 0) {
      const li = document.createElement('li');
      li.className = 'history-empty';
      li.textContent = '尚無抽獎紀錄';
      historyListEl.appendChild(li);
      return;
    }
    history.forEach(function (entry) {
      const li = document.createElement('li');

      const nameSpan = document.createElement('span');
      nameSpan.className = 'h-name';
      nameSpan.textContent = entry.name;

      const prizeSpan = document.createElement('span');
      const tier = PRIZE_TIERS.find(function (t) { return t.key === entry.prizeKey; });
      prizeSpan.className = 'h-prize ' + (tier ? tier.className : '');
      prizeSpan.textContent = (tier ? tier.emoji + ' ' : '') + entry.prizeLabel;

      const timeSpan = document.createElement('span');
      timeSpan.className = 'h-time';
      timeSpan.textContent = formatTime(entry.time);

      li.appendChild(nameSpan);
      li.appendChild(prizeSpan);
      li.appendChild(timeSpan);
      historyListEl.appendChild(li);
    });
  }

  function formatTime(ts) {
    const d = new Date(ts);
    if (isNaN(d.getTime())) return '';
    const pad = function (n) { return String(n).padStart(2, '0'); };
    return d.getFullYear() + '/' + pad(d.getMonth() + 1) + '/' + pad(d.getDate()) + ' ' +
      pad(d.getHours()) + ':' + pad(d.getMinutes()) + ':' + pad(d.getSeconds());
  }

  // ===== Wheel drawing =====
  function drawWheel() {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w, h) / 2 - 4;

    ctx.clearRect(0, 0, w, h);

    if (names.length === 0) {
      // Empty placeholder wheel
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#f5ece4';
      ctx.fill();
      ctx.fillStyle = '#a68f7f';
      ctx.font = 'bold 22px -apple-system, "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('請先新增名單', cx, cy);
      return;
    }

    const sliceAngle = (Math.PI * 2) / names.length;

    names.forEach(function (name, i) {
      const startAngle = i * sliceAngle - Math.PI / 2; // start from top (12 o'clock)
      const endAngle = startAngle + sliceAngle;
      const color = SLICE_COLORS[i % SLICE_COLORS.length];

      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, startAngle, endAngle);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw name label along the slice's mid-angle
      const midAngle = startAngle + sliceAngle / 2;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(midAngle);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold ' + Math.max(11, Math.min(16, 220 / names.length)) + 'px -apple-system, "Microsoft JhengHei", sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.35)';
      ctx.shadowBlur = 3;
      const label = name.length > 6 ? name.slice(0, 6) + '…' : name;
      ctx.fillText(label, radius - 14, 0);
      ctx.restore();
    });

    // Center hub circle (visual only, button sits on top of it via CSS)
    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = '#ffffff';
    ctx.fill();
  }

  // ===== Status / button state management =====
  function totalRemainingPrizes() {
    return PRIZE_TIERS.reduce(function (sum, tier) {
      return sum + prizePool[tier.key].remaining;
    }, 0);
  }

  function updateStatus() {
    if (isSpinning) {
      return; // don't touch status/button while spinning; handled by spin flow
    }
    if (names.length === 0 && totalRemainingPrizes() === 0) {
      // Both empty - prefer telling about the list since that's usually addressed first
      drawBtn.disabled = true;
      statusMsg.textContent = '請先輸入名單';
      return;
    }
    if (names.length === 0) {
      drawBtn.disabled = true;
      statusMsg.textContent = history.length > 0 ? '名單已抽完' : '請先輸入名單';
      return;
    }
    if (totalRemainingPrizes() === 0) {
      drawBtn.disabled = true;
      statusMsg.textContent = '獎項已抽完';
      return;
    }
    drawBtn.disabled = false;
    statusMsg.textContent = '準備就緒，按下抽獎開始！';
  }

  // ===== Name list actions =====
  function addNamesFromInput() {
    if (isSpinning) return;
    const raw = nameInput.value || '';
    const newNames = raw
      .split('\n')
      .map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0; });

    if (newNames.length === 0) return;

    names = names.concat(newNames);
    nameInput.value = '';
    renderNameList();
    drawWheel();
    updateStatus();
    saveState();
  }

  function clearNames() {
    if (isSpinning) return;
    if (names.length === 0) return;
    const ok = window.confirm('確定要清空整個名單嗎？此動作無法復原。');
    if (!ok) return;
    names = [];
    renderNameList();
    drawWheel();
    updateStatus();
    saveState();
  }

  // ===== Prize pool actions =====
  function applyPrizeSettings() {
    if (isSpinning) return;
    const grand = Math.max(0, parseInt(grandCountInput.value, 10) || 0);
    const mid = Math.max(0, parseInt(midCountInput.value, 10) || 0);
    const small = Math.max(0, parseInt(smallCountInput.value, 10) || 0);

    // Setting new totals also resets remaining to match new totals
    // (this represents "reconfigure the prize pool for a fresh round")
    prizePool.grand = { total: grand, remaining: grand };
    prizePool.mid = { total: mid, remaining: mid };
    prizePool.small = { total: small, remaining: small };

    renderPrizeUI();
    updateStatus();
    saveState();
  }

  function resetRemaining() {
    if (isSpinning) return;
    PRIZE_TIERS.forEach(function (tier) {
      prizePool[tier.key].remaining = prizePool[tier.key].total;
    });
    renderPrizeUI();
    updateStatus();
    saveState();
  }

  // ===== Weighted random prize selection =====
  function pickWeightedPrize() {
    const available = PRIZE_TIERS.filter(function (tier) {
      return prizePool[tier.key].remaining > 0;
    });
    if (available.length === 0) return null;

    const total = available.reduce(function (sum, tier) {
      return sum + prizePool[tier.key].remaining;
    }, 0);

    let r = Math.random() * total;
    for (let i = 0; i < available.length; i++) {
      const tier = available[i];
      r -= prizePool[tier.key].remaining;
      if (r <= 0) {
        return tier;
      }
    }
    // Fallback (floating point edge case) - return last available
    return available[available.length - 1];
  }

  // ===== Draw flow =====
  function handleDraw() {
    if (isSpinning) return;
    if (names.length === 0 || totalRemainingPrizes() === 0) {
      updateStatus();
      return;
    }

    // 1. Decide the winner & prize FIRST (no visual-only randomness)
    const winnerIndex = Math.floor(Math.random() * names.length);
    const winnerName = names[winnerIndex];
    const prizeTier = pickWeightedPrize();

    if (!prizeTier) {
      // Safety net - shouldn't happen since we checked totalRemainingPrizes above
      updateStatus();
      return;
    }

    // 2. Compute the target rotation so the pointer (fixed at top, 12 o'clock)
    //    lands within the winner's slice.
    const sliceAngleDeg = 360 / names.length;
    // Slice i spans [i*sliceAngleDeg, (i+1)*sliceAngleDeg) measured clockwise from top,
    // matching how drawWheel() lays out slices starting at -90deg (top) going clockwise.
    const sliceStart = winnerIndex * sliceAngleDeg;
    // Aim near the middle of the slice, with a little random jitter so it doesn't
    // always stop dead-center (still safely inside the slice).
    const jitter = (Math.random() - 0.5) * (sliceAngleDeg * 0.5);
    const targetSliceAngle = sliceStart + sliceAngleDeg / 2 + jitter;

    // The pointer points DOWN at the top of the wheel (fixed in screen space).
    // Wheel rotates clockwise (positive deg). After rotating by R degrees,
    // the slice that was originally at angle "a" (clockwise from top) is now at
    // (a + R) mod 360 from the top. We want that to equal 0 (under the pointer).
    // So R = (360 - targetSliceAngle) mod 360, plus extra full spins.
    const baseRotationNeeded = (360 - targetSliceAngle + 360) % 360;

    const extraSpins = 5 + Math.floor(Math.random() * 3); // 5~7 full spins for a good multi-second spin
    // Ensure total rotation strictly increases from currentRotation so the CSS transition
    // always animates forward (never appears to "jump back").
    const currentMod = ((currentRotation % 360) + 360) % 360;
    let deltaToTarget = (baseRotationNeeded - currentMod + 360) % 360;
    const totalDelta = extraSpins * 360 + deltaToTarget;
    const newRotation = currentRotation + totalDelta;

    // 3. Kick off spin animation
    isSpinning = true;
    drawBtn.disabled = true;
    addNamesBtn.disabled = true;
    clearNamesBtn.disabled = true;
    applyPrizeBtn.disabled = true;
    resetPrizeBtn.disabled = true;
    statusMsg.textContent = '轉盤轉動中，請稍候…';
    resultBanner.hidden = true;
    resultBanner.className = 'result-banner';

    canvas.style.transform = 'rotate(' + newRotation + 'deg)';
    currentRotation = newRotation;

    const SPIN_DURATION_MS = 4000; // matches CSS transition duration

    setTimeout(function () {
      finishDraw(winnerIndex, winnerName, prizeTier);
    }, SPIN_DURATION_MS + 80);
  }

  function finishDraw(winnerIndex, winnerName, prizeTier) {
    // Remove winner from list, decrement prize count
    names.splice(winnerIndex, 1);
    prizePool[prizeTier.key].remaining -= 1;

    const entry = {
      name: winnerName,
      prizeKey: prizeTier.key,
      prizeLabel: prizeTier.label,
      time: Date.now()
    };
    history.unshift(entry); // newest first

    renderNameList();
    renderPrizeUI();
    renderHistory();
    drawWheel(); // redraw wheel with updated (smaller) name set; visual reset happens instantly since names shrank

    // Reset the wheel's rotation transform without animation so the next spin
    // starts clean and the newly-redrawn (smaller) wheel isn't shown mid-rotation.
    canvas.style.transition = 'none';
    canvas.style.transform = 'rotate(0deg)';
    currentRotation = 0;
    // Force reflow so the transition removal takes effect before re-enabling it
    void canvas.offsetHeight;
    canvas.style.transition = '';

    showResult(entry);
    isSpinning = false;
    addNamesBtn.disabled = false;
    clearNamesBtn.disabled = false;
    applyPrizeBtn.disabled = false;
    resetPrizeBtn.disabled = false;
    updateStatus();
    saveState();
  }

  function showResult(entry) {
    const tier = PRIZE_TIERS.find(function (t) { return t.key === entry.prizeKey; });
    resultBanner.hidden = false;

    if (entry.prizeKey === 'grand' || entry.prizeKey === 'mid') {
      resultBanner.className = 'result-banner ' + (entry.prizeKey === 'grand' ? 'grand-prize' : 'mid-prize');
      resultText.textContent = (entry.prizeKey === 'grand' ? '🎉 恭喜中大獎！ 🎉  ' : '🎊 恭喜中獎！ 🎊  ') +
        entry.name + ' 抽中「' + entry.prizeLabel + '」！';
      launchConfetti(entry.prizeKey === 'grand' ? 90 : 55);
    } else {
      resultBanner.className = 'result-banner small-prize';
      resultText.textContent = '✨ ' + entry.name + ' 獲得「' + entry.prizeLabel + '」，謝謝參加！ ✨';
    }
  }

  // ===== Confetti effect =====
  function launchConfetti(count) {
    const colors = ['#ff8a65', '#ffb74d', '#4db6ac', '#ba68c8', '#64b5f6', '#f06292', '#ffd54f'];
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div');
      piece.className = 'confetti-piece';
      const left = Math.random() * 100;
      const duration = 2.2 + Math.random() * 1.6;
      const delay = Math.random() * 0.4;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const size = 6 + Math.random() * 6;

      piece.style.left = left + 'vw';
      piece.style.width = size + 'px';
      piece.style.height = (size * 1.6) + 'px';
      piece.style.background = color;
      piece.style.animationDuration = duration + 's';
      piece.style.animationDelay = delay + 's';
      piece.style.borderRadius = (Math.random() > 0.5) ? '50%' : '2px';

      confettiLayer.appendChild(piece);

      setTimeout(function () {
        piece.remove();
      }, (duration + delay) * 1000 + 200);
    }
  }

  // ===== Event bindings =====
  addNamesBtn.addEventListener('click', addNamesFromInput);
  clearNamesBtn.addEventListener('click', clearNames);
  applyPrizeBtn.addEventListener('click', applyPrizeSettings);
  resetPrizeBtn.addEventListener('click', resetRemaining);
  drawBtn.addEventListener('click', handleDraw);

  // Allow pressing Enter inside prize number inputs to apply quickly (optional UX nicety)
  [grandCountInput, midCountInput, smallCountInput].forEach(function (input) {
    input.addEventListener('keydown', function (e) {
      if (e.key === 'Enter') {
        applyPrizeSettings();
      }
    });
  });

  // ===== Init =====
  function init() {
    loadState();
    renderNameList();
    renderPrizeUI();
    renderHistory();
    drawWheel();
    updateStatus();
  }

  init();
})();
