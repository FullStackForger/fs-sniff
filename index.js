"use strict"
const
	fs = require('fs'),
	path = require('path'),
	fsSniff = {}

module.exports = fsSniff

fsSniff.file = function(filePath, opts) {
	let options = opts || {}
  let filePathArr = filePath instanceof Array ? filePath : [filePath]
	let indexes = options.index || []
	let extensions = options.ext || []
	let fileTestPaths = []

	indexes = indexes instanceof Array ? indexes : [indexes]
	extensions = extensions instanceof Array ? extensions : [extensions]

	filePathArr.forEach((fPath) => {
		let isFileName = fPath.search(/[\/\\]\w+\.\w+$/ig) > -1
		
		fileTestPaths.push(fPath)
		if (isFileName) return;

		indexes.forEach((indexFile) => {
			fileTestPaths.push(path.resolve(fPath, indexFile))
		})

		extensions.forEach((ext) => {
			if (ext[0] !== '.') ext = '.' + ext
			fileTestPaths.push(fPath + ext)
		})
	})

	return new Promise(function (resolve, reject) {
		let index = 0
		let file = null

		doWhile(() => {
			return file === null && index < fileTestPaths.length
		}, (next) => {
			fs.stat(fileTestPaths[index], (error, fsStats) => {
				if (error === null && fsStats.isFile()) file = {
					path: fileTestPaths[index],
					stats: fsStats
				}
				index++
				return next()
			})
		}, () => {
			if (file != null) return resolve(file)
			reject(new Error('File not found for any matching patterns'))
		})
	})
}

function doWhile(testFn, mainFn, completeFn) {
	if (testFn()) {
		mainFn(() => {
			doWhile(testFn, mainFn, completeFn)
		})
	} else {
		completeFn()
	}
}
