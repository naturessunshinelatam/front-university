export const API_BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "";

// Base URL for public assets (images, static files)
export const ASSETS_BASE_URL: string =
  import.meta.env.VITE_ASSETS_BASE_URL || "https://mx.naturessunshinelatam.com";

// Geo IP service used to detect country (public API). If you want to use a different provider per environment,
// set `VITE_GEO_IP_API` in the corresponding .env files.
export const GEO_IP_API: string =
  import.meta.env.VITE_GEO_IP_API || "https://ipapi.co/json/";

export default {
  API_BASE_URL,
  ASSETS_BASE_URL,
  GEO_IP_API,
};
