const models = require('../models');

const { Anime } = models;

// Page to display the anime tracker dashboard
const trackerPage = (req, res) => {
  return res.render('app');
};

// Get all anime for the current user
const getAnime = async (req, res) => {
  try {
    const query = { owner: req.session.account._id };
    const anime = await Anime.find(query).lean().exec();

    return res.json({ anime });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving anime!' });
  }
};

// Get anime by status (watching, plan, completed, dropped)
const getAnimeByStatus = async (req, res) => {
  if (!req.query.status) {
    return res.status(400).json({ error: 'Status parameter is required!' });
  }

  try {
    const validStatuses = ['watching', 'plan', 'completed', 'dropped'];
    if (!validStatuses.includes(req.query.status)) {
      return res.status(400).json({ error: 'Invalid status!' });
    }

    const query = { owner: req.session.account._id, status: req.query.status };
    const anime = await Anime.find(query).lean().exec();

    return res.json({ anime });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error retrieving anime!' });
  }
};

// Search anime by title or genre
const searchAnime = async (req, res) => {
  if (!req.query.q) {
    return res.status(400).json({ error: 'Search query is required!' });
  }

  try {
    const searchQuery = {
      owner: req.session.account._id,
      $or: [
        { title: { $regex: req.query.q, $options: 'i' } },
        { genres: { $regex: req.query.q, $options: 'i' } },
      ],
    };

    const anime = await Anime.find(searchQuery).lean().exec();
    return res.json({ anime });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error searching anime!' });
  }
};

// Add a new anime
const addAnime = async (req, res) => {
  if (!req.body.title) {
    return res.status(400).json({ error: 'Title is required!' });
  }

  const animeData = {
    title: req.body.title,
    genres: req.body.genres || [],
    rating: req.body.rating || 0,
    status: req.body.status || 'plan',
    notes: req.body.notes || '',
    owner: req.session.account._id,
  };

  try {
    const newAnime = new Anime(animeData);
    await newAnime.save();
    return res.status(201).json({ anime: Anime.toAPI(newAnime) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'An error occurred adding anime!' });
  }
};

// Update an anime
const updateAnime = async (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'Anime ID is required!' });
  }

  try {
    const anime = await Anime.findById(req.body._id).exec();

    if (!anime) {
      return res.status(404).json({ error: 'Anime not found!' });
    }

    if (anime.owner.toString() !== req.session.account._id.toString()) {
      return res.status(403).json({ error: 'You do not have permission to update this anime!' });
    }

    if (req.body.title) {
      anime.title = req.body.title;
    }
    if (req.body.genres) {
      anime.genres = req.body.genres;
    }
    if (req.body.rating !== undefined) {
      anime.rating = req.body.rating;
    }
    if (req.body.status) {
      anime.status = req.body.status;
    }
    if (req.body.notes !== undefined) {
      anime.notes = req.body.notes;
    }

    await anime.save();
    return res.json({ anime: Anime.toAPI(anime) });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error updating anime!' });
  }
};

// Delete an anime
const deleteAnime = async (req, res) => {
  if (!req.body._id) {
    return res.status(400).json({ error: 'Anime ID is required!' });
  }

  try {
    const anime = await Anime.findById(req.body._id).exec();

    if (!anime) {
      return res.status(404).json({ error: 'Anime not found!' });
    }

    if (anime.owner.toString() !== req.session.account._id.toString()) {
      return res.status(403).json({ error: 'You do not have permission to delete this anime!' });
    }

    await Anime.deleteOne({ _id: req.body._id });
    return res.json({ message: 'Anime deleted successfully' });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: 'Error deleting anime!' });
  }
};

module.exports = {
  trackerPage,
  getAnime,
  getAnimeByStatus,
  searchAnime,
  addAnime,
  updateAnime,
  deleteAnime,
};
