const sniff = require('../')

sniff
  .tree(__dirname)
  .then((dirs) => {
    console.log(JSON.stringify(dirs, null, 2))
  })


sniff
  .list(__dirname)
  .then((dirs) => {
    console.log(JSON.stringify(dirs, null, 2))
  })


sniff
  .file(__dirname, { index: 'example.js' })
  .then((data) => console.log(data.path))
