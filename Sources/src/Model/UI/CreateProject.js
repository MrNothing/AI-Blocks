import React from 'react';
import JsonManager from '../Managers/JsonManager';
const fs = require("fs");

export default class CreateProject extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {projectname:'', projectpath:''}
	    window.service.createProjectUI = this;
	}

	onCreateProject()
	{
		this.createProject();
	}

	createProject()
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

			try {
			    fs.mkdirSync(json.projectpath)
			  } catch (err) {
			    if (err.code !== 'EEXIST') throw err
			}

			window.service.project = json;
		    window.service.selectedObject = null;
			window.service.charts = {};
		    
			window.service.scriptsManager.compileAllScripts();
		    
			if(window.service.projectUI!=null)
				window.service.projectUI.selectFolder(json.projectpath, true);

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

			let saver = new JsonManager(json);
			saver.save(json.projectpath+"/Properties.json")
			let saver2 = new JsonManager([]);
			saver2.save(json.projectpath+"/Scene.json")


			$('#'+this.props.id).modal("hide");
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
		}
	}

	selectProjectFolder()
	{
		let selected_dir = require('electron').remote.dialog.showOpenDialog({title:"Select a folder...", properties: ['openDirectory']});
		if(selected_dir==null)
		{
			console.log("No dir selected");			
		}
		else
		{
			console.log(selected_dir[0]);
			this.setState({
		      projectpath: selected_dir[0]
		    });
		}
	}

	updateProjectName(evt)
	{
		this.setState({
	      projectname: evt.target.value
	    });
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
				      <input value={this.state.projectpath} onChange={evt => this.updateProjectPath(evt)} type="text" className="form-control" placeholder="Project folder..."/>
				      <span onClick={this.selectProjectFolder.bind(this)} type="button" className="input-group-addon"><i className="glyphicon glyphicon-folder-open"></i></span>
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
				          <button type="button" className="btn btn-primary	" onClick={this.onCreateProject.bind(this)}>Create</button>
				          <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
				        </div>
			      	</div>
			  </div>
			</div>
		);
	}
}
