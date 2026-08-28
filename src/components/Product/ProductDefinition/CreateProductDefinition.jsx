// // import "./CreateProductDefinition.css";
import { API } from '@/config';
// // import { electronicComponents } from "./electronicComponents";
// // import { useEffect, useState } from "react";
// // import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
// // // import Button from "@mui/material/Button";
// // import axios from "axios";

// // const CreateProductDefinition = ({
// //   productID = "12344",
// //   productName = "Test Product",
// // }) => {
// //   const [visibleComponents, setVisibleComponents] = useState([]);

// //   const [initialValues, setInitialValues] = useState({
// //     productID: productID,

// //     components: [],
// //   });

// //   const toggleVisibility = (index) => {
// //     setVisibleComponents((prev) =>
// //       prev.includes(index)
// //         ? prev.filter((id) => id !== index)
// //         : [...prev, index]
// //     );
// //   };

// //   const convertDataToAPIFormat = async (values) => {
// //     const formattedComponents = {};
// //     values.components.forEach((component) => {
// //       formattedComponents[component.componentName] = {
// //         ...component,
// //         type: component.componentType.toLowerCase(),
// //       };
// //       delete formattedComponents[component.componentName].componentName;
// //       delete formattedComponents[component.componentName].componentType;
// //       if (formattedComponents[component.componentName].state === undefined) {
// //         delete formattedComponents[component.componentName].state;
// //       }
// //     });

// //     const resultData = {
// //       productID: values.productID,
// //       components: formattedComponents,
// //       productName: productName,
// //     };

// //     console.log(resultData);

// //     try {
// //       const response = await axios.post(
// //         `${API.MAIN}/product/:productID/definitionNewNew`,
// //         resultData
// //       );
// //       console.log("Data successfully sent to the server:", response.data);
// //     } catch (error) {
// //       console.error("Error sending data to the server:", error);
// //     }
// //   };

// //   useEffect(() => {
// //     setInitialValues({
// //       productID: productID,
// //       productName: productName,
// //       components: [],
// //     });
// //   }, [productID]);

// //   return (
// //     <div className="m-4 rounded p-4 border w-50">
// //       <h3 className="m-4 text-dark text-center">{productName}</h3>

// //       <Formik
// //         initialValues={initialValues}
// //         onSubmit={async (values) => {
// //           convertDataToAPIFormat(values);
// //         }}
// //       >
// //         {(formik) => (
// //           <Form onSubmit={formik.handleSubmit}>

// //             <FieldArray name="components">
// //               {(helperMethod) => (
// //                 <div>
// //                   {formik.values.components?.map((component, index) => (
// //                     <div
// //                       key={index}
// //                       className="border p-3 mb-3 bg-light rounded"
// //                     >
// //                       <button
// //                         className={`btn ${
// //                           visibleComponents.includes(index)
// //                             ? "btn-secondary"
// //                             : "btn-primary"
// //                         } mb-3 `}
// //                         onClick={() => toggleVisibility(index)}
// //                       >
// //                         {visibleComponents.includes(index)
// //                           ? "Hide Component"
// //                           : "View Component"}
// //                       </button>

// //                       {visibleComponents.includes(index) && (
// //                         <>
// //                           {/* Component ID */}
// //                           <div className="form-floating mb-3">
// //                             <Field
// //                               type="text"
// //                               className="form-control"
// //                               name={`components[${index}].componentID`}
// //                               required
// //                             />
// //                             <label htmlFor={`components[${index}].componentID`}>
// //                               Component ID
// //                             </label>
// //                             <ErrorMessage
// //                               name={`components[${index}].componentID`}
// //                               component="div"
// //                               className="text-danger"
// //                             />
// //                           </div>

