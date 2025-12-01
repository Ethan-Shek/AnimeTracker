const mid = require('./middleware');
const controllers = require('./controllers');

const router = (app) => {
  // === AUTH ROUTES ===
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);

  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);

  app.get('/logout', mid.requiresLogin, controllers.Account.logout);

  app.post('/changePassword', mid.requiresLogin, controllers.Account.changePassword);

  app.get('/profile', mid.requiresLogin, controllers.Account.getProfile);

  // === ANIME TRACKER ROUTES ===
  app.get('/tracker', mid.requiresLogin, controllers.Anime.trackerPage);

  app.get('/getAnime', mid.requiresLogin, controllers.Anime.getAnime);

  app.get('/getAnimeByStatus', mid.requiresLogin, controllers.Anime.getAnimeByStatus);

  app.get('/searchAnime', mid.requiresLogin, controllers.Anime.searchAnime);

  app.post('/addAnime', mid.requiresLogin, controllers.Anime.addAnime);

  app.post('/updateAnime', mid.requiresLogin, controllers.Anime.updateAnime);

  app.post('/deleteAnime', mid.requiresLogin, controllers.Anime.deleteAnime);

  // === COLLECTION ROUTES (PREMIUM) ===
  app.get('/getCollections', mid.requiresLogin, controllers.Collection.getCollections);

  app.post('/createCollection', mid.requiresLogin, controllers.Collection.createCollection);

  app.post('/updateCollection', mid.requiresLogin, controllers.Collection.updateCollection);

  app.post('/deleteCollection', mid.requiresLogin, controllers.Collection.deleteCollection);

  app.post('/addAnimeToCollection', mid.requiresLogin, controllers.Collection.addAnimeToCollection);

  app.post('/removeAnimeFromCollection', mid.requiresLogin, controllers.Collection.removeAnimeFromCollection);

  // === PREMIUM/PROFIT MODEL ROUTES ===
  app.post('/purchaseCredits', mid.requiresLogin, controllers.Account.purchaseCredits);

  // === DEFAULT REDIRECT ===
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);

  // === 404 Handler ===
  app.use((req, res) => {
    res.status(404).render('404');
  });
};

module.exports = router;
