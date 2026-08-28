import React, { useState } from "react";
import { Box, Flex, Text, Spinner, useColorModeValue, Link, VStack, Icon, Badge, IconButton, Tooltip } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { ExternalLink, CheckCircle, Code, Server, RotateCw } from "lucide-react";

// Helper to bundle static files into a single HTML string
const buildStaticSrcDoc = (projectFiles) => {
  if (!projectFiles || projectFiles.length === 0) return "<h1>No files loaded</h1>";
  
  const files = {};
  const flatten = (nodes, path = "") => {
    for (const node of nodes) {
      if (node.type === "folder") {
        flatten(node.children || [], `${path}${node.name}/`);
      } else {
        files[`${path}${node.name}`] = node.content;
      }
    }
  };
  flatten(projectFiles[0]?.children || []); // skip the root workspace wrapper

  const indexKey = Object.keys(files).find(k => k.toLowerCase() === "index.html" || k.toLowerCase().endsWith("/index.html"));
  let result = indexKey ? files[indexKey] : null;

  if (!result) {
    return "<div style='font-family: sans-serif; padding: 20px;'><h3>No index.html found</h3><p>Static preview requires an index.html file in your project.</p></div>";
  }

  // Basic injection of CSS and JS
  for (const [path, content] of Object.entries(files)) {
    const filename = path.split('/').pop();
    if (filename.endsWith(".css")) {
      const cssRegex = new RegExp(`<link[^>]*href=["'](?:\\.\\/)?${filename}["'][^>]*>`, 'gi');
      if (cssRegex.test(result)) {
        result = result.replace(cssRegex, `<style>${content}</style>`);
      } else {
        result = result.replace('</head>', `<style>${content}</style></head>`);
      }
    }
    if (filename.endsWith(".js")) {
      const jsRegex = new RegExp(`<script[^>]*src=["'](?:\\.\\/)?${filename}["'][^>]*><\\/script>`, 'gi');
      if (jsRegex.test(result)) {
        result = result.replace(jsRegex, `<script>${content}</script>`);
      } else {
        result = result.replace('</body>', `<script>${content}</script></body>`);
      }
    }
  }
  return result;
};

const PreviewPanel = () => {
  const { runtimeState, previewUrl, framework, projectType, scripts, projectFiles, rootFolderId, activeSubApp } = useSelector((state) => state.workspace);
  const bgColor = useColorModeValue("white", "gray.800");
  const [iframeKey, setIframeKey] = useState(0);

  if (!["starting", "running", "ready", "stopped", "installing"].includes(runtimeState)) {
    return null;
  }

  const activeRootId = rootFolderId || localStorage.getItem("activeProjectId");
  const subApp = activeSubApp || "_root";
  const effectivePreviewUrl = previewUrl || (activeRootId ? `http://localhost:5004/preview/${activeRootId}/${subApp}` : null);

  const handleRefreshIframe = () => {
    setIframeKey((prev) => prev + 1);
  };

  return (
    <Box flex="1" h="100%" bg={bgColor} borderLeft="1px solid" borderColor={useColorModeValue("gray.200", "gray.700")}>
      <Flex h="40px" bg={useColorModeValue("gray.50", "gray.900")} align="center" px={4} borderBottom="1px solid" borderColor={useColorModeValue("gray.200", "gray.700")}>
        <Text fontSize="sm" fontWeight="semibold" mr={2}>Preview</Text>
        {effectivePreviewUrl && (
          <Tooltip label="Reload Preview">
            <IconButton
              aria-label="Reload Preview"
              icon={<RotateCw size={14} />}
              size="xs"
              variant="ghost"
              mr={2}
              onClick={handleRefreshIframe}
            />
          </Tooltip>
        )}
        {effectivePreviewUrl && runtimeState === "running" && (
          <Link href={effectivePreviewUrl} isExternal ml="auto" color="blue.500" fontSize="xs" display="flex" alignItems="center">
            {effectivePreviewUrl} <ExternalLink size={12} style={{ marginLeft: "4px" }} />
          </Link>
        )}
      </Flex>
      
      <Flex flex="1" h="calc(100% - 40px)" align="center" justify="center" direction="column" p={0}>
        {runtimeState === "running" ? (
          effectivePreviewUrl ? (
            <Box w="100%" h="100%" bg="white">
              <iframe 
                key={iframeKey}
                src={effectivePreviewUrl} 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Live Application Preview"
                allow="cross-origin-isolated; autoplay; camera; microphone; geolocation"
              />
            </Box>
          ) : projectType === "static" ? (
            <Box w="100%" h="100%" bg="white">
              <iframe 
                key={iframeKey}
                srcDoc={buildStaticSrcDoc(projectFiles)} 
                style={{ width: '100%', height: '100%', border: 'none' }}
                title="Static Preview"
                sandbox="allow-scripts allow-same-origin"
              />
            </Box>
          ) : (
            <VStack spacing={4} maxW="400px" w="100%" align="stretch" bg={useColorModeValue("gray.50", "gray.900")} p={6} borderRadius="lg" borderWidth="1px" borderColor={useColorModeValue("gray.200", "gray.700")}>
              <VStack spacing={2} align="center">
                <Icon as={CheckCircle} color="green.500" w={8} h={8} />
                <Text fontSize="lg" fontWeight="bold">Project Ready</Text>
              </VStack>
              <Text fontSize="xs" color="gray.500" textAlign="center">
                Click <strong>Start</strong> in the top header to run the development server and view your app preview.
              </Text>
            </VStack>
          )
        ) : runtimeState === "installing" ? (
          <VStack spacing={3}>
            <Spinner size="lg" color="blue.500" />
            <Text fontSize="sm" color="gray.500">Installing project dependencies (npm install)...</Text>
          </VStack>
        ) : runtimeState === "starting" ? (
          <VStack spacing={3}>
            <Spinner size="lg" color="blue.500" />
            <Text fontSize="sm" color="gray.500">Starting development server & detecting port...</Text>
          </VStack>
        ) : (
          <VStack spacing={4} maxW="400px" w="100%" align="stretch" bg={useColorModeValue("gray.50", "gray.900")} p={6} borderRadius="lg" borderWidth="1px" borderColor={useColorModeValue("gray.200", "gray.700")}>
            <VStack spacing={2} align="center">
              <Icon as={CheckCircle} color="blue.500" w={8} h={8} />
              <Text fontSize="lg" fontWeight="bold">Application Stopped</Text>
            </VStack>
            <Text fontSize="xs" color="gray.500" textAlign="center">
              Click <strong>Start</strong> in the top header to launch the development server and view live preview.
            </Text>
          </VStack>
        )}
      </Flex>
    </Box>
  );
};

export default PreviewPanel;
