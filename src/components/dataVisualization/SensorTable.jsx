import React, { useState, useEffect, useMemo } from "react";
import "./SensorTable.css";

/**
 * Flatten a single data row (new nested format) into a flat map:
 *   key: "ComponentName||paramName"
 *   value: the raw param object { value, unit, type } or { x, y, z, unit } or { state }
 */
function flattenRow(row) {
  const flat = {};
  const dataObj = row.data || row; // support both { data: {...} } and raw flat

  Object.entries(dataObj).forEach(([componentName, componentFields]) => {
    if (typeof componentFields !== "object" || componentFields === null) return;
    // skip string fields like "type" at component level
    Object.entries(componentFields).forEach(([paramName, paramObj]) => {
      if (typeof paramObj !== "object" || paramObj === null) return;
      if (paramName === "type") return; // skip bare "type" key at component level
      flat[`${componentName}||${paramName}`] = { ...paramObj, _componentName: componentName };
    });
  });

  return flat;
}

/**
 * Format a param object into a display string.
 */
function formatParam(paramObj) {
  if (!paramObj) return "-";

  // Composite: x, y, z
  if (paramObj.x !== undefined && paramObj.y !== undefined && paramObj.z !== undefined) {
    const fmt = (v) => (typeof v === "number" ? v.toFixed(2) : v);
    return `X:${fmt(paramObj.x)}, Y:${fmt(paramObj.y)}, Z:${fmt(paramObj.z)} ${paramObj.unit || ""}`.trim();
  }

  // State (switch)
  if (paramObj.state !== undefined) {
    return paramObj.state;
  }

  // Value + unit
  if (paramObj.value !== undefined) {
    const v = typeof paramObj.value === "number" ? Number(paramObj.value).toFixed(2) : paramObj.value;
    return `${v} ${paramObj.unit || ""}`.trim();
  }

  return "-";
}

const SensorTable = ({ data, deviceID }) => {
  const [filteredData, setFilteredData] = useState([]);

  useEffect(() => {
    setFilteredData(data);
  }, [data]);

  // Derive column keys from first row
  const columnKeys = useMemo(() => {
    if (filteredData.length === 0) return [];
    const firstFlat = flattenRow(filteredData[0]);
    return Object.keys(firstFlat);
  }, [filteredData]);

  // Pretty header: "STM32 - clock speed"
  const prettyHeader = (key) => {
    const [comp, param] = key.split("||");
    return `${comp} - ${param}`;
  };

  return (
    <div className="sensor-table-container">
      <h5 className="device-header">{`DeviceID: ${deviceID}`}</h5>
      <div className="table-wrapper">
        <table className="sensor-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              {columnKeys.map((key) => (
                <th key={key}>{prettyHeader(key)}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row, rowIndex) => {
              const flat = flattenRow(row);
              const ts = row.createdAt
                ? new Date(row.createdAt).toLocaleTimeString()
                : "-";

              return (
                <tr key={rowIndex}>
                  <td>{ts}</td>
                  {columnKeys.map((key) => (
                    <td key={key}>{formatParam(flat[key])}</td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SensorTable;
