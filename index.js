"use strict"
const
	fs = require('fs'),
	path = require('path'),
	fsSniff = {}

module.exports = fsSniff

fsSniff.file = function(filePath, opts) {
	let options = opts || {}
	let indexes = options.index || []
	let extensions = options.ext || []
	let filePaths = []

	filePaths.push(filePath)

	indexes = indexes instanceof Array ? indexes : [indexes];
	indexes.forEach((indexFile) => {
		filePaths.push(path.resolve(filePath, indexFile))
	})

	extensions = extensions instanceof Array ? extensions : [extensions];
	extensions.forEach((ext) => {
		if (ext[0] !== '.') ext = '.' + ext
		filePaths.push(filePath + ext)
	})

	return new Promise(function (resolve, reject) {
		let index = 0
		let file = null

		doWhile(() => {
			return file === null && index < filePaths.length
		}, (next) => {
			fs.stat(filePaths[index], (error, fsStats) => {
				if (error === null && fsStats.isFile()) file = {
					path: filePaths[index],
					stats: fsStats
				}
				//console.log(index, file !== null, filePaths[index]);
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
