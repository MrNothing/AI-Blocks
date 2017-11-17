import React from 'react';
import ReactDOM from 'react-dom';
import Window from './Window'

export default class Grid extends React.Component {
	constructor(props) {
	    super(props);
	    window.service.mainGrid = this;
	}

	renderChild(child) {
		return <div className={"col-sm-"+child.props.pos+" global_container"}>{child}</div>;
	}

	onCreateProject()
	{
		$('#'+window.service.createProjectUI.props.id).modal("show");
	}

	render() {
		if(window.service.project==null)
		{
			return(<div className="card2">
					  <h4 className="card2-header">AI-Blocs</h4>
					  <div className="card2-body">
					    <h4 className="card2-title">Welcome!</h4>
					    <p className="card2-text">AI-Blocs is a powerfull intuitive interface that allows anyone to create Machine Learning models!</p>
					    <a href="#" className="btn btn-primary" onClick={this.onCreateProject.bind(this)}>Get started!</a>
					  </div>
					</div>
				  );
		}
		else
		{
			return (
				<div className="global_container">
					<div className="row scene_container">
						{this.renderChild(this.props.children[0])}
						{this.renderChild(this.props.children[1])}
					</div>
					<div className="row hierarchy_container">
						{this.renderChild(this.props.children[2])}
						{this.renderChild(this.props.children[3])}
					</div>
				</div>

					);
		}
		
	}
}
