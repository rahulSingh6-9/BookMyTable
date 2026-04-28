import { getAllUsersService } from "../services/admin.service.js"

export const getAllUsers = async (req, res, next) => {
   try{
    const result = await getAllUsersService()

    res.status(200).json({
        success: true,
        message: "Users fetched successfully",
        count: result.length,
        data: result,
    })

   } catch(error) {
    next(error)
   }
}

