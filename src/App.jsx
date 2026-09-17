// import React, { useState } from "react";
// import { Routes, Route } from "react-router-dom";
// import "bootstrap/dist/css/bootstrap.min.css";
// import { ChakraProvider } from "@chakra-ui/react";
// import { AuthProvider } from "./contexts/AuthContext"; // ✅ import your AuthProvider

// import CodeEditor from "./components/CodeEditor";

// Auto-save system initialization
// import { autoSaveManager } from "./utils/autoSaveManager";
// import Home from "./components/Home";
// import Navbar from "./components/Navbar";
// import Footer from "./components/Footer";
// import Feedback from "./components/Feedback";
// import Template from "./components/Template";
// import Flowchart from "./components/Flowchart";
// import Flash from "./components/Flash";
// import Embedded from "./components/Embedded"; // Import Embedded component
// import BlockDiagram from "./components/BlockDiagram";
// import DefineProduct from "./components/DefineProduct";
// import TextBox from "./components/TextBox";
// import FileUpload from "./components/FileUpload";
// import Simulation from "./components/Simulation";
// import ForgotPassword from "./components/ForgotPassword";
// import CreateAccount from "./components/CreateAccount";
// import SimulationPopup from "./components/SimulationPopup";
// import TemplateOne from "./components/TemplateOne";
// import TemplateTwo from "./components/TemplateTwo";
// import DefineProductOne from "./components/DefineProductOne";
// import DefineProductTwo from "./components/DefineProductTwo";
// // import NavbarProductId from './components/NavbarProductId';
// import BlockDiagramTest from "./components/BlockDiagramTest";
// import FileExplorerOne from "./components/FileExplorerOne";
// import CreateProductDefination from "../src/components/Product/ProductDefinition/CreateProductDefinition";
// import VisualizeData from "./components/dataVisualization/VisualizeData";
// import Logout from "./components/Logout";
// import UserButton from "./components/UserButton";
// import EmbeddedFileManagement from "./components/EmbeddedFileManagement/EmbeddedFileManagement";
// import Toggle from "./components/Toggle/Toggle"
// import FlowchartTest from "./components/FlowchartTest";
// const App = () => {
//   const [currentPanel, setCurrentPanel] = useState("fileExplorer");

//   const handleToggleDebug = () => {
//     setCurrentPanel((prevPanel) =>
//       prevPanel === "debug" ? "fileExplorer" : "debug"
//     );
//   };

//   const handleToggleFlash = () => {
//     setCurrentPanel((prevPanel) =>
//       prevPanel === "flash" ? "fileExplorer" : "flash"
//     );
//   };

//   return (
//     <ChakraProvider>
//       {/* <Navbar />  */}

//       <Routes>
//         <Route path="/" element={<Home />} />
//         <Route path="/template" element={<Template />} />
//         <Route
//           path="/editor"
//           element={
//             <CodeEditor
//               currentPanel={currentPanel}
//               onDebugClick={handleToggleDebug}
//               onFlashClick={handleToggleFlash}
//             />
//           }
//         />
//         <Route path="/flowchart" element={<Flowchart />} />
//         <Route path="/feedback" element={<Feedback />} />{" "}
//         {/* Add the Feedback route */}
//         {/* <Route path="/embedded" element={<Embedded />} /> */}
//         {/* <Route path="/blockdiagram" element={<BlockDiagram />} /> */}
//         <Route path="/defineproduct" element={<DefineProduct />} />
//         <Route path="/textbox" element={<TextBox />} />
//         <Route path="/fileupload" element={<FileUpload />} />
//         <Route path="/simulation" element={<Simulation />} />
//         <Route path="/createaccount" element={<CreateAccount />} />
//         <Route path="/forgotpassword" element={<ForgotPassword />} />
//         <Route path="/simulationpopup" element={<SimulationPopup />} />
//         {/* <Route path="/templateone" element={<TemplateOne/>} />
// <Route path="/templatetwo" element={<TemplateTwo/>} /> */}
//         <Route path="/defineproductone" element={<DefineProductOne />} />
//         <Route path="/defineproducttwo" element={<DefineProductTwo />} />
//         {/* <Route path="/navbarproductid" element={<NavbarProductId/>} /> */}
//         <Route path="/blockdiagramtest" element={<BlockDiagram />} />
//         <Route path="/flowcharttest" element={<Flowchart />} />
//         <Route path="/fileexplorerone" element={<FileExplorerOne />} />
//         <Route
//           path="/createproductdefination"
//           element={<CreateProductDefination />}
//         />
//         <Route path="/view-data" element={<VisualizeData />} />
//         <Route path="/logout" element={<Logout />} />
//         <Route path="/userbutton" element={<UserButton />} />
//         <Route path="/embedded" element={<EmbeddedFileManagement />} />
//         <Route path="/toggle" element={<Toggle />} />

//       </Routes>

//       {/* <Footer />  */}
//     </ChakraProvider>
//   );
// };

// export default App;

import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ChakraProvider, Box } from "@chakra-ui/react";
import { AuthProvider } from "./contexts/AuthContext";
import { ProjectProvider } from "./ProjectContext";
import { WorkspaceStateProvider } from "./contexts/WorkspaceStateContext";
import { MeetingProvider } from "./contexts/MeetingContext";
import AutoSaveStatus from "./components/AutoSaveStatus";
import AutoSaveDemo from "./components/AutoSaveDemo";
import { autoSaveManager } from "./utils/autoSaveManager";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { useRouteRestoration } from "./hooks/useRouteRestoration";

