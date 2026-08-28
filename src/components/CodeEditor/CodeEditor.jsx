import { useRef, useState, useEffect } from "react";
import {
  Box,
  Flex,
  HStack,
  IconButton,
  useColorMode,
  Text,
  Tooltip,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Button,
} from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { AddIcon, CloseIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";

import Debug from "../Debug";
import Flash from "../Flash";
import MenuSidebar from "../MenuSidebar/MenuSidebar";
import LanguageSelector from "../LanguageSelector";
import { CODE_SNIPPETS, MONACO_LANGUAGE_MAP } from "../../constants";
import Output from "../Output";
import IconBar from "../IconBar";

const CodeEditor = ({
  currentPanel,
  onDebugClick,
  onFlashClick,
  value,
  selectedFile,
  setSelectedFile,
  updateFileContent,
}) => {
  const editorRef = useRef();
  const [tabs, setTabs] = useState([
    { id: 1, name: "Tab 1", content: CODE_SNIPPETS["C"] || "" },
  ]);
  const [activeTab, setActiveTab] = useState(1);
  const [language, setLanguage] = useState("Select Language");
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const [openFiles, setOpenFiles] = useState([]);

  const [editorValue, setEditorValue] = useState(value?.content || "");
  const updateTimeoutRef = useRef(null);

  useEffect(() => {
    setEditorValue(value?.content || "");
  }, [value]);

  const handleEditorChange = (newValue) => {
    setEditorValue(newValue);

    // Clear previous timeout if the user is still typing
    if (updateTimeoutRef.current) {
      clearTimeout(updateTimeoutRef.current);
    }

    // Set a new timeout to update the file content after 5 seconds
    updateTimeoutRef.current = setTimeout(() => {
      updateFileContent(value?.name, newValue, value?._id);
    }, 5000);
  };

  // Handle file selection from sidebar
  useEffect(() => {
    if (
      selectedFile &&
      !openFiles.some((file) => file.name === selectedFile.name)
    ) {
      setOpenFiles([...openFiles, selectedFile]);
    }
  }, [selectedFile]);

  //   handle tab close

  const handleCloseTab = (fileName) => {
    setOpenFiles(openFiles.filter((file) => file.name !== fileName));
  };

  const MAX_TABS = 10;

  const onSelect = (selectedLanguage) => {
    setLanguage(selectedLanguage);
    const updatedTabs = tabs.map((tab) =>
      tab.id === activeTab
        ? { ...tab, content: CODE_SNIPPETS[selectedLanguage] || "" }
        : tab
    );
    setTabs(updatedTabs);
  };

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const addNewTab = () => {
    if (tabs.length >= MAX_TABS) {
      alert("Maximum of 10 tabs allowed.");
      return;
    }

    const newTabId = tabs.length + 1;
    const newTab = { id: newTabId, name: `Tab ${newTabId}`, content: "" };
    setTabs([...tabs, newTab]);
    setActiveTab(newTabId);
  };

  const handleTabClick = (tabId) => {
    setActiveTab(tabId);
  };

  // const handleEditorChange = (newValue) => {
  //   setTabs(
  //     tabs.map((tab) =>
  //       tab.id === activeTab ? { ...tab, content: newValue } : tab
  //     )
  //   );
  // };

  const closeTab = (tabId, event) => {
    event.stopPropagation();
    const newTabs = tabs.filter((tab) => tab.id !== tabId);

    if (newTabs.length > 0) {
      if (activeTab === tabId) {
        setActiveTab(newTabs[newTabs.length - 1].id);
      }
    } else {
      setActiveTab(null);
    }

    setTabs(newTabs);
  };

  const goToFlowchart = () => {
    navigate("/flowchart");
  };

  const editorTheme = "vs-dark"; // Dark theme for better visibility
  const monacoLanguage = MONACO_LANGUAGE_MAP[language] || language || "c";

  const activeTabContent =
    tabs.find((tab) => tab.id === activeTab)?.content || "";

  return (
    <Flex direction="column" h="100vh" w="100%" overflow="hidden">
      {/* Code Editor & Sidebar */}
      <Flex flex="1" overflow="hidden">
        {/* Main Code Editor Section */}
        <Box flex="1" display="flex" flexDirection="column">
          {/* Top Section - Language Selector & Tabs */}

          {/* Code Editor (Scrollable) */}
          <Box
            flex="1"
            height={{ base: "40vh", md: "60vh", lg: "70vh" }}
            overflow="auto"
            bg="gray.900"
            position={"relative"}
          >
            {/* <Flex justifyContent="flex-end" width="100%">
              <Box mr={4}>
                <LanguageSelector language={language} onSelect={onSelect} />
              </Box>
            </Flex> */}

            {value?.content ? (
              <Editor
                options={{ minimap: { enabled: false } }}
                theme={editorTheme}
                language={monacoLanguage}
                value={editorValue}
                onMount={(editor) => {
                  editorRef.current = editor;
                  editor.focus();
                }}
                onChange={handleEditorChange}
              />
            ) : (
              <Editor
                options={{ minimap: { enabled: false } }}
                theme={editorTheme}
                language={monacoLanguage}
                value={editorValue}
                onMount={(editor) => {
                  editorRef.current = editor;
                  editor.focus();
                }}
                onChange={handleEditorChange}
              />
            )}

            <IconBar onDebugClick={onDebugClick} onFlashClick={onFlashClick} />

            {/* Output Section (Scrollable) */}
          </Box>
          <Box
            //   height="20vh"
            marginTop={4}
            overflow="auto"
            bg="gray.800"
            color="white"
            p={4}
            borderTop="1px solid gray"
          >
            <Output editorRef={editorRef} language={language} />
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default CodeEditor;
