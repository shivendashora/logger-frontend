export const API_BASE = "http://127.0.0.1:8000";

// must match ALLOWED_EXTENSIONS / MAX_FILE_SIZE in the backend's helper/normalHelper.py
export const ALLOWED_FILE_TYPES = ["application/pdf", "image/png", "image/jpeg", "image/gif", "image/webp"];
export const ALLOWED_FILE_EXTENSIONS = [".pdf", ".png", ".jpg", ".jpeg", ".gif", ".webp"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

// logs fetched per request on the home grid (backend allows up to 50)
export const PAGE_SIZE = 12;
