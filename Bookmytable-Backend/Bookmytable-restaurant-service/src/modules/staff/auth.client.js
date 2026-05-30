/**
 * Client to interact with the Auth/User Service.
 * In a real production system, this would make HTTP calls to the Auth microservice.
 */
export const authServiceClient = {
  /**
   * Syncs a user with the Auth service.
   * If user exists, returns user info.
   * If not, creates a new user.
   */
  async syncUser({ email, name, password, role }) {
    const userServiceUrl = process.env.USER_SERVICE_URL || "http://localhost:5002";
    const internalToken = process.env.INTERNAL_API_TOKEN || "";
    
    console.log(`[AuthServiceClient] Syncing user: ${email} via ${userServiceUrl}`);
    
    const response = await fetch(`${userServiceUrl}/internal/sync-user`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-token": internalToken
      },
      body: JSON.stringify({ email, name, password, role })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || "Failed to sync user with auth service");
    }

    return data.user;
  }
};
