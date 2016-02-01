const sniff = require('../')


sniff
  .tree(__dirname, { depth: 10, rootPrefix: false })
  .then((dirs) => {
    console.log('\ntree\n---------------')
    console.log(JSON.stringify(dirs, null, 2))
  })
