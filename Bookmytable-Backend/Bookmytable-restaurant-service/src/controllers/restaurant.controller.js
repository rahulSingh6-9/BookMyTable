import { createRestaurant, getAllRestaurants } from "../services/restaurant.services.js"
import { getMyRestaurantService } from "../services/restaurant.services.js";


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
      const restaurant = await createRestaurant(req.body, req.user.id)

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