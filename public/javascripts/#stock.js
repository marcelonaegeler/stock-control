(function() {
	"use strict";

	// Element that will show the table rows
	var showArea = document.querySelector('.react-body');

	var ProductRow = React.createClass({
		getInitialState: function() {
			return { addValue: '', rmValue: '' };
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
		, render: function() {
			var product = this.props.product;
			return (
				<tr>
					<td>{product.code || 0}</td>
					<td className="productName" ref="nameColumn">
						<span className="showName">{product.name}</span>
					</td>
					<td>{product.stock}</td>
					<td>
						<form onSubmit={this.submitAdd} className="form-inline">
							<input type="text" ref="add" className="form-control" value={this.state.addValue} onChange={this.inputAddChange} onKeyDown={this.keydown} />
							<button type="submit" className="btn btn-success"><i className="fa fa-check"></i></button>
						</form>
					</td>
					<td>
						<form onSubmit={this.submitRm} className="form-inline">
							<input type="text" ref="rm" className="form-control" value={this.state.rmValue} onChange={this.inputRmChange} onKeyDown={this.keydown} />
							<button type="submit" className="btn btn-danger"><i className="fa fa-remove"></i></button>
							<input type="hidden" ref="_id" value={product._id} />
						</form>
					</td>
				</tr>
			);
		}
	});

	var ProductNotFound = React.createClass({
		render: function() {
			return (
				<tr>
					<td colSpan="5" style={{textAlign: 'center'}}>
						Não foram encontrados resultados.
					</td>
				</tr>
			);
		}
	});

	var ProductRows = React.createClass({
		render: function() {
			var rows = []
				, search = api.changeSpecialChars(this.props.search) // remove accents to compare
				, self = this;
			this.props.products.map(function(product, index) {
				var name = api.changeSpecialChars(product.name); // remove accents to compare

				if((new RegExp(search, "i")).test(name))
					rows.push(<ProductRow update={self.props.update} order={self.props.order} product={product} key={index} />);
			});

			if(!rows.length)
				rows.push(<ProductNotFound key="-1" />);

			return (
				<div className="row">
          <div className="col-sm-12">
            <div className="table-responsive">
							<table className="table" cellPadding="0" cellSpacing="0">
								<thead>
									<tr>
										<th>Código</th>
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
        <div className="dataTables_filter form-inline">
					<label>
						Pesquisar:
						<input type="text" placeholder="Digite aqui..." className="form-control" ref="searchInput" value={this.props.search} onChange={this.changeHandler} />
					</label>
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
				<div>
					<div className="row">
          	<div className="col-sm-6">
							<SearchBar search={this.state.search} changeHandler={this.searchHandler} />
						</div>
						<div className="col-sm-6">

						</div>
					</div>
					<ProductRows update={this.getContent} order={this.order} search={this.state.search} products={this.state.products} />
				</div>
			);
		}
	});

	React.render(<BodyCompose url="/api/products" />, showArea);
})();
