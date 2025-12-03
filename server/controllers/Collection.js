const models = require('../models');

const { Collection } = models;

// Get all collections for the current user
const getCollections = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const collections = await Collection.find(query).lean().exec();

    return res.json({ collections });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving collections!' });
  }
};

// Create a new collection (premium feature)
const createCollection = async (req, res) => {
  if (!req.session.account.isPremium) {
    return res.status(403).json({ error: 'Premium access required to create collections!' });
  }

  if (!req.body.name) {
    return res.status(400).json({ error: 'Collection name is required!' });
  }

  const collectionData = {
    name: req.body.name,
    description: req.body.description || '',
    animeIds: req.body.animeIds || [],
    owner: req.session.account._id,
  };

  try {
    const newCollection = new Collection(collectionData);
    await newCollection.save();
    return res.status(201).json({ collection: Collection.toAPI(newCollection) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occurred creating the collection!' });
  }
};

// Update a collection
const updateCollection = async (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'Collection ID is required!' });
  }

  try {
    const collection = await Collection.findById(req.body._id).exec();

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found!' });
    }

    if (collection.owner.toString() !== req.session.account._id.toString()) {
      return res.status(403).json({ error: 'You do not have permission to update this collection!' });
    }

    if (req.body.name) {
      collection.name = req.body.name;
    }
    if (req.body.description !== undefined) {
      collection.description = req.body.description;
    }
    if (req.body.animeIds) {
      collection.animeIds = req.body.animeIds;
    }

    await collection.save();
    return res.json({ collection: Collection.toAPI(collection) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error updating collection!' });
  }
};

// Delete a collection
const deleteCollection = async (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'Collection ID is required!' });
  }

  try {
    const collection = await Collection.findById(req.body._id).exec();

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found!' });
    }

    if (collection.owner.toString() !== req.session.account._id.toString()) {
      return res.status(403).json({ error: 'You do not have permission to delete this collection!' });
    }

    await Collection.deleteOne({ _id: req.body._id });
    return res.json({ message: 'Collection deleted successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error deleting collection!' });
  }
};

// Add anime to collection
const addAnimeToCollection = async (req, res) => {
  if (!req.body._id || !req.body.animeId) {
    return res.status(400).json({ error: 'Collection ID and Anime ID are required!' });
  }

  try {
    const collection = await Collection.findById(req.body._id).exec();

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found!' });
    }

    if (collection.owner.toString() !== req.session.account._id.toString()) {
      return res.status(403).json({ error: 'You do not have permission to modify this collection!' });
    }

    if (!collection.animeIds.includes(req.body.animeId)) {
      collection.animeIds.push(req.body.animeId);
      await collection.save();
    }

    return res.json({ collection: Collection.toAPI(collection) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error adding anime to collection!' });
  }
};

// Remove anime from collection
const removeAnimeFromCollection = async (req, res) => {
  if (!req.body._id || !req.body.animeId) {
    return res.status(400).json({ error: 'Collection ID and Anime ID are required!' });
  }

  try {
    const collection = await Collection.findById(req.body._id).exec();

    if (!collection) {
      return res.status(404).json({ error: 'Collection not found!' });
    }

    if (collection.owner.toString() !== req.session.account._id.toString()) {
      return res.status(403).json({ error: 'You do not have permission to modify this collection!' });
    }

    collection.animeIds = collection.animeIds.filter((id) => id.toString() !== req.body.animeId);
    await collection.save();

    return res.json({ collection: Collection.toAPI(collection) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error removing anime from collection!' });
  }
};

module.exports = {
  getCollections,
  createCollection,
  updateCollection,
  deleteCollection,
  addAnimeToCollection,
  removeAnimeFromCollection,
};
