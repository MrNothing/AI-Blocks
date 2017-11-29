//$('#script-creator').modal("show");
import React from 'react';
import JsonManager from '../Managers/JsonManager';
const fs = require("fs");

export default class CreateProject extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {scriptname:'', scriptpath:'', template:"empty_template.py", template_desc:"An empty python script", icon:"fa fa-file-code-o", templatename:"Empty script"}
	    window.service.createScriptUI = this;
	}

	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({ hasError: true });
		// You can also log the error to an error reporting service
		window.service.log(error, info, 2);
	}

	createFile()
	{
		if(this.state.scriptname.length==0)
		{
			alert("Please specify a script name!");
		}
		else if(this.state.already_exists)
		{
			alert("A script with this name already exists!");
		}
		else{
			let path = this.state.scriptpath+"/"+this.state.scriptname+".py";
			
			let content = fs.readFileSync("./templates/"+this.state.template);

			fs.writeFile(path, content, (err) => {
		        if(err){
		        	alert(err);
		            LogErr("An error ocurred while creating the file "+ err.message);
		        }
		        else{
					window.service.scriptsManager.compileAllScripts();
					window.service.scriptsManager.updateAllProjectScriptInstances();
					if(window.service.createScriptcallback)
					{
						window.service.createScriptcallback(this.state.scriptname+".py");
					}

					$('#script-creator').modal("hide");
		        }
			});
		}
	}

	selectScriptFolder()
	{
		let selected_dir = require('electron').remote.dialog.showOpenDialog(require('electron').remote.getCurrentWindow(), {title:"Select a folder...", properties: ['openDirectory']});
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

	updateScriptName(evt)
	{
		let exists = false;
		if(window.service.scriptsManager.scripts[evt.target.value+".py"])
		{
			exists = true;
		}
		else
		{	
			exists = false;
		}

		this.setState({
	      scriptname: evt.target.value, already_exists: exists
	    });
	}

	setTemplate(template, desc, icon, name)
	{
		this.setState({template: template, template_desc:desc, icon:icon, templatename:name})
	}

	updateScriptPath(evt)
	{
		this.setState({
	      scriptpath: evt.target.value
	    });
	}

	show(callback)
	{
		this.setState({scriptname:'', scriptpath:window.service.project.projectpath, already_exists: false});
		window.service.createScriptcallback = callback;
	}

	renderBody()
	{
		let validtxt = "";
		let msg = "";
		if(this.state.already_exists)
		{
			validtxt = "invalid";
			msg = (	<div class="invalid-feedback">
        				A script with this name already exists!
      				</div>);
		}	
		else if(this.state.scriptname.length==0)
		{
			validtxt = "invalid";
			msg = (	<div class="invalid-feedback">
        				You must specify a script name!
      				</div>);
		}	
		return (<div>
			<div className="input-group">
			  <input value={this.state.scriptname} onChange={evt => this.updateScriptName(evt)} id="scriptname" type="text" className={"form-control "+validtxt} name="scriptname" placeholder="Script name"/>
		      <span type="button" className="input-group-addon"><i className="glyphicon glyphicon-pencil"></i></span>
		  	</div>
		  	{msg}
			<br/>
			Templates: 
		  	<div className="list-group">
				<a className={"list-group-item "+this.isActive("empty_template.py")}  href="#" onClick={this.setTemplate.bind(this, "empty_template.py", "An empty python script", "fa fa-file-code-o", "Empty script")}><span class="fa fa-file-code-o"></span> Empty script</a>
			    <a className={"list-group-item "+this.isActive("loader_template.py")} href="#" onClick={this.setTemplate.bind(this, "loader_template.py", "Create your own dataset loader.", "fa fa-sort-numeric-asc", "Data loader")}><span class="fa fa-sort-numeric-asc"></span> Data loader</a>
			    <a className={"list-group-item "+this.isActive("classifier_template.py")} href="#" onClick={this.setTemplate.bind(this, "classifier_template.py", "Create your own trainer!", "fa fa-magic", "Classifier")}><span class="fa fa-magic"></span> Classifier</a>
			    <a className={"list-group-item "+this.isActive("predictor_template.py")} href="#" onClick={this.setTemplate.bind(this, "predictor_template.py", "Use your trained model!", "fa fa-magic", "Predictor")}><span class="fa fa-magic"></span> Predictor</a>
			</div> 
		  	<div class="panel panel-default">
			  <div class="panel-heading"><span class={this.state.icon}></span> {this.state.templatename}</div>
			  <div class="panel-body" style={{padding: "7px", fontSize:"12px"}}>{this.state.template_desc}</div>
			</div>
		  	<div className="input-group">
		      <input value={this.state.scriptpath} onChange={evt => this.updateScriptPath(evt)} onClick={this.selectScriptFolder.bind(this)} type="text" className="form-control" placeholder="Script folder..."/>
		      <span onClick={this.selectScriptFolder.bind(this)} type="button" className="input-group-addon"><i className="glyphicon glyphicon-folder-open"></i></span>
		    </div>
	    </div>);
	}

	isActive(name)
	{
		if(name==this.state.template)
			return "active";
		else
			return "";
	}

	render() {
		return (
			<div id={this.props.id} className="modal fade" role="dialog">
			  <div className="modal-dialog">
		  			<div className="modal-content">
				        <div className="modal-header">
				          <button type="button" className="close" data-dismiss="modal">&times;</button>
				          <h4 className="modal-title">Create new script</h4>
				        </div>
				        <div className="modal-body">
			    			{this.renderBody()}
				        </div>
				        <div className="modal-footer">
				          <button type="button" onClick={this.createFile.bind(this)} className="btn btn-primary">Create</button>
				          <button type="button" className="btn btn-default" data-dismiss="modal">Cancel</button>
				        </div>
			      	</div>
			  </div>
			</div>
		);
	}
}