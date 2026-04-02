/**
 * Step-by-step column math animations.
 * Ported from src/unit.js: playCarryAnim, playBorrowAnim, play3dRegroup.
 *
 * Fixes vs. legacy:
 *  - "Again" passes exDiv (still in DOM) not the original detached trigger btn
 *  - Revealed cells are sticky: once shown they stay visible in all later steps
 */

// ── helpers ───────────────────────────────────────────────────────────────────

/** Find the .ex ancestor. Works whether el is the trigger btn or the .ex div itself (Again restart). */
function findEx(el: HTMLElement): HTMLElement | null {
  return (el.closest('.ex') ?? null) as HTMLElement | null;
}

// ── 2-digit addition carry (u3l1) — generic via data-arg / data-arg2 ─────────

/** Public entry — reads args from the trigger button's data-arg / data-arg2 attributes. */
export function playCarryAnim(trigger: HTMLElement): void {
  const exDiv = findEx(trigger);
  if (!exDiv) return;
  const stepsDiv = exDiv.querySelector('.ex-steps') as HTMLElement | null;
  if (!stepsDiv) return;
  const [t1, o1] = JSON.parse(trigger.dataset.arg  ?? '[4,7]') as [number, number];
  const [t2, o2] = JSON.parse(trigger.dataset.arg2 ?? '[3,6]') as [number, number];
  _doCarryAnim(stepsDiv, t1, o1, t2, o2);
}

/** Private core — all animation logic, args explicit so Again can restart correctly. */
function _doCarryAnim(
  stepsDiv: HTMLElement,
  t1: number, o1: number, t2: number, o2: number
): void {
  const n = ((window as any)._cca2n = ((window as any)._cca2n ?? 0) + 1);
  const p = `cca2_${n}`;

  const oSum = o1 + o2, oR = oSum % 10, oC = oSum >= 10 ? 1 : 0;
  const tR   = t1 + t2 + oC;
  const pStr = `${t1}${o1} + ${t2}${o2}`;
  const aStr = `${tR}${oR}`;

  const STEPS: Step[] = [
    { label: `👀 Let's solve <b>${pStr}</b> step by step!`, hi: [], reveal: [], btn: '▶ Start' },
    { label: `🔍 <b>ONES column first.</b> What is ${o1} + ${o2}?`, hi: ['o1','o2'], reveal: [], btn: 'Next ▶' },
  ];
  if (oC) {
    STEPS.push(
      { label: `💥 ${o1} + ${o2} = <b>${oSum}</b> — that's 10 or more!<br>We can't fit ${oSum} in the ones place alone.`, hi: ['o1','o2'], reveal: [], btn: 'Next ▶' },
      { label: `✏️ Write the <b>${oR}</b> in the ones place of the answer.`, hi: ['o1','o2','r-ones'], reveal: ['r-ones'], pop: 'r-ones', btn: 'Next ▶' },
      { label: '⬆️ Carry the <b>1</b> up to the tens column!', hi: ['carry'], reveal: ['carry'], pop: 'carry', btn: 'Next ▶' },
      { label: `🔍 <b>TENS column next.</b> Add: 1 (carried) + ${t1} + ${t2} = ?`, hi: ['carry','t1','t2'], reveal: [], btn: 'Next ▶' },
      { label: `✅ 1 + ${t1} + ${t2} = <b>${tR}</b> — write ${tR} in the tens place!`, hi: ['carry','t1','t2','r-tens'], reveal: ['r-tens'], pop: 'r-tens', btn: 'Next ▶' },
      { label: `🎉 <b>${pStr} = ${aStr}</b> ✅ You solved it!`, hi: ['carry','t1','t2','o1','o2','r-ones','r-tens'], reveal: [], btn: 'Again 🔄', final: true },
    );
  } else {
    STEPS.push(
      { label: `✅ ${o1} + ${o2} = <b>${oR}</b> — write ${oR} in the ones place!`, hi: ['o1','o2','r-ones'], reveal: ['r-ones'], pop: 'r-ones', btn: 'Next ▶' },
      { label: `🔍 <b>TENS column next.</b> What is ${t1} + ${t2}?`, hi: ['t1','t2'], reveal: [], btn: 'Next ▶' },
      { label: `✅ ${t1} + ${t2} = <b>${tR}</b> — write ${tR} in the tens place!`, hi: ['t1','t2','r-tens'], reveal: ['r-tens'], pop: 'r-tens', btn: 'Next ▶' },
      { label: `🎉 <b>${pStr} = ${aStr}</b> ✅ You solved it!`, hi: ['t1','t2','o1','o2','r-ones','r-tens'], reveal: [], btn: 'Again 🔄', final: true },
    );
  }

  stepsDiv.innerHTML = `
    <div class="cca-wrap">
      <table class="col-math" style="margin:0 auto">
        <tr class="cm-carry">
          <td></td><td id="${p}-carry" class="cca-ghost">${oC ? '1' : ''}</td><td></td>
        </tr>
        <tr>
          <td></td><td id="${p}-t1">${t1}</td><td id="${p}-o1">${o1}</td>
        </tr>
        <tr class="cm-bottom">
          <td class="cm-op">+</td><td id="${p}-t2">${t2}</td><td id="${p}-o2">${o2}</td>
        </tr>
        <tr class="cm-line"><td colspan="3"><hr></td></tr>
        <tr class="cm-result">
          <td></td>
          <td id="${p}-r-tens" class="cca-ghost" style="border-top:none">${tR}</td>
          <td id="${p}-r-ones" class="cca-ghost" style="border-top:none">${oR}</td>
        </tr>
      </table>
      <div class="cca-label" id="${p}-label">Tap Start to begin!</div>
      <button class="cca-btn" id="${p}-btn" style="background:#e67e22">▶ Start</button>
    </div>`;

  const allHiIds = ['carry','t1','t2','o1','o2','r-ones','r-tens'];
  const toggleIds = ['carry','r-ones','r-tens'];
  const revealed = new Set<string>();
  let step = 0;

  const advance = () => {
    const s = STEPS[step];
    if (!s) return;

    document.getElementById(`${p}-label`)!.innerHTML = s.label;

    allHiIds.forEach(id => {
      document.getElementById(`${p}-${id}`)?.classList.remove('cca-hi','cca-hi-red','cca-pop');
    });
    s.hi.forEach(id => {
      document.getElementById(`${p}-${id}`)?.classList.add(id === 'carry' ? 'cca-hi-red' : 'cca-hi');
    });

    s.reveal.forEach(id => revealed.add(id));
    toggleIds.forEach(id => {
      const el = document.getElementById(`${p}-${id}`);
      if (!el) return;
      if (revealed.has(id)) {
        el.classList.remove('cca-ghost'); el.classList.add('cca-show');
        if (s.pop === id) setTimeout(() => el.classList.add('cca-pop'), 10);
      }
    });

    const btnEl = document.getElementById(`${p}-btn`) as HTMLButtonElement;
    btnEl.textContent = s.btn;
    // Again: closure captures t1/o1/t2/o2 directly — no DOM dataset needed
    btnEl.onclick = s.final ? () => _doCarryAnim(stepsDiv, t1, o1, t2, o2) : advance;
    step++;
  };

  advance();
}

