import Joi from "joi";

export const inviteStaffSchema = Joi.object({
  email: Joi.string().email().required(),
  role: Joi.string()
    .valid("receptionist", "manager", "waiter", "chef", "staff", "co_owner", "owner")
    .required(),
  permissions: Joi.array().items(Joi.string()).default([]),
});
