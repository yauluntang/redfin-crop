const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const createBrowserless = require('browserless')
const getHTML = require('html-get')
const client = require('https');
const startTime = new Date().getTime();
const browserlessFactory = createBrowserless();
const { createBot } = require('whatsapp-cloud-api');
const from = '103671399300618';
const token = 'EAAJ7LwQPrN4BAPyl71hPZCNPnZA8jwntR0oYu8RgwdIWwUZBEFOqZCfanX6uZBTdbACqDthK8D4q7I6yb3vVXwnm0tcGgKP3Ml395aJ5rZCooRKT58wAcZAKyp84jBXqFLPOXk2ZAdKouACyYEHK7O7hlioVbeoaouZBmxgzGoWgLMb3V2li758OUrXN7ACjZCBsMZAvJsiZAaIczgZDZD';
const to = '16176976082';
const axios = require('axios');
const FormData = require('form-data');



function cropSingleImage(file, directory) {
  return new Promise((resolve, reject) => {
    console.log(`Processing ${file}`);
    const fullPath = `${directory}\\${file}`;
    const outputPath = `${directory}\\cropped\\${file}`;

    Jimp.read(fullPath)
      .then(lenna => {
        const width = lenna.getWidth();
        const height = lenna.getHeight();
        console.log(`Finish Reading ${file}`);
        return lenna
          .crop(0, 0, width, height - 60)
          .quality(60)
          .writeAsync(outputPath).then(() => {
            console.log(`Finish Writing ${file}`);
            resolve();
          }); // save
      })
      .catch((e) => {
        console.error(e);
        reject();
      });
  });
}

async function cropImages(directory) {
  const files = fs.readdirSync(directory);
  const targetFiles = files.filter(file => {
    return ['.jpg', '.png', '.bmp', '.gif'].indexOf(path.extname(file).toLowerCase()) !== -1;
  });


  //listing all files using forEach
  for (let file of targetFiles) {
    await cropSingleImage(file, directory);
  };
}


async function runAll() {

  if (process.argv.length >= 3) {
    await cropImages(process.argv[2]);
  }
  console.log(`Number of Files: ${numberOfFiles}`);
  const endTime = new Date().getTime();
  console.log(`Time: ${(endTime - startTime) / 1000}s`);
  process.exit();
}
runAll();

