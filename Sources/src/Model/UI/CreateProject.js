import React from 'react';
import JsonManager from '../Managers/JsonManager';
const fs = require("fs");

export default class CreateProject extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {projectname:'', projectpath:''}
	    window.service.createProjectUI = this;
	}

	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({ hasError: true });
		// You can also log the error to an error reporting service
		window.service.log(error, info, 2);
	}

	onCreateProject()
	{
		this.createProject();
	}

	createProject(clone_source)
	{
		if(this.state.projectpath!="" && this.state.projectname!="")
		{
			let json = {};
			json.projectname = this.state.projectname;
			json.projectpath = this.state.projectpath+"/"+json.projectname;
			json.version = '0.0.0';
			json.engine = 'Tensorflow';
			json.usegpu = true;
			json.consolelines = 100;
			json.theme = 'default';
			json.sceneNames = ['Scene 1', 'Scene 2', 'Scene 3', 'Scene 4']

			try {
			    fs.mkdirSync(json.projectpath)
			  } catch (err) {
			    if (err.code !== 'EEXIST') throw err
			}

			window.service.project = json;
		    window.service.selectedObject = null;
			window.service.charts = {};
			window.service.scene = [];

			let proceed=true;
			if(clone_source)
			{
				window.service.scene = null;
				let loader2 = new JsonManager(null);
				loader2.load(clone_source).then(_json => {
					window.service.loadSceneFromJson(_json);

					window.service.scriptsManager.compileAllScripts();
					window.service.scriptsManager.updateAllProjectScriptInstances();

					this.makeProject(json)
				}).catch(err => {
			   		alert("Failed to load example: "+err);
					window.service.log("Failed to load example!", err+"", 2);
					proceed = false;	
					window.service.scene = []	
				});
			}
			else
			{
				this.makeProject(json)
			}
		}
		else
		{
			if(this.state.projectpath=="")
			{
				alert("You must specify a project folder!");
			}
			else
			{
				alert("You must specify a project name!");
			}

			return false
		}
	}

	makeProject(properties)
	{
		window.service.scriptsManager.compileAllScripts();
		    
		if(window.service.projectUI!=null)
			window.service.projectUI.selectFolder(properties.projectpath, true);

		if(window.service.projectPropertiesUI!=null)
		{
			window.service.projectPropertiesUI.setSource();
		}

		window.service.menuUI.refresh();
		window.service.mainGrid.forceUpdate();
		if(window.service.sceneUI!=null)
		{
			window.service.sceneUI.update();	
		}
		if(window.service.hierarchyUI!=null)
			window.service.hierarchyUI.forceUpdate();

		if(window.service.outputUI!=null)
			window.service.outputUI.forceUpdate();
		
		if(window.service.projectPropertiesUI!=null)
		{
			window.service.projectPropertiesUI.setSource();
		}

		let saver = new JsonManager(properties);
		saver.save(properties.projectpath+"/Properties.json")

		let saver2 = new JsonManager(window.service.getSceneJson());
		saver2.save(properties.projectpath+"/Scene.json")


		$('#'+this.props.id).modal("hide");
	}

	selectProjectFolder()
	{
		let selected_dir = require('electron').remote.dialog.showOpenDialog(require('electron').remote.getCurrentWindow(), {title:"Select a folder...", properties: ['openDirectory']})
		.then(result => {	
			if(!result.canceled)
			{		
				console.log(result.filePaths)
				console.log(result.filePaths[0]);
				this.setState({
				  projectpath: result.filePaths[0]
				});
			}
			else
			{
				console.log("No dir selected");	
			}
			console.log(result.canceled)
		}).catch(err => {
			console.log("No dir selected");	
			console.log(err)
		})

	}

	updateProjectName(evt)
	{
		
	}

	updateProjectPath(evt)
	{
		this.setState({
	      projectpath: evt.target.value
	    });
	}

	renderBody()
	{
		return (
				<div>
					<div className="input-group">
					  <input value={this.state.projectname} onChange={evt => this.updateProjectName(evt)} id="projectname" type="text" className="form-control" name="projectname" placeholder="Project Name"/>
				      
				      <span type="button" className="input-group-addon"><i className="glyphicon glyphicon-pencil"></i></span>
				  	</div>
				  	<div className="input-group">
				      <input value={this.state.projectpath} onChange={evt => this.updateProjectPath(evt)} onClick={this.selectProjectFolder.bind(this)} type="text" className="form-control" placeholder="Project folder..."/>
				      <span onClick={this.selectProjectFolder.bind(this)} type="button" className="input-group-addon"><i className="glyphicon glyphicon-folder-open"></i></span>
				    </div>

				    <span>&nbsp;</span>

					<div className="card example-card" style={{width: "20rem"}}>
					  <img width="100" className="card-img-top previewImage" src="images/PortableBoxAlpha3.png" alt="previewImage"/>
					  <div className="card-body card-body-h">
					    <h4 className="card-title">Empty project</h4>
					    <p className="card-text">Create a new empty project.</p>
					  </div>
      				  <button type="button" className="btn btn-primary" onClick={this.createProject.bind(this, false)}>Create</button>
					</div>

					<div className="card example-card" style={{width: "20rem"}}>
					  <img width="100" className="card-img-top previewImage" src="images/minst_example.png" alt="previewImage"/>
					  <div className="card-body card-body-h">
					    <h4 className="card-title">MNIST Classifier</h4>
					    <p className="card-text">The hello word of machine learning!</p>
					  </div>
					  <a href="#" onClick={this.createProject.bind(this, "examples/MinstExample.json")} className="btn btn-primary">Clone</a>
					</div>

					<div className="card example-card" style={{width: "20rem"}}>
					  <img width="100" className="card-img-top previewImage" src="images/ae_example.png" alt="previewImage"/>
					  <div className="card-body card-body-h">
					    <h4 className="card-title">Auto-Encoder</h4>
					    <p className="card-text">Watch an Auto-Encoder learn feature representation in real time!</p>
					  </div>
					  <a href="#" onClick={this.createProject.bind(this, "examples/AutoEncoderExample.json")} className="btn btn-primary">Clone</a>
					</div>
			    </div>
			);
	}

	render() {
		return (
			<div id={this.props.id} className="modal fade" role="dialog">
			  <div className="modal-dialog">
		  			<div className="modal-content">
				        <div className="modal-header">
				          <button type="button" className="close" data-dismiss="modal">&times;</button>
				          <h4 className="modal-title">{this.props.title}</h4>
				        </div>
				        <div className="modal-body">
			    			{this.renderBody()}
				        </div>
				        <div className="modal-footer">
				          <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
				        </div>
			      	</div>
			  </div>
			</div>
		);
	}
}
