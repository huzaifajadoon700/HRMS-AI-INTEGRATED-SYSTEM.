// API Configuration
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL ||
  "https://hrms-ai-integrated-system-backend.vercel.app/api";
const API_URL =
  process.env.REACT_APP_API_URL ||
  "https://hrms-ai-integrated-system-backend.vercel.app";

export const apiConfig = {
  baseURL: API_BASE_URL,
  serverURL: API_URL,
  endpoints: {
    // Auth endpoints
    auth: `${API_BASE_URL}/auth`,
    login: `${API_BASE_URL}/auth/login`,
    register: `${API_BASE_URL}/auth/register`,
    googleAuth: `${API_BASE_URL}/auth/google`,

    // Menu endpoints
    menus: `${API_BASE_URL}/menus`,

    // Order endpoints
    orders: `${API_BASE_URL}/orders`,

    // Room endpoints
    rooms: `${API_BASE_URL}/rooms`,
    bookings: `${API_BASE_URL}/bookings`,

    // Table endpoints
    tables: `${API_BASE_URL}/tables`,
    reservations: `${API_BASE_URL}/reservations`,
    tableReservations: `${API_BASE_URL}/table-reservations`,

    // User endpoints
    user: `${API_BASE_URL}/user`,

    // Admin endpoints
    admin: `${API_BASE_URL}/admin`,

    // Payment endpoints
    payment: `${API_BASE_URL}/payment`,

    // Recommendation endpoints
    foodRecommendations: `${API_BASE_URL}/food-recommendations`,
    tableRecommendations: `${API_BASE_URL}/table-recommendations`,

    // Feedback endpoints
    feedback: `${API_BASE_URL}/feedback`,

    // File upload endpoints
    files: `${API_BASE_URL}/files`,

    // Staff endpoints
    staff: `${API_BASE_URL}/staff`,
    shift: `${API_BASE_URL}/shift`,

    // Hotel Settings endpoints
    hotelSettings: `${API_BASE_URL}/hotel-settings`,
    hotelSettingsPublic: `${API_BASE_URL}/hotel-settings/public`,
    hotelSettingsSection: `${API_BASE_URL}/hotel-settings/section`,
    hotelSettingsMetadata: `${API_BASE_URL}/hotel-settings/metadata`,
    hotelSettingsReset: `${API_BASE_URL}/hotel-settings/reset`,

    // Health check
    health: `${API_BASE_URL}/health`,
    status: `${API_BASE_URL}/status`,
  },
};

export default apiConfig;
