import axios from "axios";

/** Base URL for browser calls (e.g. downloads). Prefer Server Actions when possible. */
export const axiosClient = axios.create({
  baseURL:
    typeof window !== "undefined"
      ? window.location.origin
      : process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  withCredentials: true,
});
