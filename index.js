const path = require('path');
const fs = require('fs');
var Jimp = require('jimp');
var afterLoad = require('after-load');

const createBrowserless = require('browserless')
const getHTML = require('html-get')
const client = require('https');

// Spawn Chromium process once
const browserlessFactory = createBrowserless();

if (!fs.existsSync(`${__dirname}\\output`)) {
  fs.mkdirSync(`${__dirname}\\output`);
}
const OUTPUT_PATH = `${__dirname}\\output\\${new Date().getTime()}`;

// Kill the process when Node.js exit
process.on('exit', () => {
  browserlessFactory.close();
})

const getContent = async url => {
  // create a browser context inside Chromium process
  const browserContext = browserlessFactory.createContext()
  const getBrowserless = () => browserContext
  const result = await getHTML(url, { getBrowserless })
  // close the browser context after it's used
  await getBrowserless((browser) => browser.destroyContext())
  return result;
}
const deleteFolderSync = (directory) => {
  try {
    const files = fs.readdirSync(directory);

    for (const file of files) {
      fs.unlinkSync(path.join(directory, file));
    }
  }
  catch (e) {

  }
}

async function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    client.get(url, (res) => {
      if (res.statusCode === 200) {
        if (!fs.existsSync(OUTPUT_PATH)) {
          fs.mkdirSync(OUTPUT_PATH);
        }
        res.pipe(fs.createWriteStream(filepath))
          .on('error', reject)
          .once('close', () => resolve(filepath));
      } else {
        // Consume response data to free up memory
        res.resume();
        reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));

      }
    });
  });
}



async function runAll() {
  if (process.argv.length >= 3) {
    await deleteFolderSync(OUTPUT_PATH);
    await downloadAllRedfinImages(process.argv[2]);
    await cropImages(OUTPUT_PATH);
  }
  process.exit();
}

runAll();

async function downloadAllRedfinImages(url) {
  try {


    const content = await getContent(url);
    const regexp = new RegExp("\"https:\/\/ssl.cdn-redfin.com\/photo\/.{1,10}\/bigphoto\/.{1,50}\.jpg\"", "gmi");
    const arraylist = [...content.html.matchAll(regexp)];

    let imageUrl = null;
    if (arraylist.length > 0) {
      imageUrl = arraylist[0][0].replace(/_.{1,}\./gi, '{x}.').replaceAll('\"', '');
    }
    console.log(imageUrl)

    if (imageUrl.indexOf('{x}') !== -1) {


      let image = null;
      let i = 1;
      do {
        const imgUrl = imageUrl.replace('{x}', `_${i}_0`);
        try {
          console.log(`Downloading ${imgUrl}`)
          image = await downloadImage(imgUrl, `${OUTPUT_PATH}\\test_${i}.jpg`);
        }
        catch (e) {
          console.error(e);
          image = null;
        }
        i++;
      } while (image !== null);
    }











  }
  catch (e) {
    console.error(e);

  }
}


async function cropImages(directory) {
  const files = fs.readdirSync(directory);


  const targetFiles = files.filter(file => {
    return ['.jpg', '.png', '.bmp', '.gif'].indexOf(path.extname(file).toLowerCase()) !== -1;
  });

  //listing all files using forEach
  for (let file of targetFiles) {
    // Do whatever you want to do with the file
    console.log(`Processing ${file}`);

    const fullPath = `${directory}\\${file}`;
    const outputPath = `${directory}\\cropped\\${file}`;

    await Jimp.read(fullPath)
      .then(lenna => {
        const width = lenna.getWidth();
        const height = lenna.getHeight();
        console.log(`Finish Reading ${file}`);
        return lenna
          .crop(0, 0, width, height - 60)
          .writeAsync(outputPath).then(() => {
            console.log(`Finish Writing ${file}`);
          }); // save
      })
      .catch(err => {
        console.error(err);
      });

  };

}



/*

if (process.argv.length >= 3) {
  const directory = process.argv[2];
  
}*/