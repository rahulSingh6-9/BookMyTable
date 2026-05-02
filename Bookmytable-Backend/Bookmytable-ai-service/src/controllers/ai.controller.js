import { generateDescriptionService } from "../services/ai.service.js";

export const generateDescription = async (req, res, next) => {
  try{
    const { name, cuisine } = req.body;

    const result = await generateDescriptionService(name, cuisine)

    res.status(200).json({
        success: true,
        message: "",
        data: result,
    })

  } catch(error) {
    next(error)
  }
};