// //                           {/* Component Type */}
// //                           <div className="form-floating mb-3">
// //                             <Field
// //                               as="select"
// //                               className="form-select"
// //                               name={`components[${index}].componentType`}
// //                               onChange={(e) => {
// //                                 formik.handleChange(e);
// //                                 helperMethod.replace(index, {
// //                                   ...component,
// //                                   componentType: e.target.value,
// //                                   componentName: "",
// //                                   unit: undefined,
// //                                   min: undefined,
// //                                   max: undefined,
// //                                 });
// //                               }}
// //                             >
// //                               <option value="" disabled>
// //                                 -- Select Component Type --
// //                               </option>
// //                               {electronicComponents.map((category, idx) => (
// //                                 <option key={idx} value={category.type}>
// //                                   {category.type}
// //                                 </option>
// //                               ))}
// //                             </Field>
// //                             <label
// //                               htmlFor={`components[${index}].componentType`}
// //                             >
// //                               Component Type
// //                             </label>
// //                             <ErrorMessage
// //                               name={`components[${index}].componentType`}
// //                               component="div"
// //                               className="text-danger"
// //                             />
// //                           </div>

// //                           {/* Component Name */}
// //                           {component.componentType && (
// //                             <div className="form-floating mb-3">
// //                               <Field
// //                                 as="select"
// //                                 className="form-select"
// //                                 name={`components[${index}].componentName`}
// //                                 onChange={(e) => {
// //                                   formik.handleChange(e);
// //                                   const selectedComponent = electronicComponents
// //                                     .find(
// //                                       (cat) =>
// //                                         cat.type === component.componentType
// //                                     )
// //                                     ?.components.find(
// //                                       (comp) => comp.name === e.target.value
// //                                     );

// //                                   helperMethod.replace(index, {
// //                                     ...component,
// //                                     componentName: e.target.value,
// //                                     unit: selectedComponent?.unit || undefined,
// //                                     min: selectedComponent?.unit
// //                                       ? ""
// //                                       : undefined,
// //                                     max: selectedComponent?.unit
// //                                       ? ""
// //                                       : undefined,
// //                                   });
// //                                 }}
// //                               >
// //                                 <option value="" disabled>
// //                                   -- Select Component --
// //                                 </option>
// //                                 {electronicComponents
// //                                   .find(
// //                                     (category) =>
// //                                       category.type === component.componentType
// //                                   )
// //                                   ?.components.map((comp, idx) => (
// //                                     <option key={idx} value={comp.name}>
// //                                       {comp.name}
// //                                     </option>
// //                                   ))}
// //                               </Field>
// //                               <label
// //                                 htmlFor={`components[${index}].componentName`}
// //                               >
// //                                 Component Name
// //                               </label>
// //                               <ErrorMessage
// //                                 name={`components[${index}].componentName`}
// //                                 component="div"
// //                                 className="text-danger"
// //                               />
// //                             </div>
// //                           )}

// //                           {/* Unit Selection */}
// //                           {component.unit && (
// //                             <div className="form-floating mb-3">
// //                               <Field
// //                                 as="select"
// //                                 className="form-select"
// //                                 name={`components[${index}].unit`}
// //                               >
// //                                 <option value="" disabled>
// //                                   -- Select Unit --
// //                                 </option>
// //                                 {component.unit?.map((unitOption, idx) => (
// //                                   <option key={idx} value={unitOption}>
// //                                     {unitOption}
// //                                   </option>
// //                                 ))}
// //                               </Field>
// //                               <label htmlFor={`components[${index}].unit`}>
// //                                 Unit
// //                               </label>
// //                             </div>
// //                           )}

// //                           {/* Min and Max Fields */}
// //                           {component.unit && component.unit !== "boolean" && (
// //                             <>
// //                               <div className="form-floating mb-3">
// //                                 <Field
// //                                   type="number"
// //                                   className="form-control"
// //                                   name={`components[${index}].min`}
// //                                 />
// //                                 <label htmlFor={`components[${index}].min`}>
// //                                   Minimum
// //                                 </label>
// //                                 <ErrorMessage
// //                                   name={`components[${index}].min`}
// //                                   component="div"
// //                                   className="text-danger"
// //                                 />
// //                               </div>

// //                               <div className="form-floating mb-3">
// //                                 <Field
// //                                   type="number"
// //                                   className="form-control"
// //                                   name={`components[${index}].max`}
// //                                 />
// //                                 <label htmlFor={`components[${index}].max`}>
// //                                   Maximum
// //                                 </label>
// //                                 <ErrorMessage
// //                                   name={`components[${index}].max`}
// //                                   component="div"
// //                                   className="text-danger"
// //                                 />
// //                               </div>
// //                             </>
// //                           )}

