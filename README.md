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
 - `ext` - file extensions you are looking for
 - `type` file type string: `'any'` (default), `'file'`, `'dir'`


Below code will look for `public/index.html` and `public/index.htm` in that order
```js
require('fs-sniff').file('public', {
  index: ['index.html', 'index.htm'],
  //type: 'file'  // set by default because of 'index' property
}).then((file) => {
  return console.log(file)
})
```   

Another example, looking for directory:
  - `lib/script/`

and files:
 - `lib/script.jsx`,
 - `lib/script.js`
 - `lib/script.cofee`

in that order.

```js
require('fs-sniff').file('lib/script', {
  ext: ['jsx', 'js', 'coffee'],
  type: 'any'
}).then((file) => {
  return console.log(file)
})
```   


#### `list(path, options)`

Returns list of files from `path` location. I takes two parameters:
- `path` location string
- `opts` object as an optional parameter with two properties
  - `depth` recursive listing depth (default: 0)
  - `type` file type string: `'any'` (default), `'file'`, `'dir'`

```js
require('fs-sniff')
	.list('path/to/a/folder', {type: 'dir', depth: 2})
	.then((list) => {
		console.log(JSON.stringify(list, null, 2))
	})
```

Should output something like:
```
[
  "directory-1",
  "directory-1\subcategory-1",
  "directory-1\subcategory-2",
]
```


#### `tree(path, options)`

Returns array of `dir` objects from `path` location. Method takes two parameters:
`poath` and `options` object with internal properties listed below.
- `path` location string
- `opts` object as an optional parameter with two properties
  - `depth` recursive listing depth (default: 0)
  - `rootPrefix` if `false` it won't prefix `uri` properties with root directory

```js
require('fs-sniff')
	.tree(config.blog.path, {rootPrefix: 'false', depth: 2})
	.then((list) => {
		console.log(JSON.stringify(list, null, 2))
	})
```

Should output something like:
```
{
  "name": "example",
  "uri": "",
  "path": "full/path/to/directory",
  "dirs": [
    /* nested dir objects */
  ],
  "files": [
    "index.js",
    "another-file.md
  ]
}

```
Notice that `uri` property is empty (`""`) because `opts.rootPrefix` parameter
passed to a method is set to `false`
