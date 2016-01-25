# FS Sniff

Simple helper sniffing for files based on provided patterns.

## Methods

### `file(path)`

Searches for local files based on passed parameters.

If you searching for `docs/readme.md` file you can call `file()` method passing path as a parameter.

```js
require('fs-sniff')
  .file('docs/readme.md')     // file location
  .then((file) => {
    return console.log(file)
  }).catch((error) => {
    console.log(error)
  })
```        

Method returns promise. If file exist promise resolve with `file` object, which contains 2 parameters:
 - `path` - file location (string)
 - `stats` - [fs.Stats
 ](https://nodejs.org/api/fs.html#fs_class_fs_stats) object

If you would like to check if file exists in more than one directory you can call `file()` method passing into it an array of paths, eg.:

```js
require('fs-sniff')
  .file([
    'docs/readme.md',          // first possible location
    'temp/docs/readme.md'      // second possible location
  ]).then((file) => {
    return console.log(file)
  }).catch((error) => {
    console.log(error)
  })
```  

#### `file(path, options)`

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

#### `file(path, options)`

Returns list of files from `path` location. I takes two parameters:
- `path` location string
- `opts` object as an optional parameter with two properties
  - `depth` recursive listing depth (default: 0)
  - `type` file type string: `'all'` (default), `'file'`, `'path'`

```js
require('fs-sniff')
	.list(config.blog.path, {type: 'dir', depth: 2})
	.then((list) => {
		console.log(JSON.stringify(list, null, 2))
	})
```

Sold output something like:
```
[
  "category",
  "category1",
  "category1\subcategory",
  "category2",
  "category2\subcategory"
]
```
