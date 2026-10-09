import mongoose from "mongoose"

const layoutSchema = new mongoose.Schema({
    
    retaurants: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Restaurants",
        required: true,
        unique: true,
    },
    layoutData: {
        type: Object,
        required: true,
    },
    
}, { timestamps: true })

export default mongoose.model("Layout", layoutSchema)