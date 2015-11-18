var path = require('path');
var fs = require('fs');
var vm = require('vm');
var utils = require('./utils');

function DataSet(path, exts) {
	this.path = path;
	this.exts = exts;
}

DataSet.prototype.get = function (file, params) {
	var data = {};
	var dataExt = null;

	var ext = path.extname(file);
	var regexp = new RegExp('\\' + ext + '$');

	var dataFile = file.replace(regexp, '');
	dataFile = path.resolve(this.path, dataFile);

	this.exts.some(function (ext) {
		if (fs.existsSync(dataFile + ext)) {
			dataExt = ext;
			return true;
		}
	});

	if (dataExt) {
		dataFile += dataExt;
		var content = fs.readFileSync(dataFile).toString();

		try {
			data = JSON.parse(content)
		} catch(ex) {
			var sandbox = { module: {}, exports: {} };

			vm.createContext(sandbox);
			vm.runInContext(content, sandbox);
			data = sandbox.module.exports;

			if (utils.isFunc(data))
				data = data(params, utils);
			else
				data = utils.assign({}, data);
		}
	}

	return data;
};

module.exports = DataSet;
