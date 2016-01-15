# FS Sniff

Simple helper sniffing for files based on provided patterns.

## Methods

### `file(path)`

Searches for local files based on passed parameters`docs/readme.md` file you can do it calling `file` method.

```js
require('fs-sniff')
  .file('docs/readme.md')
  .then((file) => {
    return console.log(file)
  }).catch((error) => {
    console.log(error)
  })
```        

Method returns promise. If file exist promise resolve with `file` object, which contains 2 parameters:
 - `path` - file location (string)
 - `stats` - [fs.Stats](https://nodejs.org/api/fs.html#fs_class_fs_stats) object

### `file(path, options)`

Method `file` allows "sniffing" options object to be passed as a second parameter. It should have either of (or both) properties:

 - `index` - array of index files

```js
require('fs-sniff').file('public', {
  index: ['index.html', 'index.htm']
}).then((file) => {
  return console.log(file)
})
```   
It will look for `public/index.html` and `public/index.htm` in that order

- `ext` - file extensions you are looking for

```js
require('fs-sniff').file('lib/script', {
  ext: ['jsx', 'js', 'coffee']
}).then((file) => {
  return console.log(file)
})
```   
It will look for `lib/script.jsx`, `lib/script.js`, `lib/script.cofee` in that order
