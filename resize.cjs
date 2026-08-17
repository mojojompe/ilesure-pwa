const fs = require('fs');
const { Jimp } = require('jimp');

async function resize() {
  const image = await Jimp.read('public/favicon.png');
  image.cover({ w: 192, h: 192 }).write('public/pwa-192x192.png');
  image.cover({ w: 512, h: 512 }).write('public/pwa-512x512.png');
  console.log('Done resizing');
}

resize().catch(console.error);
