// ──────────────────────────────────────────────
// Role constants — single source of truth
// Used by: backend middleware, frontend UI, shared auth helpers
// ──────────────────────────────────────────────

export const ROLES = Object.freeze({
  USER: "user",
  ADMIN: "admin",
  OWNER: "owner",
});
