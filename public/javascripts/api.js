var api = (function() {
	"use strict";

	var arrayPop = function(arr, index) {
		var aux = []
			, count = arr.length
			, auxIndex = 0;
		for(var i = 0; i < count; i++) {
			if(i == index) continue;
			aux[auxIndex] = arr[i];
			auxIndex++;
		}
		return aux;
	};

	var getEncode = function(obj) {
		var str = '?';
		for(var el in obj) str += [ el, '=', obj[el], '&' ].join('');
		return str.slice(0, str.length-1);
	};

	var postEncode = function(obj) {
		var str = '';
		for(var el in obj) str += [ el, '=', obj[el], '&' ].join('');
		return str.slice(0, str.length-1);
	};

	var ajax = function(options) {
		var method = options.method || 'GET'
			, url = options.url || null
			, success = options.success
			, error = options.error
			, progress = options.progress
			, data = options.data || {}
			, dataType = options.dataType || 'url'
			;

		if(method == 'GET') {
			if(typeof data == 'object')
				url += getEncode(data);
			else {
				url += data;
				data = null;
			}
		} else if(method == 'POST' && !(data instanceof FormData)) {
			if(dataType == 'url')
				data = postEncode(data);
			else if(dataType == 'json')
				data = JSON.stringify(data);
		}

		var request = new XMLHttpRequest();
		// Set the progress
		if(progress) request.onprogress = progress;
		// Ready state change
		request.onreadystatechange = function() {
			if(request.readyState == 4) {
			 if(request.status == 200) success && success(JSON.parse(request.response));
			 else error && error(request.response);
			}
		};
		request.open(method, url, true);
		// Set header for POST
		if(dataType == 'url') request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		else if(dataType == 'json') request.setRequestHeader("Content-type", "application/json")
		request.send(data);
	};

	return {
		ajax: ajax
		, arrayPop: arrayPop
	}
})();