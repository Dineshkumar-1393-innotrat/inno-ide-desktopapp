import "../ProductDefinition/CreateProductDefinition.css";
import { electronicComponents } from "../ProductDefinition/electronicComponents";
import { useEffect, useState } from "react";
import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Center, Heading, Text, Button, Icon } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { baseURL, productAPIBase } from "../../../utilities";

const ViewProductDefinition = ({ productID, productName, refreshKey }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [initialValues, setInitialValues] = useState({
    productID: productID,
    productName: productName,
    components: [],
  });

  const [status, setStatus] = useState(false);
  const [loading, setLoading] = useState(false);

  const convertDataToAPIFormat = async (values) => {
    const formattedComponents = {};
    values.components.forEach((component) => {
      const compName = component.componentName;
      if (!compName) return;
      formattedComponents[compName] = {
        ...component,
        type: (component.componentType || "").toLowerCase(),
      };
      delete formattedComponents[compName].componentName;
      delete formattedComponents[compName].componentType;
      if (formattedComponents[compName].state === undefined) {
        delete formattedComponents[compName].state;
      }
    });

    const resultData = {
      productID: values.productID,
      components: formattedComponents,
      productName: values.productName,
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
        console.warn("[ViewProductDefinition] Failed to fetch server components for diffing:", checkErr);
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
          console.log(`[ViewProductDefinition] Deleting removed/renamed component "${oldName}" from backend...`);
          let delUrl = `${productAPIBase}/product/${values.productID}/definitionNew/${encodeURIComponent(oldName)}`;
          try {
            await axios.delete(delUrl, { timeout: 4000 });
          } catch {
            delUrl = `${baseURL}/product/${values.productID}/definitionNew/${encodeURIComponent(oldName)}`;
            await axios.delete(delUrl);
          }
        } catch (delErr) {
          console.warn(`[ViewProductDefinition] Failed to delete component "${oldName}":`, delErr);
        }
      }

      // 3. Submit each component to local API or Eureka fallback
      for (const [compName, compData] of Object.entries(formattedComponents)) {
        if (!compName || !compName.trim()) continue;

        const payload = {
          componentID: compData.componentID || "",
          type: (compData.type || "").toLowerCase(),
          parameters: compData.parameters || {},
          note: compData.note || "",
          urls: Array.isArray(compData.urls) ? compData.urls.filter(Boolean) : (compData.urls ? [compData.urls] : []),
        };

        let url = `${productAPIBase}/product/${values.productID}/definitionNew/${encodeURIComponent(compName)}`;
        try {
          console.log(`[ViewProductDefinition] Updating component "${compName}" via local API: ${url}`);
          await axios.put(url, payload, { timeout: 4000 });
        } catch {
          url = `${baseURL}/product/${values.productID}/definitionNew/${encodeURIComponent(compName)}`;
          try {
            await axios.put(url, payload);
          } catch (fbErr) {
            console.warn(`Fallback PUT definitionNew failed for ${compName}:`, fbErr.message);
          }
        }
      }

      // 4. Also attempt PATCH /components as secondary update
      try {
        await axios.patch(
          `${baseURL}/product/${values.productID}/components`,
          formattedComponents,
          { timeout: 3000 }
        );
      } catch {
        // ignore
      }

      // 5. Synchronize localStorage cache (REPLACE, DO NOT MERGE!)
      try {
        const prodId = values.productID || productID;
        const prodName = values.productName || productName;
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
          let cached = {};
          try {
            if (stored) cached = JSON.parse(stored);
          } catch {
            // ignore
          }

          const firstComp = Object.values(formattedComponents)[0];
          if (firstComp) {
            if (firstComp.note) cached.note = firstComp.note;
            const u = Array.isArray(firstComp.urls) ? firstComp.urls.filter(Boolean) : (firstComp.urls ? [firstComp.urls] : []);
            if (u.length > 0) cached.urls = u;
          }
          cached.componentsPayload = { ...formattedComponents };
          cached.components = values.components.filter((c) => c.componentName && c.componentName.trim());
          if (cached.basicInformation) {
            cached.basicInformation.noOfComponents = cached.components.length;
          }
          cached.noOfComponents = cached.components.length;
          if (prodName) cached.productName = prodName;
          if (prodId) cached.productId = prodId;

          localStorage.setItem(key, JSON.stringify(cached));
        });
      } catch (cacheErr) {
        console.warn("[ViewProductDefinition] Cache sync error:", cacheErr);
      }

      // 6. Synchronize project file on disk if in Electron
      try {
        if (window.electronAPI?.filesystem?.readFile && window.electronAPI?.filesystem?.writeFile) {
          const pName = values.productName || productName || localStorage.getItem("activeProjectName") || "";
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

      window.dispatchEvent(new Event("storage"));
      window.dispatchEvent(new Event("innoide:refresh-filesystem"));
      window.dispatchEvent(new CustomEvent("product-definition-changed", {
        detail: { productID: values.productID, action: "updated" }
      }));

      setInitialValues((prev) => ({
        ...prev,
        components: values.components,
      }));

      alert("Product definition updated successfully!");
    } catch (error) {
      console.error("Error sending data to the server:", error);
      alert("Error submitting form. Please try again.");
      throw error;
    }
  };

  //   fetches and updates the form

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
        const resolvedProdId = targetProductId || productID || localStorage.getItem("activeProductId") || localStorage.getItem("activeProjectId");
        const resolvedProjId = localStorage.getItem("activeProjectId");
        const resolvedProdName = targetProductName || productName || localStorage.getItem("activeProductName") || localStorage.getItem("activeProjectName");

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
        console.warn("[ViewProductDefinition] Error reading cached note/urls:", cacheErr);
      }
    }

    const cleanUrls = urls.filter((u) => u !== undefined && u !== null);
    const finalUrls = cleanUrls.length > 0 ? cleanUrls : [""];

    return { note: note || "", urls: finalUrls };
  };

  const fetchProductDefinition = async (targetProductID) => {
    const idToFetch =
      targetProductID ||
      productID ||
      initialValues?.productID ||
      localStorage.getItem("activeProductId") ||
      localStorage.getItem("activeProjectId") ||
      "";

    if (!idToFetch) return;

    console.log("[ViewProductDefinition] Fetching definition for ID:", idToFetch);
    setLoading(true);

    try {
      const url = `${productAPIBase || baseURL || 'http://localhost:5004'}/product/${idToFetch}/definitionNew`;
      const response = await axios.get(url, { timeout: 4000 });

      console.log("[ViewProductDefinition] Received Data:", response.data);
      const convertedComponents = convertDataFromApi(response.data);

      const rawProd = response.data?.data || response.data;
      try {
        let existingCached = null;
        try {
          existingCached = JSON.parse(
            localStorage.getItem(`innoide:product_details_${idToFetch}`) ||
            localStorage.getItem(`innoide:product_details_${productName}`) ||
            localStorage.getItem('innoide:last_product_details') || "null"
          );
        } catch (e) {}

        const effectiveNote = 
          rawProd?.note || 
          rawProd?.notes || 
          rawProd?.productDesc || 
          convertedComponents[0]?.note || 
          existingCached?.note || 
          '';

        const effectiveUrls = 
          (Array.isArray(rawProd?.urls) && rawProd.urls.length > 0) ? rawProd.urls :
          (rawProd?.url ? [rawProd.url] :
          (convertedComponents[0]?.urls?.filter(Boolean)?.length > 0 ? convertedComponents[0].urls.filter(Boolean) :
          (existingCached?.urls || (existingCached?.urlLink ? [existingCached.urlLink] : []))));

        const prodDetails = {
          productId: idToFetch,
          productName: rawProd?.productName || productName || '',
          basicInformation: {
            noOfDevices: 1,
            noOfComponents: convertedComponents.length,
          },
          noOfDevices: 1,
          noOfComponents: convertedComponents.length,
          components: convertedComponents,
          note: effectiveNote,
          urls: effectiveUrls,
          createdAt: new Date().toISOString()
        };
        localStorage.setItem(`innoide:product_details_${idToFetch}`, JSON.stringify(prodDetails));
        if (productName) localStorage.setItem(`innoide:product_details_${productName}`, JSON.stringify(prodDetails));
        localStorage.setItem('innoide:last_product_details', JSON.stringify(prodDetails));
      } catch (storageErr) {}

      setInitialValues((prevValues) => ({
        ...prevValues,
        productID: idToFetch,
        productName: rawProd?.productName || productName || prevValues.productName,
        components: convertedComponents,
      }));
    } catch (error) {
      console.error("[ViewProductDefinition] Error fetching product definition (All servers failed):", error);
      // Attempt recovery from localStorage cache if network fails
      try {
        const cached = 
          JSON.parse(localStorage.getItem(`innoide:product_details_${idToFetch}`) || "null") ||
          JSON.parse(localStorage.getItem(`innoide:product_details_${productName}`) || "null") ||
          JSON.parse(localStorage.getItem('innoide:last_product_details') || "null");
        if (cached) {
          let convertedComponents = [];
          if (cached.componentsPayload && Object.keys(cached.componentsPayload).length > 0) {
            convertedComponents = convertDataFromApi({ components: cached.componentsPayload });
          } else if (Array.isArray(cached.components)) {
            convertedComponents = cached.components;
          }
          console.log("[ViewProductDefinition] Recovering from localStorage cache:", convertedComponents);
          setInitialValues((prevValues) => ({
            ...prevValues,
            productID: idToFetch,
            components: convertedComponents,
          }));
        }
      } catch (cacheErr) {}
    } finally {
      setLoading(false);
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
        productID,
        productName
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

  const effectiveId =
    productID ||
    initialValues?.productID ||
    localStorage.getItem("activeProductId") ||
    localStorage.getItem("activeProjectId") ||
    "";

  useEffect(() => {
    if (effectiveId) {
      fetchProductDefinition(effectiveId);
    }
  }, [effectiveId, refreshKey]);

  useEffect(() => {
    const handleProductDefinitionChanged = () => {
      console.log("[ViewProductDefinition] product-definition-changed event received, refreshing...");
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
    window.addEventListener("product-definition-changed", handleProductDefinitionChanged);
    window.addEventListener("storage", handleProductDefinitionChanged);
    return () => {
      window.removeEventListener("product-definition-changed", handleProductDefinitionChanged);
      window.removeEventListener("storage", handleProductDefinitionChanged);
    };
  }, [productID, initialValues?.productID]);

  useEffect(() => {
    setInitialValues((prev) => ({
      ...prev,
      productID: productID || prev.productID,
      productName: productName || prev.productName,
    }));
  }, [productID, productName]);

  useEffect(() => {
    return () => {
      sessionStorage.removeItem("productDefinition");
    };
  }, []);

  return (
    <Box>
      {!status ? (
        <div
          style={{ display: "flex", justifyContent: "center", width: "100%" }}
        >
          <div className=" rounded p-4 border" style={{ width: "100%" }}>
            <div className="d-flex justify-content-between align-items-center mb-4 px-2 border-bottom pb-3">
              <div>
                <h3 className="m-0 text-dark font-weight-bold">
                  {initialValues.productName || productName || "Product Definition"}
                </h3>
                <small className="text-muted">
                  View defined components and properties for this product.
                </small>
              </div>
              <Button
                size="sm"
                variant="outline"
                colorScheme="blue"
                onClick={() => {
                  const pid = effectiveId;
                  if (pid) fetchProductDefinition(pid);
                }}
                isLoading={loading}
                loadingText="Refreshing"
              >
                ↺ Refresh
              </Button>
            </div>

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
                    {() => (
                      <div>
                        {(!formik.values.components || formik.values.components.length === 0) ? (
                          <div className="text-center py-5 text-muted">
                            <p className="mb-1 fw-semibold">No components defined for this product.</p>
                            <small>You can add components using the &quot;ADD COMPONENT&quot; tab.</small>
                          </div>
                        ) : (
                          formik.values.components.map((component, index) => (
                          <div
                            key={index}
                            className="border p-3 mb-3 bg-light rounded"
                          >
                            <div>
                              <div className="form-floating mb-3">
                                <Field
                                  disabled
                                  as="select"
                                  className="form-select"
                                  name={`components[${index}].componentType`}
                                >
                                  {/* Ensure custom values from API are shown even if not in standard list */}
                                  <option value={component.componentType}>
                                    {component.componentType}
                                  </option>
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
                              </div>

                              <div className="form-floating mb-3">
                                <Field
                                  disabled
                                  as="select"
                                  className="form-select"
                                  name={`components[${index}].componentName`}
                                >
                                  <option value={component.componentName}>
                                    {component.componentName}
                                  </option>
                                  {electronicComponents
                                    .find(
                                      (category) =>
                                        category.type ===
                                        component.componentType
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
                              </div>

                              {Array.isArray(component.unit) &&
                                component.unit.length > 0 && (
                                  <div className="form-floating mb-3">
                                    <Field
                                      as="select"
                                      className="form-select"
                                      name={`components[${index}].unit`}
                                      disabled
                                    >
                                      {component.unit.map((unitOption, idx) => (
                                        <option key={idx} value={unitOption}>
                                          {unitOption}
                                        </option>
                                      ))}
                                    </Field>
                                    <label
                                      htmlFor={`components[${index}].unit`}
                                    >
                                      Unit
                                    </label>
                                  </div>
                                )}

                              {component.min !== undefined &&
                                component.max !== undefined && (
                                  <>
                                    <div className="form-floating mb-3">
                                      <Field
                                        type="number"
                                        className="form-control"
                                        name={`components[${index}].min`}
                                        disabled
                                      />
                                      <label
                                        htmlFor={`components[${index}].min`}
                                      >
                                        Minimum
                                      </label>
                                    </div>
                                    <div className="form-floating mb-3">
                                      <Field
                                        type="number"
                                        className="form-control"
                                        name={`components[${index}].max`}
                                        disabled
                                      />
                                      <label
                                        htmlFor={`components[${index}].max`}
                                      >
                                        Maximum
                                      </label>
                                    </div>
                                  </>
                                )}

                              <div className="form-floating mb-3">
                                <Field
                                  as="textarea"
                                  className="form-control"
                                  name={`components[${index}].note`}
                                  style={{ height: "70px" }}
                                  disabled
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
                                  disabled
                                />
                                <label htmlFor={`components[${index}].urls[0]`}>
                                  URL
                                </label>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                      </div>
                    )}
                  </FieldArray>
                </Form>
              )}
            </Formik>
          </div>
        </div>
      ) : (
        <SuccessMessage />
      )}
    </Box>
  );
};

export default ViewProductDefinition;

const SuccessMessage = () => {
  return (
    <Box
      display="flex"
      alignItems="center"
      bg="green.100"
      border="1px solid"
      borderColor="green.400"
      borderRadius="md"
      p={4}
      width="fit-content"
      boxShadow="md"
    >
      <Icon as={CheckCircleIcon} color="green.500" boxSize={6} mr={2} />
      <Text fontWeight="medium" color="green.700">
        Product updated successfully!
      </Text>
    </Box>
  );
};
