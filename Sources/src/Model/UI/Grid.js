import React from 'react';
import ReactDOM from 'react-dom';
import Window from './Window';
import Popup from './Popup';
import SceneObject from '../Objects/SceneObject';
import Script from '../Objects/Script';

export default class Grid extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {news:"Loading news..."}
	    window.service.mainGrid = this;
	    window.service.gridHandles = [-1, 350, 350, 1000];
	    jQuery.get('https://raw.githubusercontent.com/MrNothing/AI-Blocks/master/news.html', { "_": $.now() }, function(data) {
		     window.service.mainGrid.setState({news:data});
		});
	}

	onCreateProject(showExamples)
	{
		$('#'+window.service.createProjectUI.props.id).modal("show");
	}

	insertObject(type)
	{
		let parent = window.service.selectedObject;

		console.log("parent: "+parent);

		window.service.getUniqueID();

		let obj = new SceneObject(window.service.getUniqueID(), type.replace("_", " "));
		obj.scene = window.service.currentScene;

		if(type.length>0)
		{
			let script = window.service.scriptsManager.CloneScript(window.service.scriptsManager.scripts[type+".py"]);
			obj.scripts.push(script);
		}
		else
		{
			obj.name = "Empty Object";
		}

		if(parent==null)
			window.service.scene.push(obj);
		else
			parent.children.push(obj);

		window.service.hierarchyUI.forceUpdate();
		window.service.sceneUI.update();
		$('#insert-object-popup').modal("hide");
	}

	renderScriptInsertCollapseButton(script, displayName, icon)
	{
		return (<a onClick={this.insertObject.bind(this, script)} href="#" className="list-group-item list-group-item-action"><span className={icon}/> {displayName}</a>);
		
	}

	renderUIInsert()
	{
		return (<Popup extra="small-modal" title="Insert:" id="insert-object-popup">
					<div className="list-group">
					
						{this.renderScriptInsertCollapseButton("", "Empty Object", "fa fa-cube")}

	  					<a className="list-group-item list-group-item-action insert collapsed" data-toggle="collapse" href={"#insert_details_0"} aria-expanded="false" aria-controls={"insert_details_0"}>
						&nbsp;Models
							<div className="collapse" id="insert_details_0">
					  			<div className="card card-body">
								  {this.renderScriptInsertCollapseButton("neural_network", "Neural Network", "fa fa-code-fork")}
								  {this.renderScriptInsertCollapseButton("rnn", "Recurent Neural Network", "glyphicon glyphicon-link")}
								  {this.renderScriptInsertCollapseButton("graph", "Graph", "fa fa-cubes")}
						    	</div>
							</div>
						</a>

						<a className="list-group-item list-group-item-action insert collapsed" data-toggle="collapse" href={"#insert_details_1"} aria-expanded="false" aria-controls={"insert_details_1"}>
						&nbsp;Functions
							<div className="collapse" id="insert_details_1">
					  			<div className="card card-body">
								  {this.renderScriptInsertCollapseButton("function", "Activation Function", "fa fa-flask")}
								  {this.renderScriptInsertCollapseButton("convolutions", "Convolutions", "fa fa-sitemap")}
						    	</div>
							</div>
						</a>

						<a className="list-group-item list-group-item-action insert collapsed" data-toggle="collapse" href={"#insert_details_2"} aria-expanded="false" aria-controls={"insert_details_2"}>
						&nbsp;Usage
							<div className="collapse" id="insert_details_2">
					  			<div className="card card-body">
								  {this.renderScriptInsertCollapseButton("auto_encoder", "Auto Encoder", "glyphicon glyphicon-random")}
								  {this.renderScriptInsertCollapseButton("classifier", "Classifier", "fa fa-magic")}
								  {this.renderScriptInsertCollapseButton("predictor", "Predictor", "fa fa-magic")}
						    	</div>
							</div>
						</a>

						<a className="list-group-item list-group-item-action insert collapsed" data-toggle="collapse" href={"#insert_details_3"} aria-expanded="false" aria-controls={"insert_details_3"}>
						&nbsp;Loaders
							<div className="collapse" id="insert_details_3">
					  			<div className="card card-body">
								  {this.renderScriptInsertCollapseButton("csv_loader", "CSV Loader", "fa fa-file-excel-o")}
								  {this.renderScriptInsertCollapseButton("MINST_loader", "MINST Loader", "fa fa-sort-numeric-asc")}
								  {this.renderScriptInsertCollapseButton("CIFAR10_loader", "Cifar10 Loader", "fa fa-file-image-o")}
						    	</div>
							</div>
						</a>

						<a className="list-group-item list-group-item-action insert collapsed" data-toggle="collapse" href={"#insert_details_4"} aria-expanded="false" aria-controls={"insert_details_4"}>
						&nbsp;Viewers
							<div className="collapse" id="insert_details_4">
					  			<div className="card card-body">
								  {this.renderScriptInsertCollapseButton("chart", "Chart", "fa fa-area-chart")}
								  {this.renderScriptInsertCollapseButton("image_viewer", "Output Viewer (Image)", "fa fa-eye")}
						    	</div>
							</div>
						</a>

						<a className="list-group-item list-group-item-action insert collapsed" data-toggle="collapse" href={"#insert_details_5"} aria-expanded="false" aria-controls={"insert_details_5"}>
						&nbsp;Networking
							<div className="collapse" id="insert_details_5">
					  			<div className="card card-body">
								  {this.renderScriptInsertCollapseButton("socket_server", "Socket Server", "fa fa-plug")}
								</div>
							</div>
						</a>

					</div>
				</Popup>);
	}

	render() {
		if(window.service.project==null)
		{
			return( <div>
						<div className="card2">
						  <h4 className="card2-header card2h4">AI-Blocs</h4>
						  <div className="card2-body">
						    <h4 className="card2-title">Welcome!</h4>
						    <p className="card2-text">AI-Blocs is a powerful intuitive interface that allows anyone to create Machine Learning models!</p>
						  </div>
						</div>
						<div className="card2">
						  <h4 className="card2-header card2h4">News</h4>
						  <div className="card2-body news-panel" dangerouslySetInnerHTML={{__html:this.state.news}}>
						  </div>
						</div>
						<div className="card2">
						  <h4 className="card2-header card2h4">Example Projects</h4>
						  <div className="card2-body">
						    <p className="card2-text">Create your project from one of the examples!</p>
						    <a href="#" className="btn btn-primary" onClick={this.onCreateProject.bind(this, true)}>Get started!</a>
						  </div>
						</div>
					</div>
				  );
		}
		else
		{
			return (
				<div className="global_container">
				{this.renderUIInsert()}
					<div className="global_container" style={{display:"flex", "flexDirection":"column", paddingBottom: "75px"}}>
						<div className="" style={{display:"flex", "flexGrow":1 }}>
							<div className="" style={{"flexGrow":1}}>{this.props.children[0]}</div>
							<div className="" style={{"width":window.service.gridHandles[2]+"px"}} id="drag_win_2">{this.props.children[1]}</div>
						</div>
						<div className="" style={{display:"flex", "height":window.service.gridHandles[1]+"px", zIndex:1}} id="drag_win_1">
							<div className="" style={{"flexGrow":1}}>{this.props.children[2]}</div>
							<div className="" style={{"width":window.service.gridHandles[3]+"px"}} id="drag_win_3">{this.props.children[3]}</div>
						</div>
					</div>
				</div>

					);
		}
		
	}
}