// //                           {/* Remove Component Button */}
// //                           <button
// //                             variant="outlined"
// //                             color="warning"
// //                             className=" mb-3"
// //                             type="button"
// //                             onClick={() => helperMethod.remove(index)}
// //                           >
// //                             Remove Component
// //                           </button>
// //                         </>
// //                       )}
// //                     </div>
// //                   ))}

// //                   {/* Add Component Button */}
// //                   <button
// //                     // variant="outlined"
// //                     color="success"
// //                     className="mb-3 w-100"
// //                     onClick={() =>
// //                       helperMethod.push({
// //                         componentID: "",
// //                         componentType: "",
// //                         componentName: "",
// //                         unit: undefined,
// //                         min: undefined,
// //                         max: undefined,
// //                       })
// //                     }
// //                   >
// //                     Add Component
// //                   </button>
// //                 </div>
// //               )}
// //             </FieldArray>

// //             <button type="submit" variant="contained" className=" w-100">
// //               Submit
// //             </button>
// //           </Form>
// //         )}
// //       </Formik>
// //     </div>
// //   );
// // };

// // export default CreateProductDefinition;

// import "./CreateProductDefinition.css";
// import { electronicComponents } from "./electronicComponents";
// import { useEffect, useState } from "react";
// import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
// import axios from "axios";
// import { useLocation } from "react-router-dom";

// const CreateProductDefinition = () => {
//   const location = useLocation();
//   const [visibleComponents, setVisibleComponents] = useState([]);

//   // Get values from props and session storage
//   const getStoredValues = () => {
//     const storedValues = sessionStorage.getItem('productDefinition');
//     if (storedValues) {
//       return JSON.parse(storedValues);
//     }

//     // If no stored values, use values from location state
//     if (location.state?.productID && location.state?.deviceName) {
//       const newValues = {
//         productID: location.state.productID,
//         deviceName: location.state.deviceName,
//       };
//       // Store in session storage
//       sessionStorage.setItem('productDefinition', JSON.stringify(newValues));
//       return newValues;
//     }

//     // Fallback default values
//     return {
//       productID: "",
//       deviceName: "",
//     };
//   };

//   const [initialValues, setInitialValues] = useState({
//     productID: getStoredValues().productID,
//     deviceName: getStoredValues().deviceName,
//     components: [],
//   });

//   const toggleVisibility = (index) => {
//     setVisibleComponents((prev) =>
//       prev.includes(index)
//         ? prev.filter((id) => id !== index)
//         : [...prev, index]
//     );
//   };

//   const convertDataToAPIFormat = async (values) => {
//     const formattedComponents = {};
//     values.components.forEach((component) => {
//       formattedComponents[component.componentName] = {
//         ...component,
//         type: component.componentType.toLowerCase(),
//       };
//       delete formattedComponents[component.componentName].componentName;
//       delete formattedComponents[component.componentName].componentType;
//       if (formattedComponents[component.componentName].state === undefined) {
//         delete formattedComponents[component.componentName].state;
//       }
//     });

//     const resultData = {
//       productID: values.productID,
//       components: formattedComponents,
//       deviceName: values.deviceName,
//     };

//     console.log(resultData);

//     try {
//       const response = await axios.post(
//         `${API.MAIN}/product/${values.productID}/definition`,
//         resultData
//       );
//       console.log("Data successfully sent to the server:", response.data);
//     } catch (error) {
//       console.error("Error sending data to the server:", error);
//     }
//   };

//   useEffect(() => {
//     const values = getStoredValues();
//     setInitialValues({
//       productID: values.productID,
//       deviceName: values.deviceName,
//       components: [],
//     });
//   }, [location.state]);

//   // Clear session storage when component unmounts
//   useEffect(() => {
//     return () => {
//       sessionStorage.removeItem('productDefinition');
//     };
//   }, []);

//   return (
//     <div className="m-4 rounded p-4 border w-50">
//       <h3 className="m-4 text-dark text-center">{initialValues.deviceName}</h3>

