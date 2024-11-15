require('dotenv').config();
const origin = process.env.ALLOWED_ORIGIN;
const express = require('express');
const cors = require('cors');
const ScrappingService = require('./ScrappingService.js');
const User = require('./User.js');

const app = new express();
const PORT = 3000;
const REQUEST_TIMEOUT = 15000;
const scrap = new ScrappingService();
let user = new User();

app.use(cors({
  origin: origin
}))

app.use((req, res, next) => {
  const memoryUsage = process.memoryUsage();
  console.log('Mémoire utilisée :');
  console.log(`RSS      : ${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Heap Total : ${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Heap Used  : ${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`);
  console.log(`External : ${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`);
  console.log(`Array Buffers : ${(memoryUsage.arrayBuffers / 1024 / 1024).toFixed(2)} MB`);
  console.log('---');
  next();
});

app.get('/api/search/:keyword', async (req, res) => {
  const keyword = req.params.keyword;
  const timeout = setTimeout(() => {
    if (!isResponseSent) {
      isResponseSent = true;
      scrap.close();
      res.status(408).send('La requête a expiré');
    }
  }, REQUEST_TIMEOUT);
  let isResponseSent = false;

  if (!keyword) {
    clearTimeout(timeout);
    isResponseSent = true;
    return res.status(400).send("keyword is required");
  }

  try {
    await scrap.start();
    const data = await scrap.getSearchResult(keyword);
    scrap.close();
    if (!isResponseSent) {
      clearTimeout(timeout);
      isResponseSent = true;
      res.send(data);
    }
  } catch (error) {
    if (!isResponseSent) {
      clearTimeout(timeout);
      isResponseSent = true;
      res.status(500).send("Internal Server Error");
    }
  }
});

app.get('/api/graph-link', async (req, res) => {
  const id = req.query.id;
  const link = req.query.link;
  const timeout = setTimeout(() => {
    if (!isResponseSent) {
      isResponseSent = true;
      scrap.close();
      res.status(408).send('La requête a expiré');
    }
  }, REQUEST_TIMEOUT);
  let isResponseSent = false;

  if (id && link) {
    try {
      await scrap.start()
      let data = "";
      if (user.getAuthStatus()) {
        data = await scrap.getPrivateGraphLink(id, link, user);
      } else {
        data = await scrap.getPublicGraphLink(id, link);
      }
      scrap.close();
      if (!isResponseSent) {
        clearTimeout(timeout);
        isResponseSent = true;
        res.send(data);
    }
    } catch (error) {
      if (!isResponseSent) {
        clearTimeout(timeout);
        isResponseSent = true;
        res.status(500).send("Internal Server Error");
      }
    }
  } else {
    clearTimeout(timeout);
    isResponseSent = true;
    return res.status(400).send("id and link are required");
  }
});

app.get('/api/login', async (req, res) => {
  const email = req.query.email;
  const password = req.query.password;
  const timeout = setTimeout(() => {
    if (!isResponseSent) {
      isResponseSent = true;
      res.status(408).send('La requête a expiré');
    }
  }, REQUEST_TIMEOUT);
  let isResponseSent = false;
  
  try {
    const response = await scrap.login(email, password);
    if(!response.error && !isResponseSent){
      user
      .setEmail(email)
      .setPassword(password)
      .setAuthStatus(true)
      .setMessage(response.message);
      clearTimeout(timeout);
      isResponseSent = true;
      res.send(user.publicUser());
    }else{
      if (!isResponseSent) {
        clearTimeout(timeout);
        isResponseSent = true;
        res.status(400).send(response.message)
      }
    }
  } catch (error) {
    clearTimeout(timeout);
    isResponseSent = true;
    res.status(500).send("Internal Server Error");
  }
});

app.get('/api/logout', (req, res) => {
    user = new User();
    res.send(user.publicUser());
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
