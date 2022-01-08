const express = require('express')
const router = express.Router()
const Joi = require('joi');
const { NotFound, BadRequest } = require("http-errors");
const contactsOperations = require("../../model")

const joiSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string(),
  phone: Joi.string().required()
});

router.get('/', async (_, res, next) => {
  try {
    const contacts = await contactsOperations.listContacts();
    res.json(contacts);
  } catch (error) {
    next(error);
  }
})

router.get('/:contactId', async (req, res, next) => {
  console.log(req.params);

  const { contactId } = req.params;
  try {
    const contact = await contactsOperations.getContactById(contactId);
    if (!contact) {
      throw new NotFound();
    } res.json(contact);
  } catch (error) {
    next(error)
  }
})

router.post('/', async (req, res, next) => {
  console.log('post');
  console.log(req.body);
  try {
    const { error } = joiSchema.validate(req.body);
    if (error) {
      throw new BadRequest(error.message);
    }
    const newContact = await contactsOperations.addContact(req.body);
    res.json(newContact);
    res.status(201);
  }
  catch (error) {
    next(error);
  }

})

router.delete('/:contactId', async (req, res, next) => {
  try {
    const { contactId } = req.params;
    const deleteContact = await contactsOperations.removeContact(contactId);
    if (!deleteContact) {
      throw new NotFound();
    }
    res.json({ message: "contact deleted" })
  } catch (error) {
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
    const updateContact = await contactsOperations.updateContact({ contactId, ...req.body });
    if (!updateContact) {
      res.json({ message: "missing fields" });
      throw new BadRequest();
    }
    res.json(updateContact);
  } catch (error) {
    next(error)
  }
})

module.exports = router;
