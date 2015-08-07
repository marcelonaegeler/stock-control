(function() {
	"use strict";

	// Element that will show the table rows
	var showArea = document.querySelector('.react-body');

	var ProductRow = React.createClass({displayName: "ProductRow",
		getInitialState: function() {
			return { name: '', defaultName: '', addValue: '', rmValue: '' };
		}
		, componentWillReceiveProps: function(props) {
			this.setState({ name: props.product.name, defaultName: props.product.name });
		}
		, submitAdd: function(event) {
			event.preventDefault();
			var stockAdd = this.state.addValue
				, _id = this.refs._id.getDOMNode().value
				, self = this;

			api.ajax({
				method: 'POST'
				, url: '/api/stock/add'
				, data: { stock: stockAdd, id: _id }
				, success: function(data) {
					self.setState({ addValue: '' });
					return self.props.update();
				}
			});
		}
		, submitRm: function(event) {
			event.preventDefault();
			var stockRm = this.state.rmValue
				, _id = this.refs._id.getDOMNode().value;
			var self = this;

			api.ajax({
				method: 'POST'
				, url: '/api/stock/rm'
				, data: { stock: stockRm, id: _id }
				, success: function(data) {
					if(data.error)
						alert('Não foi possível remover '+ stockRm +' un. '+ (!data.stock ? 'Não há produtos em estoque.' : 'Existe apenas '+ data.stock +' un em estoque.'));
					self.setState({ rmValue: '' });
					return self.props.update();
				}
			});
		}
		, inputAddChange: function(event) {
			event.preventDefault();
			if(+event.target.value || +event.target.value >= 0) this.setState({ addValue: +event.target.value });
		}
		, inputRmChange: function(event) {
			event.preventDefault();
			if(+event.target.value || +event.target.value >= 0) this.setState({ rmValue: +event.target.value });
		}
		, keydown: function(event) {
			if(event.keyCode == 109 || event.keyCode == 189) return event.preventDefault();
		}
		, showHideEdit: function(event) {
			var col = this.refs.nameColumn.getDOMNode();
			col.classList.toggle('edit');
			if(col.classList.contains('edit')) this.refs.inputName.getDOMNode().focus();
		}
		, clickCancelRename: function() {
			this.setState({ name: this.state.defaultName });
			this.showHideEdit();
		}
		, inputNameChange: function(event) {
			this.setState({ name: event.target.value });
		}
		, submitName: function(event) {
			event.preventDefault();
			var name = this.state.name
				, _id = this.refs._id.getDOMNode().value
				, self = this;

			api.ajax({
				method: 'POST'
				, url: '/api/product/edit'
				, data: { name: name, id: _id }
				, success: function(data) {
					self.showHideEdit();
					self.setState({ defaultName: self.state.name });
					return self.props.update();
					// return self.props.order();
				}
			});
		}
		, rmItem: function(event) {
			var _id = this.refs._id.getDOMNode().value;
			var self = this;

			if(!confirm('Deseja mesmo excluir este produto?')) return;

			api.ajax({
				method: 'POST'
				, url: '/api/product/remove'
				, data: { id: _id }
				, success: function(data) {
					return self.props.update();
				}
			});
		}
		, componentDidMount: function() {
			this.setState({ name: this.props.product.name, defaultName: this.props.product.name });
		}
		, render: function() {
			var product = this.props.product;
			return (
				React.createElement("tr", null, 
					React.createElement("td", {className: "productName", ref: "nameColumn"}, 
						React.createElement("span", {className: "showName", title: "Clique para editar", onClick: this.showHideEdit}, this.state.name), 
						React.createElement("div", {className: "editName"}, 
							React.createElement("form", {onSubmit: this.submitName, className: "form-inline"}, 
								React.createElement("input", {ref: "inputName", value: this.state.name, onChange: this.inputNameChange, className: "form-control"}), 
								React.createElement("button", {type: "submit", className: "btn btn-success", title: "Salvar"}, React.createElement("i", {className: "fa fa-check"})), 
								React.createElement("button", {type: "button", className: "btn btn-danger", onClick: this.clickCancelRename, title: "Cancelar"}, React.createElement("i", {className: "fa fa-remove"}))
							)
						)
					), 
					React.createElement("td", null, product.stock), 
					React.createElement("td", null, 
						React.createElement("form", {onSubmit: this.submitAdd, className: "form-inline"}, 
							React.createElement("input", {type: "text", ref: "add", className: "form-control", value: this.state.addValue, onChange: this.inputAddChange, onKeyDown: this.keydown}), 
							React.createElement("button", {type: "submit", className: "btn btn-success"}, React.createElement("i", {className: "fa fa-check"}))
						)
					), 
					React.createElement("td", null, 
						React.createElement("form", {onSubmit: this.submitRm, className: "form-inline"}, 
							React.createElement("input", {type: "text", ref: "rm", className: "form-control", value: this.state.rmValue, onChange: this.inputRmChange, onKeyDown: this.keydown}), 
							React.createElement("button", {type: "submit", className: "btn btn-danger"}, React.createElement("i", {className: "fa fa-remove"})), 
							React.createElement("input", {type: "hidden", ref: "_id", value: product._id})
						)
					), 
					React.createElement("td", null, 
						React.createElement("button", {type: "button", className: "btn btn-danger", onClick: this.rmItem}, React.createElement("i", {className: "fa fa-remove"}), " Remover")
					)
				)
			);
		}
	});

	var ProductNotFound = React.createClass({displayName: "ProductNotFound",
		render: function() {
			return (
				React.createElement("tr", null, 
					React.createElement("td", {colSpan: "5", style: {textAlign: 'center'}}, 
						"Não foram encontrados resultados."
					)
				)
			);
		}
	});

	var ProductRows = React.createClass({displayName: "ProductRows",
		render: function() {
			var rows = []
				, search = api.changeSpecialChars(this.props.search) // remove accents to compare
				, self = this;
			this.props.products.map(function(product, index) {
				var name = api.changeSpecialChars(product.name); // remove accents to compare

				if((new RegExp(search, "i")).test(name))
					rows.push(React.createElement(ProductRow, {update: self.props.update, order: self.props.order, product: product, key: index}));
			});

			if(!rows.length)
				rows.push(React.createElement(ProductNotFound, {key: "-1"}));

			return (
				React.createElement("div", {className: "row"}, 
          React.createElement("div", {className: "col-sm-12"}, 
            React.createElement("div", {className: "table-responsive"}, 
							React.createElement("table", {className: "table", cellPadding: "0", cellSpacing: "0"}, 
								React.createElement("thead", null, 
									React.createElement("tr", null, 
										React.createElement("th", null, "Produto"), 
										React.createElement("th", null, "Estoque"), 
										React.createElement("th", null, "Adicionar"), 
										React.createElement("th", null, "Remover"), 
										React.createElement("th", null, "Remover produto")
									)
								), 
								React.createElement("tbody", null, 
									rows
								)
							)
						)
					)
				)
			);
		}
	});
	
	var AddForm = React.createClass({displayName: "AddForm",
		clickHandler: function() {
			React.findDOMNode(this.refs.showHide).classList.toggle('open');
		}
		, submitHandler: function(event) {
			event.preventDefault();
			var self = this;

			var name = this.refs.name.getDOMNode()
				, stock = this.refs.stock.getDOMNode();
			var nameVal = name.value.trim()
				, stockVal = stock.value.trim();

			if(!nameVal) return;
			if(!stockVal) stockVal = 0;

			var sent = { name: nameVal, stock: stockVal };
			
			api.ajax({
				method: 'POST'
				, url: '/api/product/new'
				, data: sent
				, success: function(data) {
					name.value = "";
					stock.value = "";
					return self.props.submitHandler(sent);
				}
			});
		}
		, render: function() {
			return (
				React.createElement("form", {className: "form-inline text-right", onSubmit: this.submitHandler}, 
					React.createElement("label", {className: "form-label"}, 
						"Produto: ", React.createElement("input", {type: "text", className: "form-control", ref: "name"})
					), 
					React.createElement("label", {className: "form-label"}, 
						"Estoque: ", React.createElement("input", {type: "text", className: "form-control", ref: "stock"})
					), 
					React.createElement("button", {type: "submit", className: "btn btn-primary"}, React.createElement("i", {className: "fa fa-plus"}))
      	)
				/*
				<div className="optionArea">
					<div className="wrapper">
						<button type="button" className="material-icons" onClick={this.clickHandler}>add</button>
						<div className="addProduct" ref="showHide">
							<form action="" id="addForm" onSubmit={this.submitHandler}>
								<label>Name: <input type="text" ref="name" /></label>
								<label>Stock: <input type="text" ref="stock" /></label>
								<button type="submit">Add</button>
							</form>
						</div>
					</div>
				</div>
				*/
			);
		}
	});
	
	var SearchBar = React.createClass({displayName: "SearchBar",
		changeHandler: function() {
			this.props.changeHandler(this.refs.searchInput.getDOMNode().value);
		}
		, render: function() {
			return (
        React.createElement("div", {className: "dataTables_filter form-inline"}, 
					React.createElement("label", null, 
						"Pesquisar:", 
						React.createElement("input", {type: "text", placeholder: "Digite aqui...", className: "form-control", ref: "searchInput", value: this.props.search, onChange: this.changeHandler})
					)
				)
			);
		}
	});


	var BodyCompose = React.createClass({displayName: "BodyCompose",
		getInitialState: function() {
			return { products: [], search: '' };
		}
		// Get the content via Ajax
		, getContent: function() {
	    var self = this;
	    api.ajax({
	      url: this.props.url
	      , method: 'GET'
	      , success: function(data) {
	      	//self.setState({ products: [] });
	      	var products = data.sort(api.orderByName);
	        self.setState({ products: products });
	      }
	    });
	  }
	  , order: function() {
	  	this.setState({ products: this.state.products.sort(api.orderByName) });
	  }
		// Handle the search input changes
		, searchHandler: function(searchText) {
			this.setState({ search: searchText });
		}
		// Get Ajax content
		, componentDidMount: function() {
			this.getContent();
		}
		, render: function() {
			return (
				React.createElement("div", null, 
					React.createElement("div", {className: "row"}, 
          	React.createElement("div", {className: "col-sm-6"}, 
							React.createElement(SearchBar, {search: this.state.search, changeHandler: this.searchHandler})
						), 
						React.createElement("div", {className: "col-sm-6"}, 
							React.createElement(AddForm, {submitHandler: this.getContent})
						)
					), 
					React.createElement(ProductRows, {update: this.getContent, order: this.order, search: this.state.search, products: this.state.products})
				)
			);
		}
	});
	
	React.render(React.createElement(BodyCompose, {url: "/api/products"}), showArea);
})();
