import "../ProductDefinition/CreateProductDefinition.css";
import { electronicComponents } from "../ProductDefinition/electronicComponents";
import { useEffect, useState } from "react";
import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Center, Heading, Text, Button } from "@chakra-ui/react";
import Ellipse521 from "../../../images/Ellipse 521.svg";
import Footer from "../../Footer";
import { baseURL, productAPIBase } from "../../../utilities";

const EditProductDefinition = ({
  productID,
  productName,
  setIsProductDefined,
  onClose,
  refreshKey,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const getStoredValues = () => {
    const storedValues = sessionStorage.getItem("productDefinition");
    if (storedValues) {
      return JSON.parse(storedValues);
    }

    if (location.state?.productID && location.state?.deviceName) {
      const newValues = {
        productID: location.state.productID,
        deviceName: location.state.deviceName,
      };
      sessionStorage.setItem("productDefinition", JSON.stringify(newValues));
      return newValues;
    }

    return {
      productID: "",
      deviceName: "",
    };
  };

  const effectiveProductId =
    productID ||
    getStoredValues().productID ||
    localStorage.getItem("activeProductId") ||
    localStorage.getItem("activeProjectId") ||
    "";

  const effectiveProductName =
    productName ||
    getStoredValues().deviceName ||
    localStorage.getItem("activeProductName") ||
    localStorage.getItem("activeProjectName") ||
    "Product";

  const [initialValues, setInitialValues] = useState({
    productID: effectiveProductId,
    deviceName: effectiveProductName,
    components: [],
  });

  const extractNoteAndUrls = (component, apiData, apiDataRaw, componentName, targetProductId, targetProductName) => {
    // 1. Try to read from component directly
    let note = component.note || component.Note || component.notes || component.Notes || component.description || component.desc || "";

    let urls = [];
    if (Array.isArray(component.urls) && component.urls.length > 0) {
      urls = component.urls;
    } else if (Array.isArray(component.Urls) && component.Urls.length > 0) {
      urls = component.Urls;
    } else if (component.urls && typeof component.urls === "string") {
      urls = [component.urls];
    } else if (component.url && typeof component.url === "string") {
      urls = [component.url];
    } else if (component.urlLink && typeof component.urlLink === "string") {
      urls = [component.urlLink];
    } else if (component.link && typeof component.link === "string") {
      urls = [component.link];
    }

    // 2. Try to read from top-level apiData / apiDataRaw if component didn't have it
    if (!note) {
      note = apiData.note || apiData.Note || apiData.notes || apiData.Notes || apiData.productDesc || apiData.description ||
             apiDataRaw?.note || apiDataRaw?.notes || apiDataRaw?.productDesc || apiDataRaw?.description ||
             apiDataRaw?.data?.note || apiDataRaw?.data?.notes ||
             apiDataRaw?.definition?.note || apiDataRaw?.data?.definition?.note || "";
    }

    if (urls.length === 0) {
      if (Array.isArray(apiData.urls) && apiData.urls.length > 0) {
        urls = apiData.urls;
      } else if (Array.isArray(apiData.Urls) && apiData.Urls.length > 0) {
        urls = apiData.Urls;
      } else if (apiData.urls && typeof apiData.urls === "string") {
        urls = [apiData.urls];
      } else if (apiData.url && typeof apiData.url === "string") {
        urls = [apiData.url];
      } else if (apiData.urlLink && typeof apiData.urlLink === "string") {
        urls = [apiData.urlLink];
      } else if (Array.isArray(apiDataRaw?.urls) && apiDataRaw.urls.length > 0) {
        urls = apiDataRaw.urls;
      } else if (apiDataRaw?.url && typeof apiDataRaw.url === "string") {
        urls = [apiDataRaw.url];
      } else if (apiDataRaw?.urlLink && typeof apiDataRaw.urlLink === "string") {
        urls = [apiDataRaw.urlLink];
      } else if (Array.isArray(apiDataRaw?.data?.urls) && apiDataRaw.data.urls.length > 0) {
        urls = apiDataRaw.data.urls;
      } else if (apiDataRaw?.data?.url) {
        urls = [apiDataRaw.data.url];
      } else if (apiDataRaw?.data?.urlLink) {
        urls = [apiDataRaw.data.urlLink];
      }
    }

    // 3. Fallback to localStorage cached product details if still empty
    if (!note || urls.length === 0) {
      try {
        const resolvedProdId = targetProductId || getStoredValues().productID || localStorage.getItem("activeProductId") || localStorage.getItem("activeProjectId");
        const resolvedProjId = localStorage.getItem("activeProjectId");
        const resolvedProdName = targetProductName || getStoredValues().deviceName || localStorage.getItem("activeProductName") || localStorage.getItem("activeProjectName");

        let cachedDetails = null;
        if (resolvedProdId) {
          const stored = localStorage.getItem(`innoide:product_details_${resolvedProdId}`);
          if (stored) cachedDetails = JSON.parse(stored);
        }
        if (!cachedDetails && resolvedProjId) {
          const stored = localStorage.getItem(`innoide:product_details_${resolvedProjId}`);
          if (stored) cachedDetails = JSON.parse(stored);
        }
        if (!cachedDetails && resolvedProdName) {
          const stored = localStorage.getItem(`innoide:product_details_${resolvedProdName}`);
          if (stored) cachedDetails = JSON.parse(stored);
        }
        if (!cachedDetails) {
          const stored = localStorage.getItem("innoide:last_product_details");
          if (stored) cachedDetails = JSON.parse(stored);
        }

        if (cachedDetails) {
          if (!note) {
            if (cachedDetails.componentsPayload?.[componentName]?.note) {
              note = cachedDetails.componentsPayload[componentName].note;
            } else if (Array.isArray(cachedDetails.components)) {
              const matchComp = cachedDetails.components.find(
                (c) => c.name === componentName || c.componentName === componentName
              );
              if (matchComp?.note) note = matchComp.note;
            }
            if (!note) {
              note = cachedDetails.note || cachedDetails.notes || cachedDetails.productDesc || cachedDetails.description || "";
            }
          }

          if (urls.length === 0) {
            if (cachedDetails.componentsPayload?.[componentName]?.urls) {
              const u = cachedDetails.componentsPayload[componentName].urls;
              urls = Array.isArray(u) ? u : (u ? [u] : []);
            } else if (Array.isArray(cachedDetails.components)) {
              const matchComp = cachedDetails.components.find(
                (c) => c.name === componentName || c.componentName === componentName
              );
              if (matchComp?.urls) urls = Array.isArray(matchComp.urls) ? matchComp.urls : [matchComp.urls];
              else if (matchComp?.url) urls = [matchComp.url];
              else if (matchComp?.urlLink) urls = [matchComp.urlLink];
            }
            if (urls.length === 0) {
              if (Array.isArray(cachedDetails.urls) && cachedDetails.urls.length > 0) urls = cachedDetails.urls;
              else if (cachedDetails.urlLink) urls = [cachedDetails.urlLink];
              else if (cachedDetails.url) urls = [cachedDetails.url];
            }
          }
        }
      } catch (cacheErr) {
        console.warn("[EditProductDefinition] Error reading cached note/urls:", cacheErr);
      }
    }

    const cleanUrls = urls.filter((u) => u !== undefined && u !== null);
    const finalUrls = cleanUrls.length > 0 ? cleanUrls : [""];

    return { note: note || "", urls: finalUrls };
  };

  const convertDataToAPIFormat = async (values) => {
    const formattedComponents = {};
    values.components.forEach((component) => {
      // Skip components with no name (empty placeholder rows)
      if (!component.componentName || !component.componentName.trim()) return;

      formattedComponents[component.componentName] = {
        ...component,
        type: component.componentType.toLowerCase(),
      };

      // Assign unit only if it exists
      if (Array.isArray(component.unit) && component.unit.length > 0) {
        formattedComponents[component.componentName].unit = component.unit[0]; // Take the first unit
      }

      delete formattedComponents[component.componentName].componentName;
      delete formattedComponents[component.componentName].componentType;
      if (formattedComponents[component.componentName].state === undefined) {
        delete formattedComponents[component.componentName].state;
      }
    });

    const resultData = {
      productID: values.productID,
      components: formattedComponents,
      deviceName: values.deviceName,
    };

    console.log("Result data:", resultData);

    try {
      // 1. Determine components that were removed or renamed compared to server / initialValues
      const newComponentNames = new Set(Object.keys(formattedComponents));
      let currentServerComponents = {};
      try {
        const checkUrl = `${productAPIBase || baseURL || 'http://localhost:5004'}/product/${values.productID}/definitionNew`;
        const checkResp = await axios.get(checkUrl, { timeout: 3000 });
        const checkData = checkResp.data?.data?.definition || checkResp.data?.definition || checkResp.data?.data || checkResp.data;
        if (checkData?.components && typeof checkData.components === 'object') {
          currentServerComponents = checkData.components;
        }
      } catch (checkErr) {
        console.warn("[EditProductDefinition] Failed to fetch server components for diffing:", checkErr);
      }

      const allPreviousComponentNames = new Set([
        ...Object.keys(currentServerComponents),
        ...(initialValues?.components || []).map((c) => c.componentName || c.name).filter(Boolean)
      ]);

      const componentsToDelete = [...allPreviousComponentNames].filter(
        (oldName) => !newComponentNames.has(oldName)
      );

      // 2. Delete removed/renamed components from backend
      for (const oldName of componentsToDelete) {
        try {
          console.log(`[EditProductDefinition] Deleting removed/renamed component "${oldName}" from backend...`);
          let delUrl = `${productAPIBase}/product/${values.productID}/definitionNew/${encodeURIComponent(oldName)}`;
          try {
            await axios.delete(delUrl, { timeout: 4000 });
          } catch {
            delUrl = `${baseURL}/product/${values.productID}/definitionNew/${encodeURIComponent(oldName)}`;
            await axios.delete(delUrl);
          }
        } catch (delErr) {
          console.warn(`[EditProductDefinition] Failed to delete component "${oldName}":`, delErr);
        }
      }

      // 3. Submit each current component
      for (const [componentName, componentData] of Object.entries(formattedComponents)) {
        if (!componentName || !componentName.trim()) continue;

        const payload = {
          componentID: componentData.componentID || "",
          type: componentData.type,
          parameters: componentData.parameters || {},
          note: componentData.note || "",
          urls: Array.isArray(componentData.urls) ? componentData.urls.filter(Boolean) : (componentData.urls ? [componentData.urls] : []),
        };

        let url = `${productAPIBase}/product/${values.productID}/definitionNew/${encodeURIComponent(componentName)}`;
        try {
          console.log(`[EditProductDefinition] Updating component "${componentName}" via local API: ${url}`);
          await axios.put(url, payload, { timeout: 4000 });
        } catch {
          console.warn(`[EditProductDefinition] Local update failed/timed out for "${componentName}", falling back to Eureka...`);
          url = `${baseURL}/product/${values.productID}/definitionNew/${encodeURIComponent(componentName)}`;
          await axios.put(url, payload);
        }
      }

      // 4. Synchronize updated components and notes back into localStorage cache (REPLACE, DO NOT MERGE!)
      try {
        const prodId = values.productID;
        const prodName = values.deviceName || productName;
        const candidateKeys = new Set([
          prodId && `innoide:product_details_${prodId}`,
          prodName && `innoide:product_details_${prodName}`,
          localStorage.getItem("activeProductId") && `innoide:product_details_${localStorage.getItem("activeProductId")}`,
          localStorage.getItem("activeProjectId") && `innoide:product_details_${localStorage.getItem("activeProjectId")}`,
          localStorage.getItem("activeProductName") && `innoide:product_details_${localStorage.getItem("activeProductName")}`,
          localStorage.getItem("activeProjectName") && `innoide:product_details_${localStorage.getItem("activeProjectName")}`,
          "innoide:last_product_details",
        ].filter(Boolean));

        candidateKeys.forEach((key) => {
          const stored = localStorage.getItem(key);
          let data = {};
          try {
            if (stored) data = JSON.parse(stored);
          } catch {
            // ignore
          }

          const firstComp = Object.values(formattedComponents)[0];
          if (firstComp) {
            if (firstComp.note) data.note = firstComp.note;
            const u = Array.isArray(firstComp.urls) ? firstComp.urls.filter(Boolean) : (firstComp.urls ? [firstComp.urls] : []);
            if (u.length > 0) data.urls = u;
          }
          data.componentsPayload = { ...formattedComponents };
          data.components = values.components.filter((c) => c.componentName && c.componentName.trim());
          if (data.basicInformation) {
            data.basicInformation.noOfComponents = data.components.length;
          }
          data.noOfComponents = data.components.length;
          if (prodName) data.productName = prodName;
          if (prodId) data.productId = prodId;

          localStorage.setItem(key, JSON.stringify(data));
        });
      } catch (cacheErr) {
        console.warn("[EditProductDefinition] Cache sync error:", cacheErr);
      }

      // 5. Synchronize project file on disk if in Electron
      try {
        if (window.electronAPI?.filesystem?.readFile && window.electronAPI?.filesystem?.writeFile) {
          const pName = values.deviceName || productName || localStorage.getItem("activeProjectName") || "";
          if (pName) {
            const possibleFiles = [`${pName}.json`, `BlockDiagram/${pName}.json`];
            for (const f of possibleFiles) {
              try {
                const content = await window.electronAPI.filesystem.readFile(f, "utf8");
                if (content) {
                  const parsed = JSON.parse(content);
                  if (parsed.productDetails) {
                    parsed.productDetails.components = values.components.filter((c) => c.componentName && c.componentName.trim());
                    if (parsed.productDetails.basicInformation) {
                      parsed.productDetails.basicInformation.noOfComponents = parsed.productDetails.components.length;
                    }
                    parsed.productDetails.noOfComponents = parsed.productDetails.components.length;
                    await window.electronAPI.filesystem.writeFile(f, JSON.stringify(parsed, null, 2), "utf8");
                  }
                }
              } catch {
                // ignore
              }
            }
          }
        }
      } catch {
        // ignore
      }

      // 6. Update local initialValues so subsequent edits reflect current state
      setInitialValues((prev) => ({
        ...prev,
        components: values.components,
      }));

      // 7. Dispatch events to notify IDE components of product change
      if (setIsProductDefined) {
        setIsProductDefined(values.components.length > 0);
      }
      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("innoide:refresh-filesystem"));
      window.dispatchEvent(new CustomEvent("product-definition-changed", {
        detail: { productID: values.productID, action: "updated" }
      }));

      alert("Product definition updated successfully!");
    } catch (error) {
      console.error("Error sending data to the server:", error);
      alert("Error submitting form. Please try again.");
      throw error;
    }
  };

  //   fetches and updates the form

  const fetchProductDefinition = async (productID) => {
    console.log("[EditProductDefinition] Fetching definition for ID:", productID);
    try {
      let response;
      const localUrl = `${productAPIBase}/product/${productID}/definitionNew`;

      try {
        console.log(`[EditProductDefinition] Attempting local fetch: ${localUrl}`);
        response = await axios.get(localUrl, { timeout: 4000 });
      } catch (localError) {
        console.warn("[EditProductDefinition] Local fetch failed/timed out, trying Eureka fallback...");
        // Use definitionNew for fallback as requested
        const fallbackUrl = `${baseURL}/product/${productID}/definitionNew`;
        console.log(`[EditProductDefinition] Attempting fallback fetch: ${fallbackUrl}`);
        response = await axios.get(fallbackUrl);
      }

      console.log("[EditProductDefinition] Received Data:", response.data);
      const convertedComponents = convertDataFromApi(response.data);

      setInitialValues((prevValues) => ({
        ...prevValues,
        components: convertedComponents,
      }));
    } catch (error) {
      console.error("[EditProductDefinition] Error fetching product definition (All servers failed):", error);
      // Attempt recovery from localStorage cache if network fails
      try {
        const cached = 
          JSON.parse(localStorage.getItem(`innoide:product_details_${productID}`) || "null") ||
          JSON.parse(localStorage.getItem('innoide:last_product_details') || "null");
        if (cached && (cached.componentsPayload || cached.components)) {
          console.log("[EditProductDefinition] Recovering from localStorage cache:", cached);
          const convertedComponents = convertDataFromApi({ components: cached.componentsPayload || {} });
          setInitialValues((prevValues) => ({
            ...prevValues,
            components: convertedComponents,
          }));
        }
      } catch (cacheErr) {}
    }
  };

  const convertDataFromApi = (apiDataRaw) => {
    // Support { ... }, { data: { ... } }, and { data: { definition: { ... } } } structures
    const apiData = apiDataRaw?.data?.definition || apiDataRaw?.definition || apiDataRaw?.data || apiDataRaw;
    if (!apiData || !apiData.components) return [];

    return Object.keys(apiData.components).map((componentName) => {
      const component = apiData.components[componentName];

      // 1. Determine Component Type
      let componentType = component.type || "";
      const match = electronicComponents.find(
        (c) => c.type.toLowerCase() === componentType.toLowerCase().trim()
      );
      if (match) {
        componentType = match.type;
      } else if (componentType) {
        componentType = componentType.charAt(0).toUpperCase() + componentType.slice(1);
      }

      // 2. Initialize formatted component with robust note and url extraction
      const { note: componentNote, urls: componentUrls } = extractNoteAndUrls(
        component,
        apiData,
        apiDataRaw,
        componentName,
        getStoredValues().productID,
        getStoredValues().deviceName
      );

      let formattedComponent = {
        componentID: component.componentID || component.id || "",
        componentType,
        componentName,
        note: componentNote,
        urls: componentUrls,
      };

      // 3. Extract parameters (min, max, unit)
      let params = component.parameters || {};
      
      if (Object.keys(params).length === 0) {
        Object.keys(component).forEach(key => {
          if (typeof component[key] === 'object' && component[key] !== null && !Array.isArray(component[key])) {
            if (component[key].min !== undefined || component[key].max !== undefined || component[key].unit !== undefined) {
              params = { ...params, ...component[key] };
            }
          }
        });
      }

      const unitValue = params.unit || component.unit;
      if (unitValue) {
        formattedComponent.unit = Array.isArray(unitValue) ? unitValue : [unitValue];
      }

      const minVal = params.min !== undefined ? params.min : component.min;
      const maxVal = params.max !== undefined ? params.max : component.max;

      if (minVal !== undefined && maxVal !== undefined) {
        formattedComponent.min = minVal;
        formattedComponent.max = maxVal;
      }

      return formattedComponent;
    });
  };

  useEffect(() => {
    const pid =
      productID ||
      initialValues?.productID ||
      localStorage.getItem("activeProductId") ||
      localStorage.getItem("activeProjectId") ||
      "";
    if (pid) {
      fetchProductDefinition(pid);
    }
  }, [effectiveProductId, refreshKey]);

  useEffect(() => {
    const handleProductDefChanged = () => {
      console.log("[EditProductDefinition] product-definition-changed received, refreshing...");
      const pid =
        productID ||
        initialValues?.productID ||
        localStorage.getItem("activeProductId") ||
        localStorage.getItem("activeProjectId") ||
        "";
      if (pid) {
        fetchProductDefinition(pid);
      }
    };
    window.addEventListener("product-definition-changed", handleProductDefChanged);
    window.addEventListener("storage", handleProductDefChanged);
    return () => {
      window.removeEventListener("product-definition-changed", handleProductDefChanged);
      window.removeEventListener("storage", handleProductDefChanged);
    };
  }, [productID, initialValues?.productID]);

  useEffect(() => {
    const pid =
      productID ||
      getStoredValues().productID ||
      localStorage.getItem("activeProductId") ||
      localStorage.getItem("activeProjectId") ||
      "";
    const pname =
      productName ||
      getStoredValues().deviceName ||
      localStorage.getItem("activeProductName") ||
      localStorage.getItem("activeProjectName") ||
      "Product";

    setInitialValues((prev) => ({
      ...prev,
      productID: pid,
      deviceName: pname,
    }));

    if (pid) {
      fetchProductDefinition(pid);
    }
  }, [productID, productName, location.state]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("productDefinition");
    };
  }, []);

  return (
    <Box>
      <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
        <div className=" rounded p-4 border" style={{ width: "100%" }}>
          <h3 className="m-4 text-dark text-center">
            {initialValues.deviceName}
          </h3>

          <Formik
            initialValues={initialValues}
            onSubmit={async (values, { setSubmitting }) => {
              try {
                await convertDataToAPIFormat(values);
              } catch (error) {
                console.error("Form submission error:", error);
              } finally {
                setSubmitting(false);
              }
            }}
            enableReinitialize
          >
            {(formik) => (
              <Form onSubmit={formik.handleSubmit}>
                <FieldArray name="components">
                  {(helperMethod) => (
                    <div>
                      {formik.values.components?.map((component, index) => (
                        <div
                          key={index}
                          className="border p-3 mb-3 bg-light rounded"
                        >
                          <div>
                            {/* <div className="form-floating mb-3">
                              <Field
                                type="text"
                                className="form-control"
                                name={`components[${index}].componentID`}
                                required
                              />
                              <label
                                htmlFor={`components[${index}].componentID`}
                              >
                                Component ID
                              </label>
                              <ErrorMessage
                                name={`components[${index}].componentID`}
                                component="div"
                                className="text-danger"
                              />
                            </div> */}

                            <div className="form-floating mb-3">
                              <Field
                                as="select"
                                className="form-select"
                                name={`components[${index}].componentType`}
                                onChange={(e) => {
                                  const val = e.target.value;
                                  formik.setFieldValue(`components[${index}].componentType`, val);
                                  formik.setFieldValue(`components[${index}].componentName`, "");
                                  formik.setFieldValue(`components[${index}].unit`, undefined);
                                  formik.setFieldValue(`components[${index}].min`, undefined);
                                  formik.setFieldValue(`components[${index}].max`, undefined);
                                }}
                              >
                                <option value="" disabled>
                                  -- Select Component Type --
                                </option>
                                {/* Support custom/existing value */}
                                {component.componentType && !electronicComponents.some(c => c.type === component.componentType) && (
                                  <option value={component.componentType}>{component.componentType}</option>
                                )}
                                {electronicComponents.map((category, idx) => (
                                  <option key={idx} value={category.type}>
                                    {category.type}
                                  </option>
                                ))}
                              </Field>
                              <label
                                htmlFor={`components[${index}].componentType`}
                              >
                                Component Type
                              </label>
                              <ErrorMessage
                                name={`components[${index}].componentType`}
                                component="div"
                                className="text-danger"
                              />
                            </div>

                            {component.componentType && (
                              <div className="form-floating mb-3">
                                <Field
                                  as="select"
                                  className="form-select"
                                  name={`components[${index}].componentName`}
                                  onChange={(e) => {
                                    const val = e.target.value;
                                    formik.setFieldValue(`components[${index}].componentName`, val);
                                    
                                    const selectedComponent = electronicComponents
                                      .find((cat) => cat.type.toLowerCase() === component.componentType?.toLowerCase()?.trim())
                                      ?.components.find((comp) => comp.name === val);

                                    formik.setFieldValue(`components[${index}].unit`, selectedComponent?.unit || undefined);
                                    formik.setFieldValue(`components[${index}].min`, selectedComponent?.unit ? "" : undefined);
                                    formik.setFieldValue(`components[${index}].max`, selectedComponent?.unit ? "" : undefined);
                                  }}
                                >
                                  <option value="" disabled>
                                    -- Select Component --
                                  </option>
                                  {/* Support custom name if it doesn't exist in standard list for this type */}
                                  {component.componentName &&
                                    !(electronicComponents.find(c => c.type === component.componentType)?.components.some(comp => comp.name === component.componentName)) && (
                                      <option value={component.componentName}>{component.componentName}</option>
                                    )}
                                  {electronicComponents
                                    .find(
                                      (category) =>
                                        category.type.toLowerCase() ===
                                        component.componentType?.toLowerCase()?.trim()
                                    )
                                    ?.components.map((comp, idx) => (
                                      <option key={idx} value={comp.name}>
                                        {comp.name}
                                      </option>
                                    ))}
                                </Field>
                                <label
                                  htmlFor={`components[${index}].componentName`}
                                >
                                  Component Name
                                </label>
                                <ErrorMessage
                                  name={`components[${index}].componentName`}
                                  component="div"
                                  className="text-danger"
                                />
                              </div>
                            )}

                            {Array.isArray(component.unit) &&
                              component.unit.length > 0 && (
                                <div className="form-floating mb-3">
                                  <Field
                                    as="select"
                                    className="form-select"
                                    name={`components[${index}].unit`}
                                  >
                                    <option value="" disabled>
                                      -- Select Unit --
                                    </option>
                                    {component.unit.map((unitOption, idx) => (
                                      <option key={idx} value={unitOption}>
                                        {unitOption}
                                      </option>
                                    ))}
                                  </Field>
                                  <label htmlFor={`components[${index}].unit`}>
                                    Unit
                                  </label>
                                </div>
                              )}

                            {component.unit && component.unit !== "boolean" && (
                              <>
                                <div className="form-floating mb-3">
                                  <Field
                                    type="number"
                                    className="form-control"
                                    name={`components[${index}].min`}
                                  />
                                  <label htmlFor={`components[${index}].min`}>
                                    Minimum
                                  </label>
                                  <ErrorMessage
                                    name={`components[${index}].min`}
                                    component="div"
                                    className="text-danger"
                                  />
                                </div>

                                <div className="form-floating mb-3">
                                  <Field
                                    type="number"
                                    className="form-control"
                                    name={`components[${index}].max`}
                                  />
                                  <label htmlFor={`components[${index}].max`}>
                                    Maximum
                                  </label>
                                  <ErrorMessage
                                    name={`components[${index}].max`}
                                    component="div"
                                    className="text-danger"
                                  />
                                </div>
                              </>
                            )}

                            <div className="form-floating mb-3">
                              <Field
                                as="textarea"
                                className="form-control"
                                name={`components[${index}].note`}
                                style={{ height: "70px" }}
                              />
                              <label htmlFor={`components[${index}].note`}>
                                Note
                              </label>
                            </div>

                            <div className="form-floating mb-3">
                              <Field
                                type="text"
                                className="form-control"
                                name={`components[${index}].urls[0]`}
                              />
                              <label htmlFor={`components[${index}].urls[0]`}>
                                URL
                              </label>
                            </div>

                            <Button
                              type="button"
                              className="w-100 mb-3"
                              colorScheme="yellow"
                              variant={"outline"}
                              onClick={() => helperMethod.remove(index)}
                            >
                              Remove Component
                            </Button>
                          </div>
                        </div>
                      ))}

                      <div>
                        <Button
                          type="button"
                          className="w-100 mb-3 "
                          colorScheme="teal"
                          variant="outline"
                          onClick={() =>
                            helperMethod.push({
                              componentID: "",
                              componentType: "",
                              componentName: "",
                              note: "",
                              urls: [""],
                              unit: undefined,
                              min: undefined,
                              max: undefined,
                            })
                          }
                        >
                          Add Component
                        </Button>
                      </div>
                    </div>
                  )}
                </FieldArray>

                <Button
                  type="submit"
                  className="w-100 "
                  disabled={formik.isSubmitting}
                  colorScheme="blue"
                >
                  {formik.isSubmitting ? "Updating..." : "Update"}
                </Button>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </Box>
  );
};

export default EditProductDefinition;
