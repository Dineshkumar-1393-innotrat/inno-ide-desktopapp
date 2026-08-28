import { useEffect, useState } from "react";
import axios from "axios";
import {
  Box,
  Text,
  Button,
  VStack,
  HStack,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Badge,
  SimpleGrid,
} from "@chakra-ui/react";
import { productAPIBase, baseURL } from "../../../utilities";

const RemoveProductComponent = ({ productID, productName, setIsProductDefined, refreshKey }) => {
  const [components, setComponents] = useState([]); // list of { name, type }
  const [loading, setLoading] = useState(false);
  const [removing, setRemoving] = useState(null); // name of component being removed
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // ── Fetch existing components ──────────────────────────────────────────────
  const fetchComponents = async () => {
    if (!productID) return;
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      let response;
      const localUrl = `${productAPIBase}/product/${productID}/definitionNew`;

      try {
        console.log(`[RemoveProductComponent] Attempting local fetch: ${localUrl}`);
        response = await axios.get(localUrl, { timeout: 4000 });
      } catch (localError) {
        console.warn("[RemoveProductComponent] Local fetch failed/timed out, trying Eureka fallback...");
        const fallbackUrl = `${baseURL}/product/${productID}/definitionNew`;
        console.log(`[RemoveProductComponent] Attempting fallback fetch: ${fallbackUrl}`);
        response = await axios.get(fallbackUrl);
      }

      const apiData = response.data?.data || response.data;
      if (!apiData || !apiData.components) {
        setComponents([]);
        return;
      }

      const list = Object.entries(apiData.components).map(([name, data]) => ({
        name,
        type: data.type || "",
        note: data.note || data.Note || data.notes || data.Notes || apiData.note || apiData.Note || "",
      }));

      setComponents(list);

      if (list.length === 0 && setIsProductDefined) {
        setIsProductDefined(false);
      }
    } catch (err) {
      console.error("[RemoveProductComponent] Error fetching components:", err);
      setError("Failed to load components. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComponents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productID, refreshKey]); // re-fetch when tab is clicked (refreshKey changes)

  // ── Remove a single component ──────────────────────────────────────────────
  const handleRemove = async (componentName) => {
    if (!window.confirm(`Remove component "${componentName}"? This cannot be undone.`)) return;

    setRemoving(componentName);
    setError(null);
    setSuccessMsg(null);

    try {
      let url = `${productAPIBase}/product/${productID}/definitionNew/${componentName}`;
      try {
        console.log(`[RemoveProductComponent] Removing via local API: ${url}`);
        await axios.delete(url, { timeout: 4000 });
      } catch (localError) {
        console.warn(`[RemoveProductComponent] Local delete failed/timed out for "${componentName}", falling back to Eureka...`);
        url = `${baseURL}/product/${productID}/definitionNew/${componentName}`;
        await axios.delete(url);
      }

      setSuccessMsg(`"${componentName}" removed successfully.`);

      // Remove from local list immediately
      setComponents((prev) => {
        const updated = prev.filter((c) => c.name !== componentName);
        if (updated.length === 0 && setIsProductDefined) {
          setIsProductDefined(false);
        }
        return updated;
      });
    } catch (err) {
      console.error("[RemoveProductComponent] Error removing component:", err);
      setError(`Failed to remove "${componentName}". Please try again.`);
    } finally {
      setRemoving(null);
    }
  };

  // ── UI ─────────────────────────────────────────────────────────────────────
  return (
    <Box>
      {/* Header */}
      <HStack justify="space-between" mb={6}>
        <Box>
          <Text fontSize="xl" fontWeight="700" color="gray.800">
            {productName}
          </Text>
          <Text fontSize="sm" color="gray.500" mt={0.5}>
            Select a component to remove it from this product definition.
          </Text>
        </Box>
        <Button
          size="sm"
          variant="outline"
          colorScheme="blue"
          onClick={fetchComponents}
          isLoading={loading}
          loadingText="Refreshing"
        >
          ↺ Refresh
        </Button>
      </HStack>

      {/* Feedback messages */}
      {error && (
        <Alert status="error" borderRadius="xl" mb={4}>
          <AlertIcon />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      {successMsg && (
        <Alert status="success" borderRadius="xl" mb={4}>
          <AlertIcon />
          <AlertTitle>Done!</AlertTitle>
          <AlertDescription>{successMsg}</AlertDescription>
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box textAlign="center" py={12}>
          <Spinner size="xl" color="purple.500" thickness="4px" />
          <Text mt={4} color="gray.500" fontSize="sm">
            Fetching components…
          </Text>
        </Box>
      )}

      {/* Empty state */}
      {!loading && components.length === 0 && (
        <Box
          textAlign="center"
          py={16}
          borderRadius="2xl"
          border="2px dashed"
          borderColor="gray.200"
        >
          <Text fontSize="3xl" mb={2}>📭</Text>
          <Text fontWeight="600" color="gray.600">No components found</Text>
          <Text fontSize="sm" color="gray.400" mt={1}>
            This product has no defined components yet.
          </Text>
        </Box>
      )}

      {/* Component cards */}
      {!loading && components.length > 0 && (
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
          {components.map((comp) => (
            <Box
              key={comp.name}
              p={5}
              borderRadius="2xl"
              border="1.5px solid"
              borderColor="gray.200"
              bg="white"
              boxShadow="0 2px 12px rgba(0,0,0,0.06)"
              transition="all 0.2s"
              _hover={{ boxShadow: "0 4px 20px rgba(0,0,0,0.1)", borderColor: "red.300" }}
            >
              <HStack justify="space-between" align="start" mb={3}>
                <Box flex="1" minW={0}>
                  <Text
                    fontWeight="700"
                    fontSize="md"
                    color="gray.800"
                    noOfLines={1}
                    title={comp.name}
                  >
                    {comp.name}
                  </Text>
                  {comp.type && (
                    <Badge
                      mt={1}
                      colorScheme="purple"
                      borderRadius="full"
                      px={3}
                      fontSize="xs"
                      textTransform="capitalize"
                    >
                      {comp.type}
                    </Badge>
                  )}
                  {comp.note && (
                    <Text fontSize="xs" color="gray.500" mt={2} noOfLines={2}>
                      {comp.note}
                    </Text>
                  )}
                </Box>
              </HStack>

              <Button
                size="sm"
                width="100%"
                colorScheme="red"
                variant="outline"
                borderRadius="xl"
                isLoading={removing === comp.name}
                loadingText="Removing…"
                _hover={{ bg: "red.500", color: "white", borderColor: "red.500" }}
                transition="all 0.2s"
                onClick={() => handleRemove(comp.name)}
              >
                🗑 Remove
              </Button>
            </Box>
          ))}
        </SimpleGrid>
      )}
    </Box>
  );
};

export default RemoveProductComponent;