// ── 2-digit subtraction borrow (u3l2) ────────────────────────────────────────

export function playBorrowAnim(trigger: HTMLElement): void {
  const exDiv = findEx(trigger);
  if (!exDiv) return;
  const stepsDiv = exDiv.querySelector('.ex-steps') as HTMLElement | null;
  if (!stepsDiv) return;

  const STEPS: Step[] = [
    { label: "👀 Let's solve <b>73 − 28</b> step by step!", hi: [], reveal: [], btn: '▶ Start' },
    { label: '🔍 <b>ONES column first.</b> Can we do 3 − 8?', hi: ['o1','o2'], reveal: [], btn: 'Next ▶' },
    { label: '😬 3 is less than 8 — <b>not enough!</b><br>We need to BORROW a ten.', hi: ['o1','o2','t1'], reveal: [], btn: 'Next ▶' },
    { label: '⬅️ Borrow 1 ten from the tens place:<br><b>7 becomes 6</b>, ones becomes <b>13</b>.', hi: ['b-tens','b-ones','t1'], reveal: ['b-tens','b-ones'], pop: 'b-ones', btn: 'Next ▶' },
    { label: '✏️ Now: 13 − 8 = <b>5</b>. Write 5 in the ones place.', hi: ['b-ones','o2','r-ones'], reveal: ['r-ones'], pop: 'r-ones', btn: 'Next ▶' },
    { label: '🔍 <b>TENS column:</b> 6 − 2 = <b>4</b>. Write 4 in the tens place.', hi: ['b-tens','t2','r-tens'], reveal: ['r-tens'], pop: 'r-tens', btn: 'Next ▶' },
    { label: '🎉 <b>73 − 28 = 45</b> ✅ You solved it!', hi: ['b-tens','b-ones','t1','t2','o1','o2','r-ones','r-tens'], reveal: [], btn: 'Again 🔄', final: true },
  ];

  stepsDiv.innerHTML = `
    <div class="cca-wrap">
      <table class="col-math" style="margin:0 auto">
        <tr class="cm-carry">
          <td></td><td id="ccb-b-tens" class="cca-ghost">6</td><td id="ccb-b-ones" class="cca-ghost">13</td>
        </tr>
        <tr>
          <td></td><td id="ccb-t1">7</td><td id="ccb-o1">3</td>
        </tr>
        <tr class="cm-bottom">
          <td class="cm-op">−</td><td id="ccb-t2">2</td><td id="ccb-o2">8</td>
        </tr>
        <tr class="cm-line"><td colspan="3"><hr></td></tr>
        <tr class="cm-result">
          <td></td>
          <td id="ccb-r-tens" class="cca-ghost" style="border-top:none">4</td>
          <td id="ccb-r-ones" class="cca-ghost" style="border-top:none">5</td>
        </tr>
      </table>
      <div class="cca-label" id="ccb-label">Tap Start to begin!</div>
      <button class="cca-btn" id="ccb-btn" style="background:#e67e22">▶ Start</button>
    </div>`;

  const allHiIds = ['b-tens','b-ones','t1','t2','o1','o2','r-ones','r-tens'];
  const toggleIds = ['b-tens','b-ones','r-ones','r-tens'];
  const revealed = new Set<string>();
  let step = 0;

  const advance = () => {
    const s = STEPS[step];
    if (!s) return;

    document.getElementById('ccb-label')!.innerHTML = s.label;

    allHiIds.forEach(id => {
      document.getElementById('ccb-' + id)?.classList.remove('cca-hi','cca-hi-red','cca-pop');
    });
    s.hi.forEach(id => {
      document.getElementById('ccb-' + id)?.classList.add('cca-hi');
    });

    s.reveal.forEach(id => revealed.add(id));
    toggleIds.forEach(id => {
      const el = document.getElementById('ccb-' + id);
      if (!el) return;
      if (revealed.has(id)) {
        el.classList.remove('cca-ghost'); el.classList.add('cca-show');
        if (s.pop === id) setTimeout(() => el.classList.add('cca-pop'), 10);
      }
    });

    const btnEl = document.getElementById('ccb-btn') as HTMLButtonElement;
    btnEl.textContent = s.btn;
    btnEl.onclick = s.final ? () => playBorrowAnim(exDiv) : advance;
    step++;
  };

  advance();
}

