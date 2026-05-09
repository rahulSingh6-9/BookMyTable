import { createRestaurant, getAllRestaurants } from "./restaurant.services.js"
import { getMyRestaurantService } from "./restaurant.services.js";
import { createLog } from "../log/log.service.js";



export const getMyRestaurant = async (req, res) => {
  try {
    const userId = req.user?.id;

    const restaurant = await getMyRestaurantService(userId);

    res.status(200).json({
      success: true,
      message: "Restaurant fetched successfully",
      data: restaurant,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal Server Error",
    });
  }
};


export const create = async (req, res, next) => {
    try{
      const userId = req.user.id;
      const restaurant = await createRestaurant(req.body, userId)

      // 📝 Log Action
      createLog({
        action: "RESTAURANT_CREATED",
        performedBy: userId,
        role: req.headers["x-user-role"] || req.user?.role,
        restaurant: restaurant._id,
        metadata: { name: restaurant.name, city: restaurant.city },
        ipAddress: req.ip,
      });

      res.status(201).json({
        success: true,
        data: restaurant
      })

    }catch(error){
        next(error)
    }
}

export const getAll = async (req, res, next) => {
    try{ 
    const restaurants = await getAllRestaurants(req.query)

    res.json({
        success: true,
        data: restaurants
    })

    }catch(error){
        next(error)
    }
}
