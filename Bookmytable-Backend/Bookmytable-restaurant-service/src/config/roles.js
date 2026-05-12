// ──────────────────────────────────────────────
// Role constants — single source of truth
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
// Permission Sets (Internal usage for mapping)
// ──────────────────────────────────────────────

const BASE_PERMISSIONS = ["VIEW_BASIC_INFO"];

const ORDER_PERMISSIONS = [
  ...BASE_PERMISSIONS,
  "VIEW_KITCHEN_ORDERS",
  "UPDATE_ORDER_STATUS",
];

const BOOKING_PERMISSIONS = [
  ...BASE_PERMISSIONS,
  "CREATE_BOOKING",
  "VIEW_BOOKINGS",
  "MANAGE_RESERVATIONS",
];

const MENU_PERMISSIONS = [
  "MANAGE_MENU",
  "VIEW_MENU",
];

const STAFF_PERMISSIONS = [
  "MANAGE_STAFF",
  "VIEW_STAFF",
];

const ANALYTICS_PERMISSIONS = [
  "VIEW_ANALYTICS",
  "VIEW_REPORTS",
];

// ──────────────────────────────────────────────
// Role-Permission mapping using constants
// ──────────────────────────────────────────────

export const ROLE_PERMISSIONS = {
  [ROLES.OWNER]: ["*"],

  [ROLES.CO_OWNER]: [
    "*", // Co-owners usually have full access too, but can be restricted if needed. 
    // For now, keeping it robust.
  ],

  [ROLES.MANAGER]: [
    ...BOOKING_PERMISSIONS,
    ...MENU_PERMISSIONS,
    ...ANALYTICS_PERMISSIONS,
    ...STAFF_PERMISSIONS,
    "MANAGE_TABLES",
    "MANAGE_BOOKINGS",
  ],

  [ROLES.ASSISTANT_MANAGER]: [
    ...BOOKING_PERMISSIONS,
    "VIEW_REPORTS",
    "MANAGE_TABLES",
  ],

  [ROLES.CASHIER]: [
    ...BOOKING_PERMISSIONS,
  ],

  [ROLES.HOST]: [
    "MANAGE_RESERVATIONS",
    "VIEW_TABLES",
    "VIEW_BOOKINGS",
  ],

  [ROLES.WAITER]: [
    "VIEW_ASSIGNED_TABLES",
    "UPDATE_ORDER_STATUS",
    "VIEW_MENU",
  ],

  [ROLES.CHEF]: [
    ...ORDER_PERMISSIONS,
    "VIEW_MENU",
  ],

  [ROLES.KITCHEN_STAFF]: [
    "VIEW_KITCHEN_ORDERS",
  ],

  [ROLES.SUPPORT_STAFF]: [
    ...BASE_PERMISSIONS,
  ],
};