// ── 3-digit addition carry (u4l1) — triggered via data-arg / data-arg2 ───────

export function play3dRegroup(trigger: HTMLElement): void {
  const exDiv = findEx(trigger);
  if (!exDiv) return;

  // Args live on the original [data-action] btn; on Again restart they're stored on exDiv
  const argSrc = trigger.dataset.arg ? trigger : exDiv;
  const top = JSON.parse(argSrc.dataset.arg  ?? '[3,4,7]') as [number,number,number];
  const bot = JSON.parse(argSrc.dataset.arg2 ?? '[2,8,6]') as [number,number,number];
  const stepsDiv = exDiv.querySelector('.ex-steps') as HTMLElement | null;
  if (!stepsDiv) return;

  const n = ((window as any)._cc3n = ((window as any)._cc3n ?? 0) + 1);
  const p = `cc3_${n}`;

  const [h1,t1,o1] = top, [h2,t2,o2] = bot;
  const oSum = o1+o2, oR = oSum%10, oC = oSum >= 10 ? 1 : 0;
  const tSum = t1+t2+oC, tR = tSum%10, tC = tSum >= 10 ? 1 : 0;
  const hR = h1+h2+tC;
  const pStr = `${h1}${t1}${o1} + ${h2}${t2}${o2}`;
  const aStr = `${hR}${tR}${oR}`;

  const STEPS: Step[] = [
    { label: `👀 Let's solve <b>${pStr}</b> step by step!`, hi: [], reveal: [], btn: '▶ Start' },
    { label: `🔍 <b>ONES column first.</b> What is ${o1} + ${o2}?`, hi: ['o1','o2'], reveal: [], btn: 'Next ▶' },
    { label: `💥 ${o1} + ${o2} = <b>${oSum}</b> — write <b>${oR}</b>${oC ? ', carry <b>1</b>!' : '. No carry!'}`, hi: ['o1','o2','r-o'], reveal: ['r-o'], pop: 'r-o', btn: 'Next ▶' },
  ];
  if (oC) STEPS.push({ label: '⬆️ Carry the <b>1</b> up to the tens column!', hi: ['c-t'], reveal: ['c-t'], pop: 'c-t', btn: 'Next ▶' });
  STEPS.push({ label: `🔍 <b>TENS column:</b> ${t1} + ${t2}${oC ? ' + 1(carried)' : ''} = <b>${tSum}</b> — write <b>${tR}</b>${tC ? ', carry <b>1</b>!' : '. No carry!'}`, hi: [...(oC?['c-t']:[]),'t1','t2','r-t'], reveal: ['r-t'], pop: 'r-t', btn: 'Next ▶' });
  if (tC) STEPS.push({ label: '⬆️ Carry the <b>1</b> up to the hundreds column!', hi: ['c-h'], reveal: ['c-h'], pop: 'c-h', btn: 'Next ▶' });
  STEPS.push({ label: `🔍 <b>HUNDREDS column:</b> ${h1} + ${h2}${tC ? ' + 1(carried)' : ''} = <b>${hR}</b>. Write <b>${hR}</b>!`, hi: [...(tC?['c-h']:[]),'h1','h2','r-h'], reveal: ['r-h'], pop: 'r-h', btn: 'Next ▶' });
  STEPS.push({ label: `🎉 <b>${pStr} = ${aStr}</b> ✅ You solved it!`, hi: ['h1','t1','o1','h2','t2','o2','r-h','r-t','r-o',...(oC?['c-t']:[]),...(tC?['c-h']:[])], reveal: [], btn: 'Again 🔄', final: true });

  // Store args on exDiv so the Again restart can re-read them
  exDiv.dataset.animArg  = trigger.dataset.arg  ?? '[3,4,7]';
  exDiv.dataset.animArg2 = trigger.dataset.arg2 ?? '[2,8,6]';

  stepsDiv.innerHTML = `
    <div class="cca-wrap">
      <table class="col-math" style="margin:0 auto">
        <tr class="cm-carry">
          <td></td>
          <td id="${p}-c-h" class="cca-ghost">${tC ? '1' : ''}</td>
          <td id="${p}-c-t" class="cca-ghost">${oC ? '1' : ''}</td>
          <td></td>
        </tr>
        <tr>
          <td></td><td id="${p}-h1">${h1}</td><td id="${p}-t1">${t1}</td><td id="${p}-o1">${o1}</td>
        </tr>
        <tr class="cm-bottom">
          <td class="cm-op">+</td><td id="${p}-h2">${h2}</td><td id="${p}-t2">${t2}</td><td id="${p}-o2">${o2}</td>
        </tr>
        <tr class="cm-line"><td colspan="4"><hr></td></tr>
        <tr class="cm-result">
          <td></td>
          <td id="${p}-r-h" class="cca-ghost" style="border-top:none">${hR}</td>
          <td id="${p}-r-t" class="cca-ghost" style="border-top:none">${tR}</td>
          <td id="${p}-r-o" class="cca-ghost" style="border-top:none">${oR}</td>
        </tr>
      </table>
      <div class="cca-label" id="${p}-label">Tap Start to begin!</div>
      <button class="cca-btn" id="${p}-btn" style="background:#d35400">▶ Start</button>
    </div>`;

  const allIds = ['h1','t1','o1','h2','t2','o2','r-h','r-t','r-o','c-t','c-h'];
  const toggleIds = ['r-h','r-t','r-o','c-t','c-h'];
  const revealed = new Set<string>();
  let step = 0;

  const advance = () => {
    const s = STEPS[step];
    if (!s) return;

    document.getElementById(`${p}-label`)!.innerHTML = s.label;

    allIds.forEach(id => {
      document.getElementById(`${p}-${id}`)?.classList.remove('cca-hi','cca-hi-red','cca-pop');
    });
    s.hi.forEach(id => {
      document.getElementById(`${p}-${id}`)?.classList.add(id.startsWith('c-') ? 'cca-hi-red' : 'cca-hi');
    });

    s.reveal.forEach(id => revealed.add(id));
    toggleIds.forEach(id => {
      const el = document.getElementById(`${p}-${id}`);
      if (!el) return;
      if (revealed.has(id)) {
        el.classList.remove('cca-ghost'); el.classList.add('cca-show');
        if (s.pop === id) setTimeout(() => el.classList.add('cca-pop'), 10);
      }
    });

    const btnEl = document.getElementById(`${p}-btn`) as HTMLButtonElement;
    btnEl.textContent = s.btn;
    btnEl.onclick = s.final ? () => play3dRegroup(exDiv) : advance;
    step++;
  };

  advance();
}

// ── Delegated dispatcher ──────────────────────────────────────────────────────

export function handleExampleAction(e: MouseEvent): void {
  const btn = (e.target as HTMLElement).closest('[data-action]') as HTMLElement | null;
  if (!btn) return;
  const action = btn.dataset.action;
  if (action === 'playCarryAnim')   { e.stopPropagation(); playCarryAnim(btn); }
  else if (action === 'playBorrowAnim') { e.stopPropagation(); playBorrowAnim(btn); }
  else if (action === 'play3dRegroup')  { e.stopPropagation(); play3dRegroup(btn); }
}

// ── Internal type ─────────────────────────────────────────────────────────────

interface Step {
  label: string;
  hi: string[];
  reveal: string[];
  pop?: string;
  btn: string;
  final?: boolean;
}
