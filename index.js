var _ = require("lodash");

var fs = require("fs");
var path = require("path");
var mkdirp = require("mkdirp");
var fileType = require("file-type");
var json2csv = require('json2csv');
var json2xls = require('json2xls');
var nodexlsx = require('node-xlsx');
var csvParse = require("csv-parse/lib/sync");
var jsbeautify = require('js-beautify');

module.exports = new FSExt();

function FSExt() {
	return {
		readSync: readSync,
		writeSync: writeSync,
		readSyncByType: readSyncByType,
		writeSyncByType: writeSyncByType,
		readHTMLSync: readHTMLSync,
		writeHTMLSync: writeHTMLSync,
		readJSONSync: readJSONSync,
		writeJSONSync: writeJSONSync,
		readCsvSync: readCsvSync,
		writeCsvSync: writeCsvSync,
		readXlsSync: readXlsSync,
		writeXlsSync: writeXlsSync
	};

	function readSync(filePath) {
		if (!filePath) return new Error("incorrect params");

		return fs.existsSync(filePath) ? fs.readFileSync(filePath) : null;
	};

	function writeSync(filePath, data, type) {
		if (!filePath && !data) return new Error("incorrect params");

		var dirPath = path.dirname(filePath);
        if (!fs.existsSync(dirPath)) mkdirp.sync(dirPath);

        fs.writeFileSync(filePath, data, type);
	};

	function readSyncByType(filePath) {
		var type = __fileTypePath(filePath);

		if (!type) return readSync(filePath);

		if (type.ext == "json") return readJSONSync(filePath);
		else if (type.ext == "html") return readTMLSync(filePath);
		else return readSync(filePath);
	};

	function writeSyncByType(filePath, data) {
		var type = fileType(data) || __fileTypePath(filePath);

		if (!type) writeSync(filePath, data);

		if (type.ext == "json") writeJSONSync(filePath, data);
		else if (type.ext == "html") writeHTMLSync(filePath, data);
		else writeSync(filePath, data);
	};

	function readHTMLSync(filePath) {
		return readSync(filePath);
	};

	function writeHTMLSync(filePath, data) {
		if (!filePath && !data) return new Error("incorrect params");

		var data = jsbeautify.html(data);
		writeSync(filePath, data);
	};

	function readJSONSync(filePath) {
		return JSON.parse(readSync(filePath));
	};

	function writeJSONSync(filePath, data) {
		if (!filePath && !data) return new Error("incorrect params");

		var data = JSON.stringify(data, null, 4);
		writeSync(filePath, data);
	};

	function readCsvSync(filePath) {
		var input = readSync(filePath);

        return csvParse(input, {columns: true});
	};

	function writeCsvSync(filePath, data) {
		if (!filePath && !data) return new Error("incorrect params");

		var csvData = json2csv({ data: data, fields: _.isArray(data[0]) ? data[0] : _.keys(data[0]) });
		writeSync(filePath, csvData);
	};

	function readXlsSync(filePath) {
		var result = nodexlsx.parse(filePath);
		if (!result) return null;

		var data = result[0].data;

		var output = [];
		var keys = data[0];

		_.each(data, function(arr, id) {
			if (id == 0) return;

			var obj = {};

			_.each(keys, function(key, index) {
				obj[key] = arr[index];
			});

			output.push(obj);
		});

		return output;
	};

	function writeXlsSync(filePath, data) {
		if (!filePath && !data) return new Error("incorrect params");

		var xlsData = json2xls(data, { fields: _.keys(data[0]) });
		writeSync(filePath, xlsData, 'binary');
	};

	function __fileTypePath(filePath) {
		var ext = path.extname(filePath);
		
		return {
			ext: ext ? ext.replace(".", "") : null
		};
	};
}
