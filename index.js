const path = require('path');
const fs = require('fs');
const Jimp = require('jimp');
const createBrowserless = require('browserless')
const getHTML = require('html-get')
const client = require('https');
const startTime = new Date().getTime();
const browserlessFactory = createBrowserless();
const axios = require('axios');
const FormData = require('form-data');



if (!fs.existsSync(`${__dirname}\\output`)) {
  fs.mkdirSync(`${__dirname}\\output`);
}
const OUTPUT_PATH = `${__dirname}\\output\\${startTime}`;
let numberOfFiles = 0;

const getContent = async url => {
  const browserContext = browserlessFactory.createContext()
  const getBrowserless = () => browserContext
  const result = await getHTML(url, { getBrowserless })
  await getBrowserless((browser) => browser.destroyContext())
  browserlessFactory.close();
  return result;
}


const postImage = async (file, type) => {
  return new Promise(async (resolve, reject) => {
    var body = new FormData();
    const filestream = fs.createReadStream(file);
    body.append('file', filestream);
    body.append('type', type);
    body.append('messaging_product', 'whatsapp');
    const request_config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        ...body.getHeaders()
      }
    };
    const url = `https://graph.facebook.com/v15.0/${from}/media`;

    axios.post(url, body, request_config)
      .then((response) => {
        console.log(response);
        resolve(response.data);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  })
}

const postText = async (to, text) => {
  return new Promise(async (resolve, reject) => {
    const body = {};
    body.messaging_product = "whatsapp";
    body.recipient_type = "individual";
    body.to = to;
    body.type = "text";
    body.text = { "preview_url": true, "body": text }
    const request_config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    const url = `https://graph.facebook.com/v15.0/${from}/messages`;

    axios.post(url, body, request_config)
      .then((response) => {

        console.log(response.data)
        resolve(response.data);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  })
}

const postTemplate = async (to) => {
  return new Promise(async (resolve, reject) => {
    const body = {};
    body.messaging_product = "whatsapp";
    body.to = to;
    body.type = "template";
    body.template = { "name": "hello_world", "language": { "code": "en_US" } }
    const request_config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    const url = `https://graph.facebook.com/v15.0/${from}/messages`;

    axios.post(url, body, request_config)
      .then((response) => {

        console.log(response.data)
        resolve(response.data);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  })
}

const postMedia = async (to) => {
  return new Promise(async (resolve, reject) => {
    const body = {};
    body.messaging_product = "whatsapp";
    body.to = to;
    body.type = "image";
    body.image = { "link": "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/640px-Image_created_with_a_mobile_phone.png" }
    const request_config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
    const url = `https://graph.facebook.com/v15.0/${from}/messages`;

    axios.post(url, body, request_config)
      .then((response) => {

        console.log(response.data)
        resolve(response.data);
      })
      .catch((error) => {
        console.error(error);
        reject(error);
      });
  })
}

const deleteFolderSync = (directory) => {
  try {
    if (fs.existsSync(directory)) {
      const files = fs.readdirSync(directory);
      for (const file of files) {
        fs.unlinkSync(path.join(directory, file));
      }
    }
  }
  catch (e) {
    // Not an error if it does not exist
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

const firstVersionOnly = false;

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
      let j = 0;
      let retry = false;
      let atLeastOne = false;
      do {
        const imgUrl = imageUrl.replace('{x}', `_${i}_${j}`);
        try {
          console.log(`Downloading ${imgUrl}`)
          const numI = i.toString().padStart(2, '0');
          const numJ = j.toString().padStart(2, '0');
          const numJLast = (j - 1).toString().padStart(2, '0');
          image = await downloadImage(imgUrl, `${OUTPUT_PATH}\\image_${numI}_${numJ}.jpg`);
          if (firstVersionOnly) {
            i++;
          }
          else {
            if (j > 0) {
              let path = `${OUTPUT_PATH}\\image_${numI}_${numJLast}.jpg`;
              if (fs.existsSync(path)) {
                fs.unlinkSync(path)
              }
            }
            j++;

          }
          if ( image ){
            retry = false;
            atLeastOne = true;
          }
        }
        catch (e) {
          //console.log('Error out', e)
          //end of the images
          image = null;
          if (j >= 1 && atLeastOne) {
            j = 0;
            i++;
            atLeastOne = false;
          }

          else if ( j <= 10 && !atLeastOne ){
            retry = true;
            j++;
          }
          else if ( j > 10 ){
            retry = false;
          }
  
        }
      } while (image !== null || (j >= 0 && j <= 10) || retry );
    }
  }
  catch (e) {
    console.error(e);
  }
}

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
            numberOfFiles++;
            console.log(`Finish Writing ${file}`);
            resolve();
          }); // save
      })
      .catch((e) => {
        console.error(err);
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
    await deleteFolderSync(OUTPUT_PATH);
    await downloadAllRedfinImages(process.argv[2]);
    await cropImages(OUTPUT_PATH);
  }
  console.log(`Number of Files: ${numberOfFiles}`);
  const endTime = new Date().getTime();
  console.log(`Time: ${(endTime - startTime) / 1000}s`);
  process.exit();
}
runAll();

