import { NOTIFICATION_TOPICS } from "./notification.topics.js";

export const KAFKA_TOPICS = {
  ...NOTIFICATION_TOPICS,
  BRANCH_CREATION_BLOCKED: "branch.creation.blocked.plan_limit"
};

export * from "./notification.topics.js";
