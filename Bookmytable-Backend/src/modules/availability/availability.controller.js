import { generateAvailability } from "./availability.service.js";

export const getAvailability = async (req, res) => {
  try {
    const { branchSlug } = req.params;
    const { date, tableType } = req.query;
    const guests = req.query.guests || req.query.partySize;

    if (!date || !guests) {
      return res.status(400).json({ success: false, message: "Date and guests are required" });
    }

    const { tables, slots } = await generateAvailability(branchSlug, date, Number(guests), tableType);
     
    console.log("tables 👇: ", tables)
    console.log("slots 👇: ", slots)
    res.status(200).json({
      success: true,
      data: {
        tables,
        slots
      }
    });
  } catch (error) {
    console.error("❌ Error generating availability:", error);
    res.status(500).json({ success: false, message: error.message || "Internal server error" });
  }
};
