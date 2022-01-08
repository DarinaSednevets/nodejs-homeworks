// const contacts = require('./contacts.json')

const path = require('path');
const fs = require('fs').promises;
const { v4 } = require("uuid");
const contactsPath = path.join(__dirname, "contacts.json");

const listContacts = async () => {
  const data = await fs.readFile(contactsPath);
  const contacts = JSON.parse(data);
  return contacts;
}

const getContactById = async (contactId) => {
  const contacts = await listContacts();
  const contact = contacts.find(({ id }) => id.toString() === contactId);
  if (!contact) {
    return null;
  }
  return contact;
}

const removeContact = async (contactId) => {
  const contacts = await listContacts();
  const idx = contacts.findIndex(({ id }) => id.toString() === contactId);

  if (idx === -1) {
    return null;
  }
  const newContact = contacts.filter((_, index) => index !== idx);
  await updateContact(newContact);
  return contacts[idx];
}

const addContact = async (body) => {
  const newContact = { ...body, id: v4() };
  const contacts = await listContacts();
  const updatedContactsList = [...contacts, newContact]
  await updateContact(updatedContactsList);
  return newContact;
}

const updateContact = async (c) => {
  await fs.writeFile(contactsPath, JSON.stringify(c, null, 2));
}


module.exports = {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
}

