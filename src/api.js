import axios from "axios";
import { API as CONFIG_API } from '@/config';
import { LANGUAGE_VERSIONS } from "./constants";

const PISTON_API = axios.create({
  baseURL: "https://emkc.org/api/v2/piston",
  timeout: 15000,
});

// High-speed, free, public online compiler mapping (Wandbox)
const WANDBOX_COMPILERS = {
  c: "gcc-head-c",
  cpp: "gcc-head",
  arduino: "gcc-head",
  esp32: "gcc-head",
  python: "cpython-3.12.7",
  javascript: "nodejs-20.17.0",
  typescript: "typescript-5.6.2",
  java: "openjdk-jdk-22+36",
  csharp: "mono-6.12.0.199",
  php: "php-8.3.12",
};

export const executeCode = async (language = "c", sourceCode, stdin = "") => {
  // Normalize language string
  let norm = (language || "c").toLowerCase().trim();
  if (norm.includes("select") || !norm) {
    if (/^\s*(#include|void\s+app_main|int\s+main|void\s+setup)/m.test(sourceCode)) {
      norm = "c";
    } else if (/^\s*(import\s+|def\s+|print\()/m.test(sourceCode)) {
      norm = "python";
    } else {
      norm = "c";
    }
  }

  // 1. Primary Engine: Wandbox (Fast, public, no auth/whitelist required)
  const compiler = WANDBOX_COMPILERS[norm] || "gcc-head-c";
  try {
    const payload = {
      compiler,
      code: sourceCode,
      stdin: stdin || "",
    };

    if (norm === "c") {
      payload.options = "-std=c11";
    }

    const response = await axios.post("https://wandbox.org/api/compile.json", payload, {
      timeout: 25000,
      headers: { "Content-Type": "application/json" }
    });

    const data = response.data;
    const exitCode = parseInt(data.status || "0", 10);
    const compileErr = data.compiler_error || data.compiler_message || "";
    const progErr = data.program_error || "";
    const stdout = data.program_output || "";
    const fullErr = [compileErr, progErr].filter(Boolean).join("\n");
    const fullOutput = [stdout, fullErr].filter(Boolean).join("\n") || stdout;

    return {
      language: norm,
      version: "latest",
      run: {
        stdout,
        stderr: fullErr,
        code: exitCode,
        signal: data.signal || null,
        output: fullOutput || (exitCode === 0 ? "Program exited with code 0 (no output)" : fullErr)
      },
      compile: compileErr ? {
        stdout: data.compiler_output || "",
        stderr: compileErr,
        code: exitCode !== 0 ? exitCode : 0,
        output: compileErr
      } : null
    };
  } catch (wandboxErr) {
    console.warn("Wandbox execution failed, attempting Piston fallback:", wandboxErr.message);
  }

  // 2. Fallback Engine: Piston
  try {
    const pistonLang = norm === "arduino" || norm === "esp32" ? "c" : norm;
    const response = await PISTON_API.post("/execute", {
      language: pistonLang,
      version: LANGUAGE_VERSIONS[pistonLang] || "*",
      files: [{ content: sourceCode }],
      stdin,
    });
    return response.data;
  } catch (pistonErr) {
    const status = pistonErr.response?.status;
    if (status === 401 || status === 403) {
      throw new Error("Online cloud compiler is currently unavailable (401). For microcontroller / ESP32 code, please use the 'Flash' button to compile locally.");
    }
    throw pistonErr;
  }
};

export const submitCodeToDevice = async (code, language) => {
  try {
    const response = await axios.post(`${CONFIG_API.ADMIN}/submit-code`, {
      code,
      language
    });
    return response.data;
  } catch (error) {
    console.error("Error submitting code:", error);
    throw error;
  }
};
