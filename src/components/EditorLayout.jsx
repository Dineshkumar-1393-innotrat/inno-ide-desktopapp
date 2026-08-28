import { useEffect, useRef, useState } from "react";
import { Box, Flex, HStack, IconButton, useColorMode, Text, Tooltip } from "@chakra-ui/react";
import { Editor } from "@monaco-editor/react";
import { AddIcon, CloseIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import LanguageSelector from "./LanguageSelector";
import { CODE_SNIPPETS, MONACO_LANGUAGE_MAP } from "../constants";
import Output from "./Output";
import IconBar from "./IconBar";
import ProjectExplorer from "./ProjectExplorer";

const CodeEditor = () => {
  const editorRef = useRef();
  const [value, setValue] = useState(CODE_SNIPPETS["C"] || "");
  const [language, setLanguage] = useState("Select Language");
  const { colorMode } = useColorMode();
  const [tabs, setTabs] = useState([{ id: 1, name: "Tab 1", content: "" }]);
  const [activeTab, setActiveTab] = useState(1);
  const [outputHeight, setOutputHeight] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const MAX_TABS = 10;
  const navigate = useNavigate();
  const resizeStartYRef = useRef(0);
  const resizeStartHeightRef = useRef(0);

  const MIN_OUTPUT_HEIGHT = 160;
  const MAX_OUTPUT_HEIGHT = 600;

  const onMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const onSelect = (language) => {
    setLanguage(language);
    setValue(CODE_SNIPPETS[language] || "");
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
    const selectedTab = tabs.find((tab) => tab.id === tabId);
    setValue(selectedTab.content);
  };

  const handleEditorChange = (newValue) => {
    setValue(newValue);
    setTabs(
      tabs.map((tab) =>
        tab.id === activeTab ? { ...tab, content: newValue } : tab
      )
    );
  };

  const closeTab = (tabId, event) => {
    event.stopPropagation();
    const newTabs = tabs.filter((tab) => tab.id !== tabId);

    if (newTabs.length > 0) {
      if (activeTab === tabId) {
        setActiveTab(newTabs[newTabs.length - 1].id);
        setValue(newTabs[newTabs.length - 1].content);
      }
    } else {
      setValue("");
    }

    setTabs(newTabs);
  };

  const goToFlowchart = () => {
    navigate("/FlowchartTest");
  };

  const beginResize = (event) => {
    setIsResizing(true);
    resizeStartYRef.current = event.clientY;
    resizeStartHeightRef.current = outputHeight;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
    event.preventDefault();
  };

  useEffect(() => {
    if (!isResizing) {
      return undefined;
    }

    const handleMouseMove = (event) => {
      const delta = event.clientY - resizeStartYRef.current;
      const nextHeight = resizeStartHeightRef.current - delta;
      const clampedHeight = Math.min(
        Math.max(nextHeight, MIN_OUTPUT_HEIGHT),
        MAX_OUTPUT_HEIGHT
      );
      setOutputHeight(clampedHeight);
    };

    const stopResizing = () => {
      setIsResizing(false);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing]);

  const editorTheme = colorMode === "dark" ? "vs-dark" : "vs-light";
  const monacoLanguage = MONACO_LANGUAGE_MAP[language] || language;
  const outputBackground =
    colorMode === "dark" ? "rgba(15,23,42,0.6)" : "rgba(15, 23, 42, 0.04)";
  const resizerHover =
    colorMode === "dark" ? "rgba(59,130,246,0.35)" : "rgba(37,99,235,0.25)";

  return (
    <Flex direction="column" h="100%" w="100%" minH="0">
      <Flex flex="1" overflow="hidden" minH="0">
        {/* Sidebar */}
        <Box
          w={{ base: "100%", md: "260px" }}
          bg={colorMode === "dark" ? "gray.950" : "#0b1220"}
          color="#e2e8f0"
          borderRight="1px solid rgba(148, 163, 184, 0.2)"
          display={{ base: "none", md: "flex" }}
          flexDirection="column"
        >
          <Box px={4} py={4} borderBottom="1px solid rgba(148, 163, 184, 0.15)">
            <Text fontWeight="bold" fontSize="sm" letterSpacing="0.08em" textTransform="uppercase">
              Explorer
            </Text>
          </Box>
          <Box flex="1" overflow="auto" px={3} py={3} className="editor-sidebar__content">
            <ProjectExplorer />
          </Box>
        </Box>

        {/* Editor area */}
        <Flex
          direction="column"
          flex="1"
          px={6}
          py={4}
          position="relative"
          gap={4}
          bg={colorMode === "dark" ? "#0f172a" : "#f8fafc"}
          minH="0"
        >
          <Flex
            justifyContent="flex-end"
            alignItems="center"
            gap={4}
            position="sticky"
            top={0}
            zIndex={5}
            bg={colorMode === "dark" ? "#0f172a" : "#f8fafc"}
            py={1}
          >
            <LanguageSelector language={language} onSelect={onSelect} />
            <IconBar
              placement="inline"
              direction="row"
              buttonSize="sm"
              gap={2}
            />
          </Flex>

          <HStack
            spacing={1}
            p={2}
            borderRadius="md"
            border="1px solid"
            borderColor={colorMode === "dark" ? "gray.700" : "rgba(148, 163, 184, 0.3)"}
            bg={colorMode === "dark" ? "rgba(15,23,42,0.55)" : "rgba(15, 23, 42, 0.04)"}
            boxShadow="0 6px 18px rgba(15, 23, 42, 0.12)"
            overflowX="auto"
          >
            {tabs.map((tab) => (
              <Flex
                key={tab.id}
                align="center"
                onClick={() => handleTabClick(tab.id)}
                px={3}
                py={2}
                bg={activeTab === tab.id ? "linear-gradient(135deg, #2563eb, #38bdf8)" : "transparent"}
                color={activeTab === tab.id ? "white" : colorMode === "dark" ? "gray.200" : "#0f172a"}
                fontSize="sm"
                flexShrink={0}
                borderRadius="md"
                whiteSpace="nowrap"
                cursor="pointer"
                _hover={{ bg: activeTab === tab.id ? "linear-gradient(135deg, #1d4ed8, #22d3ee)" : "rgba(148, 163, 184, 0.25)" }}
                maxW="140px"
                textOverflow="ellipsis"
                overflow="hidden"
                gap={2}
              >
                <Text noOfLines={1}>{tab.name}</Text>

                <IconButton
                  icon={<CloseIcon fontSize="9px" />}
                  size="xs"
                  aria-label="Close tab"
                  variant="ghost"
                  onClick={(event) => closeTab(tab.id, event)}
                  _hover={{ bg: "rgba(255, 255, 255, 0.15)" }}
                  color={activeTab === tab.id ? "white" : colorMode === "dark" ? "gray.300" : "#0f172a"}
                />
              </Flex>
            ))}

            <IconButton
              icon={<AddIcon />}
              size="sm"
              onClick={addNewTab}
              aria-label="Add new tab"
              variant="outline"
              borderColor="rgba(148, 163, 184, 0.5)"
              color={colorMode === "dark" ? "gray.200" : "#0f172a"}
              _hover={{ bg: "rgba(148, 163, 184, 0.2)" }}
            />

            <Tooltip label="Flow Chart" aria-label="Flow Chart Tooltip">
              <IconButton
                icon={<ExternalLinkIcon />}
                size="sm"
                onClick={goToFlowchart}
                aria-label="Go to Flow Chart"
                variant="outline"
                borderColor="rgba(148, 163, 184, 0.5)"
                color={colorMode === "dark" ? "gray.200" : "#0f172a"}
                _hover={{ bg: "rgba(148, 163, 184, 0.2)" }}
              />
            </Tooltip>
          </HStack>

          <Box
            flex="1"
            borderRadius="lg"
            overflow="hidden"
            boxShadow="0 16px 40px rgba(15, 23, 42, 0.2)"
            display="flex"
            flexDirection="column"
            minH="0"
          >
            <Box flex="1" minH="0">
              <Editor
                options={{
                  minimap: { enabled: false },
                  automaticLayout: true,
                  scrollBeyondLastLine: false,
                  smoothScrolling: true,
                }}
                height="100%"
                theme={editorTheme}
                language={monacoLanguage}
                value={value}
                onMount={onMount}
                onChange={handleEditorChange}
              />
            </Box>
          </Box>

          <Box
            role="separator"
            aria-orientation="horizontal"
            h="6px"
            cursor="row-resize"
            borderRadius="full"
            bg="transparent"
            onMouseDown={beginResize}
            _hover={{ bg: resizerHover }}
          />

          <Box
            flex="0 0 auto"
            minH={`${MIN_OUTPUT_HEIGHT}px`}
            h={`${outputHeight}px`}
            display="flex"
            minW="0"
          >
            <Output
              editorRef={editorRef}
              language={language}
              p={4}
              borderRadius="md"
              border="1px solid rgba(148, 163, 184, 0.2)"
              bg={outputBackground}
              h="100%"
              flex="1"
            />
          </Box>
        </Flex>
      </Flex>
    </Flex>
  );
};

const EditorLayout = () => {
  return (
    <Box display="flex" height="100vh" bg="#0b1220">
      <CodeEditor />
    </Box>
  );
};

export default EditorLayout;


