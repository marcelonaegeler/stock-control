(function() {
	"use strict";

	/*
	* Editable Table
	*/
	var EditableTable = React.createClass({
		mapHead: function(col, index) {
			return (<th key={index}>{col}</th>);
		}
		, render: function() {
			var search = api.changeSpecialChars(this.props.search)
				, self = this
				, rows = [];

			this.props.products.map(function(product, index) {
				var name = api.changeSpecialChars(product.name); // remove accents to compare

				if((new RegExp(search, "i")).test(name) || (new RegExp(search, "i")).test(product.code))
					rows.push(<EditableRow product={product} update={self.props.update} key={index} />);
			});

			if(!rows.length) rows.push(<NotFoundRow key="-1" />);

			return (
				<div className="row">
          <div className="col-sm-12">
						<div className="table-responsive">
							<table className="table" cellPadding="0" cellSpacing="0">
								<thead>
									<tr>
										{this.props.columns.map(this.mapHead)}
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

	var EditableRow = React.createClass({
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
			return (
				<tr>
					<td>
						<span className="field-label textAlign">{this.props.product.code}</span>
					</td>
					<td>
						<span className="field-label textAlign">{this.props.product.name}</span>
					</td>
					<td>
						<span className="field-label textAlign">{this.props.product.stock}</span>
					</td>
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
							<input type="hidden" ref="_id" value={this.props.product._id} />
						</form>
					</td>
				</tr>
			);
		}
	});

	var NotFoundRow = React.createClass({
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

	/*
	* Search Bar
	*/
	var SearchBar = React.createClass({
		changeHandler: function() {
			this.props.changeHandler(this.refs.searchInput.getDOMNode().value);
		}
		, render: function() {
			return (
				<div className="dataTables_filter form-inline">
					<input type="text" placeholder="Pesquisar..." className="form-control" ref="searchInput" value={this.props.search} onChange={this.changeHandler} />
				</div>
			);
		}
	});

	/*
	* Compose body
	*/
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
					self.setState({ products: [] });
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
					<SearchBar search={this.state.search} changeHandler={this.searchHandler} />
						
					<EditableTable products={this.state.products} columns={this.props.columns} search={this.state.search} update={this.getContent} order={this.order} />
				</div>
			);
		}
	});

	var showArea = document.querySelector('.react-body');
	var columns = [ 'Código', 'Nome', 'Estoque', 'Adicionar', 'Remover' ];

	React.render(<BodyCompose url="/api/products" columns={columns} />, showArea);
})();
