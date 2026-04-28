import { createRestaurant, getAllRestaurants } from "../services/restaurant.services.js"

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