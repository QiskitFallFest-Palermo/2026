"use strict";
(() => {
  const stages = ["Foundations", "Circuit lab", "Teleportation"];
  const units = [lessons, challenges, [teleport]];
  const key = "qff.palermo.2026.codebook.v1";
  const root = document.querySelector("#workspace");
  const map = document.querySelector("#map");
  const find = id => document.getElementById(id);
  const doors = {
    locked: '<svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="7" width="10" height="7" rx="2"/><path d="M5 7V5a3 3 0 0 1 6 0v2"/></svg>',
    complete: '<span aria-hidden="true">✓</span>'
  };
  let saved = {};
  function storageNotice() {
    find("storage-status").textContent = "Circuit drafts and results are available for this visit only because browser storage is unavailable.";
  }
  try {
    const value = JSON.parse(localStorage.getItem(key));
    if (value && typeof value === "object" && !Array.isArray(value)) saved = value;
  } catch { storageNotice(); }
  const record = value => value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const answers = {}, checks = {};
  const drafts = record(saved.drafts);
  const hints = record(saved.hints), graded = record(saved.graded);
  const results = {};
  const feedback = {};
  function unitDone(stage, index) {
    if (stage === 0) return lessons[index].questions.every((q, i) => checks[index + "-" + i] === true);
    return graded[units[stage][index].id] === true;
  }
  const done = stage => units[stage].every((_, i) => unitDone(stage, i));
  const unlocked = n => n === 0 || (done(0) && (n === 1 || done(1)));
  let stage = 0;
  let unit = 0;
  let request = null;
  let revision = 0;
  let binary = 5;
  function persist() {
    try { localStorage.setItem(key, JSON.stringify({drafts, hints, graded})); }
    catch { storageNotice(); }
  }
  if ("answers" in saved || "checks" in saved) persist();
  window.addEventListener("pageshow", event => {
    if (event.persisted) window.location.reload();
  });
  function announce(text) { find("announce").textContent = text; }
  function renderMap() {
    const count = stages.filter((_, i) => unlocked(i) && done(i)).length;
    find("resume").textContent = count === 3 ? "Revisit your work" :
      Object.keys(answers).length ? "Resume learning" : "Start learning";
    find("progress-text").textContent = count + " of 3 stages complete";
    find("progress").value = count;
    map.innerHTML = stages.map((title, i) => {
      const locked = !unlocked(i);
      const status = locked ? "Locked" : done(i) ? "Completed" : i === stage ? "In progress" : "Available";
      const reason = locked ? ' title="Complete ' + stages[done(0) ? i-1 : 0] + ' to unlock"' : "";
      return '<button type="button" class="step" data-stage="' + i + '"' + (locked ? " disabled" : "") + reason +
        (i === stage ? ' aria-current="step"' : "") + '><span class="step-meta">Stage 0' + (i+1) +
        '<span class="state">' + (locked ? doors.locked : done(i) ? doors.complete : "") + status +
        '</span></span><strong>' + title + '</strong></button>';
    }).join("");
  }
  find("resume").addEventListener("click", event => {
    event.preventDefault();
    move(stage, unit);
  });
  function navigation() {
    const sidebar = units[stage].map((u, i) =>
      '<li><button type="button" data-unit="' + i + '"' + (i === unit ? ' aria-current="true"' : "") +
      '><span class="marker" aria-hidden="true">' + (unitDone(stage, i) ? "✓" : String(i+1).padStart(2, "0")) +
      '</span>' + u.title + (unitDone(stage, i) ? '<span class="sr">, completed</span>' : "") + '</button></li>'
    ).join("");
    return '<nav class="side" aria-label="Activities in this stage"><h3>' + stages[stage] + '</h3><ol>' + sidebar + '</ol></nav>';
  }
  function move(s, u) {
    if (!unlocked(s) || !units[s][u]) return;
    request?.abort();
    request = null;
    revision++;
    stage = s; unit = u;
    render();
    find("activity-title").focus({preventScroll: true});
    root.scrollIntoView({block: "start"});
  }
  function stageStart(s) {
    const i = units[s].findIndex((_, index) => !unitDone(s, index));
    move(s, Math.max(0, i));
  }
  function bottom() {
    let next = "";
    if (stage < 2 && done(stage)) next = '<button class="primary" data-next-stage>Open ' + stages[stage+1] + '</button>';
    else if (unit < units[stage].length - 1) next = '<button class="secondary" data-next>Next activity</button>';
    else if (!done(stage)) next = '<button class="secondary" data-unfinished>Find unfinished activity</button>';
    if (stage === 2 && done(2)) next = '<div class="complete"><strong>Journey complete</strong><p>You built a half-adder, prepared a Bell pair and teleported a qubit. You can revisit any activity above.</p></div>';
    return '<div class="lesson-nav">' + (unit > 0 ? '<button class="secondary" data-prev>Previous activity</button>' : "") + next + '</div>';
  }
  // Open references separately so consulting the SDK preserves the current quiz.
  const sdkReferences = [
    ["Bit weights in Qiskit", "qiskit/bit-ordering"],
    ["Measure qubits", "qiskit/measure-qubits"],
    ["Hadamard gate", "api/qiskit/qiskit.circuit.library.HGate"],
    ["Read bit order in Qiskit", "qiskit/bit-ordering"],
    ["Construct circuits", "qiskit/construct-circuits"],
    ["Qiskit development workflow", "guides/intro-to-patterns"]
  ];
  function quiz() {
    const [sourceTitle, sourcePath] = sdkReferences[unit];
    const lesson = lessons[unit];
    const form = lesson.questions.map(([question, options, correct], i) => {
      const id = unit + "-" + i, passed = checks[id] === true;
      const choices = options.map((option, j) => '<label class="choice"><input type="radio" name="q' + i + '" value="' + j + '"' +
        ((passed ? correct : answers[id]) === j ? " checked" : "") + (passed ? " disabled" : "") + ">" + option + "</label>").join("");
      return '<fieldset><legend>' + question + '</legend>' + choices + '<div class="feedback' + (passed ? " pass" : "") + '" id="fb-' + i + '">' +
        (passed ? "✓ Correct. " + lesson.questions[i][3] : feedback[id] || "") + '</div></fieldset>';
    }).join("");
    const demo = lesson.widget ? '<div class="demo"><div><strong>Try a bit flip</strong><p>Toggle a bit to change the number.</p></div><div class="bits" id="bits"></div></div>' : "";
    return '<p class="activity-text">' + lesson.intro + '</p>' + demo +
      (lesson.formula ? '<pre class="formula">' + lesson.formula + '</pre>' : "") + '<p class="activity-text">' + lesson.example +
      '</p><form class="quiz" id="quiz" autocomplete="off"><h3>Check your understanding</h3>' + form +
      (unitDone(0, unit) ? "" : '<button class="primary" type="submit">Check answers</button>') + '</form><p><a target="_blank" rel="noopener noreferrer" href="https://quantum.cloud.ibm.com/docs/en/' + sourcePath + '">IBM documentation · ' + sourceTitle + ' (opens in a new tab)</a></p>';
  }
  function setBits() {
    for (const btn of find("bits").querySelectorAll("button")) {
      const digit = (binary & Number(btn.dataset.bit)) ? 1 : 0;
      btn.textContent = digit; btn.setAttribute("aria-pressed", String(Boolean(digit)));
    }
    find("binary-value").textContent = "= " + binary;
  }
  const reference = '<figure class="reference"><figcaption>Reference circuit</figcaption><div class="diagram-scroll" tabindex="0" role="group" aria-label="Scrollable circuit diagram"><img src="teleport.svg" width="780" height="280" alt="Teleportation circuit. The following text describes every gate and classical connection."></div>' +
    '<details><summary>Read the circuit as text</summary><ol><li>Apply H to q1, then CX from q1 to Bob’s q2 to share a Bell pair.</li>' +
    '<li>Apply CX from the input q0 to q1, then H to q0.</li><li>Measure q0 into c0 and q1 into c1. Send both classical bits to Bob.</li>' +
    '<li>On q2, apply X when c1 is 1 and Z when c0 is 1. Leave Bob’s output unmeasured.</li></ol></details></figure>';
  function guide(t) {
    return '<details class="guide"><summary>Qiskit syntax guide</summary><p>Write one circuit statement per line. Use the supplied variable <code>qc</code>, integer wire indices and # comments. The workshop supports these gates.</p>' +
      '<pre>qc.h(0)       # also x, y, z, s and sdg\nqc.cx(0, 1)   # controlled X; cz is also supported\nqc.ccx(0, 1, 2)   # two controls, then the target</pre>' +
      (t ? '<pre>qc.measure(0, 0)   # qubit 0 into classical bit 0\nwith qc.if_test((qc.clbits[0], 1)):\n    qc.x(2)        # an example conditional gate</pre>' : "") +
      '<p>Each circuit may use up to 32 operations. The simulator supplies the input state.</p></details>';
  }
  function editor() {
    const task = units[stage][unit], t = stage === 2;
    const seen = Math.min(task.hints.length, Math.max(0, Number(hints[task.id]) || 0));
    return '<p class="activity-text">' + task.goal + '</p>' + (t ? reference :
      '<div class="example"><h3>Syntax example</h3><pre>' + task.example + '</pre><p>' + task.note + '</p></div>') +
      '<label class="editor-head" for="code"><span>circuit.py</span><span>Python / Qiskit</span></label>' +
      '<textarea id="code" aria-describedby="editor-help" spellcheck="false" autocapitalize="off" autocomplete="off" wrap="off" rows="' + (t ? 13 : 7) + '" maxlength="4096"></textarea>' +
      '<p id="editor-help">Use the circuit calls in the syntax guide below. Run an example to inspect the output. Submit when you are ready to try the hidden tests.</p>' +
      '<div class="actions"><button class="secondary" id="run">Run example</button><button class="primary" id="grade">Submit circuit</button>' +
      '<button class="secondary" id="hint"' + (seen >= task.hints.length ? " disabled" : "") + '>Hint ' + seen + '/' + task.hints.length + '</button></div>' +
      '<ol class="hint-list" id="hint-list">' + task.hints.slice(0, seen).map(h => "<li>" + h + "</li>").join("") + '</ol>' +
      '<div class="result" id="result" role="status"></div>' + guide(t);
  }
  function refreshNav() {
    renderMap();
    root.querySelector(".side").outerHTML = navigation();
    root.querySelector(".lesson-nav").outerHTML = bottom();
  }
  function render() {
    renderMap();
    const title = units[stage][unit].title;
    root.innerHTML = navigation() + '<article class="paper"><p class="eyebrow">Stage 0' + (stage+1) + ' / ' +
      (stage === 0 ? "Lesson" : "Challenge") + ' ' + (unit+1) + ' of ' + units[stage].length +
      '</p><h2 id="activity-title" tabindex="-1">' + title + '</h2>' + (stage === 0 ? quiz() : editor()) + bottom() + '</article>';
    if (find("bits")) {
      find("bits").innerHTML = [4,2,1].map(w => '<button type="button" data-bit="' + w + '" aria-label="Toggle bit with weight ' + w + '"></button>').join("") +
        '<output id="binary-value" aria-label="Decimal value" aria-live="polite"></output>';
      setBits();
    }
    if (stage > 0) {
      const task = units[stage][unit];
      find("code").value = typeof drafts[task.id] === "string" ? drafts[task.id] : task.starter;
      if (results[task.id]) showResult(results[task.id]);
    }
  }
  function showResult(data) {
    const box = find("result");
    box.replaceChildren(); box.dataset.outcome = data.error ? "error" : data.passed ? "pass" : "run";
    const p = document.createElement("p");
    p.textContent = data.message;
    box.append(p);
    if (!Array.isArray(data.rows)) return;
    const table = document.createElement("table");
    table.setAttribute("aria-label", "Public simulation results");
    const head = table.createTHead().insertRow();
    for (const label of data.columns) {
      const th = document.createElement("th"); th.scope = "col"; th.textContent = label; head.append(th);
    }
    const body = table.createTBody();
    for (const row of data.rows) {
      const tr = body.insertRow();
      row.forEach(value => { tr.insertCell().textContent = value; });
    }
    box.append(table);
  }
  async function submit(action) {
    const task = units[stage][unit], source = find("code").value;
    const attempt = ++revision;
    const controller = new AbortController();
    request?.abort(); request = controller;
    const timer = setTimeout(() => controller.abort(), 20000);
    find("run").disabled = find("grade").disabled = true;
    showResult({message: action === "run" ? "Running your circuit…" : "Checking your circuit…"});
    try {
      const response = await fetch(document.querySelector('meta[name="qff-grader"]').content, {
        method: "POST", headers: {"Content-Type": "application/json"}, credentials: "omit", cache: "no-store",
        body: JSON.stringify({challenge: task.id, code: source, action}), signal: controller.signal
      });
      const data = await response.json();
      if (attempt !== revision) return;
      if (typeof data.message !== "string") throw Error();
      data.error = !response.ok || data.passed === false;
      if (response.ok && action === "grade" && data.passed === true) {
        graded[task.id] = true; persist(); refreshNav();
        if (done(stage)) data.message += stage === 2 ? " You completed the codebook." : " Teleportation is now unlocked.";
      }
      results[task.id] = data; showResult(data);
    } catch {
      if (attempt !== revision) return;
      const message = controller.signal.aborted ? "The grader timed out. Try again." :
        "The grader is unavailable. For local practice, open the workshop server address. Your draft is still in the editor.";
      results[task.id] = {message, error: true}; showResult(results[task.id]);
    } finally {
      clearTimeout(timer);
      if (attempt === revision) { request = null; find("run").disabled = find("grade").disabled = false; }
    }
  }
  map.addEventListener("click", e => {
    const btn = e.target.closest("[data-stage]"); if (btn && !btn.disabled) stageStart(Number(btn.dataset.stage));
  });
  root.addEventListener("change", e => {
    if (e.target.type === "radio") {
      const i = Number(e.target.name.slice(1)); answers[unit + "-" + i] = Number(e.target.value);
    }
  });
  root.addEventListener("submit", e => {
    e.preventDefault();
    if (e.target.id !== "quiz") return;
    let firstMiss = -1;
    lessons[unit].questions.forEach((q, i) => {
      const id = unit + "-" + i;
      if (answers[id] === q[2]) checks[id] = true;
      else if (!checks[id]) {
        feedback[id] = answers[id] === undefined ? "Choose an answer to check it." : "Try again. " + q[3];
        if (firstMiss < 0) firstMiss = i;
      }
    });
    render();
    const message = firstMiss >= 0 ? feedback[unit+"-"+firstMiss] : done(0) ? "Foundations complete. Circuit lab is unlocked." : "Lesson complete.";
    announce(message);
    const target = firstMiss >= 0 ? root.querySelector('input[name="q'+firstMiss+'"]:checked') || root.querySelector('[name="q'+firstMiss+'"]') :
      root.querySelector("[data-next-stage], [data-next], [data-unfinished]");
    target?.focus({preventScroll: true});
  });
  root.addEventListener("input", e => {
    if (e.target.id !== "code") return;
    const id = units[stage][unit].id;
    drafts[id] = e.target.value; delete results[id]; persist();
    revision++; request?.abort(); request = null;
    find("result").replaceChildren(); find("run").disabled = find("grade").disabled = false;
  });
  root.addEventListener("click", e => {
    const btn = e.target.closest("button"); if (!btn || btn.disabled) return;
    if (btn.hasAttribute("data-unit")) return move(stage, Number(btn.dataset.unit));
    if (btn.hasAttribute("data-next-stage")) return stageStart(stage+1);
    if (btn.hasAttribute("data-prev")) return move(stage, unit-1);
    if (btn.hasAttribute("data-next")) return move(stage, unit+1);
    if (btn.hasAttribute("data-unfinished")) return stageStart(stage);
    if (btn.hasAttribute("data-bit")) { binary ^= Number(btn.dataset.bit); setBits(); return; }
    if (btn.id === "run" || btn.id === "grade") return submit(btn.id === "run" ? "run" : "grade");
    if (btn.id === "hint") {
      const task = units[stage][unit], count = find("hint-list").children.length;
      const li = document.createElement("li"); li.textContent = task.hints[count]; find("hint-list").append(li);
      hints[task.id] = count+1; btn.textContent = "Hint " + (count+1) + "/" + task.hints.length;
      btn.disabled = count+1 >= task.hints.length; announce(li.textContent); persist();
    }
  });
  render();
})();
