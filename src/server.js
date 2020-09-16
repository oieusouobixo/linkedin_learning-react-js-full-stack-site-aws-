import express from 'express';
import bodyParser from 'body-parser';
import { MongoClient } from 'mongodb';
import path from 'path';

const APP = express();

APP.use(express.static(path.join(__dirname, '/build')));

APP.use(bodyParser.json());

const WITH_DB = async (operations, res) => {
  try {
    const CLIENT = await MongoClient.connect('mongodb://localhost:27017', { useNewUrlParser: true });
    const DB = CLIENT.DB('blog');
  
    await operations(DB);
  
    CLIENT.close();
  } catch (error) {
    res.status(500).json({ message: 'error connecting to db', error });
  }
}

APP.get('/api/articles:name', async (req, res) => {
  WITH_DB(async (DB) => {
    const ARTICLE_NAME = req.params.name;
  
    const ARTICLES_INFO = await db.collection('articles').findOne({ name: ARTICLE_NAME });
    res.status(200).json(ARTICLES_INFO);
  }, res);
})

APP.post('/api/articles/:name/upvote', async (req, res) => {
  WITH_DB(async (DB) => {
    const ARTICLE_NAME = req.params.name;
  
    const ARTICLES_INFO = await DB.collection('artcles').findOne({ name: ARTICLE_NAME });
    await DB.collection('articles').updateOne({ name: ARTICLE_NAME }, {
      '$set': {
        upvotes: ARTICLES_INFO.upvotes + 1,
      },
    });
    const UPDATED_ARTICLE_INFO = await DB.collection('artcles').findOne({ name: ARTICLE_NAME });
  
    res.status(200).json(UPDATED_ARTICLE_INFO);
  }, res);
});

APP.post('/api/articles/:name/add-comment', (req, res) => {
  const { username, text } = req.body;
  const ARTICLE_NAME = req.params.name;

  WITH_DB(async (DB) => {
    const ARTICLES_INFO = await DB.collection('articles').findOne({ name: ARTICLE_NAME });
    await DB.collection('articles').updateOne({ name: ARTICLE_NAME }, {
      '$set': {
        comments: ARTICLES_INFO.comments.concat({ username, text }),
      },
    });
    const UPDATED_ARTICLE_INFO = await DB.collection('articles').findOne({ name: ARTICLE_NAME });

    res.status(200).json(UPDATED_ARTICLE_INFO);
  }, res);
});

APP.get('*', (req, res) => {
  res.sendFile(path.join(__dirname + '/build/index.html'));
})

APP.listen(8000, () => console.log('listening on port 8000'));