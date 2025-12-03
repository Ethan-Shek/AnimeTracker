const mongoose = require('mongoose');
const _ = require('underscore');

let AnimeModel = {};

const setTitle = (title) => _.escape(title).trim();
const setGenres = (genres) => {
  if (Array.isArray(genres)) {
    return genres.map((g) => _.escape(g).trim()).filter((g) => g.length > 0);
  }
  return [];
};

const AnimeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    set: setTitle,
  },
  genres: {
    type: [String],
    default: [],
    set: setGenres,
  },
  rating: {
    type: Number,
    min: 0,
    max: 10,
    default: 0,
  },
  status: {
    type: String,
    enum: ['watching', 'plan', 'completed', 'dropped'],
    default: 'plan',
  },
  notes: {
    type: String,
    default: '',
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

AnimeSchema.statics.toAPI = (doc) => ({
  _id: doc._id,
  title: doc.title,
  genres: doc.genres,
  rating: doc.rating,
  status: doc.status,
  notes: doc.notes,
  createdDate: doc.createdDate,
});

AnimeSchema.statics.findByOwner = async (ownerId) => {
  const search = { owner: new mongoose.Types.ObjectId(ownerId) };
  const docs = await AnimeModel.find(search).lean();
  return docs;
};

AnimeSchema.statics.findByOwnerAndStatus = async (ownerId, status) => {
  const search = { owner: new mongoose.Types.ObjectId(ownerId), status };
  const docs = await AnimeModel.find(search).lean();
  return docs;
};

AnimeModel = mongoose.model('Anime', AnimeSchema);

module.exports = AnimeModel;
