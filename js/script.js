const screens = {
      start: document.getElementById("screen-start"),
      input: document.getElementById("screen-input"),
      result: document.getElementById("screen-result"),
      feedback: document.getElementById("screen-feedback")
    };

    const stepText = document.getElementById("stepText");
    const progressBar = document.getElementById("progressBar");

    const state = {
      medicine: "",
      period: "",
      discomfort: "",
      foods: "",
      digestive: "",
      afterUse: "",
      consent: false,
      feedback: ""
    };

    const stepConfig = {
      start: ["1 / 4", "25%"],
      input: ["2 / 4", "50%"],
      result: ["3 / 4", "75%"],
      feedback: ["4 / 4", "100%"]
    };

    function showScreen(name) {
      Object.entries(screens).forEach(([key, el]) => {
        el.hidden = key !== name;
      });
      stepText.textContent = stepConfig[name][0];
      progressBar.style.width = stepConfig[name][1];
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    function syncFormState() {
      state.medicine = document.getElementById("medicine").value;
      state.period = document.getElementById("period").value;
      state.discomfort = document.getElementById("discomfort").value.trim();
      state.foods = document.getElementById("foods").value.trim();
      state.digestive = document.getElementById("digestive").value;
      state.afterUse = document.getElementById("afterUse").value;
      state.consent = document.getElementById("consent").checked;
      document.getElementById("generateBtn").disabled =
        !state.medicine || !state.period || !state.discomfort || !state.foods ||
        !state.digestive || !state.afterUse || !state.consent;
    }

    function generateDemoResult() {
      const discomfort = state.discomfort || "입력된 식사 불편 없음";
      const foods = state.foods || "입력된 제한 없음";

      const digestiveLine =
        state.digestive === "사용한 적 있음"
          ? `소화효소제 사용 경험이 있으며, 사용 후 상태는 "${state.afterUse}"로 입력했습니다.`
          : "소화효소제 사용 경험은 현재 입력 기준으로 없습니다.";

      document.getElementById("summary").textContent =
        `복용 상황: ${state.medicine} / 투약 초기: ${state.period}\n` +
        `식사 불편: ${discomfort}\n` +
        `먹기 어려운 음식: ${foods}\n` +
        `${digestiveLine}`;

      document.getElementById("mealDirection").textContent =
        "현재 입력을 기준으로, 한 끼의 부담과 음식 선택의 어려움을 줄이는 방향의 간편식 구성을 검토하는 데 초점을 둔 데모 결과입니다.";
    }

    document.getElementById("startBtn").addEventListener("click", () => showScreen("input"));
    document.getElementById("backToStartBtn").addEventListener("click", () => showScreen("start"));
    document.getElementById("backToInputBtn").addEventListener("click", () => showScreen("input"));
    document.getElementById("feedbackStartBtn").addEventListener("click", () => showScreen("feedback"));
    document.getElementById("backToResultBtn").addEventListener("click", () => showScreen("result"));

    ["medicine","period","discomfort","foods","digestive","afterUse","consent"].forEach(id => {
      document.getElementById(id).addEventListener("input", syncFormState);
      document.getElementById(id).addEventListener("change", syncFormState);
    });

    document.getElementById("generateBtn").addEventListener("click", () => {
      syncFormState();
      if (document.getElementById("generateBtn").disabled) return;
      generateDemoResult();
      showScreen("result");
    });

    document.querySelectorAll(".feedback-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".feedback-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        state.feedback = btn.dataset.feedback;
        const msg = document.getElementById("feedbackMessage");
        msg.hidden = false;
        msg.textContent = `“${state.feedback}”로 선택되었습니다. [미검증 가설 · 추가 검증 필요] 상태는 유지됩니다.`;
      });
    });

    syncFormState();
