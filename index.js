"use strict"
const
	fs = require('fs'),
	path = require('path'),
	fsSniff = {},
	dirNameReg = /([\w-_]*)$/

module.exports = fsSniff

fsSniff.tree = function(rootDir) {
	return new Promise((resolve, reject) => {
		fs.readdir(rootDir, (err, files) => {
			let index = -1
			let data = {
				name: rootDir.match(dirNameReg)[1],
				path: path.resolve(rootDir),
				dirs: [],
				files: []
			}
			if (!files) return resolve(data)
			doWhile(() => {
				return ++index < files.length
			}, (next) => {
				let file = files[index]
				let filePath = rootDir + '/' + file
				if (file[0] === '.') return next()
				fs.stat(filePath, function(err, stat) {
					if (stat.isDirectory()) {
						fsSniff
							.tree(path.resolve(rootDir, file))
							.then((subDirData) => 	{
								data.dirs.push(subDirData)
								next()
							})
					} else {
						data.files.push(file)
						next()
					}
				})
			}, () => {
				return resolve(data)
			})
		})
	})
}

fsSniff.list = function(rootDir, opts) {
	opts = opts || {}
	opts.type = (opts.type == 'file' || opts.type == 'dir')
		? opts.type
		: 'all'
	opts.depth = (opts.depth && typeof(opts.depth) == 'number' && opts.depth >= 0)
		? opts.depth
		: 0
	return new Promise((resolve, reject) => {
		fs.readdir(rootDir, (err, files) => {
			let index = -1
			let dirs = []
			if (!files) return resolve(dirs)
			doWhile(() => {
				return ++index < files.length
			}, (next) => {
				let file = files[index]
				let filePath = rootDir + '/' + file
				if (file[0] === '.') return next()
				fs.stat(filePath, function(err, stat) {
					if (stat.isDirectory()) {
						if (opts.type == 'all' || opts.type == 'dir') dirs.push(file)
						if (opts.depth == 0) return next()
						fsSniff
							.list(path.resolve(rootDir, file), {
								type: opts.type,
								depth: opts.depth - 1
							})
							.then((subdirs) => {
								subdirs.forEach((subdir) => dirs.push(path.join(file, subdir)))
								next()
							})
					} else {
						if (opts.type == 'all' || opts.type == 'file') dirs.push(file)
						next()
					}
				})
			}, () => {
				return resolve(dirs)
			})
		})
	})
}

fsSniff.file = function(locations, opts) {
	let options = opts || {}
	let indexes = options.index || []
	let extensions = options.ext || []
	let fileTestPaths = []

	locations = locations instanceof Array ? locations : [locations]
	indexes = indexes instanceof Array ? indexes : [indexes]
	extensions = extensions instanceof Array ? extensions : [extensions]

	locations.forEach((fPath) => {
		let isFileName = fPath.search(/[\/\\]\w+\.\w+$/ig) > -1

		fileTestPaths.push(fPath)
		if (isFileName) return;

		indexes.forEach((indexFile) => {
			fileTestPaths.push(path.join(fPath, indexFile))
		})

		extensions.forEach((ext) => {
			if (ext[0] !== '.') ext = '.' + ext
			fileTestPaths.push(fPath + ext)
		})
	})

	//fileTestPaths.forEach((fTestPath) => console.log(fTestPath))

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
