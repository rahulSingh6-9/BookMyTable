import User from "../models/user.model.js";

export const getAllUsersService = async () => {
    try{
        const users = await User.find()
        .select("-password")
        .sort({ createdAt: -1 });
        
        return users

    } catch(error) {
        console.log(error.message);
        throw error;
    }
}