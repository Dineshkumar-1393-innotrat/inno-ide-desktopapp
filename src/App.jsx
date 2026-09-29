import React, { useState, useEffect, lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { ChakraProvider, Box, Spinner, Center } from "@chakra-ui/react";
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
import { ValidationProvider } from "./validation";

// Eagerly loaded core / lightweight components
import Home from "./components/Home";
import Feedback from "./components/Feedback";
import Template from "./components/Template";
import DefineProduct from "./components/DefineProduct";
import TextBox from "./components/TextBox";
import FileUpload from "./components/FileUpload";
import ForgotPassword from "./components/ForgotPassword";
import CreateAccount from "./components/CreateAccount";
import SimulationPopup from "./components/SimulationPopup";
import DefineProductOne from "./components/DefineProductOne";
import DefineProductTwo from "./components/DefineProductTwo";
import FileExplorerOne from "./components/FileExplorerOne";
import Logout from "./components/Logout";
import UserButton from "./components/UserButton";
import Toggle from "./components/Toggle/Toggle";

// Lazy-loaded heavy components for instant app startup & route transition performance
const CodeEditor = lazy(() => import("./components/CodeEditor"));
const BlockDiagramTest = lazy(() => import("./components/BlockDiagramTest"));
const FlowchartTest = lazy(() => import("./components/FlowchartTest"));
const Simulation = lazy(() => import("./components/Simulation"));
const BlockProgramming = lazy(() => import("./components/BlockProgramming"));
const MathCodeEditor = lazy(() => import("./components/MathCodeEditor"));
const MeetingPage = lazy(() => import("./components/MeetingPage"));
const RuleEnginePage = lazy(() => import("./components/RuleEngine/RuleEnginePage"));
const ESP32Flasher = lazy(() => import("./components/ESP32Flasher"));
const VisualizeData = lazy(() => import("./components/dataVisualization/VisualizeData"));
const CreateProductDefination = lazy(() => import("./components/Product/ProductDefinition/CreateProductDefinition"));
const EmbeddedFileManagement = lazy(() => import("./components/EmbeddedFileManagement/EmbeddedFileManagement"));

// Sleek fallback loader
const PageLoader = () => (
  <Center minH="80vh" w="100%">
    <Spinner size="xl" color="blue.500" thickness="3px" speed="0.8s" />
  </Center>
);

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
              <ValidationProvider>
                <DndProvider backend={HTML5Backend}>
                  <Box minH="100vh" display="flex" flexDirection="column" overflowX="hidden">
                    <Suspense fallback={<PageLoader />}>
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
                    </Suspense>
                  </Box>

                  {/* AutoSaveStatus hidden on /simulation route per user request */}
                  {location.pathname !== "/simulation" && (
                    <AutoSaveStatus position="corner" />
                  )}
                </DndProvider>
              </ValidationProvider>
            </MeetingProvider>
          </AuthProvider>
        </WorkspaceStateProvider>
      </ProjectProvider>
    </ChakraProvider>
  );
};

export default App;
