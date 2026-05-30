import User from "../../models/user.model.js";

/**
 * Handles auth.user.registered events from Auth Service
 */
export const handleUserRegistered = async (event) => {
  try {
    const { id, userId, name, email, phone, roles, avatar } = event;
    const actualId = id || userId;

    if (!actualId) {
      console.warn("⚠️ [UserService] auth.user.registered missing ID", event);
      return;
    }

    // Check if user already exists
    const existingUser = await User.findById(actualId);
    if (existingUser) {
      console.log(`ℹ️ [UserService] User ${actualId} already exists, skipping creation.`);
      return;
    }

    console.log(`🛠️ [UserService] Creating new user profile for ${actualId}`);

    const newUser = await User.create({
      _id: actualId,
      name: name || "Unknown User",
      email: email,
      phone: typeof phone === 'string' ? { number: phone, e164: phone } : phone,
      roles: roles || ["customer"],
      avatar: avatar || "",
      profile: {
        fullName: name || "Unknown User",
        avatar: avatar || "",
      }
    });

    console.log(`✅ [UserService] User profile created for ${actualId}`);
  } catch (error) {
    console.error(`❌ [UserService] Error handling user registration:`, error.message);
  }
};
