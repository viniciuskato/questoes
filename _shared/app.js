// Questões — motor de quiz e preferências de interface compartilhados.
// Usado por _banco/template-quiz.html e _banco/template-seletor.html.
// Cada página ainda declara suas próprias variáveis de dados (QUIZ_ID,
// QUIZ_TITLE, questions, fontes, refOrder, refNumberMap) no <script> local,
// antes ou durante o próprio fluxo — este arquivo só lê esses nomes em tempo
// de execução (quando as funções abaixo são de fato chamadas), então a ordem
// de carregamento (este script antes do <script> específico da página) é o
// que garante que tudo funcione.
// Editado à mão; gerar-lista.js e gerar-seletor.js não tocam este arquivo.

// ---------- Preferências de aparência e leitura ----------
const preferenceStore = {
  get(key, fallback) { try { return localStorage.getItem(key) || fallback; } catch (_) { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
};

let themeMode = preferenceStore.get("questoes-theme", "light");
let paletteMode = preferenceStore.get("questoes-palette", "normal");
let viewMode = preferenceStore.get("questoes-view", "list");
let focusPosition = 0;

function setTheme(mode) {
  themeMode = mode === "dark" ? "dark" : "light";
  document.documentElement.dataset.theme = themeMode;
  document.querySelectorAll("[data-theme-choice]").forEach(button => {
    const active = button.dataset.themeChoice === themeMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  preferenceStore.set("questoes-theme", themeMode);
}
function setPalette(mode) {
  paletteMode = mode === "presleep" ? "presleep" : "normal";
  document.documentElement.dataset.palette = paletteMode;
  document.querySelectorAll("[data-palette-choice]").forEach(button => {
    const active = button.dataset.paletteChoice === paletteMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  preferenceStore.set("questoes-palette", paletteMode);
}
function setView(mode, keepPosition = false) {
  viewMode = mode === "focus" ? "focus" : "list";
  document.body.dataset.view = viewMode;
  document.querySelectorAll("[data-view-choice]").forEach(button => {
    const active = button.dataset.viewChoice === viewMode;
    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  if (!keepPosition && viewMode === "focus") {
    const firstUnanswered = questionOrder.findIndex(index => {
      const card = document.getElementById("q" + index);
      return card && !card.classList.contains("answered");
    });
    focusPosition = firstUnanswered >= 0 ? firstUnanswered : 0;
  }
  updateFocusView();
  preferenceStore.set("questoes-view", viewMode);
}
function updateFocusView() {
  const cards = document.querySelectorAll("#quiz .question-card");
  if (!cards.length) return;
  focusPosition = Math.max(0, Math.min(focusPosition, cards.length - 1));
  cards.forEach((card, index) => card.classList.toggle("active", index === focusPosition));
  document.getElementById("focus-position").textContent = `Questão ${focusPosition + 1} de ${cards.length}`;
  document.getElementById("focus-prev").disabled = focusPosition === 0;
  document.getElementById("focus-next").disabled = focusPosition === cards.length - 1;
  document.querySelector(".focus-navigation").style.setProperty("--focus-progress", `${((focusPosition + 1) / cards.length) * 100}%`);
  renderRefs();
}

document.querySelectorAll("[data-theme-choice]").forEach(button => button.addEventListener("click", () => setTheme(button.dataset.themeChoice)));
document.querySelectorAll("[data-palette-choice]").forEach(button => button.addEventListener("click", () => setPalette(button.dataset.paletteChoice)));
document.querySelectorAll("[data-view-choice]").forEach(button => button.addEventListener("click", () => setView(button.dataset.viewChoice)));

// ---------- Diálogo de configurações ----------
// Generalizado para qualquer número de ".settings-trigger" na página (o
// template de quiz tem um botão fixo; o seletor tem um no cabeçalho e outro
// na barra da sessão) — devolve o foco ao botão que abriu o diálogo.
const settingsOverlay = document.getElementById("settings-overlay");
let settingsReturnFocus = null;
function openSettings(trigger) {
  settingsReturnFocus = trigger || null;
  settingsOverlay.classList.add("open");
  settingsOverlay.setAttribute("aria-hidden", "false");
  document.body.classList.add("settings-open");
  settingsOverlay.querySelector(".settings-close").focus();
}
function closeSettings() {
  settingsOverlay.classList.remove("open");
  settingsOverlay.setAttribute("aria-hidden", "true");
  document.body.classList.remove("settings-open");
  if (settingsReturnFocus) settingsReturnFocus.focus();
}
document.querySelectorAll(".settings-trigger").forEach(button => {
  button.addEventListener("click", () => openSettings(button));
});
settingsOverlay.querySelector(".settings-close").addEventListener("click", closeSettings);
settingsOverlay.querySelector(".settings-done").addEventListener("click", closeSettings);
settingsOverlay.addEventListener("click", event => { if (event.target === settingsOverlay) closeSettings(); });
document.addEventListener("keydown", event => { if (event.key === "Escape" && settingsOverlay.classList.contains("open")) closeSettings(); });

// ---------- Motor do quiz (renderização, resposta, salvamento) ----------
const letters = ["A","B","C","D","E"];
let answered = 0, correctCount = 0, partialCount = 0;
let sessionLog = [];
let qualityReviews = [];
let sessionStart = new Date();
let pendingCertainty = {};
let shuffledOrder = [];
let questionOrder = [];
let quizOrderMode = null;
let quizRevealMode = "immediate";

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function renderQuiz() {
  const el = document.getElementById("quiz");
  el.innerHTML = "";
  el.classList.toggle("reveal-pending", quizRevealMode === "end");
  shuffledOrder = questions.map(item => shuffle(item.options.map((_, i) => i)));
  questionOrder = quizOrderMode === "original" ? questions.map((_, i) => i) : shuffle(questions.map((_, i) => i));
  pendingCertainty = {};

  questionOrder.forEach((idx, displayPos) => {
    const item = questions[idx];
    const card = document.createElement("div");
    card.className = "question-card";
    card.id = "q" + idx;
    card.dataset.displayPosition = displayPos;

    const meta = document.createElement("div");
    meta.className = "q-meta";
    const temaBadge = item.tema && item.tema !== QUIZ_TITLE ? `<span class="badge tema">${item.tema}</span>` : "";
    meta.innerHTML = `<span class="q-num">Questão ${displayPos+1}</span><span class="badge">${item.cat}</span>${temaBadge}`;
    card.appendChild(meta);

    const qtext = document.createElement("p");
    qtext.className = "q-text";
    qtext.textContent = item.q;
    card.appendChild(qtext);

    if (item.img) {
      const figure = document.createElement("div");
      figure.className = "q-image";
      const imgEl = document.createElement("img");
      imgEl.src = item.img;
      imgEl.alt = item.imgAlt || "Imagem da questão";
      imgEl.loading = "lazy";
      figure.appendChild(imgEl);
      if (item.imgAlt) {
        const cap = document.createElement("div");
        cap.className = "caption";
        cap.textContent = item.imgAlt;
        figure.appendChild(cap);
      }
      card.appendChild(figure);
    }

    renderPreAnswerCertainty(card, idx);

    const openAnswer = document.createElement("div");
    openAnswer.className = "open-answer";
    openAnswer.innerHTML = `<label for="open-answer-${idx}">Responda com suas próprias palavras, sem consultar as alternativas:</label>
      <textarea id="open-answer-${idx}" placeholder="Digite aqui tudo o que você lembra..."></textarea>
      <button type="button" class="open-submit">Registrar e conferir</button>
      <div class="open-error" aria-live="polite"></div>
      <div class="open-model"><strong>Resposta esperada</strong><span class="open-model-text"></span></div>
      <div class="self-assessment">
        <div class="assessment-label">Comparando sua resposta com a resposta esperada, como você se saiu?</div>
        <div class="assessment-actions">
          <button type="button" class="assessment-btn" data-grade="correct">Correta</button>
          <button type="button" class="assessment-btn" data-grade="partial">Parcial</button>
          <button type="button" class="assessment-btn" data-grade="incorrect">Incorreta</button>
        </div>
        <div class="partial-gap">
          <label for="partial-gap-${idx}">O que faltou ou precisa ser corrigido?</label>
          <textarea id="partial-gap-${idx}" placeholder="Registre a informação que faltou para consolidar a revisão..."></textarea>
          <button type="button" class="partial-submit">Finalizar como parcial</button>
        </div>
        <div class="open-error assessment-error" aria-live="polite"></div>
      </div>`;
    card.appendChild(openAnswer);
    openAnswer.querySelector(".open-submit").addEventListener("click", () => submitOpenAnswer(idx));
    openAnswer.querySelectorAll(".assessment-btn").forEach(btn => {
      btn.addEventListener("click", () => assessOpenAnswer(idx, btn.dataset.grade));
    });
    openAnswer.querySelector(".partial-submit").addEventListener("click", () => finalizePartialAnswer(idx));

    const order = shuffledOrder[idx];
    const opts = document.createElement("div");
    opts.className = "options";
    order.forEach((origIdx, displayIdx) => {
      const opt = document.createElement("div");
      opt.className = "option";
      opt.innerHTML = `<span class="letter">${letters[displayIdx]}</span><span>${item.options[origIdx]}</span>`;
      opt.addEventListener("click", () => selectOption(idx, origIdx));
      opts.appendChild(opt);
    });
    card.appendChild(opts);

    const postChoice = document.createElement("div");
    postChoice.className = "post-choice";
    postChoice.innerHTML = `<div class="post-choice-label">Como você chegou a essa escolha?</div>
      <div class="post-choice-actions">
        <button type="button" class="strategy-btn" data-strategy="elimination">Usei exclusão</button>
        <button type="button" class="strategy-btn strategy-recognition" data-strategy="recognition">Li a alternativa certa e lembrei</button>
        <button type="button" class="strategy-btn strategy-false-confidence" data-strategy="false-confidence">Achei que tinha marcado a certa — confiança equivocada</button>
        <button type="button" class="strategy-btn" data-strategy="guess">Chutei</button>
      </div>`;
    postChoice.querySelectorAll(".strategy-btn").forEach(btn => {
      btn.addEventListener("click", () => finalizeChoiceAnswer(idx, btn.dataset.strategy));
    });
    card.appendChild(postChoice);

    const refNums = (item.ref || []).map(slug => refNumberMap[slug]).join(", ");
    const exp = document.createElement("div");
    exp.className = "explanation";
    exp.innerHTML = `<strong>Explicação:</strong> ${item.exp}` + (refNums ? ` <span class="ref-tag">[${refNums}]</span>` : "");
    card.appendChild(exp);

    const quality = document.createElement("div");
    quality.className = "quality-review";
    quality.innerHTML = `<div class="quality-label">Como está a qualidade desta questão?</div>
      <div class="quality-actions">
        <button type="button" class="quality-btn" data-quality="good">Não identifiquei problemas</button>
        <button type="button" class="quality-btn" data-quality="needs-improvement">Poderia melhorar</button>
      </div>
      <div class="quality-details">
        <label for="quality-comment-${idx}">O que deveria ser melhorado?</label>
        <textarea id="quality-comment-${idx}" placeholder="Descreva ambiguidade, erro, dificuldade inadequada ou sugestão de reformulação..."></textarea>
        <button type="button" class="quality-submit">Registrar melhoria</button>
      </div>
      <div class="quality-status" aria-live="polite"></div>`;
    quality.querySelector('[data-quality="good"]').addEventListener("click", () => recordQualityReview(idx, "good", ""));
    quality.querySelector('[data-quality="needs-improvement"]').addEventListener("click", () => {
      quality.classList.add("needs-comment");
      quality.querySelector("textarea").focus();
    });
    quality.querySelector(".quality-submit").addEventListener("click", () => {
      const comment = quality.querySelector("textarea").value.trim();
      if (!comment) {
        quality.querySelector(".quality-status").textContent = "Descreva o que pode melhorar antes de registrar.";
        quality.querySelector("textarea").focus();
        return;
      }
      recordQualityReview(idx, "needs-improvement", comment);
    });
    card.appendChild(quality);

    el.appendChild(card);
  });
  document.getElementById("score-max").textContent = questions.length;
  updateFocusView();
}

function selectOption(qIdx, origIdx) {
  const card = document.getElementById("q" + qIdx);
  if (card.classList.contains("answered") || card.classList.contains("reviewing-choice")) return;
  if (!pendingCertainty[qIdx] || pendingCertainty[qIdx].value !== "choices") return;
  card.classList.add("reviewing-choice");
  const opts = card.querySelectorAll(".option");
  const correctOrigIdx = questions[qIdx].correct;
  const order = shuffledOrder[qIdx];
  const correctDisplayIdx = order.indexOf(correctOrigIdx);
  opts[correctDisplayIdx].classList.add("correct");
  const isCorrect = origIdx === correctOrigIdx;
  if (!isCorrect) {
    const wrongDisplayIdx = order.indexOf(origIdx);
    opts[wrongDisplayIdx].classList.add("wrong");
  }
  card.classList.toggle("choice-wrong", !isCorrect);
  card.classList.toggle("choice-correct", isCorrect);
  pendingCertainty[qIdx].selectedOption = origIdx;
  pendingCertainty[qIdx].choiceCorrect = isCorrect;
  lockCertainty(card);
}

function finalizeChoiceAnswer(qIdx, strategy) {
  const card = document.getElementById("q" + qIdx);
  if (!card.classList.contains("reviewing-choice") || card.classList.contains("answered")) return;
  const pending = pendingCertainty[qIdx];
  if (pending.choiceCorrect) correctCount++;
  answered++;
  sessionLog.push({
    qIndex: qIdx,
    qId: questions[qIdx].id || null,
    tema: questions[qIdx].tema || QUIZ_TITLE,
    cat: questions[qIdx].cat,
    question: questions[qIdx].q,
    correct: pending.choiceCorrect,
    answerMode: "multiple-choice",
    selectedOption: pending.selectedOption,
    selectedOptionText: questions[qIdx].options[pending.selectedOption],
    options: questions[qIdx].options.slice(),
    correctOption: questions[qIdx].correct,
    correctOptionText: questions[qIdx].options[questions[qIdx].correct],
    itemVersion: questions[qIdx].itemVersion || 1,
    editorialState: questions[qIdx].editorialState || null,
    certainty: strategy,
    alternativesOpenedAt: pending.markedAt,
    certaintyMarkedAt: new Date().toISOString(),
    answeredAt: new Date().toISOString()
  });
  card.querySelectorAll(".strategy-btn").forEach(btn => btn.classList.toggle("selected", btn.dataset.strategy === strategy));
  card.classList.remove("reviewing-choice");
  card.classList.add("answered");
  updateScore();
}

function submitOpenAnswer(qIdx) {
  const card = document.getElementById("q" + qIdx);
  if (card.classList.contains("answered") || card.classList.contains("reviewing-open")) return;
  const textarea = card.querySelector(".open-answer > textarea");
  const error = card.querySelector(".open-answer > .open-error");
  const response = textarea.value.trim();
  if (!response) {
    error.textContent = "Escreva sua resposta antes de conferir.";
    textarea.focus();
    return;
  }
  error.textContent = "";
  pendingCertainty[qIdx].openAnswer = response;
  card.querySelector(".open-model-text").textContent = questions[qIdx].options[questions[qIdx].correct];
  card.classList.add("reviewing-open");
  lockCertainty(card);
}

function assessOpenAnswer(qIdx, grade) {
  const card = document.getElementById("q" + qIdx);
  if (!card.classList.contains("reviewing-open") || card.classList.contains("answered")) return;
  const assessment = card.querySelector(".self-assessment");
  assessment.querySelectorAll(".assessment-btn").forEach(btn => btn.classList.toggle("selected", btn.dataset.grade === grade));
  if (grade === "partial") {
    assessment.classList.add("partial-selected");
    assessment.querySelector(".partial-gap textarea").focus();
    return;
  }
  assessment.classList.remove("partial-selected");
  finalizeOpenAnswer(qIdx, grade, "");
}

function finalizePartialAnswer(qIdx) {
  const card = document.getElementById("q" + qIdx);
  if (card.classList.contains("answered")) return;
  const gap = card.querySelector(".partial-gap textarea").value.trim();
  const error = card.querySelector(".assessment-error");
  if (!gap) {
    error.textContent = "Registre o que faltou antes de finalizar como parcial.";
    card.querySelector(".partial-gap textarea").focus();
    return;
  }
  error.textContent = "";
  finalizeOpenAnswer(qIdx, "partial", gap);
}

function finalizeOpenAnswer(qIdx, grade, missingContent) {
  const card = document.getElementById("q" + qIdx);
  if (card.classList.contains("answered")) return;
  const isCorrect = grade === "correct";
  if (isCorrect) correctCount++;
  if (grade === "partial") partialCount++;
  answered++;
  card.classList.remove("reviewing-open");
  card.classList.add("answered");
  sessionLog.push({
    qIndex: qIdx,
    qId: questions[qIdx].id || null,
    tema: questions[qIdx].tema || QUIZ_TITLE,
    cat: questions[qIdx].cat,
    question: questions[qIdx].q,
    correct: isCorrect,
    correctOption: questions[qIdx].correct,
    correctOptionText: questions[qIdx].options[questions[qIdx].correct],
    itemVersion: questions[qIdx].itemVersion || 1,
    editorialState: questions[qIdx].editorialState || null,
    partial: grade === "partial",
    selfAssessment: grade,
    answerMode: "open-recall",
    openAnswer: pendingCertainty[qIdx].openAnswer,
    missingContent: missingContent || null,
    certainty: pendingCertainty[qIdx].value,
    certaintyMarkedAt: pendingCertainty[qIdx].markedAt,
    answeredAt: new Date().toISOString()
  });
  updateScore();
}

function lockCertainty(card) {
  const certaintyBox = card.querySelector(".certainty-box");
  certaintyBox.classList.add("locked");
  certaintyBox.querySelector(".certainty-confirm").textContent = "Modo de resposta registrado e bloqueado para esta questão.";
}

const CERTAINTY_OPTIONS = [
  ["know", "Eu sei a resposta"],
  ["choices", "Ver alternativas"]
];

function renderPreAnswerCertainty(card, qIdx) {
  const box = document.createElement("div");
  box.className = "certainty-box";
  box.innerHTML = `<div class="certainty-label">Como você deseja responder?</div>
    <div class="certainty-btns">
      ${CERTAINTY_OPTIONS.map(([val, label]) => `<button type="button" class="certainty-btn" data-val="${val}">${label}</button>`).join("")}
    </div>
    <div class="certainty-confirm">Marcado — agora assinale uma alternativa. Você ainda pode trocar esta marcação antes de responder.</div>`;
  card.appendChild(box);
  box.querySelectorAll(".certainty-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      if (card.classList.contains("answered")) return;
      pendingCertainty[qIdx] = { value: btn.dataset.val, markedAt: new Date().toISOString() };
      box.querySelectorAll(".certainty-btn").forEach(b => b.classList.remove("selected"));
      btn.classList.add("selected");
      box.classList.add("done");
      card.classList.add("certainty-set");
      card.classList.toggle("mode-open", btn.dataset.val === "know");
      card.classList.toggle("mode-choice", btn.dataset.val === "choices");
      box.querySelector(".certainty-confirm").textContent = btn.dataset.val === "know"
        ? "Marcado — escreva a resposta com suas próprias palavras antes de conferir."
        : "Alternativas liberadas — marque uma opção e depois registre se usou exclusão ou chutou.";
    });
  });
}

function recordQualityReview(qIdx, rating, comment) {
  const card = document.getElementById("q" + qIdx);
  if (!card.classList.contains("answered")) return;
  const entry = {
    quiz: QUIZ_ID,
    quizTitle: QUIZ_TITLE,
    qIndex: qIdx,
    qId: questions[qIdx].id || null,
    tema: questions[qIdx].tema || QUIZ_TITLE,
    cat: questions[qIdx].cat,
    question: questions[qIdx].q,
    correctAnswer: questions[qIdx].options[questions[qIdx].correct],
    rating,
    comment: comment || null,
    questionCompleted: true,
    reviewedAt: new Date().toISOString(),
    exportedAt: null
  };
  const previousIndex = qualityReviews.findIndex(item => item.qId === entry.qId && item.quiz === QUIZ_ID);
  if (previousIndex >= 0) qualityReviews[previousIndex] = entry;
  else qualityReviews.push(entry);

  const review = card.querySelector(".quality-review");
  review.classList.remove("needs-comment");
  review.classList.add("saved");
  review.querySelectorAll(".quality-btn").forEach(btn => btn.classList.toggle("selected", btn.dataset.quality === rating));
  review.querySelector(".quality-status").textContent = rating === "good"
    ? "Avaliação registrada: nenhum problema identificado."
    : "Sugestão de melhoria registrada.";
  updateQualityPendingCount();

  if (viewMode === "focus") {
    const cards = document.querySelectorAll("#quiz .question-card");
    if (focusPosition < cards.length - 1) {
      setTimeout(() => {
        focusPosition++;
        updateFocusView();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 700);
    }
  }
}

function updateQualityPendingCount() {
  const count = qualityReviews.filter(item => item.questionCompleted && !item.exportedAt).length;
  document.getElementById("quality-pending").textContent = count;
}

function qualityExportPayload(entries) {
  return {
    schemaVersion: 1,
    source: "question-quality-review",
    quiz: QUIZ_ID,
    quizTitle: QUIZ_TITLE,
    exportedAt: new Date().toISOString(),
    reviews: entries.map(({ exportedAt, ...entry }) => entry)
  };
}

function qualityFilename() {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `melhorias_${QUIZ_ID}_${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}.json`;
}

function normalizedDirectoryName(name) {
  return String(name || "").normalize("NFD").replace(new RegExp("[\\u0300-\\u036f]", "g"), "").toLowerCase().trim();
}

function requireDirectory(directory, expectedName, purpose) {
  const selected = normalizedDirectoryName(directory && directory.name);
  const expected = normalizedDirectoryName(expectedName);
  if (selected === expected) return true;
  alert(`Pasta incorreta para ${purpose}. Selecione a pasta "${expectedName}". Nenhum arquivo foi salvo.`);
  return false;
}

async function saveQualityReviews() {
  const pending = qualityReviews.filter(item => item.questionCompleted && !item.exportedAt);
  if (pending.length === 0) {
    alert("Avalie ao menos uma questão antes de salvar, ou não há novas avaliações desde o último salvamento.");
    return;
  }
  const payload = qualityExportPayload(pending);
  const filename = qualityFilename();
  try {
    if (window.showDirectoryPicker) {
      const directory = await window.showDirectoryPicker({ mode: "readwrite" });
      if (!requireDirectory(directory, "melhorias de questões", "sugestões de melhoria")) return;
      const file = await directory.getFileHandle(filename, { create: true });
      const writer = await file.createWritable();
      await writer.write(JSON.stringify(payload, null, 2));
      await writer.close();
      pending.forEach(item => { item.exportedAt = payload.exportedAt; });
      updateQualityPendingCount();
      alert(`${pending.length} avaliação(ões) de questões concluídas salva(s) em ${directory.name}\\${filename}`);
      return;
    }
    downloadQualityReviews(payload, filename);
    pending.forEach(item => { item.exportedAt = payload.exportedAt; });
    updateQualityPendingCount();
    alert(`${pending.length} avaliação(ões) de questões concluídas foram baixadas. Mova o arquivo para Questões\\_dados\\melhorias de questões.`);
  } catch (error) {
    if (error && error.name === "AbortError") return;
    console.error(error);
    alert("Não foi possível gravar as avaliações. Tente novamente ou use um navegador Chromium atualizado.");
  }
}

function downloadQualityReviews(payload, filename) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function registroFilename() {
  const now = new Date();
  const pad = n => String(n).padStart(2, "0");
  return `${QUIZ_ID}_${now.getFullYear()}${pad(now.getMonth()+1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}.json`;
}

async function saveRegistro() {
  if (sessionLog.length === 0) {
    alert("Responda ao menos uma questão antes de salvar o registro.");
    return;
  }
  const now = new Date();
  const registro = {
    quiz: QUIZ_ID,
    title: QUIZ_TITLE,
    startedAt: sessionStart.toISOString(),
    finishedAt: now.toISOString(),
    totalQuestions: questions.length,
    score: { correct: correctCount, partial: partialCount, answered: answered },
    answers: sessionLog
  };
  // Campo opcional e aditivo: só presente quando a sessão veio da SPA com
  // metadados (curated/dynamic + filtro + contagens). Registros legados e
  // sessões sem sessionMeta continuam com exatamente o formato de sempre.
  if (window.QUIZ_SESSION_META) registro.session = window.QUIZ_SESSION_META;
  const filename = registroFilename();
  try {
    if (window.showDirectoryPicker) {
      const directory = await window.showDirectoryPicker({ mode: "readwrite" });
      if (!requireDirectory(directory, "registros", "o progresso")) return;
      const file = await directory.getFileHandle(filename, { create: true });
      const writer = await file.createWritable();
      await writer.write(JSON.stringify(registro, null, 2));
      await writer.close();
      alert(`Registro salvo em ${directory.name}\\${filename}`);
      return;
    }
  } catch (error) {
    if (error && error.name === "AbortError") return;
    console.error(error);
    alert("Não foi possível gravar o registro. Tente novamente ou use um navegador Chromium atualizado.");
    return;
  }
  downloadRegistroFile(registro, filename);
  document.getElementById("export-hint").classList.add("show");
}

function downloadRegistroFile(registro, filename) {
  const blob = new Blob([JSON.stringify(registro, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function updateScore() {
  document.getElementById("score-correct").textContent = correctCount;
  document.getElementById("score-partial").textContent = partialCount;
  document.getElementById("score-total").textContent = answered;
}

function resetQuiz() {
  answered = 0; correctCount = 0; partialCount = 0;
  sessionLog = [];
  sessionStart = new Date();
  document.getElementById("export-hint").classList.remove("show");
  const revealButton = document.getElementById("capsule-reveal");
  if (revealButton) { revealButton.disabled = false; revealButton.setAttribute("aria-pressed", "false"); revealButton.textContent = "Revelar respostas"; }
  updateScore();
  renderQuiz();
  window.scrollTo({top: 0, behavior: "smooth"});
}

function renderRefs() {
  const ol = document.getElementById("ref-list");
  if (!ol) return;

  let visibleRefs = refOrder;
  if (viewMode === "focus" && questionOrder.length) {
    const activeQuestion = questions[questionOrder[focusPosition]];
    visibleRefs = activeQuestion ? (activeQuestion.ref || []) : [];
  }

  ol.innerHTML = visibleRefs.map(slug => {
    const number = refNumberMap[slug];
    const value = number ? ` value="${number}"` : "";
    return `<li${value}>${fontes[slug] || slug}</li>`;
  }).join("");
}

// ---------- API programática para o shell de rota única ----------
// A API é aditiva: os HTMLs gerados continuam declarando seus próprios dados e
// chamando renderQuiz/renderRefs como antes. A SPA injeta os mesmos nomes no
// objeto global apenas durante a vida da view de quiz.
let spaQuizMount = null;
let spaQuizCleanups = [];

function listenForSpa(target, type, listener, options) {
  if (!target) return;
  target.addEventListener(type, listener, options);
  spaQuizCleanups.push(() => target.removeEventListener(type, listener, options));
}

function destroyQuiz() {
  spaQuizCleanups.splice(0).forEach(cleanup => cleanup());
  answered = 0; correctCount = 0; partialCount = 0;
  sessionLog = []; qualityReviews = []; pendingCertainty = {};
  shuffledOrder = []; questionOrder = []; focusPosition = 0;
  quizOrderMode = null; quizRevealMode = "immediate";
  if (settingsOverlay && settingsOverlay.classList.contains("open")) closeSettings();
  if (spaQuizMount && spaQuizMount.isConnected) spaQuizMount.replaceChildren();
  spaQuizMount = null;
  ["QUIZ_ID", "QUIZ_TITLE", "questions", "fontes", "refOrder", "refNumberMap", "QUIZ_SESSION_META"].forEach(key => {
    try { delete window[key]; } catch (_) {}
  });
}

function initQuiz(quizData, mountEl) {
  destroyQuiz();
  if (!quizData || !Array.isArray(quizData.questions)) throw new Error("Dados de quiz inválidos.");
  spaQuizMount = mountEl || document.getElementById("app");
  window.QUIZ_ID = quizData.quizId;
  window.QUIZ_TITLE = quizData.title;
  window.questions = quizData.questions;
  window.fontes = quizData.fontes || {};
  // Aditivo: HTMLs legados nunca definem quizData.sessionMeta, então esta
  // chave fica ausente do registro exportado exatamente como antes.
  window.QUIZ_SESSION_META = quizData.sessionMeta || null;
  // Aditivo: HTMLs legados e sessões curadas/dinâmicas nunca definem
  // quizData.order/answerReveal, então mantêm o comportamento de sempre
  // (ordem embaralhada, resposta revelada ao responder). Só cápsulas de
  // estudo (#/lista) passam esses campos.
  quizOrderMode = quizData.order || null;
  quizRevealMode = quizData.answerReveal || "immediate";
  window.refOrder = [];
  window.questions.forEach(item => (item.ref || []).forEach(slug => {
    if (!window.refOrder.includes(slug)) window.refOrder.push(slug);
  }));
  window.refNumberMap = {};
  window.refOrder.forEach((slug, index) => { window.refNumberMap[slug] = index + 1; });

  const title = document.getElementById("quiz-title");
  const description = document.getElementById("quiz-desc");
  const footnote = document.getElementById("quiz-footnote");
  if (title) title.textContent = window.QUIZ_TITLE;
  if (description) description.textContent = quizData.description || "";
  if (footnote) footnote.textContent = quizData.footnote || "";
  document.title = `Questões — ${window.QUIZ_TITLE}`;

  listenForSpa(document.getElementById("focus-prev"), "click", () => {
    focusPosition--; updateFocusView(); window.scrollTo({ top: 0, behavior: "smooth" });
  });
  listenForSpa(document.getElementById("focus-next"), "click", () => {
    focusPosition++; updateFocusView(); window.scrollTo({ top: 0, behavior: "smooth" });
  });
  listenForSpa(document.getElementById("save-progress"), "click", saveRegistro);
  listenForSpa(document.getElementById("save-quality"), "click", saveQualityReviews);
  listenForSpa(document.getElementById("reset-quiz"), "click", resetQuiz);
  listenForSpa(document.getElementById("capsule-reveal"), "click", event => {
    document.getElementById("quiz")?.classList.remove("reveal-pending");
    event.target.setAttribute("aria-pressed", "true");
    event.target.textContent = "Respostas reveladas";
    event.target.disabled = true;
  });
  document.querySelectorAll(".quiz-view .settings-trigger").forEach(button => {
    listenForSpa(button, "click", () => openSettings(button));
  });
  listenForSpa(document, "keydown", event => {
    if (viewMode !== "focus" || (settingsOverlay && settingsOverlay.classList.contains("open"))) return;
    const tag = document.activeElement && document.activeElement.tagName;
    if (["INPUT", "TEXTAREA", "SELECT"].includes(tag)) return;
    if (event.key === "ArrowLeft" && focusPosition > 0) { focusPosition--; updateFocusView(); }
    if (event.key === "ArrowRight" && focusPosition < questionOrder.length - 1) { focusPosition++; updateFocusView(); }
  });

  setTheme(themeMode); setPalette(paletteMode);
  renderQuiz(); renderRefs(); setView(viewMode, true);
}

function initSelector() { /* A view SPA possui DOM próprio; mantido por simetria de ciclo de vida. */ }
function destroySelector() { /* Listeners da view pertencem ao mount e somem em replaceChildren(). */ }

window.QuestoesApp = Object.assign(window.QuestoesApp || {}, {
  initQuiz, destroyQuiz, initSelector, destroySelector,
  setTheme, setPalette, setView, openSettings, closeSettings
});
