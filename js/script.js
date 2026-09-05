const screens = {
  start: document.getElementById("screen-start"),
  input: document.getElementById("screen-input"),
  result: document.getElementById("screen-result"),
  feedback: document.getElementById("screen-feedback")
};

const stepText = document.getElementById("stepText");
const progressBar = document.getElementById("progressBar");
const mobileTitle = document.getElementById("mobileTitle");
const mobileBackBtn = document.getElementById("mobileBackBtn");
const pcResultNav = document.getElementById("pcResultNav");
const mobileResultNav = document.getElementById("mobileResultNav");

const state = {
  medicine: "",
  period: "",
  discomfort: "",
  foods: "",
  digestive: "",
  afterUse: "",
  consent: false,
  feedback: "",
  hasResult: false
};

const screenMeta = {
  start: { step: "시작", progress: "25%", title: "GLP-1 식사 부담 확인 MVP" },
  input: { step: "입력 · 1단계", progress: "50%", title: "식사 불편 경험 입력" },
  result: { step: "결과 · 2단계", progress: "75%", title: "AI 식사 방향 결과" },
  feedback: { step: "피드백 · 3단계", progress: "100%", title: "해결방식 반응 수집" }
};

function showScreen(name, options = {}) {
  const { fromNav = false } = options;
  Object.entries(screens).forEach(([key, el]) => {
    el.hidden = key !== name;
  });

  stepText.textContent = screenMeta[name].step;
  progressBar.style.width = screenMeta[name].progress;
  mobileTitle.textContent = screenMeta[name].title;
  mobileBackBtn.hidden = name === "start";

  updateNav(name);
  window.scrollTo({ top: 0, behavior: "smooth" });

  // 메뉴로 이동할 때도 기존 결과/입력 상태를 그대로 유지한다.
  if (name === "feedback" && !state.hasResult && !fromNav) {
    showScreen("start");
  }
}

function updateNav(screenName) {
  const navName = screenName === "start" ? "home" : (screenName === "feedback" ? "result" : screenName === "input" ? "experience" : "result");
  document.querySelectorAll("[data-nav]").forEach((item) => {
    item.classList.toggle("active", item.dataset.nav === navName);
  });
  pcResultNav.disabled = !state.hasResult;
  mobileResultNav.disabled = !state.hasResult;
}

function syncFormState() {
  state.medicine = document.getElementById("medicine").value;
  state.period = document.getElementById("period").value;
  state.discomfort = document.getElementById("discomfort").value.trim();
  state.foods = document.getElementById("foods").value.trim();
  state.digestive = document.getElementById("digestive").value;
  state.afterUse = document.getElementById("afterUse").value;
  state.consent = document.getElementById("consent").checked;

  const complete = Boolean(
    state.medicine && state.period && state.discomfort && state.foods &&
    state.digestive && state.afterUse && state.consent
  );
  document.getElementById("generateBtn").disabled = !complete;
  if (complete) clearInputError();
}

function showInputError(message) {
  const box = document.getElementById("inputError");
  box.textContent = message;
  box.hidden = false;
}

function clearInputError() {
  document.getElementById("inputError").hidden = true;
}

function generateDemoResult() {
  const digestiveLine = state.digestive === "사용한 적 있음"
    ? `소화효소제 사용 경험이 있으며, 사용 후 상태는 "${state.afterUse}"로 입력했습니다.`
    : "소화효소제 사용 경험은 현재 입력 기준으로 없습니다.";

  document.getElementById("summary").textContent =
    `복용 상황: ${state.medicine} / 투약 초기: ${state.period}\n` +
    `식사 불편: ${state.discomfort}\n` +
    `먹기 어려운 음식: ${state.foods}\n` +
    digestiveLine;

  document.getElementById("mealDirection").textContent =
    "현재 입력을 기준으로, 한 끼의 부담과 음식 선택의 어려움을 줄이는 방향의 간편식 구성을 검토하는 데 초점을 둔 데모 결과입니다.";

  state.hasResult = true;
  updateNav("result");
}

function goToNav(destination) {
  if (destination === "home") {
    showScreen("start");
  } else if (destination === "experience") {
    showScreen("input", { fromNav: true });
  } else if (destination === "result" && state.hasResult) {
    showScreen("result", { fromNav: true });
  }
}

function goBack() {
  const visible = Object.entries(screens).find(([, el]) => !el.hidden)?.[0];
  if (visible === "input") showScreen("start");
  else if (visible === "result") showScreen("input");
  else if (visible === "feedback") showScreen("result");
  else showScreen("start");
}

// PC / mobile navigation.
document.querySelectorAll("[data-nav]").forEach((item) => {
  item.addEventListener("click", () => goToNav(item.dataset.nav));
});

document.getElementById("brandLink").addEventListener("click", (event) => {
  event.preventDefault();
  showScreen("start");
});

document.getElementById("mobileBackBtn").addEventListener("click", goBack);

document.getElementById("startBtn").addEventListener("click", () => showScreen("input"));
document.getElementById("backToStartBtn").addEventListener("click", () => showScreen("start"));
document.getElementById("backToInputBtn").addEventListener("click", () => showScreen("input"));
document.getElementById("feedbackStartBtn").addEventListener("click", () => showScreen("feedback"));
document.getElementById("backToResultBtn").addEventListener("click", () => showScreen("result"));

["medicine", "period", "discomfort", "foods", "digestive", "afterUse", "consent"].forEach((id) => {
  document.getElementById(id).addEventListener("input", syncFormState);
  document.getElementById(id).addEventListener("change", syncFormState);
});

document.getElementById("inputForm").addEventListener("submit", (event) => {
  event.preventDefault();
  syncFormState();
  if (document.getElementById("generateBtn").disabled) {
    showInputError("필수 항목을 모두 입력하고 개인정보 처리 동의를 선택해주세요.");
    return;
  }
  generateDemoResult();
  showScreen("result");
});

document.querySelectorAll(".feedback-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".feedback-btn").forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    state.feedback = btn.dataset.feedback;

    const msg = document.getElementById("feedbackMessage");
    msg.hidden = false;
    msg.textContent = `“${state.feedback}”로 선택되었습니다. [미검증 가설 · 추가 검증 필요] 상태는 유지됩니다.`;
  });
});

syncFormState();
showScreen("start");
