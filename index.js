"use strict"
const
	fs = require('fs'),
	path = require('path'),
	forger = require('forger'),
	doWhile = forger.doWhile,
	fsSniff = {},
	dirNameReg = /([\w-_.]*)$/

module.exports = fsSniff

fsSniff.tree = function(rootDir, opts) {
	opts = opts || {}
	opts.uriPrefix = opts.uriPrefix || null // added to slug
	opts.depth = (opts.depth && opts.depth >= 0) ? opts.depth : 0
	return new Promise((resolve, reject) => {
		fs.readdir(rootDir, (err, files) => {
			let index = -1
			let name = rootDir.match(dirNameReg)[1]
			let data = {
				name: name,
				uri: opts.uriPrefix ? opts.uriPrefix + '/' + name : name,
				path: path.resolve(rootDir),
				dirs: [],
				files: []
			}
			if (!files) return resolve(data)
			doWhile((next) => {
				let file = files[index]
				let filePath = rootDir + '/' + file
				if (file[0] === '.') return next()
				fs.stat(filePath, function(err, stat) {
					if (stat.isDirectory()) {
						if (opts.depth == 0) return next()
						fsSniff
							.tree(path.resolve(rootDir, file), {
								uriPrefix: data.uri,
								depth: opts.depth - 1
							}).then((subDirData) => 	{
								data.dirs.push(subDirData)
								next()
							})
					} else {
						data.files.push(file)
						next()
					}
				})
			}, () => {
				return ++index < files.length
			}).then(() => {
				return resolve(data)
			})
		})
	})
}

fsSniff.list = function(rootDir, opts) {
	opts = opts || {}
	opts.type = (opts.type == 'file' || opts.type == 'dir')
		? opts.type
		: 'any'
	opts.depth = (opts.depth && typeof(opts.depth) == 'number' && opts.depth >= 0)
		? opts.depth
		: 0
	return new Promise((resolve, reject) => {
		fs.readdir(rootDir, (err, files) => {
			let index = -1
			let dirs = []
			if (!files) return resolve(dirs)
			doWhile((next) => {
				let file = files[index]
				let filePath = rootDir + '/' + file
				if (file[0] === '.') return next()
				fs.stat(filePath, function(err, stat) {
					if (stat.isDirectory()) {
						if (opts.type == 'any' || opts.type == 'dir') dirs.push(file)
						if (opts.depth == 0) return next()
						fsSniff
							.list(path.resolve(rootDir, file), {
								type: opts.type,
								depth: opts.depth - 1
							}).then((subdirs) => {
								subdirs.forEach((subdir) => dirs.push(path.join(file, subdir)))
								next()
							})
					} else {
						if (opts.type == 'any' || opts.type == 'file') dirs.push(file)
						next()
					}
				})
			}, () => {
				return ++index < files.length
			}).then(() => {
				return resolve(dirs)
			})
		})
	})
}

fsSniff.file = function(locations, opts) {
	opts = opts || {}

	let fileType = (opts.type == 'file' || opts.type == 'dir') ? opts.type : 'any'
	let indexes = opts.index || []
	let extensions = opts.ext || []
	let fileTestPaths = []

	locations = locations instanceof Array ? locations : [locations]
	indexes = indexes instanceof Array ? indexes : [indexes]
	extensions = extensions instanceof Array ? extensions : [extensions]

	if (!opts.type && (extensions.length > 0 || indexes.length > 0)) {
		fileType = 'file'
	}

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

		doWhile((next) => {
			fs.stat(fileTestPaths[index], (error, fsStats) => {
				if ((error === null) &&	(
					(fsStats.isDirectory() && (fileType == 'any' || fileType == 'dir')) ||
					(fsStats.isFile() && (fileType == 'any' || fileType == 'file'))
				)) file = {
					path: fileTestPaths[index],
					stats: fsStats
				}
				index++
				return next()
			})
		}, () => {
			return file === null && index < fileTestPaths.length
		}).then(() => {
			if (file != null) return resolve(file)
			reject(new Error('File not found for any matching patterns'))
		})
	})
}