import CodeEditor from "./components/CodeEditor";
import Home from "./components/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Feedback from "./components/Feedback";
import Template from "./components/Template";
// import Flowchart from "./components/Flowchart";
import Flash from "./components/Flash";
import Embedded from "./components/Embedded";
import BlockDiagram from "./components/BlockDiagram";
import DefineProduct from "./components/DefineProduct";
import TextBox from "./components/TextBox";
import FileUpload from "./components/FileUpload";
import Simulation from "./components/Simulation";
import ForgotPassword from "./components/ForgotPassword";
import CreateAccount from "./components/CreateAccount";
import SimulationPopup from "./components/SimulationPopup";
import TemplateOne from "./components/TemplateOne";
import TemplateTwo from "./components/TemplateTwo";
import DefineProductOne from "./components/DefineProductOne";
import DefineProductTwo from "./components/DefineProductTwo";
import BlockDiagramTest from "./components/BlockDiagramTest";
import FileExplorerOne from "./components/FileExplorerOne";
import CreateProductDefination from "./components/Product/ProductDefinition/CreateProductDefinition";
import VisualizeData from "./components/dataVisualization/VisualizeData";
import Logout from "./components/Logout";
import UserButton from "./components/UserButton";
import EmbeddedFileManagement from "./components/EmbeddedFileManagement/EmbeddedFileManagement";
import Toggle from "./components/Toggle/Toggle";
import FlowchartTest from "./components/FlowchartTest";
import BlockProgramming from "./components/BlockProgramming";
import MathCodeEditor from "./components/MathCodeEditor";
import MeetingPage from "./components/MeetingPage";
import RuleEnginePage from "./components/RuleEngine/RuleEnginePage";
import ESP32Flasher from "./components/ESP32Flasher";

const App = () => {
  const location = useLocation();
  const [currentPanel, setCurrentPanel] = useState("fileExplorer");

  // Restore the last active route after idle reloads / HMR / Electron restarts.
  // Must be called inside the router context (i.e. inside <App>).
  useRouteRestoration();
  const handleToggleDebug = () => {
    setCurrentPanel((prevPanel) =>
      prevPanel === "debug" ? "fileExplorer" : "debug",
    );
  };

  const handleToggleFlash = () => {
    setCurrentPanel((prevPanel) =>
      prevPanel === "flash" ? "fileExplorer" : "flash",
    );
  };

  // Initialize auto-save system and cleanup old data on app start
  useEffect(() => {
    // Clean up old auto-save data (older than 7 days)
    autoSaveManager.cleanup(7 * 24 * 60 * 60 * 1000);

    // Start global auto-save
    autoSaveManager.startGlobalAutoSave();

    console.log("[App] Auto-save system initialized");

    return () => {
      // Save all data before app unmounts
      autoSaveManager.saveAll({ parallel: false });
      console.log("[App] Auto-save cleanup completed");
    };
  }, []);

  return (
    <ChakraProvider>
      <ProjectProvider>
        <WorkspaceStateProvider>
          <AuthProvider>
            <MeetingProvider>
              <DndProvider backend={HTML5Backend}>
                <Box minH="100vh" display="flex" flexDirection="column" overflowX="hidden">
                  <Routes>
                    <Route path="/" element={<Home />} />
                <Route path="/template" element={<Template />} />

                <Route
                  path="/editor"
                  element={
                    <CodeEditor
                      currentPanel={currentPanel}
                      onDebugClick={handleToggleDebug}
                      onFlashClick={handleToggleFlash}
                    />
                  }
                />
                {/* <Route path="/Flowchartone" element={<Flowchartone />} /> */}
                <Route path="/FlowchartTest" element={<FlowchartTest />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/defineproduct" element={<DefineProduct />} />
                <Route path="/textbox" element={<TextBox />} />
                <Route path="/fileupload" element={<FileUpload />} />
                <Route path="/simulation" element={<Simulation />} />
                <Route path="/createaccount" element={<CreateAccount />} />
                <Route path="/forgotpassword" element={<ForgotPassword />} />
                <Route path="/simulationpopup" element={<SimulationPopup />} />
                <Route path="/defineproductone" element={<DefineProductOne />} />
                <Route path="/defineproducttwo" element={<DefineProductTwo />} />
                <Route path="/BlockDiagram" element={<BlockDiagramTest />} />
                {/* <Route path="/flowcharttest" element={<Flowchart />} />  */}
                <Route path="/blockprogramming" element={<BlockProgramming />} />
                <Route path="/fileexplorerone" element={<FileExplorerOne />} />
                <Route
                  path="/createproductdefination"
                  element={<CreateProductDefination />}
                />
                <Route path="/view-data" element={<VisualizeData />} />
                <Route path="/logout" element={<Logout />} />
                <Route path="/userbutton" element={<UserButton />} />
                <Route path="/embedded" element={<EmbeddedFileManagement />} />
                <Route
                  path="/embedded/manage"
                  element={<EmbeddedFileManagement />}
                />
                <Route path="/toggle" element={<Toggle />} />
                <Route path="/mathcodeeditor" element={<MathCodeEditor />} />
                <Route path="/meet" element={<MeetingPage />} />
                <Route path="/meet/:meetingId" element={<MeetingPage />} />
                <Route path="/rule-engine" element={<RuleEnginePage />} />
                <Route path="/flasher" element={<ESP32Flasher />} />

                <Route path="/autosave-demo" element={<AutoSaveDemo />} />
              </Routes>
            </Box>

            {/* AutoSaveStatus hidden on /simulation route per user request */}
            {location.pathname !== "/simulation" && (
              <AutoSaveStatus position="corner" />
            )}
              {/* <Footer /> */}
              </DndProvider>
            </MeetingProvider>
          </AuthProvider>
        </WorkspaceStateProvider>
      </ProjectProvider>
    </ChakraProvider>
  );
};

export default App;