//       <Formik
//         initialValues={initialValues}
//         onSubmit={async (values) => {
//           convertDataToAPIFormat(values);
//         }}
//         enableReinitialize
//       >
//         {(formik) => (
//           <Form onSubmit={formik.handleSubmit}>
//             <FieldArray name="components">
//               {(helperMethod) => (
//                 <div>
//                   {formik.values.components?.map((component, index) => (
//                     <div
//                       key={index}
//                       className="border p-3 mb-3 bg-light rounded"
//                     >
//                       <button
//                         type="button"
//                         className={`btn ${
//                           visibleComponents.includes(index)
//                             ? "btn-secondary"
//                             : "btn-primary"
//                         } mb-3 `}
//                         onClick={() => toggleVisibility(index)}
//                       >
//                         {visibleComponents.includes(index)
//                           ? "Hide Component"
//                           : "View Component"}
//                       </button>

//                       {visibleComponents.includes(index) && (
//                         <>
//                           {/* Component ID */}
//                           <div className="form-floating mb-3">
//                             <Field
//                               type="text"
//                               className="form-control"
//                               name={`components[${index}].componentID`}
//                               required
//                             />
//                             <label htmlFor={`components[${index}].componentID`}>
//                               Component ID
//                             </label>
//                             <ErrorMessage
//                               name={`components[${index}].componentID`}
//                               component="div"
//                               className="text-danger"
//                             />
//                           </div>

//                           {/* Component Type */}
//                           <div className="form-floating mb-3">
//                             <Field
//                               as="select"
//                               className="form-select"
//                               name={`components[${index}].componentType`}
//                               onChange={(e) => {
//                                 formik.handleChange(e);
//                                 helperMethod.replace(index, {
//                                   ...component,
//                                   componentType: e.target.value,
//                                   componentName: "",
//                                   unit: undefined,
//                                   min: undefined,
//                                   max: undefined,
//                                 });
//                               }}
//                             >
//                               <option value="" disabled>
//                                 -- Select Component Type --
//                               </option>
//                               {electronicComponents.map((category, idx) => (
//                                 <option key={idx} value={category.type}>
//                                   {category.type}
//                                 </option>
//                               ))}
//                             </Field>
//                             <label htmlFor={`components[${index}].componentType`}>
//                               Component Type
//                             </label>
//                             <ErrorMessage
//                               name={`components[${index}].componentType`}
//                               component="div"
//                               className="text-danger"
//                             />
//                           </div>

//                           {/* Component Name */}
//                           {component.componentType && (
//                             <div className="form-floating mb-3">
//                               <Field
//                                 as="select"
//                                 className="form-select"
//                                 name={`components[${index}].componentName`}
//                                 onChange={(e) => {
//                                   formik.handleChange(e);
//                                   const selectedComponent = electronicComponents
//                                     .find(
//                                       (cat) =>
//                                         cat.type === component.componentType
//                                     )
//                                     ?.components.find(
//                                       (comp) => comp.name === e.target.value
//                                     );

//                                   helperMethod.replace(index, {
//                                     ...component,
//                                     componentName: e.target.value,
//                                     unit: selectedComponent?.unit || undefined,
//                                     min: selectedComponent?.unit
//                                       ? ""
//                                       : undefined,
//                                     max: selectedComponent?.unit
//                                       ? ""
//                                       : undefined,
//                                   });
//                                 }}
//                               >
//                                 <option value="" disabled>
//                                   -- Select Component --
//                                 </option>
//                                 {electronicComponents
//                                   .find(
//                                     (category) =>
//                                       category.type === component.componentType
//                                   )
//                                   ?.components.map((comp, idx) => (
//                                     <option key={idx} value={comp.name}>
//                                       {comp.name}
//                                     </option>
//                                   ))}
//                               </Field>
//                               <label htmlFor={`components[${index}].componentName`}>
//                                 Component Name
//                               </label>
//                               <ErrorMessage
//                                 name={`components[${index}].componentName`}
//                                 component="div"
//                                 className="text-danger"
//                               />
//                             </div>
//                           )}

//                           {/* Unit Selection */}
//                           {component.unit && (
//                             <div className="form-floating mb-3">
//                               <Field
//                                 as="select"
//                                 className="form-select"
//                                 name={`components[${index}].unit`}
//                               >
//                                 <option value="" disabled>
//                                   -- Select Unit --
//                                 </option>
//                                 {component.unit?.map((unitOption, idx) => (
//                                   <option key={idx} value={unitOption}>
//                                     {unitOption}
//                                   </option>
//                                 ))}
//                               </Field>
//                               <label htmlFor={`components[${index}].unit`}>
//                                 Unit
//                               </label>
//                             </div>
//                           )}

