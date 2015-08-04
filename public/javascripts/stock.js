(function() {
	"use strict";

	// Element that will show the table rows
	var showArea = document.querySelector('.body');

	var ProductRow = React.createClass({
		getInitialState: function() {
			return { addValue: 0, rmValue: 0 };
		}
		, submitAdd: function(event) {
			event.preventDefault();
			var stockAdd = this.state.addValue
				, _id = this.refs._id.getDOMNode().value;
			var self = this;

			api.ajax({
				method: 'POST'
				, url: '/api/stock/add'
				, data: { stock: stockAdd, id: _id }
				, success: function(data) {
					self.setState({ addValue: 0 });
					return self.props.update();
				}
			});
		}
		, submitRm: function() {
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
					self.setState({ rmValue: 0 });
					return self.props.update();
				}
			});
		}
		, inputAddChange: function(event) {
			event.preventDefault();
			if(+event.target.value || +event.target.value == 0) this.setState({ addValue: +event.target.value });
		}
		, inputRmChange: function(event) {
			event.preventDefault();
			if(+event.target.value || +event.target.value == 0) this.setState({ rmValue: +event.target.value });
		}
		, render: function() {
			var product = this.props.product;
			return (
				<tr>
					<td>{product.name}</td>
					<td>{product.stock}</td>
					<td>
						<form onSubmit={this.submitAdd}>
							<input type="text" ref="add" value={this.state.addValue} onChange={this.inputAddChange} />
							<button type="submit" className="material-icons">add</button>
							<input type="hidden" ref="_id" value={product._id} />
						</form>
					</td>
					<td>
						<form onSubmit={this.submitRm}>
							<input type="text" ref="rm" value={this.state.rmValue} onChange={this.inputRmChange} />
							<button type="submit" className="material-icons">remove</button>
							<input type="hidden" ref="_id" value={product._id} />
						</form>
					</td>
				</tr>
			);
		}
	});

	var ProductRows = React.createClass({
		update: function() {
			return this.props.update();
		}
		, render: function() {
			var rows = []
				, search = this.props.search
				, self = this;
			this.props.products.map(function(product, index) {
				if((new RegExp(search, "i")).test(product.name)) {
					rows.push(<ProductRow update={self.update} product={product} key={index} />);
				}
			});

			return (
				<table cellPadding="0" cellSpacing="0">
					<thead>
						<tr>
							<th>Produto</th>
							<th>Estoque</th>
							<th>Adicionar</th>
							<th>Remover</th>
						</tr>
					</thead>
					<tbody>
						{rows}
					</tbody>
				</table>
			);
		}
	});

	var AddForm = React.createClass({
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

			if(!stockVal || !nameVal) return false;

			var sent = { name: nameVal, stock: stockVal };
			
			api.ajax({
				method: 'POST'
				, url: '/api/product'
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
			);
		}
	});

	var SearchBar = React.createClass({
		changeHandler: function() {
			this.props.changeHandler(this.refs.searchInput.getDOMNode().value);
		}
		, render: function() {
			return (
				<div>
					<input type="text" placeholder="Search..." ref="searchInput" value={this.props.search} onChange={this.changeHandler} />
				</div>
			);
		}
	});


	var BodyCompose = React.createClass({
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
	        self.setState({ products: data });
	      }
	    });
	  }
		// Add Product
		, addProduct: function(data) {
			var products = this.state.products;
	  	products.push(data);
	  	this.setState({ products: products });
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
				<div>
					<AddForm submitHandler={this.addProduct} />
					<SearchBar search={this.state.search} changeHandler={this.searchHandler} />
					<ProductRows update={this.getContent} search={this.state.search} products={this.state.products} />
				</div>
			);
		}
	});
	React.render(<BodyCompose url="/api/products" />, showArea);
})();