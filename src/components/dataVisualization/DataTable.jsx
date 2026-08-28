import React, { useEffect, useState } from "react";
import "./SensorTable.css";

import SensorTable from "./SensorTable";
import axios from "axios";
import {} from "@chakra-ui/react";
import { baseURL, productAPIBase } from "../../utilities";

const data = [
  {
    productID: "67b2f025e4ce874e77a65458",
    deviceID: "52bdad6a-c241-4ef9-a292-5ecd47d66509",
    FlameSensor_flameIntensity: {
      type: "sensors",
      unit: "units",
      value: 948.3915245536696,
    },
    DHT11_temperature: {
      type: "sensors",
      unit: "°C",
      value: 30.27869676125956,
    },
    DHT11_humidity: {
      type: "sensors",
      unit: "%",
      value: 50.32744075605764,
    },
    "Toggle Switch": {
      type: "switch",
      state: "ON",
    },
  },
  {
    productID: "67b2f025e4ce874e77a65458",
    deviceID: "52bdad6a-c241-4ef9-a292-5ecd47d66509",
    FlameSensor_flameIntensity: {
      type: "sensors",
      unit: "units",
      value: 947.8396369002418,
    },
    DHT11_temperature: {
      type: "sensors",
      unit: "°C",
      value: 31.270719621493274,
    },
    DHT11_humidity: {
      type: "sensors",
      unit: "%",
      value: 49.48278437966394,
    },
    "Toggle Switch": {
      type: "switch",
      state: "ON",
    },
  },
];

export function groupByDeviceId(data) {
  if (!data) return;

  try {
    if (data.status === "error") {
      throw new Error(data.message);
    }

    console.log("data:", data);

    return data?.reduce((acc, item) => {
      if (!acc[item.deviceID]) {
        acc[item.deviceID] = [];
      }
      acc[item.deviceID].push(item);
      return acc;
    }, {});
  } catch (error) {
    if (window.confirm(`${error.message}\nClick OK to reload the page.`)) {
      window.location.reload(); // Reload the page on confirmation
    }
  }
}

const DataTable = ({ selectedProduct, selectedDevice, selectedName }) => {
  const [devicesData, setDevicesData] = useState([]);
  const [tableData, setTableData] = useState([]);

  // Update tableData whenever devicesData or selectedDevice changes
  useEffect(() => {
    if (!selectedDevice) return;

    const newData = groupByDeviceId(devicesData) || {};
    setTableData(newData?.[selectedDevice] || []);
  }, [selectedDevice, devicesData]);

  useEffect(() => {
    if (!selectedProduct || !selectedDevice) return; // Ensure both product and device are selected

    const payload = {
      productID: selectedProduct,
      deviceID: selectedDevice,
    };

    const fetchDeviceData = async () => {
      // Fire-and-forget: trigger data generation without blocking the data fetch
      axios
        .post(`${productAPIBase}/generateNewProductData`, payload, { timeout: 5000 })
        .catch(() => {}); // silently ignore failures

      // Fetch actual device data in parallel (don't wait for generate above)
      try {
        const response = await axios.post(
          `${productAPIBase}/data`,
          { productID: selectedProduct },
          { timeout: 8000 }
        );

        if (response.data && response.data.data) {
          setDevicesData(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching device data:", error.response);
        const errorMessage = error.response?.data?.message;
        if (errorMessage && errorMessage !== "undefined") {
          alert(`Data Fetch Error: ${errorMessage}`);
        }
      }
    };

    // Call immediately upon device selection
    fetchDeviceData();

    // Then set up the interval to poll every 5 seconds
    const interval = 5000;
    const intervalId = setInterval(fetchDeviceData, interval);

    return () => clearInterval(intervalId); // Clear interval on unmount
  }, [selectedProduct, selectedDevice]);


  return (
    <div className="data-table-container">
      {!selectedProduct || !selectedDevice ? (
        <p>Please select a product and a device to view data.</p>
      ) : tableData.length > 0 ? (
        <SensorTable
          data={tableData}
          deviceID={selectedDevice}
          productName="Fire Sensor"
        />
      ) : (
        <p>No data available for the selected device. Make sure it is running in the Simulation screen.</p>
      )}
    </div>
  );
};

export default DataTable;
