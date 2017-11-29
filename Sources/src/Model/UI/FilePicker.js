import React from 'react';
import ReactDOM from 'react-dom';
var fs = require('fs');
const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')
const isDirectory = source => lstatSync(source).isDirectory()

export default class FilePicker extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {target:"py", filter:""};
	    window.service.filePickerUI = this;
	}

	validateSelection(file)
	{
		$('#file-picker').modal("hide");
		window.service.pickercallback(file);
	}

	getAllScripts(ext, folder, root)
	{
		let scripts = this.findAllScriptsInFolders(ext, folder, root);

		for (let i in scripts)
			scripts[i] = root+scripts[i];

		return scripts;
	}

	createScript()
	{
		window.service.createScriptUI.show(window.service.pickercallback);
		$('#file-picker').modal("hide");
		$('#script-creator').modal("show");
	}

	findAllScriptsInFolders(ext, folder, root)
	{
		//let root = window.service.project.projectpath;
		let found = [];
		fs.readdirSync(root+"\\"+folder).forEach(file => {
			if(isDirectory(root+"\\"+folder+"\\"+file))
			{
			  	let sub_files = this.findAllScriptsInFolders(ext, folder+"\\"+file, root);

				for(let sub in sub_files)
					found.push(folder+"\\"+sub_files[sub]);
			}
			else
			{
				if(file.split('.')[1]==ext)
				{
					found.push(folder+"\\"+file);
				}
			}
		});

		return found;
	}

	getIcon(name)
	{
		if(this.state.target=="json" || this.state.target=="js")
		{
			return "fa fa-file-code-o";
		}
		else if (this.state.target=="py")
		{
			let icon = window.service.scriptsManager.getScriptIcon(name);
		 	if(icon!=null)
				return icon;
			else
				return "fa fa-file-code-o";
		}
		else
		{
			return "fa fa-cube";
		}
	}

	findAndRenderTargets()
	{
		if(window.service.project!=null)
		{
			let files = this.getAllScripts(this.state.target, "", window.service.project.projectpath);
			let files2 = this.getAllScripts(this.state.target, "", "./scripts");
			files = files.concat(files2);

			let output = [];
			for(let f in files)
			{
				let filePath = files[f];
				let name = require('path').basename(filePath);

				let title = "";
				if(window.service.scriptsManager.scripts[name]!=null)
				{
					title=window.service.scriptsManager.scripts[name].description;
				}
				if (name.indexOf(this.state.filter.trim())!=-1 || (this.state.filter.trim()+"").length==0)
					output.push(<a href="#" onClick={this.validateSelection.bind(this, name)} className="list-group-item" title={title}><span className={this.getIcon(name)}/> {name}</a>);
			}

			return output;
		}
	}

	findAndRenderObjects()
	{
		if(window.service.project!=null)
		{
			let output = [];
			
			let title = "Scene Object";
			output.push(<a href="#" onClick={this.validateSelection.bind(this, null)} className="list-group-item" title={title}><span className="glyphicon glyphicon-erase"/> {"{None}"}</a>);
	
			for(let f in window.service.objectsByID)
			{
				let id = window.service.objectsByID[f].id;
				let name = window.service.objectsByID[f].name;
				if(id!=window.service.selectedObject.id && window.service.objectsByID[f].scene==window.service.currentScene && (name.indexOf(this.state.filter.trim())!=-1 || (this.state.filter.trim()+"").length==0))
				{
					
					output.push(<a href="#" onClick={this.validateSelection.bind(this, id)} className="list-group-item" title={title}><span className={window.service.objectsByID[f].getObjectIcon()}/> {name}</a>);
	
				}
			}

			return output;
		}
	}

	showPicker(target, callback)
	{
		this.setState({target:target, type:0});
		window.service.pickercallback = callback;
	}

	showObjectPicker(callback)
	{
		this.setState({target:"{object}", type:1});
		window.service.pickercallback = callback;
	}

	updateFilter(evt)
	{
		this.setState({filter:evt.target.value})
	}

	render() {
		let list;
		let createB;

		if(this.state.type==0)
		{
			list = this.findAndRenderTargets();
			createB = (<a onClick={this.createScript.bind(this)} className="list-group-item list-group-item-success">Create new script <span className="glyphicon glyphicon-plus"/></a>);
		}
		else
		{
			list = this.findAndRenderObjects();
			createB  = (<div/>)
		}

		return (
			<div>
			  	<div className="input-group">
				    <input type="text" className="form-control" placeholder="Search" onChange={this.updateFilter.bind(this)}/>
				    <div className="input-group-btn">
				      <button className="btn btn-default" type="submit">
				        <i className="glyphicon glyphicon-search"></i>
				      </button>
				    </div>
			  	</div>
				<div className="list-group">
					{createB}
					{list}
				</div> 
			</div>
		);
	}
}
