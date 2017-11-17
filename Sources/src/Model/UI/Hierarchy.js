import React from 'react';
import ReactDOM from 'react-dom';
import TreeView from 'react-treeview';
import SceneObject from '../Objects/SceneObject';
import Script from '../Objects/Script';
import Popup from './Popup';

export default class Hierarchy extends React.Component {
	constructor(props) {
	    super(props);
	    
	    this.state = {selectedObject:null};
	    window.service.hierarchyUI = this;
	}

	insertObject(type)
	{
		let parent = this.state.selectedObject;

		console.log("parent: "+parent);

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

		this.forceUpdate();
		window.service.sceneUI.update();
		$('#insert-object-popup').modal("hide");
	}

	renderScriptInsertCollapseButton(script, displayName, icon)
	{
		return (<a onClick={this.insertObject.bind(this, script)} href="#" className="list-group-item list-group-item-action"><span className={icon}/> {displayName}</a>);
		
	}

	renderInsertNewObjectPopup()
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

	renderInsertNewObjectButton()
	{
		return (<button style={{padding:"0px 2px"}} className="btn btn-light" data-toggle="modal" data-target="#insert-object-popup">
					Insert <span className="glyphicon glyphicon-plus"/>
				</button>);
	}

  	renderRecursive(objects, isRoot) 
  	{
    	if(objects!=null)
  		{
			let elems = [];

			for (let file in objects)
			{
				if(window.service.currentScene==objects[file].scene)
				{
					let selected = "";
					if(window.service.selectedObject!=null && objects[file].id===window.service.selectedObject.id)
					{
						selected = " selected";
					}

					if(objects[file].children.length>0)
					{
						let children = this.renderRecursive(objects[file].children, false)

						let label = <span onClick={this.selectObject.bind(this, objects[file])} className={"node"+selected}><span className={objects[file].getObjectIcon()}/> {objects[file].name}</span>;
						elems.push(<TreeView className="node object" defaultCollapsed={true} nodeLabel={label}><div className="info">{children}</div></TreeView>);
					}
					else
					{
						elems.push(<div onClick={this.selectObject.bind(this, objects[file])} className={"info"+selected}><span className={objects[file].getObjectIcon()}/> {objects[file].name}</div>);
					}
				}
			}

			if(isRoot){
				let insertobjUI = this.renderInsertNewObjectButton();
	    		let label2 = <span className="node"><span className="fa fa-object-group"/> Scene {insertobjUI}</span>;
				return <TreeView className="node object" defaultCollapsed={false} nodeLabel={label2}>{elems}</TreeView>;
			}else{
				return elems;
			}
  		}
  		else
  		{
  			return <label></label>;
  		}
	}

	selectObject(object)
	{
		window.service.selectedObject = object;
		window.service.propertiesUI.setTarget();
		window.service.sceneUI.update();
		this.setState({selectedObject:object});
	}

	render() {
		let ret = (
		  	<div className="scrollable_container">
		  		{this.renderRecursive(window.service.scene, true)}
		  		{this.renderInsertNewObjectPopup()}
		  		<div className="bg-click" onClick={this.selectObject.bind(this, null)}/>
	  		</div>
		);
  		
  		window.service.hierarchyReady = true;

		return ret;
	}
}
