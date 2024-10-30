const express = require('express');
const ScrappingService = require('./ScrappingService.js');

const app = new express();
let scrap = new ScrappingService()
const PORT = 3000;

app.get('/search/:keyword', async (req, res) => {
  const keyword = req.params.keyword;

  if (!keyword) {
    return res.status(400).send("keyword is required");
  }

  try {
    await scrap.start();
    const data = await scrap.getSearchResult(keyword);
    res.send(data);
  } catch (error) {
    res.status(500).send("Internal Server Error");
  }
});

app.get('/graph-link', async (req, res) => {
  const id = req.query.id;
  const link = req.query.link;

  if (id && link) {
    try {
      await scrap.start()
      let data = "";
      if (scrap.User.getAuthStatus()) {
        data = await scrap.getPrivateGraphLink(id, link);
      } else {
        data = await scrap.getPublicGraphLink(id, link);
      }
      await scrap.close();
      res.send(data);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  } else {
    return res.status(400).send("id and link are required");
  }
});

app.get('/login', async (req, res) => {
  const email = req.query.email;
  const password = req.query.password;

  if (email && password) {
    try {
      const data = await scrap.User.login(email, password)
      res.send(data);
    } catch (error) {
      res.status(500).send("Internal Server Error");
    }
  } else {
    return res.status(400).send("email and password are required");
  }
});

app.get('/logout', (req, res) => {
  
  if(!scrap.User.getAuthStatus()){
    res.send("You'r not connected !")
  }else {
    scrap = new ScrappingService();
    res.send('Successfully disconnected !');
  }
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
