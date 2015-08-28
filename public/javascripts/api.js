var api = (function() {
	"use strict";

	var arrayPop = function(arr, index) {
		var aux = []
			, count = arr.length
			, auxIndex = 0;
		for(var i = 0; i < count; i++) {
			if(i === index) continue;
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

		if(method === 'GET') {
			if(typeof data === 'object')
				url += getEncode(data);
			else {
				url += data;
				data = null;
			}
		} else if(method === 'POST' && !(data instanceof FormData)) {
			if(dataType === 'url')
				data = postEncode(data);
			else if(dataType === 'json')
				data = JSON.stringify(data);
		}

		var request = new XMLHttpRequest();
		// Set the progress
		if(progress) request.onprogress = progress;
		// Ready state change
		request.onreadystatechange = function() {
			if(request.readyState === 4) {
			 if(request.status === 200 && success) success(JSON.parse(request.response));
			 else if(error) error(request.response);
			}
		};
		request.open(method, url, true);
		// Set header for POST
		if(dataType === 'url') request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		else if(dataType === 'json') request.setRequestHeader("Content-type", "application/json");
		request.send(data);
	};

	var changeSpecialChars = function(text) {
		var chars = ['aáàãäâ', 'eéèëê', 'iíìïî', 'oóòõöô', 'uúùüû', 'cç'];
		var value = text.toLowerCase();
		for (var i in chars)
			value = value.replace(new RegExp('[' + chars[i] + ']', 'g'), chars[i][0]);
		return value;
	};

	var orderByName = function(a, b) {
		var aName = a.name.toLowerCase()
			, bName = b.name.toLowerCase();
		if(aName < bName) return -1;
		if(aName > bName) return 1;
		return 0;
	};

	/*
	var liveSearch = function(options) {
		var element = options.element
			, parentElement = element.parentNode
			, idStore = element.parentNode
			, searchBlock
			, url = options.url
			, querySelector = '.live-search'
			;

		var init = function() {
			var block = document.createElement('span');
	    block.classList.add('load-block');
	    block.innerHTML = 'Carregando...';
	    block.style.display = 'none';
			parentElement.appendChild(block);

			element.setAttribute('autocomplete', 'off');
	    searchBlock = block;
		};

		var setBlockContent = function(html) {
			searchBlock.innerHTML = html;
		};

		var closeBlock = function() {
			searchBlock.style.display = 'none';
			return;
		};

		var loadResults = function(event) {
			//console.log(event);
			var query = event.currentTarget.value;
			if(!query) return closeBlock();
			if(searchBlock.style.display === 'none') searchBlock.style.display = '';

			this.changeInput = function(el) {
				console.log(element.value, el);
				element.value = el.innerHTML;
			};

			setBlockContent('Carregando...');

			api.ajax({
				method: 'GET'
				, url: url
				, data: { query: query }
				, success: function(data) {
					var dataLength = data.length;
					var toHTML = [];
					for(var i = 0; i < dataLength; i++) {
						toHTML.push([ '<a data-id="', data[i].id, '" href="javascript:void(0);" onclick="this.parentNode.parentNode.querySelector(\''+ querySelector +'\').changeInput(this)">', data[i].client, '</a>' ].join(''));
					}
					setBlockContent(toHTML.join(''));
				}
				, error: function() {
					setBlockContent('Erro ao buscar resultados.');
				}
			});
		};

		(function() {
			init();

			element.onkeyup = loadResults;
			element.onfocus = loadResults;
		})();

	};

	*/

	return {
		ajax: ajax
		, arrayPop: arrayPop
		, changeSpecialChars: changeSpecialChars
		, orderByName: orderByName
		//, liveSearch: liveSearch
	};
})();
