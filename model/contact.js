const { Schema, model } = require("mongoose");
const Joi = require('joi');

const contactSchema = Schema({
    name: {
        type: String,
        required: [true, 'Set name for contact'],
    },
    email: {
        type: String,
    },
    phone: {
        type: String,
        required: true,
        unique: true,
    },
    favorite: {
        type: Boolean,
        default: false,
    },

})

const Contact = model("contact", contactSchema);

const joiSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().min(8),
    phone: Joi.string().min(7).required(),
    favorite: Joi.bool,
});

module.exports = {
    Contact,
    joiSchema,
};