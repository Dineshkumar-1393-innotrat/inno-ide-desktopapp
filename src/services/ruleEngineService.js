import axios from "axios";
import { API } from "../config/api";
import { baseURL } from "../utilities";

const getApiBase = () => {
  if (API && API.MAIN) return `${API.MAIN}/api/v1`;
  if (baseURL) return `${baseURL}/api/v1`;
  return "/api/v1";
};

export const ruleEngineApi = {
  // ==========================================
  // 1. RULES API
  // ==========================================
  createRule: async (ruleData) => {
    const response = await axios.post(`${getApiBase()}/rules`, ruleData);
    return response.data;
  },

  getAllRules: async () => {
    const response = await axios.get(`${getApiBase()}/rules`);
    return response.data;
  },

  getRuleById: async (ruleId) => {
    const response = await axios.get(`${getApiBase()}/rules/${ruleId}`);
    return response.data;
  },

  getRulesByProject: async (projectId) => {
    const response = await axios.get(`${getApiBase()}/rules/project/${projectId}`);
    return response.data;
  },

  getRulesByProduct: async (productId) => {
    const response = await axios.get(`${getApiBase()}/rules/product/${productId}`);
    return response.data;
  },

  getRulesByDevice: async (deviceId) => {
    const response = await axios.get(`${getApiBase()}/rules/device/${deviceId}`);
    return response.data;
  },

  updateRule: async (ruleId, payload) => {
    const response = await axios.put(`${getApiBase()}/rules/${ruleId}`, payload);
    return response.data;
  },

  disableRule: async (ruleId) => {
    const response = await axios.patch(`${getApiBase()}/rules/${ruleId}/disable`);
    return response.data;
  },

  enableRule: async (ruleId) => {
    const response = await axios.patch(`${getApiBase()}/rules/${ruleId}/enable`);
    return response.data;
  },

  deleteRule: async (ruleId) => {
    const response = await axios.delete(`${getApiBase()}/rules/${ruleId}`);
    return response.data;
  },

  // ==========================================
  // 2. CONDITIONS & ACTIONS API
  // ==========================================
  createCondition: async (ruleId, conditionData) => {
    const response = await axios.post(`${getApiBase()}/rules/${ruleId}/conditions`, conditionData);
    return response.data;
  },

  updateCondition: async (ruleId, conditionId, conditionData) => {
    const response = await axios.put(
      `${getApiBase()}/rules/${ruleId}/conditions/${conditionId}`,
      conditionData
    );
    return response.data;
  },

  deleteCondition: async (ruleId, conditionId) => {
    const response = await axios.delete(
      `${getApiBase()}/rules/${ruleId}/conditions/${conditionId}`
    );
    return response.data;
  },

  createAction: async (ruleId, actionData) => {
    const response = await axios.post(`${getApiBase()}/rules/${ruleId}/actions`, actionData);
    return response.data;
  },

  updateAction: async (ruleId, actionId, actionData) => {
    const response = await axios.put(
      `${getApiBase()}/rules/${ruleId}/actions/${actionId}`,
      actionData
    );
    return response.data;
  },

  deleteAction: async (ruleId, actionId) => {
    const response = await axios.delete(
      `${getApiBase()}/rules/${ruleId}/actions/${actionId}`
    );
    return response.data;
  },

  // ==========================================
  // 3. RULE SIMULATION API
  // ==========================================
  runSimulation: async (simData) => {
    const response = await axios.post(`${getApiBase()}/simulations/run`, simData);
    return response.data;
  },

  getSimulationResult: async (simulationId) => {
    const response = await axios.get(`${getApiBase()}/simulations/${simulationId}`);
    return response.data;
  },

  getSimulationHistory: async (ruleId) => {
    const response = await axios.get(`${getApiBase()}/simulations/rule/${ruleId}`);
    return response.data;
  },

  // ==========================================
  // 4. DASHBOARD BUILDER API
  // ==========================================
  createDashboard: async (dashboardData) => {
    const response = await axios.post(`${getApiBase()}/dashboards`, dashboardData);
    return response.data;
  },

  getAllDashboards: async () => {
    const response = await axios.get(`${getApiBase()}/dashboards`);
    return response.data;
  },

  getDashboardById: async (dashboardId) => {
    const response = await axios.get(`${getApiBase()}/dashboards/${dashboardId}`);
    return response.data;
  },

  updateDashboard: async (dashboardId, payload) => {
    const response = await axios.put(`${getApiBase()}/dashboards/${dashboardId}`, payload);
    return response.data;
  },

  deleteDashboard: async (dashboardId) => {
    const response = await axios.delete(`${getApiBase()}/dashboards/${dashboardId}`);
    return response.data;
  },

  addWidget: async (dashboardId, widgetData) => {
    const response = await axios.post(
      `${getApiBase()}/dashboards/${dashboardId}/widgets`,
      widgetData
    );
    return response.data;
  },

  updateWidget: async (dashboardId, widgetId, widgetData) => {
    const response = await axios.put(
      `${getApiBase()}/dashboards/${dashboardId}/widgets/${widgetId}`,
      widgetData
    );
    return response.data;
  },

  deleteWidget: async (dashboardId, widgetId) => {
    const response = await axios.delete(
      `${getApiBase()}/dashboards/${dashboardId}/widgets/${widgetId}`
    );
    return response.data;
  }
};
