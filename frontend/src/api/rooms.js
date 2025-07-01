import { apiConfig } from '../config/api';

export const fetchRooms = async () => {
    try {
      const response = await fetch(apiConfig.endpoints.rooms);
      return await response.json();
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }
  };
  