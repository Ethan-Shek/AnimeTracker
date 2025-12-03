const mongoose = require('mongoose');
const _ = require('underscore');

let CollectionModel = {};

const setName = (name) => _.escape(name).trim();

const CollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    set: setName,
  },
  description: {
    type: String,
    default: '',
  },
  animeIds: {
    type: [mongoose.Schema.ObjectId],
    default: [],
  },
  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
});

CollectionSchema.statics.toAPI = (doc) => ({
  _id: doc._id,
  name: doc.name,
  description: doc.description,
  animeIds: doc.animeIds,
  createdDate: doc.createdDate,
});

CollectionSchema.statics.findByOwner = async (ownerId) => {
  const search = { owner: new mongoose.Types.ObjectId(ownerId) };
  const docs = await CollectionModel.find(search).lean();
  return docs;
};

CollectionModel = mongoose.model('Collection', CollectionSchema);

module.exports = CollectionModel;
