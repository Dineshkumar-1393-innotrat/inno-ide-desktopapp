import "../ProductDefinition/CreateProductDefinition.css";
import { electronicComponents } from "../ProductDefinition/electronicComponents";
import { useEffect, useState } from "react";
import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { Box, Center, Heading, Text, Button } from "@chakra-ui/react";
import { CheckCircleIcon } from "@chakra-ui/icons";
import { baseURL, productAPIBase } from "../../../utilities";

const ViewProductDefinition = ({ productID, productName }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // const getStoredValues = () => {
  //   const storedValues = sessionStorage.getItem("productDefinition");
  //   if (storedValues) {
  //     return JSON.parse(storedValues);
  //   }

  //   if (location.state?.productID && location.state?.deviceName) {
  //     const newValues = {
  //       productID: location.state.productID,
  //       deviceName: location.state.deviceName,
  //     };
  //     sessionStorage.setItem("productDefinition", JSON.stringify(newValues));
  //     return newValues;
  //   }

  //   return {
  //     productID: "",
  //     deviceName: "",
  //   };
  // };

  const [initialValues, setInitialValues] = useState({
    productID: productID,
    productName: productName,
    components: [],
  });

  const [status, setStatus] = useState(false);

  const convertDataToAPIFormat = async (values) => {
    const formattedComponents = {};
    values.components.forEach((component) => {
      formattedComponents[component.componentName] = {
        ...component,
        type: component.componentType.toLowerCase(),
      };
      delete formattedComponents[component.componentName].componentName;
      delete formattedComponents[component.componentName].componentType;
      if (formattedComponents[component.componentName].state === undefined) {
        delete formattedComponents[component.componentName].state;
      }
    });

    const resultData = {
      productID: values.productID,
      components: formattedComponents,
      productName: values.productName,
    };

    console.log("Result data:", resultData);

    try {
      const response = await axios.patch(
        `${baseURL}/product/${values.productID}/components`,
        resultData.components
      );
      console.log("Product definition successfully updated:", response.data);
    } catch (error) {
      console.error("Error sending data to the server:", error);
      alert("Error submitting form. Please try again.");
      throw error; // Re-throw to be caught by the form submission handler
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

  const fetchProductDefinition = async (productID) => {
    console.log("[ViewProductDefinition] Fetching definition for ID:", productID);

    try {
      const url = `${productAPIBase || baseURL || 'http://localhost:5004'}/product/${productID}/definitionNew`;
      const response = await axios.get(url, { timeout: 3000 });

      console.log("[ViewProductDefinition] Received Data:", response.data);
      const convertedComponents = convertDataFromApi(response.data);

      const rawProd = response.data?.data || response.data;
      try {
        let existingCached = null;
        try {
          existingCached = JSON.parse(
            localStorage.getItem(`innoide:product_details_${productID}`) ||
            localStorage.getItem(`innoide:product_details_${productName}`) ||
            localStorage.getItem('innoide:last_product_details') || "null"
          );
        } catch (e) {}

        const effectiveNote = 
          rawProd.note || 
          rawProd.notes || 
          rawProd.productDesc || 
          convertedComponents[0]?.note || 
          existingCached?.note || 
          '';

        const effectiveUrls = 
          (Array.isArray(rawProd.urls) && rawProd.urls.length > 0) ? rawProd.urls :
          (rawProd.url ? [rawProd.url] :
          (convertedComponents[0]?.urls?.filter(Boolean)?.length > 0 ? convertedComponents[0].urls.filter(Boolean) :
          (existingCached?.urls || (existingCached?.urlLink ? [existingCached.urlLink] : []))));

        const prodDetails = {
          productId: productID,
          productName: rawProd.productName || productName || '',
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
        localStorage.setItem(`innoide:product_details_${productID}`, JSON.stringify(prodDetails));
        if (productName) localStorage.setItem(`innoide:product_details_${productName}`, JSON.stringify(prodDetails));
        localStorage.setItem('innoide:last_product_details', JSON.stringify(prodDetails));
      } catch (storageErr) {}

      setInitialValues((prevValues) => ({
        ...prevValues,
        components: convertedComponents,
      }));
    } catch (error) {
      console.error("[ViewProductDefinition] Error fetching product definition (All servers failed):", error);
      // Attempt recovery from localStorage cache if network fails
      try {
        const cached = 
          JSON.parse(localStorage.getItem(`innoide:product_details_${productID}`) || "null") ||
          JSON.parse(localStorage.getItem(`innoide:product_details_${productName}`) || "null") ||
          JSON.parse(localStorage.getItem('innoide:last_product_details') || "null");
        if (cached && (cached.componentsPayload || cached.components)) {
          console.log("[ViewProductDefinition] Recovering from localStorage cache:", cached);
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

  useEffect(() => {
    // console.log(productID);

    if (initialValues?.productID !== null) {
      fetchProductDefinition(initialValues.productID);
    }
  }, [initialValues?.productID]);

  useEffect(() => {
    // const values = getStoredValues();
    setInitialValues({
      productID: productID,
      productName: productName,
      components: [],
    });
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
            <h3 className="m-4 text-dark text-center">
              {initialValues.productName}
            </h3>

            <Formik
              initialValues={initialValues}
              onSubmit={async (values, { setSubmitting }) => {
                try {
                  await convertDataToAPIFormat(values);
                  alert("Product updated successfully");
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
                        ))}
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
