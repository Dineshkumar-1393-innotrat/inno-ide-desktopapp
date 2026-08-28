import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button as ChakraButton,
  Select,
  Spinner,
  Text,
  HStack,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import DataTable from "./DataTable";
import { baseURL, productAPIBase } from "../../utilities";
import { useProject } from "../../ProjectContext";
import { Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

// --- Session-level cache so we don't refetch on every page visit ---
const _cache = {};

/**
 * Race all candidate URLs simultaneously with a per-request timeout.
 * Returns the first response whose data passes the validator, or null.
 */
async function raceEndpoints(urls, validator, timeoutMs = 5000) {
  const controllers = urls.map(() => new AbortController());

  const requests = urls.map((url, i) =>
    axios
      .get(url, {
        signal: controllers[i].signal,
        timeout: timeoutMs,
      })
      .then((res) => {
        const value = validator(res.data);
        if (value && value.length > 0) return value;
        throw new Error("empty");
      })
  );

  try {
    const result = await Promise.any(requests);
    // Cancel all remaining requests once we have a winner
    controllers.forEach((c) => c.abort());
    return result;
  } catch {
    return null;
  }
}

/**
 * Race POST endpoints simultaneously.
 */
async function racePostEndpoints(endpoints, validator, timeoutMs = 5000) {
  const controllers = endpoints.map(() => new AbortController());

  const requests = endpoints.map(({ url, data }, i) =>
    axios
      .post(url, data, {
        signal: controllers[i].signal,
        timeout: timeoutMs,
      })
      .then((res) => {
        const value = validator(res.data);
        if (value && value.length > 0) return value;
        throw new Error("empty");
      })
  );

  try {
    const result = await Promise.any(requests);
    controllers.forEach((c) => c.abort());
    return result;
  } catch {
    return null;
  }
}

const extractProducts = (data) => {
  if (data?.data && Array.isArray(data.data)) return data.data;
  if (Array.isArray(data)) return data;
  if (data?.products && Array.isArray(data.products)) return data.products;
  return [];
};

const extractDevices = (data) => {
  if (Array.isArray(data)) return data;
  if (data?.runningDevices && Array.isArray(data.runningDevices))
    return data.runningDevices;
  if (data?.devices && Array.isArray(data.devices)) return data.devices;
  if (data?.data && Array.isArray(data.data)) return data.data;
  return [];
};

const SelectProduct = () => {
  const [selectedProduct, setSelectedProduct] = useState("");
  const [availableDevices, setAvailableDevices] = useState([]);
  const [selectedDevice, setSelectedDevice] = useState("");
  const [selectedProductName, setSelectedProductName] = useState("");

  const [products, setProducts] = useState([]);
  const [runningDevices, setRunningDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { user, activeProjectName, activeProductId } = useProject();
  const navigate = useNavigate();

  useEffect(() => {
    const getEffectiveUserId = () => {
      if (user?.userId) return user.userId;
      if (user?._id) return user._id;
      if (user?.id) return user.id;
      const directLS = localStorage.getItem("userId");
      if (directLS) return directLS;
      const directSS = sessionStorage.getItem("userId");
      if (directSS) return directSS;
      try {
        const uData = JSON.parse(localStorage.getItem("userData") || "{}");
        if (uData?.userId) return uData.userId;
        if (uData?._id) return uData._id;
        if (uData?.id) return uData.id;
      } catch (e) {
        console.warn("Failed parsing userData from localStorage:", e);
      }
      return "default_user_1";
    };

    const userId = getEffectiveUserId();

    // Use cache to avoid redundant network calls on repeated visits
    if (_cache[userId]) {
      setProducts(_cache[userId].products);
      setRunningDevices(_cache[userId].runningDevices);
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        // --- 1. Fetch products (all endpoints raced in parallel) ---
        const productUrls = [
          `${baseURL}/getProductIds/${userId}`,
          `${baseURL}/api/v1/getProductIds/${userId}`,
          `${baseURL}/api/v2/getProductIds/${userId}`,
          `${productAPIBase}/getProductIds/${userId}`,
          `${productAPIBase}/api/v1/getProductIds/${userId}`,
          `${productAPIBase}/api/v2/getProductIds/${userId}`,
          `${productAPIBase}/products/${userId}`,
          `${productAPIBase}/product/all/${userId}`,
          `${baseURL}/product/all/${userId}`,
        ];

        const productsList = await raceEndpoints(
          productUrls,
          extractProducts,
          5000
        );

        if (!productsList || productsList.length === 0) {
          setProducts([]);
          setLoading(false);
          return;
        }

        setProducts(productsList);

        // --- 2. Fetch devices for ALL products in parallel ---
        const devicePromises = productsList.map(async (product) => {
          const pId =
            product.productId ||
            product.productID ||
            product._id ||
            product.id;

          // Race GET and POST device endpoints simultaneously
          const getUrls = [
            `${baseURL}/product/${pId}/devices`,
            `${productAPIBase}/product/${pId}/devices`,
          ];

          const postEndpoints = [
            {
              url: `${baseURL}/devices/running`,
              data: { productID: pId },
            },
            {
              url: `${productAPIBase}/devices/running`,
              data: { productID: pId },
            },
          ];

          // Race GET and POST simultaneously
          const [getResult, postResult] = await Promise.all([
            raceEndpoints(getUrls, extractDevices, 5000),
            racePostEndpoints(postEndpoints, extractDevices, 5000),
          ]);

          let rawDevices = getResult || postResult || [];
          let deviceIds = rawDevices.map((d) =>
            typeof d === "string" ? d : d.deviceID || d.deviceId || d.id
          ).filter(Boolean);

          // --- Fallback: if no device found via device endpoints,
          //     discover device IDs from the /data endpoint itself ---
          if (deviceIds.length === 0) {
            try {
              const dataRes = await axios.post(
                `${productAPIBase}/data`,
                { productID: pId },
                { timeout: 8000 }
              );
              const records = dataRes.data?.data || dataRes.data || [];
              if (Array.isArray(records)) {
                const seen = new Set();
                records.forEach((r) => r?.deviceID && seen.add(r.deviceID));
                deviceIds = [...seen];
              }
            } catch {
              // Fallback also failed — leave deviceIds as empty
            }
          }

          return { productID: pId, runningDevices: deviceIds };
        });

        const deviceResults = await Promise.allSettled(devicePromises);
        const finalRunningDevices = deviceResults.map((r) =>
          r.status === "fulfilled"
            ? r.value
            : { productID: "", runningDevices: [] }
        );

        setRunningDevices(finalRunningDevices);

        // Save to session cache (always overwrite so fresh device data sticks)
        _cache[userId] = {
          products: productsList,
          runningDevices: finalRunningDevices,
        };
      } catch (err) {
        setError(err.message || "Error fetching data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user?.userId]);

  // Auto-select product based on activeProductId
  useEffect(() => {
    if (activeProductId && products.length > 0 && !selectedProduct) {
      const found = products.find(
        (p) =>
          (p.productId || p.productID || p._id || p.id) === activeProductId
      );
      if (found) {
        setSelectedProduct(activeProductId);
        setSelectedProductName(
          found.productName || found.ProductName || found.name
        );
      }
    }
  }, [activeProductId, products, selectedProduct]);

  // Update available devices when product selection changes
  useEffect(() => {
    if (selectedProduct) {
      const deviceData = runningDevices.find(
        (item) => item.productID === selectedProduct
      );
      const fetchedDevs = deviceData?.runningDevices ?? [];
      const defaultVirtualDev = `Virtual-Device-01`;
      const effectiveDevs = fetchedDevs.length > 0 ? fetchedDevs : [defaultVirtualDev];
      setAvailableDevices(effectiveDevs);
      setSelectedDevice((prev) => (effectiveDevs.includes(prev) ? prev : effectiveDevs[0]));
    } else {
      setAvailableDevices([]);
      setSelectedDevice("");
    }
  }, [selectedProduct, runningDevices]);

  if (loading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        minH="200px"
        gap={4}
      >
        <Spinner size="lg" color="blue.500" thickness="3px" />
        <Text color="gray.500" fontSize="sm">
          Loading products…
        </Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        p={4}
        bg="red.50"
        border="1px solid"
        borderColor="red.300"
        borderRadius="md"
        color="red.700"
      >
        ⚠ {error}
      </Box>
    );
  }

  const handleProductChange = (pID) => {
    setSelectedProduct(pID);
    const product = products.find(
      (p) => (p.productId || p.productID || p._id || p.id) === pID
    );
    if (product) {
      setSelectedProductName(
        product.productName || product.ProductName || product.name
      );
    }
    setSelectedDevice(""); // Reset device on product change
  };

  const handleDeviceChange = (e) => {
    setSelectedDevice(e.target.value);
  };

  const getDisplayName = () => {
    if (!selectedProduct) return "Select Product";
    const found = products.find(
      (p) => (p.productId || p.productID || p._id || p.id) === selectedProduct
    );
    return (
      found?.productName || found?.ProductName || found?.name || "Select Product"
    );
  };

  return (
    <Box>

      <HStack flexWrap="wrap" alignItems="center" gap={2} mb={4}>
        {/* Product Dropdown */}
        <Menu>
          <MenuButton
            as={ChakraButton}
            rightIcon={<ChevronDownIcon />}
            size="sm"
            variant="outline"
            minW="180px"
            textAlign="left"
            fontWeight="normal"
            color={selectedProduct ? "inherit" : "gray.400"}
          >
            {getDisplayName()}
          </MenuButton>
          <MenuList maxH="250px" overflowY="auto" zIndex={9999}>
            {products.length === 0 ? (
              <MenuItem isDisabled>No products found</MenuItem>
            ) : (
              products.map((product) => {
                const pId =
                  product.productId ||
                  product.productID ||
                  product._id ||
                  product.id;
                const pName =
                  product.productName || product.ProductName || product.name;
                return (
                  <MenuItem
                    key={pId}
                    value={pId}
                    onClick={() => handleProductChange(pId)}
                    bg={selectedProduct === pId ? "blue.50" : undefined}
                    fontWeight={selectedProduct === pId ? "semibold" : "normal"}
                  >
                    {pName}
                  </MenuItem>
                );
              })
            )}
          </MenuList>
        </Menu>

        {/* Device Dropdown */}
        {selectedProduct && (
          <>
            {availableDevices.length > 0 ? (
              <Select
                placeholder="Select Device"
                onChange={handleDeviceChange}
                value={selectedDevice}
                minW="180px"
                size="sm"
              >
                {availableDevices.map((deviceID) => (
                  <option key={deviceID} value={deviceID}>
                    {deviceID}
                  </option>
                ))}
              </Select>
            ) : (
              <Box
                px={3}
                py={1}
                bg="orange.50"
                border="1px solid"
                borderColor="orange.300"
                borderRadius="md"
                fontSize="xs"
                color="orange.700"
                whiteSpace="nowrap"
                display="flex"
                alignItems="center"
              >
                ⚠ No devices registered for this product
              </Box>
            )}
          </>
        )}

        <Button
          size="sm"
          colorScheme="blue"
          isDisabled={!selectedProduct}
          onClick={() => navigate("/editor")}
        >
          Flash
        </Button>
      </HStack>

      <Box overflowX="auto" w="full">
        <DataTable
          selectedProduct={selectedProduct}
          selectedDevice={selectedDevice}
          selectedName={selectedProductName}
        />
      </Box>
    </Box>
  );
};

export default SelectProduct;
