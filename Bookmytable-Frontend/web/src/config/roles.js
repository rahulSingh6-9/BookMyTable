// ──────────────────────────────────────────────
// Role constants — must match backend
// ──────────────────────────────────────────────

export const ROLES = {
  OWNER: "owner",
  CO_OWNER: "co_owner",
  MANAGER: "manager",
  ASSISTANT_MANAGER: "assistant_manager",
  CASHIER: "cashier",
  HOST: "host",
  WAITER: "waiter",
  CHEF: "chef",
  KITCHEN_STAFF: "kitchen_staff",
  SUPPORT_STAFF: "support_staff",
};

// ──────────────────────────────────────────────
// Role-Permission mapping
// ──────────────────────────────────────────────

export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: ["*"],

  [ROLES.CO_OWNER]: [
    "MANAGE_BRANCH",
    "MANAGE_STAFF",
    "VIEW_ANALYTICS",
    "MANAGE_SETTINGS",
    "MANAGE_MENU",
    "MANAGE_BOOKINGS",
    "MANAGE_TABLES",
  ],

  [ROLES.MANAGER]: [
    "MANAGE_BOOKINGS",
    "MANAGE_TABLES",
    "VIEW_ANALYTICS",
    "MANAGE_MENU",
    "VIEW_REPORTS",
  ],

  [ROLES.ASSISTANT_MANAGER]: [
    "MANAGE_BOOKINGS",
    "VIEW_REPORTS",
    "VIEW_ANALYTICS",
  ],

  [ROLES.CASHIER]: [
    "CREATE_BOOKING",
    "VIEW_BOOKINGS",
  ],

  [ROLES.HOST]: [
    "MANAGE_RESERVATIONS",
    "VIEW_BOOKINGS",
  ],

  [ROLES.WAITER]: [
    "VIEW_ASSIGNED_TABLES",
    "UPDATE_ORDER_STATUS",
  ],

  [ROLES.CHEF]: [
    "VIEW_KITCHEN_ORDERS",
    "UPDATE_ORDER_STATUS",
  ],

  [ROLES.KITCHEN_STAFF]: [
    "VIEW_KITCHEN_ORDERS",
  ],

  [ROLES.SUPPORT_STAFF]: [
    "VIEW_BASIC_INFO",
  ],
};
