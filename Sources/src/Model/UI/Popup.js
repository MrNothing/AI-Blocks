import React from 'react';
import ReactDOM from 'react-dom';

export default class Popup extends React.Component {
	constructor(props) {
	    super(props);
	}

	render() {
		return (
			<div id={this.props.id} className="modal fade" role="dialog">
			  <div className={"modal-dialog "+this.props.extra}>
		  			<div className="modal-content">
				        <div className="modal-header">
				          <button type="button" className="close" data-dismiss="modal">&times;</button>
				          <h4 className="modal-title">{this.props.title}</h4>
				        </div>
				        <div className="modal-body">
			    			{this.props.children}
				        </div>
				        <div className="modal-footer">
				          <button type="button" className="btn btn-default" data-dismiss="modal">Close</button>
				        </div>
			      	</div>
			  </div>
			</div>
		);
	}
}
