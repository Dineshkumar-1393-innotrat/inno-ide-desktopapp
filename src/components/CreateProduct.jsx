import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  Textarea,
  Button,
  Select,
  IconButton,
  useToast,
  Grid,
  GridItem,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormControl,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import { API } from '@/config';
import { AddIcon, EditIcon, DeleteIcon } from "@chakra-ui/icons";

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@chakra-ui/react";

import axios from "axios";
import { useProject } from "../ProjectContext";
import { productAPIBase, baseURL } from "../utilities";

import { COMPONENT_DATA, COMPONENT_TYPES } from "./componentData.js";

export default function ProductDefinition({ onSuccess }) {
  const toast = useToast();

  // Get project data from ProjectContext to ensure accurate association
  const {
    switchProject,
    activeProjectId,
    activeProjectName,
    activeProductId,
    setActiveProductId,
    setActiveProductName,
    setActiveDeviceId
  } = useProject();

  // const SI_UNITS = [
  //   "Volt (V)", "Ampere (A)", "Milliampere (mA)", "Ohm (Ω)", "Farad (F)", "Henry (H)",
  //   "Watt (W)", "Hertz (Hz)", "Kilohertz (kHz)", "Coulomb (C)",
  //   "Second (s)", "Millisecond (ms)", "Microsecond (µs)", "Nanosecond (ns)",
  //   "Kelvin (K)", "Degree Celsius (°C)", "Pascal (Pa)", "m/s²", "Tesla (T)",
  //   "Lux (lx)", "Decibel (dB)", "Kilometer (km)", "Kilogram (kg)", "Gram (g)",
  //   "G-force (G)", "Bits per second (bps)", "PPM", "K/W"
  // ].sort();

  const SIUNITS = [
    'meter m',
    'kilogram kg',
    'second s',
    'ampere A',
    'kelvin K',
    'mole mol',
    'candela cd',
    'Volt V',
    'Ohm Ω',
    'Farad F',
    'Henry H',
    'Watt W',
    'Hertz Hz',
    'Pascal Pa',
    'Tesla T',
    'lumen lm',
    'lux lx'
  ].sort((a, b) => a.localeCompare(b));


  // Component Names list
  const [componentNames, setComponentNames] = useState([]);
  // Component Names cache: { [typeId]: [{ _id, name }] }
  const [componentNamesMap, setComponentNamesMap] = useState({});

  // Selected Component & Component Name (Legacy single selection state - used for determining "active" tab if needed, 
  // but we will render all components now. We might still use this to track which one is "active" or just render all)
  const [selectedComponent, setSelectedComponent] = useState(""); // Sensor / Actuator
  const [selectedComponentName, setSelectedComponentName] = useState(""); // e.g. Flame Sensor
  const [selectedComponentId, setSelectedComponentId] = useState(""); // ID of the selected component name

  const [specificParams, setSpecificParams] = useState([]);

  const parameterOptions = (() => {
    const unique = new Map();
    specificParams
      .flatMap(item => item.parameterName || [])
      .forEach(name => {
        const trimmed = name.trim();
        const lower = trimmed.toLowerCase();
        if (trimmed && !unique.has(lower)) {
          unique.set(lower, trimmed);
        }
      });
    return Array.from(unique.values()).sort((a, b) => a.localeCompare(b));
  })();

  console.log(parameterOptions, "parameterOptions---");

  const [parameterNames, setParameterNames] = useState(["temperature", "humidity"]);

  // component types from API
  const [componentTypes, setComponentTypes] = useState([]);
  console.log(componentTypes, "componentTypes---");

  const [loadingComponentType, setLoadingComponentType] = useState(true);

  // const submitParameters = async () => {
  //   if (!selectedComponentId) {
  //     alert("Component ID select pannunga");
  //     return;
  //   }

  //   if (!newSpecificParam) {
  //     alert("Parameter name enter pannunga");
  //     return;
  //   }

  //   const payload = {
  //     componentId: selectedComponentId,
  //     parameterName: [newSpecificParam], // single param as array
  //     parameterType: "simple",
  //   };

  //   console.log("Payload:", payload);

  //   try {
  //     const res = await axios.post(
  //       `${API.MAIN}/api/v2/componentParameters`,
  //       payload
  //     );

  //     console.log("API Success:---", res.data);

  //     // ✅ Dropdown option-la add pannradhu
  //     setSpecificParamOptions((prev) => [
  //       ...prev,
  //       newSpecificParam,
  //     ]);

  //     // optional: parameterNames-kum store panna
  //     setParameterNames((prev) => [
  //       ...prev,
  //       newSpecificParam,
  //     ]);

  //     // input clear
  //     setNewSpecificParam("");

  //   } catch (error) {
  //     console.error("API Error:", error);
  //   }
  // };

  // const submitParameters = async () => {
  //   if (!selectedComponentId) {
  //     alert("Component ID select pannunga");
  //     return;
  //   }

  //   if (!newSpecificParam.trim()) {
  //     alert("Parameter name enter pannunga");
  //     return;
  //   }

  //   try {
  //     // 🔹 1. First API – parameterVariables
  //     // const variableRes = await fetch(
  //     //   `${API.MAIN}/api/v2/parameterVariables`,
  //     //   {
  //     //     method: "POST",
  //     //     headers: {
  //     //       "Content-Type": "application/json",
  //     //     },
  //     //     body: JSON.stringify({
  //     //       variableName: newSpecificParam.trim(),
  //     //     }),
  //     //   }
  //     // );

  //     // const variableResult = await variableRes.json();
  //     // console.log("Variable API Response:", variableResult);

  //     // 🔹 2. Second API – componentParameters
  //     const payload = {
  //       componentId: selectedComponentId,
  //       parameterName: [newSpecificParam.trim()],
  //       parameterType: "simple",
  //     };

  //     console.log("Payload:", payload);

  //     const res = await axios.post(
  //       `${API.MAIN}/api/v2/componentParameters`,
  //       payload
  //     );

  //     console.log("Component API Success:", res.data);

  //     // 🔹 Dropdown & local state update
  //     setSpecificParamOptions((prev) => [
  //       ...prev,
  //       newSpecificParam.trim(),
  //     ]);

  //     setParameterNames((prev) => [
  //       ...prev,
  //       newSpecificParam.trim(),
  //     ]);

  //     // 🔹 clear & close
  //     setNewSpecificParam("");
  //     setIsParamModalOpen(false);

  //   } catch (error) {
  //     console.error("API Error:", error);
  //   }
  // };

  const submitParameters = async () => {
    if (!selectedComponentId) {
      alert("Component ID select pannunga");
      return;
    }

    if (!newSpecificParam.trim()) {
      alert("Parameter name enter pannunga");
      return;
    }

    try {
      // 🔹 POST API
      await axios.post(
        `${API.MAIN}/api/v2/componentParameters`,
        {
          componentId: selectedComponentId,
          parameterName: [newSpecificParam.trim()],
          parameterType: "simple",
        }
      );

      console.log("Parameter added successfully");

      // 🔁 IMMEDIATE REFRESH (GET API call)
      await fetchComponentParameters(selectedComponentId);

      // clear UI
      setNewSpecificParam("");
      setIsParamModalOpen(false);

    } catch (error) {
      console.error("Submit API Error:", error);
    }
  };




  const fetchComponentParameters = async (componentId) => {
    if (!componentId) return;

    try {
      const res = await fetch(
        `${API.MAIN}/api/v2/componentParameters/${componentId}`
      );

      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }

      const result = await res.json();
      console.log("Fetch component parameters response:", result);

      setSpecificParams(result.data || []);
    } catch (error) {
      console.error("Fetch component parameters error:", error);
      toast({
        title: "Error fetching parameters",
        description: error.message,
        status: "error",
        duration: 3000,
      });
    }
  };

  const fetchVariables = async () => {
    try {
      const res = await fetch(
        `${API.MAIN}/api/v2/parameterVariables`
      );
      const result = await res.json();

      console.log("Variables GET response:", result);

      // assuming result.data = [{ variableName: "onConstant" }]
      const variables = (result.data || []).map(
        (item) => item.variableName
      );

      setVariableOptions(variables);
    } catch (error) {
      console.error("GET variables error:", error);
    }
  };


  useEffect(() => {
    fetchVariables();
  }, []);



  useEffect(() => {
    fetchComponentParameters(selectedComponentId);
  }, [selectedComponentId]);



  // component parameters
  const [isParamModalOpen, setIsParamModalOpen] = useState(false);
  const [isVariableModalOpen, setIsVariableModalOpen] = useState(false);

  const [newSpecificParam, setNewSpecificParam] = useState("");
  const [newVariable, setNewVariable] = useState("");

  const [specificParamOptions, setSpecificParamOptions] = useState([]);
  console.log(specificParamOptions, "specificParamOptions---");
  const [variableOptions, setVariableOptions] = useState([]);
  console.log(variableOptions, "variableOptions---");



  // basic states
  const [urlLink, setUrlLink] = useState("");
  const [note, setNote] = useState("");

  // Step 1 (popup) or Step 2 (full form)
  const [step, setStep] = useState(1);

  // Basic Info (Step 1 + reused in Step 2)
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");

  // Basic Info - Step 2
  // Basic Info - Step 2
  const [numDevices, setNumDevices] = useState(1); // numeric
  const [numComponents, setNumComponents] = useState(1); // numeric

  // We will fetch component names for a specific type and store in map
  const fetchComponentNames = async (typeId) => {
    if (!typeId) return;
    if (componentNamesMap[typeId]) return; // already fetched

    try {
      const res = await axios.get(
        `${API.MAIN}/api/v2/componentNames/${typeId}`
      );
      setComponentNamesMap((prev) => ({
        ...prev,
        [typeId]: res.data.data || []
      }));
    } catch (err) {
      console.error("Fetch component names failed", err);
    }
  };

  // This useEffect is no longer needed as component names are fetched per row
  // useEffect(() => {
  //   if (!selectedComponentTypes) return;
  //   fetchComponentNames(selectedComponentTypes);
  // }, [selectedComponentTypes]);

  const handleAddComponentName = async (typeId, rowIndex) => {
    const name = prompt("Enter Component Name", "Buzzer");
    if (!name || !typeId) {
      alert("Select Component Type first");
      return;
    }

    try {
      await axios.post(
        `${API.MAIN}/api/v2/componentNames`,
        {
          typeId: typeId,
          name,
        }
      );

      // force re-fetch
      const res = await axios.get(
        `${API.MAIN}/api/v2/componentNames/${typeId}`
      );
      console.log("Component Names GET response:", res.data);

      const list = res.data?.data || [];
      setComponentNamesMap((prev) => ({
        ...prev,
        [typeId]: list
      }));

      // auto select newly added name for that row
      // We search for the exact name case-insensitively just in case
      const matched = list.find(x => x.name.trim().toLowerCase() === name.trim().toLowerCase());
      updateComponentRow(rowIndex, "name", name, matched?._id || "");

      toast({
        title: "Success",
        description: "Component name added and selected",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      console.error("Component name create failed", err);
      toast({
        title: "Error",
        description: "Failed to add component name",
        status: "error",
        duration: 3000,
      });
    }
  };

  // Components list (type + name + parameters) - FORM COMPONENTS
  // Structure: { typeId, typeName, nameId, nameName, parameters: [] }
  const [formComponents, setFormComponents] = useState([
    {
      name: "",
      type: "Sensor",
      typeId: "",
      typeName: "Sensor",
      nameId: "",
      nameName: "",
      parameters: [],
    }
  ]);

  // Auto-advance to Step 2 if a product is already associated with the project
  useEffect(() => {
    if (activeProductId && step === 1) {
      console.log("[ProductDefinition] Existing product found, advancing to Step 2", activeProductId);
      setStep(2);
    }
    // Pre-populate name if available
    if (activeProjectName && !productName) {
      setProductName(activeProjectName);
    }
  }, [activeProductId, activeProjectName, step]);

  console.log(formComponents, "formComponents---");

  // Sync formComponents with numComponents
  useEffect(() => {
    const n = Math.max(1, Number(numComponents) || 1);
    setFormComponents((prev) => {
      const copy = [...prev];
      if (copy.length === n) return copy;
      if (copy.length < n) {
        // add new
        const added = Array.from({ length: n - copy.length }, () => ({
          name: "",
          type: "Sensor",
          typeId: "",
          typeName: "Sensor", // default
          nameId: "",
          nameName: "",
          parameters: [],
        }));
        return [...copy, ...added];
      }
      // remove from end
      return copy.slice(0, n);
    });
  }, [numComponents]);

  const updateComponentRow = (index, field, value, extraId = null) => {
    setFormComponents((prev) => {
      const copy = [...prev];
      if (!copy[index]) return prev;

      const row = { ...copy[index] };

      if (field === "type") {
        row.typeId = extraId; // id
        row.typeName = value; // name (e.g. Sensor)
        row.type = value;      // LEGACY COMPAT

        // reset name if type changes
        row.nameId = "";
        row.nameName = "";
        row.name = "";         // LEGACY COMPAT

        // fetch names for this new type
        if (extraId) fetchComponentNames(extraId);
      } else if (field === "name") {
        row.nameName = value;
        row.name = value;      // LEGACY COMPAT
        row.nameId = extraId;
        // Optionally fetch parameters for this component ID if needed for "Specific Parameters"
        // ex: fetchComponentParameters(extraId)
      }

      copy[index] = row;
      return copy;
    });
  };

  // deviceInfos is an array of device identity objects (one per device)
  const [deviceInfos, setDeviceInfos] = useState([{ imei: "", iccid: "", phone: "" }]);

  // Popup for adding a new Component (type + name) -> REMOVING OLD POPUP 
  const [showComponentPopup, setShowComponentPopup] = useState(false); // keeping specific state just in case, but flow changes
  const [newComponent, setNewComponent] = useState({
    name: "",
    type: "Sensor", // Sensor / Actuator
  });

  // small editing states for inline edit controls
  const [editingParam, setEditingParam] = useState(null); // { compIndex, paramIndex } or null
  // const [editingComponentIndex, setEditingComponentIndex] = useState(null); // index or null - No longer needed

  const inputStyles = {
    bg: "white",
    color: "black",
    _placeholder: { color: "gray.400" },
  };

  // Keep deviceInfos in sync with numDevices
  useEffect(() => {
    const n = Number(numDevices) || 0;
    setDeviceInfos((prev) => {
      const copy = [...prev];
      if (n <= 0) return [];
      if (copy.length === n) return copy;
      if (copy.length < n) {
        // push empty entries
        return [
          ...copy,
          ...Array.from({ length: n - copy.length }, () => ({ imei: "", iccid: "", phone: "" })),
        ];
      }
      // truncate if larger
      return copy.slice(0, n);
    });
  }, [numDevices]);

  // helper to update a particular device's field
  const handleDeviceInfoChange = (index, field, value) => {
    setDeviceInfos((prev) => {
      const copy = [...prev];
      if (!copy[index]) copy[index] = { imei: "", iccid: "", phone: "" };
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  // existing handlers (addComponent, addParameter, updateParameter, handleVariableChange)
  const addComponent = (compData) => {
    setFormComponents((prev) => [
      ...prev,
      {
        ...compData,
        name: compData.name || "",
        type: compData.type || "Sensor",
        parameters: compData.parameters || [],
      },
    ]);

    toast({
      title: "Component added successfully!",
      description: `"${compData.name}" has been added to the list`,
      status: "success",
      duration: 2000,
    });
  };


  const addParameter = (compIndex, type) => {
    console.log("addParameter called with:", compIndex, type);

    if (compIndex < 0 || compIndex >= formComponents.length) {
      console.log("Invalid index:", compIndex);
      return;
    }

    setFormComponents((prev) => {
      const newParam = {
        type: type === "constant" ? "constant" : "inconstant",
        variable: "",
        name: "", // Parameter Name
        min: "",
        max: "",
        xMin: "", xMax: "", xUnit: "",
        yMin: "", yMax: "", yUnit: "",
        zMin: "", zMax: "", zUnit: "",
        unit: "",
        value: "",
        state: "", // for Switch
        color: "", // for LED
      };

      console.log("Adding new parameter:", newParam);

      return prev.map((comp, i) =>
        i === compIndex
          ? { ...comp, parameters: [...(comp.parameters || []), newParam] }
          : comp
      );
    });
  };

  const updateParameter = (compIndex, paramIndex, field, value) => {
    console.log(`updateParameter: [${compIndex}][${paramIndex}] ${field} = ${value}`);
    setFormComponents((prev) =>
      prev.map((comp, cIdx) =>
        cIdx === compIndex
          ? {
            ...comp,
            parameters: comp.parameters.map((param, pIdx) =>
              pIdx === paramIndex ? { ...param, [field]: value } : param
            ),
          }
          : comp
      )
    );
  };

  // const handleVariableChange = (compIndex, paramIndex, newValue) => {
  //   setFormComponents((prev) => {
  //     const updated = [...prev];
  //     const param = updated[compIndex].parameters[paramIndex];
  //     param.type = newValue === "Constant" ? "constant" : "inconstant";
  //     updated[compIndex].parameters[paramIndex] = param;
  //     return updated;
  //   });
  // };

  const handleVariableChange = (compIndex, paramIndex, newValue) => {
    setFormComponents((prev) =>
      prev.map((comp, cIdx) =>
        cIdx === compIndex
          ? {
            ...comp,
            parameters: comp.parameters.map((param, pIdx) =>
              pIdx === paramIndex
                ? {
                  ...param,
                  variable: newValue,     // ✅ store variable name
                  type: newValue === "Constant" ? "constant" : "inconstant", // simplistic mapping, but we rely on 'variable' for UI
                }
                : param
            ),
          }
          : comp
      )
    );
  };




  // ---------- New helpers: edit / delete ----------
  const deleteParameter = (compIndex, paramIndex) => {
    if (!window.confirm("Delete this parameter?")) return;
    setFormComponents((prev) => {
      const copy = [...prev];
      if (!copy[compIndex]) return prev;
      copy[compIndex] = {
        ...copy[compIndex],
        parameters: copy[compIndex].parameters.filter((_, i) => i !== paramIndex),
      };
      return copy;
    });
  };

  const saveParameterField = (compIndex, paramIndex, field, value) => {
    updateParameter(compIndex, paramIndex, field, value);
    setEditingParam(null);
  };

  const deleteComponent = (compIndex) => {
    if (!window.confirm("Delete this component and its parameters?")) return;
    setFormComponents((prev) => {
      const copy = prev.filter((_, i) => i !== compIndex);
      return copy;
    });
    // clear selection if needed
    setSelectedComponent((curr) => {
      if (!formComponents[compIndex]) return curr;
      if (formComponents[compIndex].type === curr) return "";
      return curr;
    });
    setSelectedComponentName((curr) => {
      if (!formComponents[compIndex]) return curr;
      if (formComponents[compIndex].name === curr) return "";
      return curr;
    });
  };

  const deleteDeviceInfo = (index) => {
    if (!window.confirm("Delete this device info?")) return;
    setDeviceInfos((prev) => {
      const copy = [...prev];
      copy.splice(index, 1);
      // adjust numDevices to match
      setNumDevices(copy.length);
      return copy;
    });
  };

  // ---------- submit / persistence logic ----------
  const handleFinalSubmit = () => {
    if (!productName.trim()) {
      toast({
        title: "Product Name Required",
        description: "Please enter a product name",
        status: "warning",
        duration: 2000,
      });
      return;
    }
    if (!urlLink.trim()) {
      toast({
        title: "URL Required",
        description: "Please enter the URL link",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    const payload = {
      productName,
      description,
      numDevices,
      selectedComponent,
      selectedComponentName,
      components: formComponents,
      urlLink,
      note,
      deviceInfos,
    };

    console.log("FINAL FORM SUBMIT:", payload);

    toast({
      title: "Product Created",
      description: "Your product has been configured successfully.",
      status: "success",
      duration: 3000,
    });
  };

  //newly added start 10/12/2025
  const [loading, setLoading] = useState(false);

  const saveToLocal = (key, value) => {
    try {
      localStorage.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
    } catch (e) {
      console.warn("localStorage set error", e);
    }
  };

  const handleInitialSubmit = async () => {
    if (!productName.trim()) {
      toast({
        title: "Product Name Required",
        description: "Please enter a product name",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    if (formComponents && formComponents.length > 0) {
      setSelectedComponent(formComponents[0].type);
      setSelectedComponentName(formComponents[0].name);
    }

    const userData = JSON.parse(localStorage.getItem("userData") || "{}");
    const payload = {
      name: productName,
      userId: userData.userId,
      projectId: activeProjectId || localStorage.getItem("activeProjectId"),
      productDesc: description ?? "",
    };

    if (!payload.projectId) {
      toast({
        title: "Missing projectId",
        description: "activeProjectId not found in localStorage. Please create/choose a project first.",
        status: "error",
        duration: 3000,
      });
      return;
    }

    setLoading(true);
    try {
      saveToLocal("pendingProductNew", payload);

      const url = `${API.MAIN}/productNew`;
      const resp = await axios.post(url, payload);
      console.log(resp, "productID----");

      // Extract productID from response
      const productId = resp.data.productID;
      console.log("Extracted Product ID:", productId);

      // Store in localStorage AND update context
      localStorage.setItem("activeProductId", productId);
      localStorage.setItem("activeProductName", productName);

      // Explicitly update context states to ensure UI updates even if switchProject skips
      setActiveProductId(productId);
      setActiveProductName(productName);

      // Update ProjectContext using switchProject to guarantee safe auto-save flushing and clean state mapping
      switchProject({
        projectId: activeProjectId || localStorage.getItem("activeProjectId"),
        projectName: activeProjectName || localStorage.getItem("activeProjectName"),
        productId: productId,
        productName: productName
      });

      saveToLocal("productNewResponse", resp.data);

      toast({
        title: "Product created",
        description: resp?.data?.message ?? "ProductNew created successfully",
        status: "success",
        duration: 2500,
      });

      setStep(2);
    } catch (error) {
      console.error("productNew error:", error?.response ?? error);
      toast({
        title: "Failed to create product",
        description: error?.response?.data?.message ?? error?.message ?? "An error occurred while creating product",
        status: "error",
        duration: 4000,
      });
    } finally {
      setLoading(false);
    }
  };
  //newly added end 10/12/2025

  //newly added start 11/12/2025
  const adjustDeviceInfosToCount = (count) => {
    const current = [...deviceInfos];
    if (count > current.length) {
      // Add empty objects
      while (current.length < count) {
        current.push({ imei: "", iccid: "", phone: "" });
      }
    } else if (count < current.length) {
      // Trim from end
      current.length = count;
    }
    setDeviceInfos(current);
  };
  const [isLoading, setIsLoading] = useState(false);

  const submitProductDefinition = async () => {
    const productId = localStorage.getItem("activeProductId");
    if (!productId) {
      console.error("Product ID missing for definition");
      return;
    }

    const extractUnit = (u) => {
      if (!u) return "";
      const match = u.match(/\((.*?)\)/);
      return match ? match[1] : u;
    };

    // Helper to format component type (e.g. "Power Supply" -> "power_management")
    const formatComponentType = (rawType) => {
      if (!rawType) return "sensor";
      const normalized = rawType.toLowerCase().trim();

      const MAPPING = {
        "sensor": "sensor",
        "actuator": "actuator",
        "switch": "switch",
        "microcontroller": "microcontroller",
        "power supply": "power_management",
        "power_supply": "power_management",
        "audio component": "audio_component",
        "audio components": "audio_component",
        "connectivity": "connectivity",
        // Add more if needed
      };

      return MAPPING[normalized] || normalized.replace(/\s+/g, '_');
    };

    const componentsPayload = {};

    formComponents.forEach((comp) => {
      const safeName = comp.name || "Unnamed";
      const type = formatComponentType(comp.typeName || comp.type);

      const paramsObj = {};

      if (Array.isArray(comp.parameters)) {
        comp.parameters.forEach((param) => {
          if (!param.name) return;

          let paramDef = {};

          // 1. CONSTANT
          if (param.variable === "Constant" || (!param.variable && param.type === "constant")) {
            paramDef = {
              parameterType: "constant",
              value: param.value, // Keep as string or number? User example has number? "value": 10.
              // Note: Inputs are usually strings. Backend might want numbers. 
              // Attempt convert? User example value: 10. My code input is text.
              // Let's try to parse if it looks like a number
              unit: extractUnit(param.unit)
            };
            // Try valid number conversion
            const numVal = parseFloat(param.value);
            if (!isNaN(numVal)) paramDef.value = numVal;
          }
          // 2. COMPOSITE
          else if (param.variable === "Inconstant Composite") {
            paramDef = {
              parameterType: "composite",
              children: {
                x: {
                  min: parseFloat(param.xMin) || 0,
                  max: parseFloat(param.xMax) || 0,
                  unit: extractUnit(param.xUnit)
                },
                y: {
                  min: parseFloat(param.yMin) || 0,
                  max: parseFloat(param.yMax) || 0,
                  unit: extractUnit(param.yUnit)
                },
                z: {
                  min: parseFloat(param.zMin) || 0,
                  max: parseFloat(param.zMax) || 0,
                  unit: extractUnit(param.zUnit)
                }
              }
            };
          }
          // 3. SWITCH (State)
          else if (comp.typeName === "Switch" || comp.typeName === "switch") {
            // For switch, strict "State" param?
            // User example: "State": { parameterType: "state", states: ["ON", "OFF"] }
            // Only if param name is "State" or we want to force it?
            // Current UI allows arbitrary param names. Use param.name as key.

            // If user entered "State", we map it to state type
            if (param.name === "State") {
              paramDef = {
                parameterType: "state",
                states: ["ON", "OFF"]
              };
            } else {
              // Fallback if they added a random param to a switch? Treat as simple?
              // Or if they used button to set On/Off state?
              // Let's assume simple if not "State".
              // But usually Switch only has State.
              // Let's force "state" type if it looks like state.
              paramDef = {
                parameterType: "state",
                states: ["ON", "OFF"]
              };
            }
          }
          // 4. SIMPLE (Default)
          else {
            paramDef = {
              parameterType: "simple",
              min: parseFloat(param.min) || 0,
              max: parseFloat(param.max) || 0,
              unit: extractUnit(param.unit)
            };
          }

          paramsObj[param.name] = paramDef;
        });
      }

      componentsPayload[safeName] = {
        componentID: "",
        type: type,
        parameters: paramsObj,
        note: note || "",
        urls: urlLink ? [urlLink] : []
      };
    });

    const payload = {
      productID: productId,
      productName: productName,
      note: note || "",
      urls: urlLink ? [urlLink] : [],
      components: componentsPayload
    };

    console.log("📤 Definition Payload:", JSON.stringify(payload, null, 2));

    try {
      let url = `${productAPIBase}/product/${productId}/definitionNew`;
      let resp;
      
      try {
        console.log(`[CreateProduct] Attempting definition submission to local API: ${url}`);
        // Set a shorter timeout for the local API to avoid long UI hangs
        resp = await axios.post(url, payload, { timeout: 5000 });
      } catch (localError) {
        console.warn("[CreateProduct] Local Definition API failed or timed out. Falling back to Eureka server...", localError.message);
        // Use definitionNew for fallback as requested
        url = `${baseURL}/product/${productId}/definitionNew`;
        console.log(`[CreateProduct] Attempting definition submission to fallback API: ${url}`);
        resp = await axios.post(url, payload);
      }

      console.log("📥 Definition Response:", resp.data);

      toast({
        title: "Definition Saved",
        description: "Product definition updated successfully",
        status: "success",
        duration: 3000,
      });

      if (resp.data?.success || resp.data?.status === "success") {
        setActiveProductId(productId);
        if (productName) setActiveProductName(productName);
      }

      if (onSuccess) onSuccess();

    } catch (error) {
      console.error("❌ Definition API Error (All servers failed):", error);
      toast({
        title: "Failed to Save Definition",
        description: error?.response?.data?.message || error.message || "Connection to definition server failed. Please check if the microservice is running.",
        status: "error",
        duration: 5000,
        isClosable: true
      });
    }
  };

  const handleSubmitDevices = async () => {
    setLoading(true);
    const productId = activeProductId || localStorage.getItem("activeProductId");

    if (!productId) {
      toast({
        title: "Product ID Missing",
        description: "activeProjectId not found in localStorage.",
        status: "error",
        duration: 3000,
      });
      setLoading(false);
      return;
    }

    // Validation
    const hasData = deviceInfos.some(dev =>
      dev.imei.trim() || dev.iccid.trim() || dev.phone.trim()
    );

    if (!hasData) {
      toast({
        title: "No Data",
        description: "Please enter at least one device's information",
        status: "warning",
        duration: 3000,
      });
      setLoading(false);
      return;
    }

    // Validation for IMEI, ICCID, Phone
    const invalidDevice = deviceInfos.find(dev => 
      (dev.imei && !/^\d{15}$/.test(dev.imei)) ||
      (dev.iccid && !/^\d{19,20}$/.test(dev.iccid)) ||
      (dev.phone && !/^\d{10}$/.test(dev.phone))
    );

    if (invalidDevice) {
      toast({
        title: "Invalid Device Info",
        description: "Please check IMEI (15 digits), ICCID (19-20 digits), and Phone (10 digits).",
        status: "error",
        duration: 3000,
      });
      setLoading(false);
      return;
    }

    // Prepare devices payload
    const infos = [...deviceInfos];
    const required = Math.max(0, Number(numDevices) || 0);

    const devices = infos.map((d) => {
      const IMEI = (d?.imei || "").trim();
      const ICCID = (d?.iccid || "").trim();
      const mobileNumber = (d?.phone || "").trim();

      if (!IMEI && !ICCID && !mobileNumber) return null;
      return { IMEI, ICCID, mobileNumber };
    }).filter(Boolean);

    const devicePayload = {
      deviceCount: required,
      devices,
    };

    console.log("📤 Devices Payload:", devicePayload);

    try {
      // 1. Submit Devices
      // const devUrl = `${API.MAIN}/product/${productId}/devicesNew`;
      // Ensure you are using backticks (`) and ${} to insert the variable
      const devUrl = `${API.MAIN}/product/${productId}/devicesNew`;
      const devResp = await axios.post(devUrl, devicePayload);

      console.log("📥 Devices Response:", devResp.data);

      // Extract deviceID and save to context
      const newDeviceIds = devResp.data.addedDevices || [];
      if (newDeviceIds.length > 0) {
        const firstDeviceId = newDeviceIds[0];
        console.log("Saving new Device ID to context:", firstDeviceId);
        setActiveDeviceId(firstDeviceId);
      }

      // 2. Submit Definition (Chained)
      await submitProductDefinition();

      // onSuccess is handled inside submitProductDefinition
      // if (onSuccess) onSuccess(); 

    } catch (error) {
      console.error("❌ API Error:", error);
      toast({
        title: "Submission Failed",
        description:
          error?.response?.data?.message || error.message || "Unknown error",
        status: "error",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
      setLoading(false); // Reset both to ensure UI spinner stops
    }
  };

  //component type 
  const [componentsLoading, setComponentsLoading] = useState(false);
  const [componentsError, setComponentsError] = useState(null);

  // Fetch component types from API
  const fetchComponentTypeList = async () => {
    setComponentsLoading(true);
    setComponentsError(null);

    try {
      const resp = await axios.get(
        `${API.MAIN}/api/v2/componentTypes`
      );

      const list = Array.isArray(resp?.data?.data)
        ? resp.data.data
        : [];

      setComponentTypes(list);

    } catch (err) {
      console.error("Failed to load component types", err);
      setComponentsError(err);
      toast({
        title: "Failed to load components",
        description:
          err?.response?.data?.message || err.message || "Check server",
        status: "error",
        duration: 3000,
      });
    } finally {
      setComponentsLoading(false);
    }
  };

  useEffect(() => {
    fetchComponentTypeList();
  }, []);

  const handleAddComponentPrompt = async () => {
    const name = prompt("New component name", "Audio Components");
    if (!name) return;

    setComponentsLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${API.MAIN}/api/v2/componentTypes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ componentName: name }),
        }
      );

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || "Failed to create component");
      }

      const data = await res.json();

      // ✅ POST finished → GET again
      await fetchComponentTypeList();

      // optional: auto select new component
      setSelectedComponentTypes(data._id);
      setSelectedComponentName(data.componentName);

      toast({
        title: "Component added successfully",
        status: "success",
        duration: 2000,
      });
    } catch (err) {
      console.error("Create component error:", err);
      toast({
        title: "Failed to create component",
        description: err.message,
        status: "error",
        duration: 3000,
      });
    } finally {
      setComponentsLoading(false);
    }
  };

  //newly added end 11/12/2025
  //newly added end 11/12/2025
  const handleCancel = () => {
    setProductName("");
    setDescription("");
    setNumDevices(1);
    setNumComponents(1); // RESET Component count
    setSelectedComponent("");
    setSelectedComponentName("");
    setFormComponents([
      {
        typeId: "",
        typeName: "Sensor",
        nameId: "",
        nameName: "",
        parameters: [],
      }
    ]);
    setDeviceInfos([{ imei: "", iccid: "", phone: "" }]);
    setUrlLink("");
    setNote("");
    setStep(1);
    setEditingParam(null);
    // setEditingComponentIndex(null); // removed
  };

  // popup handlers
  const openComponentPopup = () => {
    setNewComponent({ name: "", type: "Sensor" });
    setShowComponentPopup(true);
  };

  const handleComponentPopupCancel = () => {
    setShowComponentPopup(false);
    setNewComponent({ name: "", type: "Sensor" });
  };

  const handleComponentPopupSubmit = () => {
    if (!newComponent.name.trim()) {
      toast({
        title: "Component Name Required",
        description: "Please enter a component name",
        status: "warning",
        duration: 2000,
      });
      return;
    }

    const exists = formComponents.some(
      (comp) =>
        comp?.name?.toLowerCase() ===
        newComponent?.name?.trim()?.toLowerCase() &&
        comp?.type === newComponent?.type
    );

    if (exists) {
      toast({
        title: "Component Already Exists",
        description: `Component "${newComponent.name}" already exists in the list`,
        status: "error",
        duration: 3000,
      });
      return;
    }

    addComponent({
      name: newComponent.name.trim(),
      type: newComponent.type,
      parameters: [],
    });

    setSelectedComponent(newComponent.type);
    setSelectedComponentName(newComponent.name.trim());

    setShowComponentPopup(false);
    setNewComponent({ name: "", type: "Sensor" });
  };

  // STEP 1 UI
  if (step === 1) {
    return (
      <Box width="100%" minH="100%" display="flex" alignItems="center" justifyContent="center" bg="gray.100" py={10}>
        <Box bg="#f5f5f5" borderRadius="md" borderWidth="1px" maxW="600px" w="100%" p={8}>
          <VStack align="stretch" spacing={4}>
            <Box>
              <Text fontSize="sm" mb={2}>
                Product Name{" "}
                <Text as="span" color="red.500">
                  *
                </Text>
              </Text>
              <Input size="sm" value={productName} onChange={(e) => setProductName(e.target.value)} sx={inputStyles} />
            </Box>

            <Box>
              <Text fontSize="sm" mb={2}>
                Product Descriptions
              </Text>
              <Textarea size="sm" minH="120px" value={description} onChange={(e) => setDescription(e.target.value)} sx={inputStyles} />
            </Box>
          </VStack>

          <Box textAlign="center" mt={8}>
            <Button colorScheme="blue" size="sm" px={10} onClick={handleInitialSubmit}>
              Submit
            </Button>
          </Box>
        </Box>
      </Box>
    );
  }

  // STEP 2 UI
  const activeComponentIndex = (() => {
    const idx = formComponents.findIndex((c) => c.name === selectedComponentName && c.type === selectedComponent);
    return idx === -1 ? 0 : idx;
  })();
  const activeComponent = formComponents[activeComponentIndex] || formComponents[0];

  return (
    <Box width="100%" bg="gray.100" py={8}>
      <Box maxW="1100px" mx="auto" bg="#f5f5f5" borderRadius="md" borderWidth="1px" p={6}>
        {/* Product Name */}
        <Box mb={6}>
          <Text fontSize="md" fontWeight="bold" mb={1}>
            Product Name
          </Text>
          <Input size="sm" value={productName} onChange={(e) => setProductName(e.target.value)} sx={inputStyles} placeholder="Enter product name" />
        </Box>

        <VStack align="stretch" spacing={6}>
          {/* Basic Information */}
          <Box>
            <Text fontSize="md" fontWeight="bold" mb={3}>
              Basic Information
            </Text>

            <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={6}>
              {/* No. Of Devices */}
              <GridItem>
                <Text fontSize="sm" mb={1} fontWeight="medium">
                  No. Of Devices{" "}
                  <Text as="span" color="red.500">
                    *
                  </Text>
                </Text>

                <NumberInput
                  size="sm"
                  min={1}
                  max={20}
                  value={numDevices}
                  onChange={(valueString) => {
                    const n = parseInt(valueString || "0", 10) || 0;
                    setNumDevices(n);
                    // adjustDeviceInfosToCount(n); // (effect handles this now)
                  }}
                  clampValueOnBlur={true}
                >
                  <NumberInputField placeholder="Select or type..." sx={inputStyles} />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </GridItem>

              {/* No. Of Component */}
              <GridItem>
                <Text fontSize="sm" mb={1} fontWeight="medium">
                  No. Of Component
                </Text>
                <Select
                  size="sm"
                  value={numComponents}
                  onChange={(e) => setNumComponents(parseInt(e.target.value, 10))}
                  sx={inputStyles}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </Select>
              </GridItem>
            </Grid>

            {/* Dynamic Component Rows */}
            {formComponents.map((comp, index) => (
              <Grid key={index} templateColumns={{ base: "1fr", md: "repeat(2, 1fr)" }} gap={6} mb={4} p={2} borderWidth="1px" borderRadius="md" bg="white">
                <GridItem colSpan={2}>
                  <Text fontSize="xs" color="gray.500" fontWeight="bold">Component {index + 1}</Text>
                </GridItem>

                {/* Component Name (Type in code, but used as Parent Category) or Type? 
                    Let's stick to Type -> Name flow but label as requested if needed.
                    Code flow: Select Type (get ID) -> Then Select Name (from ID).
                    I will label "Component Type" for the Parent, "Component Name" for the Child.
                */}

                {/* Component Type (Parent Category) */}
                <GridItem>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      Component Type{" "}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                  </HStack>
                  <Select
                    size="sm"
                    value={comp.typeId || ""}
                    onChange={(e) => {
                      const selectedId = e.target.value;
                      const typeObj = componentTypes.find(t => t._id === selectedId);
                      updateComponentRow(index, "type", typeObj?.componentName || "", selectedId);
                    }}
                    sx={inputStyles}
                    placeholder={loadingComponentType ? "Loading..." : "Select Type"}
                  >
                    {componentTypes?.map((item) => (
                      <option key={item?._id} value={item?._id}>
                        {item?.componentName}
                      </option>
                    ))}
                  </Select>
                  <Text
                    fontSize="xs"
                    color="blue.500"
                    cursor="pointer"
                    textAlign="right"
                    mt={1}
                    onClick={handleAddComponentPrompt}
                  >
                    +Add
                  </Text>
                </GridItem>

                {/* Component Name (Specific Item) */}
                <GridItem>
                  <HStack justify="space-between" mb={1}>
                    <Text fontSize="sm" fontWeight="medium">
                      Component Name{" "}
                      <Text as="span" color="red.500">
                        *
                      </Text>
                    </Text>
                  </HStack>

                  <Select
                    size="sm"
                    value={comp.nameId || ""}
                    onChange={(e) => {
                      const selectedVal = e.target.value;
                      // Check if it's an ID from API list or a Name from local list
                      const list = componentNamesMap[comp.typeId] || [];
                      const nameObj = list.find(x => x._id === selectedVal);

                      // If nameObj found, use its name and ID. If not, assume selectedVal is the name (from COMPONENT_TYPES)
                      const newName = nameObj ? nameObj.name : selectedVal;
                      const newId = nameObj ? nameObj._id : selectedVal;

                      setFormComponents((prev) => {
                        const copy = [...prev];
                        if (!copy[index]) return prev;
                        const row = { ...copy[index] };

                        row.nameName = newName;
                        row.name = newName;
                        row.nameId = newId;
                        row.parameters = []; // Clear params

                        copy[index] = row;
                        return copy;
                      });
                    }}
                    sx={inputStyles}
                    placeholder="Select Name"
                    isDisabled={!comp.typeId && !comp.typeName}
                  >
                    {/* Render both hardcoded and dynamic options */}
                    {(() => {
                      if (!comp.typeName) return null;
                      // Find matching key in COMPONENT_TYPES (ignoring case and trailing 's')
                      const typeNameLower = comp.typeName.toLowerCase();
                      const matchingKey = Object.keys(COMPONENT_TYPES).find(
                        key => key.toLowerCase() === typeNameLower || key.toLowerCase() + 's' === typeNameLower
                      );
                      const options = matchingKey ? COMPONENT_TYPES[matchingKey] : [];
                      return options.map((name) => (
                        <option key={`hardcoded-${name}`} value={name}>{name}</option>
                      ));
                    })()}
                    {(componentNamesMap[comp.typeId] || []).map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                  <Text
                    fontSize="xs"
                    color="blue.500"
                    cursor="pointer"
                    textAlign="right"
                    onClick={() => handleAddComponentName(comp.typeId, index)}
                  >
                    +Add
                  </Text>
                </GridItem>
              </Grid>
            ))}

            {/* Old Single Row Logic Removed */}
          </Box>

          {/* Parameters Section - Loop over all components */}
          {formComponents.map((comp, compIndex) => (
            <Box key={compIndex} mb={8} borderTop="1px" borderColor="gray.300" pt={4}>
              <HStack justify="space-between" mb={4}>
                <Text fontSize="md" fontWeight="bold">
                  Specific Parameters - {comp.typeName} {comp.nameName}
                </Text>
                <Button
                  size="xs"
                  colorScheme="blue"
                  leftIcon={<AddIcon />}
                  onClick={() => addParameter(compIndex, "inconstant")}
                >
                  Add Parameters
                </Button>
              </HStack>

              {/* Parameters List */}
              <Box bg="gray.50" p={2} borderRadius="md" mb={4}>
                {comp.parameters && comp.parameters.length === 0 && (
                  <Text fontSize="sm" color="gray.500" fontStyle="italic">No parameters added yet.</Text>
                )}

                {comp.parameters?.map((param, paramIndex) => (
                  <Box key={paramIndex} bg="white" p={3} borderRadius="md" borderWidth="1px" position="relative" mb={3}>
                    <HStack position="absolute" top="8px" right="8px" spacing={1}>
                      <IconButton
                        size="xs"
                        aria-label="Edit parameter"
                        icon={<EditIcon />}
                        onClick={() => setEditingParam({ compIndex, paramIndex })}
                        variant="ghost"
                      />
                      <IconButton size="xs" aria-label="Delete parameter" icon={<DeleteIcon />} onClick={() => deleteParameter(compIndex, paramIndex)} variant="ghost" />
                    </HStack>

                    <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(4, 1fr)" }} gap={4}>
                      {/* Specific Parameter Name */}
                      <GridItem>
                        <Text fontSize="sm" mb={1} fontWeight="medium">
                          Specific Parameter
                        </Text>
                        {/* Add New Param Option Button */}
                        <IconButton
                          size="xs"
                          aria-label="Add parameter option"
                          icon={<AddIcon />}
                          variant="ghost"
                          onClick={() => {
                            setSelectedComponentId(comp.nameId); // Set context for modal if needed
                            setIsParamModalOpen(true);
                          }}
                          mb={1}
                        />

                        {editingParam && editingParam.compIndex === compIndex && editingParam.paramIndex === paramIndex ? (
                          <Select
                            size="sm"
                            value={param.name}
                            sx={inputStyles}
                            onChange={(e) => {
                              updateParameter(
                                compIndex,
                                paramIndex,
                                "name",
                                e.target.value
                              );
                              setEditingParam(null);
                            }}
                            onBlur={() => setEditingParam(null)}
                            placeholder="Select Parameter"
                          >
                            {/* We should ideally show params relevant to *this* component. 
                                  For now using global parameterOptions or specificParams if fetched.
                                  TODO: Make parameterOptions specific to the component type/id. 
                              */}
                            {(() => {
                              const hardcoded = (comp.nameName && COMPONENT_DATA[comp.nameName]) || [];
                              const combined = [...hardcoded, ...parameterOptions];
                              const uniqueCombined = new Map();
                              combined.forEach(name => {
                                const trimmed = name.trim();
                                const lower = trimmed.toLowerCase();
                                if (trimmed && !uniqueCombined.has(lower)) {
                                  uniqueCombined.set(lower, trimmed);
                                }
                              });
                              return Array.from(uniqueCombined.values()).sort((a, b) => a.localeCompare(b));
                            })().map((name, idx) => (
                              <option key={idx} value={name}>
                                {name}
                              </option>
                            ))}
                          </Select>
                        ) : (
                          <Text
                            fontSize="sm"
                            cursor="pointer"
                            fontWeight="bold"
                            onClick={() =>
                              setEditingParam({ compIndex, paramIndex })
                            }
                          >
                            {param.name || "Select Parameter"}
                          </Text>
                        )}
                      </GridItem>

                      {/* Variables */}
                      <GridItem>
                        <Text fontSize="sm" mb={1} fontWeight="medium">
                          Variables
                        </Text>
                        <IconButton
                          size="xs"
                          aria-label="Add variable"
                          icon={<AddIcon />}
                          variant="ghost"
                          onClick={() => setIsVariableModalOpen(true)}
                          mb={1}
                        />

                        <Select
                          size="sm"
                          value={param.variable || ""}
                          onChange={(e) =>
                            handleVariableChange(
                              compIndex,
                              paramIndex,
                              e.target.value
                            )
                          }
                          sx={inputStyles}
                        >
                          <option value="">Select Variable</option>
                          <option value="Constant">Constant</option>
                          <option value="Inconstant Simple">Inconstant Simple</option>
                          <option value="Inconstant Composite">Inconstant Composite</option>
                          {/* 
                            {variableOptions.map((opt, i) => (
                              <option key={i} value={opt}>
                                {opt}
                              </option>
                            ))} 
                            */}
                        </Select>
                      </GridItem>

                      <GridItem colSpan={param.variable === "Inconstant Composite" ? 4 : 2}>
                        {/* 1. CONSTANT SELECTED */}
                        {param.variable === "Constant" && (
                          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                            <GridItem>
                              <Text fontSize="sm" mb={1} fontWeight="medium">Constant Value</Text>
                              <Input size="sm" placeholder="Enter value" value={param.value || ""} onChange={(e) => updateParameter(compIndex, paramIndex, "value", e.target.value)} sx={inputStyles} />
                            </GridItem>
                            <GridItem>
                              <Text fontSize="sm" mb={1} fontWeight="medium">Unit</Text>
                              <HStack>
                                <Select size="sm" value={param.unit || ""} onChange={(e) => updateParameter(compIndex, paramIndex, "unit", e.target.value)} sx={inputStyles}>
                                  <option value="">Select Unit</option>
                                  {SIUNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                </Select>
                                <IconButton
                                  size="xs"
                                  aria-label="Delete parameter"
                                  icon={<DeleteIcon />}
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() => deleteParameter(compIndex, paramIndex)}
                                />
                              </HStack>
                            </GridItem>
                          </Grid>
                        )}

                        {/* 2. INCONSTANT SIMPLE SELECTED */}
                        {param.variable === "Inconstant Simple" && (
                          <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                            <GridItem>
                              <Text fontSize="sm" mb={1} fontWeight="medium">Range</Text>
                              <HStack spacing={2}>
                                <Input size="sm" placeholder="Min" value={param.min} onChange={(e) => updateParameter(compIndex, paramIndex, "min", e.target.value)} sx={inputStyles} />
                                <Text fontSize="xs">to</Text>
                                <Input size="sm" placeholder="Max" value={param.max} onChange={(e) => updateParameter(compIndex, paramIndex, "max", e.target.value)} sx={inputStyles} />
                              </HStack>
                            </GridItem>
                            <GridItem>
                              <Text fontSize="sm" mb={1} fontWeight="medium">Unit</Text>
                              <Select size="sm" value={param.unit} onChange={(e) => updateParameter(compIndex, paramIndex, "unit", e.target.value)} sx={inputStyles}>
                                <option value="">Select Unit</option>
                                {SIUNITS.map(u => <option key={u} value={u}>{u}</option>)}
                              </Select>
                            </GridItem>
                          </Grid>
                        )}

                        {/* 3. INCONSTANT COMPOSITE SELECTED */}
                        {param.variable === "Inconstant Composite" && (
                          <VStack align="stretch" spacing={2}>
                            <Text fontSize="sm" fontWeight="medium">Range (Composite)</Text>
                            {/* X Range */}
                            <HStack spacing={2}>
                              <Text fontSize="xs" w="20px">X:</Text>
                              <input
                                type="text"
                                placeholder="X Min"
                                value={param.xMin || ""}
                                onChange={(e) => updateParameter(compIndex, paramIndex, "xMin", e.target.value)}
                                style={{
                                  width: "80px",
                                  height: "32px",
                                  fontSize: "14px",
                                  padding: "0 8px",
                                  borderRadius: "4px",
                                  border: "1px solid #E2E8F0",
                                  backgroundColor: "white",
                                  color: "black",
                                  position: "relative",
                                  zIndex: 10,
                                  cursor: "text"
                                }}
                              />
                              <Text fontSize="xs">to</Text>
                              <input
                                type="text"
                                placeholder="X Max"
                                value={param.xMax || ""}
                                onChange={(e) => updateParameter(compIndex, paramIndex, "xMax", e.target.value)}
                                style={{
                                  width: "100px",
                                  height: "32px",
                                  fontSize: "14px",
                                  padding: "0 12px",
                                  borderRadius: "4px",
                                  border: "1px solid #E2E8F0",
                                  backgroundColor: "white",
                                  color: "black",
                                  position: "relative",
                                  zIndex: 10,
                                  cursor: "text"
                                }}
                              />
                              <select
                                value={param.xUnit || ""}
                                onChange={(e) => {
                                  console.log("X Unit changed:", e.target.value);
                                  updateParameter(compIndex, paramIndex, "xUnit", e.target.value);
                                }}
                                style={{
                                  width: "140px",
                                  height: "32px",
                                  fontSize: "14px",
                                  padding: "0 8px",
                                  borderRadius: "4px",
                                  border: "1px solid #E2E8F0",
                                  backgroundColor: "white",
                                  color: "black",
                                  cursor: "pointer"
                                }}
                              >
                                <option value="">Unit</option>
                                {SIUNITS.map(u => <option key={u} value={u}>{u}</option>)}
                              </select>
                            </HStack>
                            {/* Y Range */}
                            <HStack spacing={2}>
                              <Text fontSize="xs" w="20px">Y:</Text>
                              <input
                                type="text"
                                placeholder="Y Min"
                                value={param.yMin || ""}
                                onChange={(e) => updateParameter(compIndex, paramIndex, "yMin", e.target.value)}
                                style={{
                                  width: "100px",
                                  height: "32px",
                                  fontSize: "14px",
                                  padding: "0 12px",
                                  borderRadius: "4px",
                                  border: "1px solid #E2E8F0",
                                  backgroundColor: "white",
                                  color: "black",
                                  position: "relative",
                                  zIndex: 10,
                                  cursor: "text"
                                }}
                              />
                              <Text fontSize="xs">to</Text>
                              <input
                                type="text"
                                placeholder="Y Max"
                                value={param.yMax || ""}
                                onChange={(e) => updateParameter(compIndex, paramIndex, "yMax", e.target.value)}
                                style={{
                                  width: "100px",
                                  height: "32px",
                                  fontSize: "14px",
                                  padding: "0 12px",
                                  borderRadius: "4px",
                                  border: "1px solid #E2E8F0",
                                  backgroundColor: "white",
                                  color: "black",
                                  position: "relative",
                                  zIndex: 10,
                                  cursor: "text"
                                }}
                              />
                              <select
                                value={param.yUnit || ""}
                                onChange={(e) => {
                                  console.log("Y Unit changed:", e.target.value);
                                  updateParameter(compIndex, paramIndex, "yUnit", e.target.value);
                                }}
                                style={{
                                  width: "140px",
                                  height: "32px",
                                  fontSize: "14px",
                                  padding: "0 8px",
                                  borderRadius: "4px",
                                  border: "1px solid #E2E8F0",
                                  backgroundColor: "white",
                                  color: "black",
                                  cursor: "pointer"
                                }}
                              >
                                <option value="">Unit</option>
                                {SIUNITS.map(u => <option key={u} value={u}>{u}</option>)}
                              </select>
                            </HStack>
                            {/* Z Range */}
                            <HStack spacing={2}>
                              <Text fontSize="xs" w="20px">Z:</Text>
                              <input
                                type="text"
                                placeholder="Z Min"
                                value={param.zMin || ""}
                                onChange={(e) => updateParameter(compIndex, paramIndex, "zMin", e.target.value)}
                                style={{
                                  width: "100px",
                                  height: "32px",
                                  fontSize: "14px",
                                  padding: "0 12px",
                                  borderRadius: "4px",
                                  border: "1px solid #E2E8F0",
                                  backgroundColor: "white",
                                  color: "black",
                                  position: "relative",
                                  zIndex: 10,
                                  cursor: "text"
                                }}
                              />
                              <Text fontSize="xs">to</Text>
                              <input
                                type="text"
                                placeholder="Z Max"
                                value={param.zMax || ""}
                                onChange={(e) => updateParameter(compIndex, paramIndex, "zMax", e.target.value)}
                                style={{
                                  width: "100px",
                                  height: "32px",
                                  fontSize: "14px",
                                  padding: "0 12px",
                                  borderRadius: "4px",
                                  border: "1px solid #E2E8F0",
                                  backgroundColor: "white",
                                  color: "black",
                                  position: "relative",
                                  zIndex: 10,
                                  cursor: "text"
                                }}
                              />
                              <select
                                value={param.zUnit || ""}
                                onChange={(e) => {
                                  console.log("Z Unit changed:", e.target.value);
                                  updateParameter(compIndex, paramIndex, "zUnit", e.target.value);
                                }}
                                style={{
                                  width: "140px",
                                  height: "32px",
                                  fontSize: "14px",
                                  padding: "0 8px",
                                  borderRadius: "4px",
                                  border: "1px solid #E2E8F0",
                                  backgroundColor: "white",
                                  color: "black",
                                  cursor: "pointer"
                                }}
                              >
                                <option value="">Unit</option>
                                {SIUNITS.map(u => <option key={u} value={u}>{u}</option>)}
                              </select>
                            </HStack>
                          </VStack>
                        )}

                        {/* 4. SWITCH COMPONENT TYPE Logic */}
                        {(comp.typeName && (comp.typeName.toLowerCase() === "switch" || comp.typeName.toLowerCase() === "switches")) && (
                          <Box mt={2}>
                            <Text fontSize="sm" mb={1} fontWeight="medium">State (On/Off)</Text>
                            <HStack spacing={4}>
                              <Button
                                size="xs"
                                colorScheme={param.state === "On" ? "green" : "gray"}
                                variant={param.state === "On" ? "solid" : "outline"}
                                onClick={() => updateParameter(compIndex, paramIndex, "state", "On")}
                              >
                                On
                              </Button>
                              <Button
                                size="xs"
                                colorScheme={param.state === "Off" ? "red" : "gray"}
                                variant={param.state === "Off" ? "solid" : "outline"}
                                onClick={() => updateParameter(compIndex, paramIndex, "state", "Off")}
                              >
                                Off
                              </Button>
                            </HStack>
                          </Box>
                        )}

                        {/* 5. LED COMPONENT TYPE Logic */}
                        {(comp.typeName && (comp.typeName.toLowerCase() === "led" || comp.typeName.toLowerCase() === "leds")) && (
                          <Box mt={2}>
                            <Text fontSize="sm" mb={1} fontWeight="medium">Color</Text>
                            <Select size="sm" value={param.color} onChange={(e) => updateParameter(compIndex, paramIndex, "color", e.target.value)} sx={inputStyles}>
                              <option value="">Select Color</option>
                              <option value="Red">Red</option>
                              <option value="Green">Green</option>
                              <option value="Blue">Blue</option>
                            </Select>
                          </Box>
                        )}

                      </GridItem>
                    </Grid>
                  </Box>
                )
                )}
              </Box>

            </Box>
          ))}

          {/* URL Link */}
          <Box>
            <Text fontSize="md" fontWeight="bold" mb={2}>
              Url Link{" "}
              <Text as="span" color="red.500">
                *
              </Text>
            </Text>
            <Input size="sm" value={urlLink} onChange={(e) => setUrlLink(e.target.value)} sx={inputStyles} placeholder="Enter URL" />
          </Box>

          {/* Note */}
          <Box>
            <Text fontSize="md" fontWeight="bold" mb={2}>
              Note (Optional)
            </Text>
            <Textarea size="sm" minH="80px" value={note} onChange={(e) => setNote(e.target.value)} sx={inputStyles} placeholder="Add notes here..." />
          </Box>

          {/* Identity of Device - render per-device blocks */}
          <Box>
            <Text fontSize="md" fontWeight="bold" mb={3}>
              Identity Of Device
            </Text>

            <VStack spacing={4} align="stretch">
              {deviceInfos.map((dev, idx) => (
                <Box key={idx} bg="white" p={3} borderRadius="md" borderWidth="1px" position="relative">
                  <HStack position="absolute" top="8px" right="8px" spacing={1}>
                    <IconButton
                      size="xs"
                      aria-label="Edit device"
                      icon={<EditIcon />}
                      variant="ghost"
                      onClick={() => {
                        toast({ title: "Edit device", description: `You can edit fields directly for device ${idx + 1}`, status: "info", duration: 1200 });
                      }}
                    />
                    <IconButton size="xs" aria-label="Delete device" icon={<DeleteIcon />} onClick={() => deleteDeviceInfo(idx)} variant="ghost" />
                  </HStack>

                  <Text fontSize="sm" fontWeight="semibold" mb={2}>
                    Device {idx + 1}
                  </Text>
                  <Grid templateColumns="repeat(3, 1fr)" gap={4}>
                    <GridItem>
                      <FormControl isInvalid={dev.imei && !/^\d{15}$/.test(dev.imei)}>
                        <Text fontSize="sm" mb={1} fontWeight="medium">
                          IMEI
                        </Text>
                        <Input size="sm" value={dev.imei} onChange={(e) => handleDeviceInfoChange(idx, "imei", e.target.value)} sx={inputStyles} placeholder="Enter IMEI (15 digits)" maxLength={15} />
                        <FormErrorMessage fontSize="2xs">Must be 15 digits</FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isInvalid={dev.iccid && !/^\d{19,20}$/.test(dev.iccid)}>
                        <Text fontSize="sm" mb={1} fontWeight="medium">
                          ICCID
                        </Text>
                        <Input size="sm" value={dev.iccid} onChange={(e) => handleDeviceInfoChange(idx, "iccid", e.target.value)} sx={inputStyles} placeholder="Enter ICCID (19-20 digits)" maxLength={20} />
                        <FormErrorMessage fontSize="2xs">Must be 19-20 digits</FormErrorMessage>
                      </FormControl>
                    </GridItem>

                    <GridItem>
                      <FormControl isInvalid={dev.phone && !/^\d{10}$/.test(dev.phone)}>
                        <Text fontSize="sm" mb={1} fontWeight="medium">
                          Phone No.
                        </Text>
                        <Input size="sm" value={dev.phone} onChange={(e) => handleDeviceInfoChange(idx, "phone", e.target.value)} sx={inputStyles} placeholder="Enter Phone (10 digits)" maxLength={10} />
                        <FormErrorMessage fontSize="2xs">Must be 10 digits</FormErrorMessage>
                      </FormControl>
                    </GridItem>
                  </Grid>
                </Box>
              ))}
            </VStack>
          </Box>

          {/* Cancel and Create Product Buttons */}
          <HStack justify="center" spacing={6} mt={8} pt={4} borderTop="1px" borderColor="gray.300">
            <Button variant="outline" size="md" borderColor="blue.500" color="blue.500" onClick={handleCancel} px={10}>
              Cancel
            </Button>
            <Button colorScheme="blue" size="md" px={10} onClick={handleSubmitDevices}
              isLoading={loading}>
              Create Product
            </Button>
          </HStack>
        </VStack>
      </Box>

      {/* POPUP: Add Component (type + name) */}
      {
        showComponentPopup && (
          <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="blackAlpha.400" display="flex" alignItems="center" justifyContent="center" zIndex={1000}>
            <Box bg="#f5f5f5" borderRadius="md" borderWidth="1px" maxW="400px" w="100%" p={6}>
              <HStack justify="space-between" mb={4}>
                <Text fontSize="sm" fontWeight="semibold">
                  Add Component
                </Text>
                <Button variant="ghost" size="sm" fontSize="sm" onClick={handleComponentPopupCancel} px={2}>
                  ✕
                </Button>
              </HStack>

              <VStack align="stretch" spacing={4}>
                <Box>
                  <Text fontSize="xs" mb={1}>
                    Component
                  </Text>
                  <Select size="sm" value={newComponent.type} onChange={(e) => setNewComponent((prev) => ({ ...prev, type: e.target.value }))} sx={inputStyles}>
                    <option value="Sensor">Sensor</option>
                    <option value="Actuator">Actuator</option>
                  </Select>
                </Box>

                <Box>
                  <Text fontSize="xs" mb={1}>
                    Component Name{" "}
                    <Text as="span" color="red.500">
                      *
                    </Text>
                  </Text>
                  <Input size="sm" value={newComponent.name} onChange={(e) => setNewComponent((prev) => ({ ...prev, name: e.target.value }))} sx={inputStyles} placeholder="Enter component name" />
                </Box>
              </VStack>

              <Box textAlign="center" mt={6}>
                <Button colorScheme="blue" size="sm" px={8} onClick={handleComponentPopupSubmit}>
                  Submit
                </Button>
              </Box>
            </Box>
          </Box>
        )
      }

      <Modal isOpen={isParamModalOpen} onClose={() => setIsParamModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Specific Parameter</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Input
              color="black"
              placeholder="Enter parameter name"
              value={newSpecificParam}
              onChange={(e) => setNewSpecificParam(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>

            <Button
              colorScheme="blue"
              onClick={submitParameters}
            >
              Submit
            </Button>

          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isVariableModalOpen} onClose={() => setIsVariableModalOpen(false)} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Variable</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Input
              placeholder="Enter variable name"
              color="black"
              value={newVariable}
              onChange={(e) => setNewVariable(e.target.value)}
            />
          </ModalBody>

          <ModalFooter>

            {/* <Button
              colorScheme="blue"
              onClick={async () => {
                if (!newVariable.trim()) return;

                try {
                  const res = await fetch(
                    `${API.MAIN}/api/v2/parameterVariables`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        variableName: newVariable.trim(),
                      }),
                    }
                  );

                  const result = await res.json();
                  console.log("Variable API response:", result);

                  // ✅ API success apram dropdown/state update
                  setVariableOptions((prev) => [
                    ...prev,
                    newVariable.trim(),
                  ]);

                  setNewVariable("");
                  setIsVariableModalOpen(false);

                } catch (error) {
                  console.error("Variable POST error:", error);
                }
              }}
            >
              Submit
            </Button> */}
            <Button
              colorScheme="blue"
              onClick={async () => {
                if (!newVariable.trim()) return;

                try {
                  // 🔹 POST API
                  await fetch(
                    `${API.MAIN}/api/v2/parameterVariables`,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        variableName: newVariable.trim(),
                      }),
                    }
                  );

                  // 🔁 AUTO REFRESH (GET)
                  await fetchVariables();

                  setNewVariable("");
                  setIsVariableModalOpen(false);

                } catch (error) {
                  console.error("Variable POST error:", error);
                }
              }}
            >
              Submit
            </Button>


          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}