//                           {/* Min and Max Fields */}
//                           {component.unit && component.unit !== "boolean" && (
//                             <>
//                               <div className="form-floating mb-3">
//                                 <Field
//                                   type="number"
//                                   className="form-control"
//                                   name={`components[${index}].min`}
//                                 />
//                                 <label htmlFor={`components[${index}].min`}>
//                                   Minimum
//                                 </label>
//                                 <ErrorMessage
//                                   name={`components[${index}].min`}
//                                   component="div"
//                                   className="text-danger"
//                                 />
//                               </div>

//                               <div className="form-floating mb-3">
//                                 <Field
//                                   type="number"
//                                   className="form-control"
//                                   name={`components[${index}].max`}
//                                 />
//                                 <label htmlFor={`components[${index}].max`}>
//                                   Maximum
//                                 </label>
//                                 <ErrorMessage
//                                   name={`components[${index}].max`}
//                                   component="div"
//                                   className="text-danger"
//                                 />
//                               </div>
//                             </>
//                           )}

//                           {/* Remove Component Button */}
//                           <button
//                             type="button"
//                             className="btn btn-warning mb-3"
//                             onClick={() => helperMethod.remove(index)}
//                           >
//                             Remove Component
//                           </button>
//                         </>
//                       )}
//                     </div>
//                   ))}

//                   {/* Add Component Button */}
//                   <button
//                     type="button"
//                     className="btn btn-success mb-3 w-100"
//                     onClick={() =>
//                       helperMethod.push({
//                         componentID: "",
//                         componentType: "",
//                         componentName: "",
//                         unit: undefined,
//                         min: undefined,
//                         max: undefined,
//                       })
//                     }
//                   >
//                     Add Component
//                   </button>
//                 </div>
//               )}
//             </FieldArray>

//             <button type="submit" className="btn btn-primary w-100">
//               Submit
//             </button>
//           </Form>
//         )}
//       </Formik>
//     </div>
//   );
// };

// export default CreateProductDefinition;

import "./CreateProductDefinition.css";
import { electronicComponents } from "./electronicComponents";
import { useEffect, useState } from "react";
import { Formik, Field, Form, FieldArray, ErrorMessage } from "formik";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import Navbarone from "../../Navbarone";
import { Box, Center, Heading, Text } from "@chakra-ui/react";
import Ellipse521 from "../../../images/Ellipse 521.svg";
import Footer from "../../Footer";
import { Button } from "@chakra-ui/react";
import { getUserInfo } from "../../../utilities";
import { useProject } from "../../../ProjectContext";
import { baseURL } from "../../../utilities";

