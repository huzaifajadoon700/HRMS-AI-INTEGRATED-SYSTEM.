// src/api/rooms.ts
export const fetchRooms = async () => {
    try {
      const response = await fetch("https://hrms-ai-integrated-system-production.up.railway.app/api/rooms");
      return await response.json();
    } catch (error) {
      console.error("Error fetching rooms:", error);
      return [];
    }
  };
  