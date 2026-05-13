/**
 * API base URL — resolves correctly in all environments:
 * - Local dev (Vite proxy):     "" → /api/chat → proxied to localhost:5000
 * - Production (same server):   "" → /api/chat → same Express server
 * - GitHub Pages (ext backend): "https://your-backend.onrender.com" → full URL
 *
 * Set VITE_API_URL in .env to point to your deployed backend.
 */
export const API_BASE = import.meta.env.VITE_API_URL || '';
