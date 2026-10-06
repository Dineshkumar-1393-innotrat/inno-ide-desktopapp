// Geolog & Widget Sanitization Helpers for InnoIDE Companion Studio

export const isHardcodedTextFieldQuestion = (q) => Boolean(
  q && (
    q.id === "q-1" ||
    q.id === "q-2" ||
    q.text === "What is your technician or operator name?" ||
    q.text === "Device operational status & feedback:" ||
    (typeof q.text === "string" && (
      q.text.toLowerCase().includes("technician") ||
      q.text.toLowerCase().includes("operational status") ||
      q.text.toLowerCase().includes("hi satya") ||
      q.text.toLowerCase().includes("what is your name")
    ))
  )
);

export const isHardcodedTextFieldResponse = (r) => {
  if (!r) return true;
  const ans = String(r.answer || "").trim().toLowerCase();
  const qText = String(r.questionText || r.question || "").trim().toLowerCase();
  const id = String(r.id || "");
  const qId = String(r.questionId || "");

  if (
    id === "resp-1" ||
    id === "resp-2" ||
    qId === "q-1" ||
    qId === "q-2" ||
    qText.includes("technician") ||
    qText.includes("operational status") ||
    qText.includes("hi satya") ||
    qText.includes("what is your name") ||
    ans === "iam good" ||
    ans === "i am good" ||
    ans === "dinesh" ||
    ans === "dk" ||
    ans === "alex" ||
    ans === "alex engineer" ||
    ans.includes("alex engineer") ||
    ans === "running normally at 24.5°c" ||
    ans.includes("running normally")
  ) {
    return true;
  }
  return false;
};

export const isStaleTestGeolog = (g) => {
  if (!g) return true;
  const id = String(g.id || "");
  const t = String(g.time || g.timestamp || "");
  if (id === "loc-init-1") return true;
  if (
    t === "12:53:01" ||
    t === "12:34:55" ||
    t === "12:34:49" ||
    t === "12:19:06 pm" ||
    t === "11:36:18" ||
    t === "11:36:10" ||
    t === "11:35:58" ||
    t === "11:01:35" ||
    t === "11:01:33"
  ) {
    return true;
  }
  return false;
};

export const getLogTimestampMs = (item) => {
  if (!item) return 0;
  if (typeof item.timestamp === "number" && item.timestamp > 0) {
    return item.timestamp < 1e11 ? item.timestamp * 1000 : item.timestamp;
  }
  const rawNum = Number(item.timestamp);
  if (!isNaN(rawNum) && rawNum > 1e9) {
    return rawNum < 1e11 ? rawNum * 1000 : rawNum;
  }
  const rawTimeNum = Number(item.time);
  if (!isNaN(rawTimeNum) && rawTimeNum > 1e9) {
    return rawTimeNum < 1e11 ? rawTimeNum * 1000 : rawTimeNum;
  }
  const timeStr = String(item.time || item.timestamp || "").trim();
  if (timeStr) {
    const parsedDate = Date.parse(timeStr);
    if (!isNaN(parsedDate)) return parsedDate;

    const match = timeStr.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(am|pm)?$/i);
    if (match) {
      let hrs = parseInt(match[1], 10);
      const mins = parseInt(match[2], 10);
      const secs = match[3] ? parseInt(match[3], 10) : 0;
      const meridian = match[4] ? match[4].toLowerCase() : null;
      if (meridian === "pm" && hrs < 12) hrs += 12;
      if (meridian === "am" && hrs === 12) hrs = 0;
      const now = new Date();
      now.setHours(hrs, mins, secs, 0);
      return now.getTime();
    }
  }
  return 0;
};

export const formatGeologTime = (item) => {
  if (!item) return "";
  if (typeof item === "string") return item;
  if (item.time && typeof item.time === "string" && !/^\d{10,}$/.test(item.time)) {
    return item.time;
  }
  const raw = item.timestamp || item.time;
  if (!raw) return new Date().toLocaleTimeString();
  if (typeof raw === "number" || /^\d{10,}$/.test(String(raw))) {
    const d = new Date(Number(raw));
    if (!isNaN(d.getTime())) return d.toLocaleTimeString();
  }
  return String(raw);
};

export const sanitizeWidgets = (wList) => {
  if (!Array.isArray(wList)) return [];
  return wList.map((w) => {
    if (w.type === "textfield") {
      const questions = Array.isArray(w.questions)
        ? w.questions.filter((q) => !isHardcodedTextFieldQuestion(q))
        : [];
      const activeQuestionTexts = questions.map((q) => String(q.text || "").trim().toLowerCase());
      const activeQuestionIds = questions.map((q) => String(q.id || ""));
      const responses = Array.isArray(w.responses)
        ? w.responses.filter((r) => {
            if (isHardcodedTextFieldResponse(r)) return false;
            const rQText = String(r.questionText || r.question || "").trim().toLowerCase();
            const rQId = String(r.questionId || "");
            return (rQId && activeQuestionIds.includes(rQId)) || (rQText && activeQuestionTexts.includes(rQText));
          })
        : [];
      return {
        ...w,
        questions,
        responses
      };
    }
    if (w.type === "location") {
      const hist = Array.isArray(w.locationHistory)
        ? w.locationHistory.filter((g) => !isStaleTestGeolog(g))
        : [];
      const lastLoc = (w.lastLocation && !isStaleTestGeolog(w.lastLocation)) ? w.lastLocation : null;
      return {
        ...w,
        locationHistory: hist,
        lastLocation: lastLoc
      };
    }
    return w;
  });
};
