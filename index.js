const express = require('express');
const axios = require('axios');
const nsfwjs = require('nsfwjs');
const tf = require('@tensorflow/tfjs-node');
const sharp = require('sharp');

const app = express();
const PORT = 9740;
const HOST = '127.0.0.1';

let model;

nsfwjs.load("https://raw.githubusercontent.com/infinitered/nsfwjs/master/models/inception_v3/model.json", { size: 299 })
  .then((loadedModel) => {
    model = loadedModel;
    console.log('Model loaded');
  })
  .catch((error) => {
    console.error('Error loading model:', error);
  });

// Redirect root path to GitHub
app.get('/', (req, res) => {
  res.redirect('https://github.com/0-RTT/nsfw');
});

// NSFW classification endpoint
app.get('/nsfw', async (req, res) => {
  try {
    const { url } = req.query;
    if (!url) {
      return res.status(400).json({ message: 'Invalid URL.' });
    }

    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const imageBuffer = Buffer.from(response.data);

    let imageTensor;

    if (url.endsWith('.gif')) {
      const jpgBuffer = await sharp(imageBuffer)
        .resize({ width: 299, height: 299 })
        .toFormat('jpeg')
        .toBuffer();

      imageTensor = tf.node.decodeImage(jpgBuffer, 3);
    } else {
      imageTensor = tf.node.decodeImage(imageBuffer, 3);
    }

    const predictions = await model.classify(imageTensor);
    imageTensor.dispose();

    const formattedPredictions = predictions.reduce((acc, { className, probability }) => {
      acc[className] = probability;
      return acc;
    }, {});

    res.json(formattedPredictions);
  } catch (error) {
    console.error('Error processing image:', error);
    
    if (error.response) {
      return res.status(error.response.status).json({ message: 'Error fetching image from URL.', details: error.message });
    } else if (error.code === 'ERR_INVALID_URL') {
      return res.status(400).json({ message: 'Invalid image URL.', details: error.message });
    } else {
      return res.status(500).json({ message: 'Internal server error.', details: error.message });
    }
  }
});

// Handle 404 for any other paths
app.use((req, res) => {
  res.sendStatus(404); // 直接返回 404 响应
});

app.listen(PORT, HOST, () => {
  console.log(`Server is running on http://${HOST}:${PORT}`);
});
