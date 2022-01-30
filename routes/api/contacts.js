const express = require('express')
const router = express.Router()

const { NotFound, BadRequest } = require("http-errors");
const { joiSchema } = require("../../models/contact");
const { Contact } = require('../../models');
const { authenticate } = require('../../middlewares');

router.get('/', authenticate, async (req, res, next) => {
  try {
    const { page = 1, limit = 5 } = req.query;
    const { _id } = req.user;
    const skip = (page - 1) * limit;
    const products = await Contact.find({ owner: _id },
      "-createdAt -updatedAt", { skip, limit: +limit });
    res.json(products);
  } catch (error) {
    next(error);
  }
})

router.get('/:contactId', authenticate, async (req, res, next) => {
  const { contactId } = req.params;
  try {
    const contact = await Contact.findById(contactId);
    if (!contact) {
      throw new NotFound();
    } res.json(contact);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
})


router.post('/', authenticate, async (req, res, next) => {
  console.log(req.user)
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { _id } = req.user;
    const newContact = await Contact.create({ ...req.body, owner: _id });
    res.status(201).json(newContact);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
})

router.delete('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const deleteContact = await Contact.findByIdAndRemove(contactId);
    if (!deleteContact) {
      throw new NotFound();
    }
    res.json({ message: "contact deleted" })
  } catch (error) {
    ;
    next(error);
  }
})

router.put('/:contactId', async (req, res, next) => {
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const { contactId } = req.params;
    Contact.findById(contactId, async function (err) {
      if (err) {
        console.log(err)
        next(err)
      }
      const updateContact = await Contact.findByIdAndUpdate(contactId, req.body, { new: true });
      res.json(updateContact);
    })
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
})

router.patch("/:id/favorite", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { favorite } = req.body;
    const updateContact = await Contact.findByIdAndUpdate(id, { favorite }, { new: true });
    if (!updateContact) {
      throw new NotFound();
    }
    res.json(updateContact);
  } catch (error) {
    if (error.message.includes("validation failed")) {
      error.status = 400;
    }
    next(error);
  }
})

module.exports = router;


