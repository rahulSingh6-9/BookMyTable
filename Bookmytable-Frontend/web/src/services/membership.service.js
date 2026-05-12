import apiClient from "../lib/api";

export function getMyMemberships() {
  return apiClient.get(
    "/memberships/my-memberships"
  );
}