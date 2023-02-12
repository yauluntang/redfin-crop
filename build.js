const exe = require('@angablue/exe');

const build = exe({
  entry: './index.js',
  out: './output/redfin.exe',
  pkg: ['-C', 'GZip'], // Specify extra pkg arguments
  productVersion: '0.0.1',
  fileVersion: '0.0.1',
  target: 'latest-win-x64',
  icon: './exe.ico', // Application icons must be in .ico format
  properties: {
    FileDescription: 'Redfin Crop',
    ProductName: 'Redfin Crop',
    LegalCopyright: 'Legal',
    OriginalFilename: 'redin.exe'
  }
});

build.then(() => console.log('Build completed!'));