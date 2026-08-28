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

  const fetchProductDefinition = async (productID) => {
    console.log("[ViewProductDefinition] Fetching definition for ID:", productID);

    try {
      let response;
      const localUrl = `${productAPIBase}/product/${productID}/definitionNew`;
      
      try {
        console.log(`[ViewProductDefinition] Attempting local fetch: ${localUrl}`);
        response = await axios.get(localUrl, { timeout: 4000 });
      } catch (localError) {
        console.warn("[ViewProductDefinition] Local fetch failed/timed out, trying Eureka fallback...");
        // Use definitionNew for fallback as requested
        const fallbackUrl = `${baseURL}/product/${productID}/definitionNew`;
        console.log(`[ViewProductDefinition] Attempting fallback fetch: ${fallbackUrl}`);
        response = await axios.get(fallbackUrl);
      }

      console.log("[ViewProductDefinition] Received Data:", response.data);
      const convertedComponents = convertDataFromApi(response.data);

      setInitialValues((prevValues) => ({
        ...prevValues,
        components: convertedComponents,
      }));
    } catch (error) {
      console.error("[ViewProductDefinition] Error fetching product definition (All servers failed):", error);
    }
  };

  const convertDataFromApi = (apiDataRaw) => {
    // Support both { ... } and { data: { ... } } structures
    const apiData = apiDataRaw?.data || apiDataRaw;
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

      // 2. Initialize formatted component
      // Note/URLs may live inside the component OR at the top-level product (fallback)
      // Check both lowercase and capitalized variants, and common alternatives
      let componentNote = component.note || component.Note || component.notes || component.Notes || apiData.note || apiData.Note || "";
      
      let componentUrls = [];
      if (Array.isArray(component.urls) && component.urls.length > 0) {
        componentUrls = component.urls;
      } else if (Array.isArray(component.Urls) && component.Urls.length > 0) {
        componentUrls = component.Urls;
      } else if (component.urls && typeof component.urls === "string") {
        componentUrls = [component.urls];
      } else if (component.url && typeof component.url === "string") {
        componentUrls = [component.url];
      } else if (Array.isArray(apiData.urls) && apiData.urls.length > 0) {
        componentUrls = apiData.urls;
      } else if (Array.isArray(apiData.Urls) && apiData.Urls.length > 0) {
        componentUrls = apiData.Urls;
      }

      let formattedComponent = {
        componentID: component.componentID || component.id || "",
        componentType,
        componentName,
        note: componentNote,
        urls: componentUrls,
      };

      // 3. Extract parameters (min, max, unit)
      // They might be at the root, or inside 'parameters', or inside a named object (like 'distance')
      let params = component.parameters || {};
      
      // If no 'parameters' key, check other keys that are objects (like the 'distance' object in user's example)
      if (Object.keys(params).length === 0) {
        Object.keys(component).forEach(key => {
          if (typeof component[key] === 'object' && component[key] !== null && !Array.isArray(component[key])) {
            // Found an object key (e.g., 'distance'), merge its contents if it has min/max/unit
            if (component[key].min !== undefined || component[key].max !== undefined || component[key].unit !== undefined) {
              params = { ...params, ...component[key] };
            }
          }
        });
      }

      // Fallback: Check component root for min/max/unit (standard structure)
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