const CreateProductDefinition = ({
  productID,
  productName,
  onClose,
  fetchFileSystem,
  setIsProductDefined,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [visibleComponents, setVisibleComponents] = useState([]);
  const [userId, setUserId] = useState(null);

  const { activeProjectId } = useProject();

  const getStoredValues = () => {
    const storedValues = sessionStorage.getItem("productDefinition");
    if (storedValues) {
      return JSON.parse(storedValues);
    }

    if (location.state?.productID && location.state?.deviceName) {
      const newValues = {
        productID: location.state.productID,
        productName: productName,
      };
      sessionStorage.setItem("productDefinition", JSON.stringify(newValues));
      return newValues;
    }

    return {
      productID: "",
      productName: "",
    };
  };

  const [initialValues, setInitialValues] = useState({
    productID: productID,
    productName: productName,
    components: [],
  });

  const toggleVisibility = (index) => {
    setVisibleComponents((prev) =>
      prev.includes(index)
        ? prev.filter((id) => id !== index)
        : [...prev, index]
    );
  };

  const convertDataToAPIFormat = async (values) => {
    const formattedComponents = {};
    values.components.forEach((component) => {
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
      productName: values.productName,
    };

    console.log("result data", resultData);

    try {
      const response = await axios.post(
        `${baseURL}/product/${values.productID}/definitionNew`,
        resultData
      );
      console.log("Data successfully sent to the server:", response.data);

      alert("Prodcut defined successfuly!");

      if (userId && typeof fetchFileSystem === "function") await fetchFileSystem(userId);

      setIsProductDefined(() => true);

      // close modal on success
      onClose();
    } catch (error) {
      console.error(
        "Error sending data to the server:",
        error.response.data.message
      );
      alert("Error submitting form. Please try again.");
      throw error; // Re-throw to be caught by the form submission handler
    }
  };

  useEffect(() => {
    // const values = getStoredValues();
    setInitialValues({
      productID: productID,
      productName: productName,
      components: [],
    });
  }, [productID]);

  useEffect(() => {
    return () => {
      const userInfo = getUserInfo();
      if (userInfo && typeof fetchFileSystem === "function") {
        fetchFileSystem(userInfo.userId);
      }
    };
  }, [fetchFileSystem]);

  return (
    <Box>
      {/* <Box
        position="relative"
        top={4}
        left={0}
        width="100%"
        height="65px"
        borderBottom="1px solid gray"
        display="flex"
        alignItems="center"
        padding="0 20px"
        zIndex={1000}
      >
        <Text fontWeight="bold" fontSize="lg">
         
          <img
            src={Ellipse521}
            alt="Innoide"
            style={{ maxWidth: "35%", height: "auto" }}
          />
        </Text>
      </Box> */}

      <div style={{ display: "flex", justifyContent: "center" }}>
        <div className=" rounded p-4 border w-100">
          {/* <h3 className="m-4 text-dark text-center">
            {initialValues.productName}
          </h3> */}

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
                    <div
                    // style={{
                    //   display: "grid",
                    //   gridTemplateColumns:
                    //     "repeat(auto-fill, minmax(300px, 1fr))",
                    //   gap: "1rem",
                    // }}
                    >
                      {formik.values.components?.map((component, index) => (
                        <div
                          key={index}
                          className="border p-3 mb-3 bg-light rounded"
                        >
                          {/* <button
                        type="button"
                        className={`btn ${
                          visibleComponents.includes(index)
                            ? "btn-secondary"
                            : "btn-primary"
                        } mb-3 `}
                        onClick={() => toggleVisibility(index)}
                      >
                        {visibleComponents.includes(index)
                          ? "Hide Component"
                          : "View Component"}
                      </button> */}
                          {/* {visibleComponents.includes(index) && ( */}
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

                            {component.unit && (
                              <div className="form-floating mb-3">
                                <Field
                                  as="select"
                                  className="form-select"
                                  name={`components[${index}].unit`}
                                >
                                  <option value="" disabled>
                                    -- Select Unit --
                                  </option>
                                  {component.unit?.map((unitOption, idx) => (
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
                            <Center>
                              <Button
                                // type="button"
                                // className="btn btn-warning mb-3 w-100"
                                variant={"outline"}
                                colorScheme="red"
                                size={"sm"}
                                onClick={() => helperMethod.remove(index)}
                              >
                                Remove Component
                              </Button>
                            </Center>
                          </div>
                        </div>
                      ))}

                      {/* <div className="mb-3"> */}
                      <Button
                        className="w-100 mb-3"
                        variant={"outline"}
                        size="sm"
                        colorScheme={"green"}
                        onClick={() =>
                          helperMethod.push({
                            componentID: "",
                            componentType: "",
                            componentName: "",
                            unit: undefined,
                            min: undefined,
                            max: undefined,
                          })
                        }
                      >
                        Add Component
                      </Button>
                      {/* </div> */}
                    </div>
                  )}
                </FieldArray>

                {/* <div
                  style={{
                    display: "flex",

                    justifyContent: "center",
                  }}
                > */}
                <Button
                  type="submit"
                  className=" w-100 "
                  disabled={formik.isSubmitting}
                  colorScheme="blue"
                  size={"sm"}
                >
                  {formik.isSubmitting ? "Submitting..." : "Submit"}
                </Button>
                {/* </div> */}
              </Form>
            )}
          </Formik>
        </div>
      </div>
      {/* <Footer /> */}
    </Box>
  );
};

export default CreateProductDefinition;
