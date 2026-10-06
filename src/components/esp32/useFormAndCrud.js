import { useState, useCallback } from "react";
import { useDisclosure } from "@chakra-ui/react";

/**
 * Custom hook to manage Dynamic Form questions, responses,
 * CRUD data records table modal, and switch location geologs.
 */
export default function useFormAndCrud({
  widgets,
  setWidgets,
  pushWidgetsToHistory,
  autoPersistApp,
  startLocalCompanionServer,
  toast
}) {
  const { isOpen: isCrudModalOpen, onOpen: onCrudModalOpen, onClose: onCrudModalClose } = useDisclosure();
  const [newQuestionInputs, setNewQuestionInputs] = useState({}); // { [widgetId]: "" }
  const [newAnswerInputs, setNewAnswerInputs] = useState({}); // { [`${widgetId}_${questionId}`]: "" }

  const [crudRecordTargetWidgetId, setCrudRecordTargetWidgetId] = useState(null);
  const [editingCrudRecord, setEditingCrudRecord] = useState(null);
  const [crudRecordForm, setCrudRecordForm] = useState({ name: "", value: "", status: "Active" });

  // Dynamic Google Form Question Builder: Add question to widget
  const handleAddQuestionToForm = useCallback((widgetId, questionText) => {
    if (!questionText || !questionText.trim()) return;
    const cleanText = questionText.trim();
    const newQ = {
      id: `q-${Date.now()}`,
      text: cleanText,
      type: "text",
      createdAt: new Date().toLocaleTimeString()
    };

    let updatedWidgets = null;
    setWidgets((prev) => {
      updatedWidgets = prev.map((w) => {
        if (w.id === widgetId) {
          const currentQuestions = Array.isArray(w.questions) ? w.questions : [];
          return {
            ...w,
            questions: [...currentQuestions, newQ]
          };
        }
        return w;
      });
      return updatedWidgets;
    });

    if (updatedWidgets && autoPersistApp) {
      autoPersistApp(updatedWidgets);
    }

    setNewQuestionInputs((prev) => ({ ...prev, [widgetId]: "" }));

    setTimeout(() => {
      try {
        if (typeof startLocalCompanionServer === "function") {
          startLocalCompanionServer();
        }
      } catch { }
    }, 150);

    if (toast) {
      toast({
        title: "Question Submitted to Google Form",
        description: `"${cleanText}" will render dynamically on mobile UI.`,
        status: "success",
        duration: 2500,
        isClosable: true
      });
    }
  }, [setWidgets, autoPersistApp, startLocalCompanionServer, toast]);

  // Delete question from form
  const handleDeleteQuestionFromForm = useCallback((widgetId, questionId) => {
    let updatedWidgets = null;
    setWidgets((prev) => {
      updatedWidgets = prev.map((w) => {
        if (w.id === widgetId) {
          const currentQuestions = Array.isArray(w.questions) ? w.questions : [];
          return {
            ...w,
            questions: currentQuestions.filter((q) => q.id !== questionId)
          };
        }
        return w;
      });
      return updatedWidgets;
    });

    if (updatedWidgets && autoPersistApp) {
      autoPersistApp(updatedWidgets);
    }

    setTimeout(() => {
      try {
        if (typeof startLocalCompanionServer === "function") {
          startLocalCompanionServer();
        }
      } catch { }
    }, 150);
  }, [setWidgets, autoPersistApp, startLocalCompanionServer]);

  // Submit Answer to Question (called from Mobile Preview or remote companion sync)
  const handleSubmitFormAnswer = useCallback((widgetId, questionId, questionText, answerText, source = "Mobile Preview") => {
    if (!answerText || !answerText.trim()) return;
    const cleanAnswer = answerText.trim();
    const newResponse = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      questionId,
      questionText: questionText || "Question",
      answer: cleanAnswer,
      source,
      timestamp: new Date().toLocaleTimeString()
    };

    let updatedWidgets = null;
    setWidgets((prev) => {
      updatedWidgets = prev.map((w) => {
        if (w.id === widgetId) {
          const currentResponses = Array.isArray(w.responses) ? w.responses : [];
          return {
            ...w,
            responses: [newResponse, ...currentResponses.slice(0, 99)]
          };
        }
        return w;
      });
      return updatedWidgets;
    });

    if (updatedWidgets && autoPersistApp) {
      autoPersistApp(updatedWidgets);
    }

    setNewAnswerInputs((prev) => ({ ...prev, [`${widgetId}_${questionId}`]: "" }));

    fetch("http://localhost:5055/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        widgetId,
        formResponse: newResponse,
        syncOnly: true
      })
    }).catch(() => { });

    if (toast) {
      toast({
        title: "Response Received in UI",
        description: `Answer: "${cleanAnswer}" for "${questionText}"`,
        status: "info",
        duration: 3000,
        isClosable: true
      });
    }
  }, [setWidgets, autoPersistApp, toast]);

  // Clear Form Responses
  const handleClearFormResponses = useCallback((widgetId) => {
    let updatedWidgets = null;
    setWidgets((prev) => {
      updatedWidgets = prev.map((w) => {
        if (w.id === widgetId || !widgetId) {
          return { ...w, responses: [] };
        }
        return w;
      });
      return updatedWidgets;
    });

    if (updatedWidgets && autoPersistApp) {
      autoPersistApp(updatedWidgets);
    }

    fetch("http://localhost:5055/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearFormResponses: true, widgetId, syncOnly: true })
    }).catch(() => { });

    if (toast) {
      toast({
        title: "Answers Cleared",
        description: "All submitted form answers have been cleared.",
        status: "info",
        duration: 2000
      });
    }

    setTimeout(() => {
      if (typeof startLocalCompanionServer === "function") {
        startLocalCompanionServer();
      }
    }, 150);
  }, [setWidgets, autoPersistApp, startLocalCompanionServer, toast]);

  // Clear Switch Geologs
  const handleClearGeologs = useCallback((widgetId) => {
    let updatedWidgets = null;
    setWidgets((prev) => {
      updatedWidgets = prev.map((w) => {
        if (w.id === widgetId || (!widgetId && w.type === "location")) {
          return { ...w, locationHistory: [], lastLocation: null };
        }
        return w;
      });
      return updatedWidgets;
    });

    if (updatedWidgets && autoPersistApp) {
      autoPersistApp(updatedWidgets);
    }

    fetch("http://localhost:5055/api/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clearGeologs: true, widgetId, syncOnly: true })
    }).catch(() => { });

    if (toast) {
      toast({
        title: "Geologs Cleared",
        description: "Switch location history has been cleared.",
        status: "info",
        duration: 2000
      });
    }

    setTimeout(() => {
      if (typeof startLocalCompanionServer === "function") {
        startLocalCompanionServer();
      }
    }, 150);
  }, [setWidgets, autoPersistApp, startLocalCompanionServer, toast]);

  // CRUD Record Handlers for in-app Data Records / CRUD Table widget
  const handleOpenAddCrudRecord = useCallback((widgetId) => {
    setCrudRecordTargetWidgetId(widgetId);
    setEditingCrudRecord(null);
    setCrudRecordForm({ name: "", value: "", status: "Active" });
    onCrudModalOpen();
  }, [onCrudModalOpen]);

  const handleOpenEditCrudRecord = useCallback((widgetId, record) => {
    setCrudRecordTargetWidgetId(widgetId);
    setEditingCrudRecord(record);
    setCrudRecordForm({ name: record.name, value: record.value, status: record.status || "Active" });
    onCrudModalOpen();
  }, [onCrudModalOpen]);

  const handleSaveCrudRecord = useCallback(() => {
    if (!crudRecordTargetWidgetId || !crudRecordForm.name.trim()) {
      if (toast) {
        toast({ title: "Name Required", description: "Please enter a record name.", status: "warning", duration: 2000 });
      }
      return;
    }
    const updated = widgets.map((w) => {
      if (w.id !== crudRecordTargetWidgetId) return w;
      const records = Array.isArray(w.records) ? [...w.records] : [];
      if (editingCrudRecord) {
        // UPDATE
        const updatedRecords = records.map((r) =>
          r.id === editingCrudRecord.id
            ? {
                ...r,
                name: crudRecordForm.name.trim(),
                value: crudRecordForm.value.trim(),
                status: crudRecordForm.status,
                timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              }
            : r
        );
        return { ...w, records: updatedRecords };
      } else {
        // CREATE
        const newRecord = {
          id: `rec-${Date.now()}`,
          name: crudRecordForm.name.trim(),
          value: crudRecordForm.value.trim() || "OK",
          status: crudRecordForm.status || "Active",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        };
        return { ...w, records: [...records, newRecord] };
      }
    });

    setWidgets(updated);
    if (pushWidgetsToHistory) pushWidgetsToHistory(updated);
    if (autoPersistApp) autoPersistApp(updated);
    onCrudModalClose();

    if (toast) {
      toast({
        title: editingCrudRecord ? "Record Updated" : "Record Created",
        status: "success",
        duration: 1800
      });
    }
  }, [
    crudRecordTargetWidgetId,
    crudRecordForm,
    editingCrudRecord,
    widgets,
    setWidgets,
    pushWidgetsToHistory,
    autoPersistApp,
    onCrudModalClose,
    toast
  ]);

  const handleDeleteCrudRecord = useCallback((widgetId, recordId) => {
    const updated = widgets.map((w) => {
      if (w.id !== widgetId) return w;
      const records = (w.records || []).filter((r) => r.id !== recordId);
      return { ...w, records };
    });
    setWidgets(updated);
    if (pushWidgetsToHistory) pushWidgetsToHistory(updated);
    if (autoPersistApp) autoPersistApp(updated);
    if (toast) {
      toast({ title: "Record Deleted", status: "info", duration: 1500 });
    }
  }, [widgets, setWidgets, pushWidgetsToHistory, autoPersistApp, toast]);

  return {
    isCrudModalOpen,
    onCrudModalOpen,
    onCrudModalClose,
    newQuestionInputs,
    setNewQuestionInputs,
    newAnswerInputs,
    setNewAnswerInputs,
    crudRecordTargetWidgetId,
    editingCrudRecord,
    crudRecordForm,
    setCrudRecordForm,
    handleAddQuestionToForm,
    handleDeleteQuestionFromForm,
    handleSubmitFormAnswer,
    handleClearFormResponses,
    handleClearGeologs,
    handleOpenAddCrudRecord,
    handleOpenEditCrudRecord,
    handleSaveCrudRecord,
    handleDeleteCrudRecord
  };
}
