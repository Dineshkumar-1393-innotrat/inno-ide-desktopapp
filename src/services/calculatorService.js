import axios from 'axios';

const CALC_API_BASE_URL = '/api/v1';

export const calculatorService = {
  /**
   * Save a new equation to the backend.
   * @param {Object} payload - { equationName, equation, userId, isAdmin }
   */
  saveEquation: async (payload) => {
    try {
      const response = await axios.post(`${CALC_API_BASE_URL}/scientificCalculator`, payload);
      return response.data;
    } catch (error) {
      console.error('Error saving equation:', error);
      throw error;
    }
  },

  /**
   * Fetch all saved equations for a specific user.
   * @param {string} userId
   * @param {number} isAdmin
   */
  getEquations: async (userId, isAdmin) => {
    try {
      const response = await axios.get(`${CALC_API_BASE_URL}/getscientificCalculator/scientificCalculator`, {
        params: { isAdmin, userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching equations:', error);
      throw error;
    }
  }
};
