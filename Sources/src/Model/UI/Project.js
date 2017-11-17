import React from 'react';
import ReactDOM from 'react-dom';
const fs = require("fs");
import TreeView from 'react-treeview';
const {app} = require('electron');
import JsonManager from '../Managers/JsonManager';
import Script from '../Objects/Script';

export default class Project extends React.Component {
	constructor(props) {
	    super(props);
	    if(window.service.project!=null)
	    {
		    this.state = {current_folder:window.service.project.projectpath, files:null, selectedFile:null};
		    fs.readdir(window.service.project.projectpath, (err, dir) => {
				this.setState({
				  current_folder:window.service.project.projectpath,
			      files: dir,
			      selectedFile:null
			    });
			});
	    }
		else
		{
			this.state = {current_folder:'.', files:null, selectedFile:null, fileContent:""};
		}
		this.selectFolder = this.selectFolder.bind(this);
		window.service.projectUI = this;
	}

  	renderFilesAndFolders()
  	{

  		if(this.state.files!=null)
  		{
			let elems = [];

			for (let file in this.state.files)
			{
				let selected = "";
				if(this.state.files[file]===this.state.selectedFile)
				{
					selected = " selected";
				}

				if(this.state.files[file].split('.').length==1)
				{
					let label = <span className="node" onClick={this.selectFolder.bind(this, this.state.files[file], false)}>{this.state.files[file]}</span>;
					//elems.push(<TreeView className={"node "+selected} defaultCollapsed={true} nodeLabel={label}><div className="info">loading...</div></TreeView>);
					elems.push(<div className={"info"+selected} onClick={this.selectFolder.bind(this, this.state.files[file], false)}><span className={"glyphicon glyphicon-folder-close"}></span> {this.state.files[file]}</div>);
				}
				else
				{
					elems.push(<div className={"info"+selected} onClick={this.selectFile.bind(this, this.state.files[file])}><span className={this.getIcon(this.state.files[file])[0]}></span> {this.state.files[file]}</div>);
				}
			}

			let relative_path = require('path').relative(window.service.project.projectpath, this.state.current_folder);

			if(relative_path.length==0)
				relative_path = "...";

    		let label2 = <span className="node" onClick={this.selectFolder.bind(this, this.getParentPath(), true)}>{relative_path}</span>;
			return <TreeView className="node" defaultCollapsed={false} nodeLabel={label2}>{elems}</TreeView>;
  		}
  		else
  		{
  			return <label>Error while loading project folder...</label>;
  		}
  		
	}

	getIcon(file)
	{
		let icon;
		let type;

		let ext = file.split('.').pop(0);
		if(["txt", "md"].indexOf(ext)>=0)
		{
			icon = "fa fa-file-text-o";
			type = "text file";
		}
		else if(["js", "py", "json"].indexOf(ext)>=0)
		{
			icon = "fa fa-file-code-o";
			if(ext=='py')
				type = "python script";
			else if(ext=='js')
				type = "javascript file";
			else
				type = "json file";
		}
		else if(["jpg", "jpeg", "png", "ico", "png", "svg"].indexOf(ext)>=0)
		{
			icon = "fa fa-file-image-o";
			type = "image file";
		}
		else if(["mov", "avi", "mp4"].indexOf(ext)>=0)
		{
			icon = "fa fa-file-video-o";
			type = "video file";
		}
		else if(["mp3", "wav"].indexOf(ext)>=0)
		{
			icon = "fa fa-file-audio-o";
			type = "audio file";
		}
		else
		{
			icon = "fa fa-file-o";
			type = "file";
		}

		return [icon, type];
	}

	getParentPath()
	{
		if(this.state.current_folder===window.service.project.projectpath)
		{
			return this.state.current_folder;
		}
		else
		{
			let path = this.state.current_folder.split('/');
			path.pop(0);

			if(path.length==0)
			{
				return '.';
			}
			else
			{
				return path.join('/');
			}
		}
	}

	selectFolder(folder, replace)
	{
		let new_folder;
		if(replace)
		{
			new_folder = folder;
		}
		else
		{
			if(this.state.current_folder!=".")
				new_folder = this.state.current_folder+"/"+folder
			else
				new_folder = folder;
		}
		fs.readdir(new_folder, (err, dir) => {
			this.setState({
      		  	current_folder:new_folder,
		      	files: dir,
		      	selectedFile:null
	    	});
		});	
	}

	selectFile(file)
	{
		this.setState({
	      selectedFile:file
	    });
	}

	renderJsonProperties(objects, depth, node_name)
	{
		if(objects)
		{
			let counter = 0;
			let elems = [];
	    	for (let i in objects)
			{
				if(counter<4 || objects.length<=4)
				{
					if(typeof objects[i] === 'object')
					{
						if(depth>2)
							elems.push(<div className="info">{i+""}: ...</div>);
						else
							elems.push(this.renderJsonProperties(objects[i], depth+1, i));
					}
					else
					{
						elems.push(<div className="info">{i+""}: {objects[i]}</div>);
					}
				}
				else
				{
					elems.push(<div className="info">...</div>);
					break;
				}
				
				
				counter++;
			}

			let label2 = <span className="node">{node_name}</span>;
			return <TreeView className="node object" defaultCollapsed={false} nodeLabel={label2}>{elems}</TreeView>;
		}	
	}

	renderScriptProperties(params)
	{
		let elems = [];
		let counter = 0;
		for(let i in params)
		{
			if(counter<3 || params.length<=3)
			{
				elems.push(<div>{params[i].name}:{params[i].value}<br/></div>);
			}
			else
			{
				elems.push(<div>...</div>);
				break;
			}
			counter++;
		}

		return elems;
	}

	updateFolder()
	{
		this.selectFolder(this.state.current_folder, true);
	}

	renderSelectedFilePreview()
	{		
		let fileInfos;
		let fileContent;
		let details;
		let img = "";

		if(this.state.selectedFile==null)
		{
			details = [null, 'folder'];
			fileInfos = (<div><span className={"glyphicon glyphicon-folder-close"}></span> {this.state.current_folder}</div>);
		}
		else
		{
			details = this.getIcon(this.state.selectedFile);
			fileInfos = (<div><span className={details[0]}></span> {this.state.selectedFile}</div>);
			if(details[1]==='json file')
			{
				if(this.state.file_loading!=this.state.selectedFile)
				{
					let loader = new JsonManager(null);
					loader.load(require('path').resolve(this.state.current_folder+"/"+this.state.selectedFile)).then(json => {
						this.setState({file_loading:this.state.selectedFile, fileContent:json});
					});
				}
				else
				{
					fileContent = this.renderJsonProperties(this.state.fileContent, 0, "Json Node");
				}
			}
			else if(details[1]=='python script')
			{
				let script = window.service.scriptsManager.scripts[this.state.selectedFile];
				fileContent = <div><br/>{"Description: "+script.description}<br/>Parameters:<br/>{this.renderScriptProperties(script.params)}</div>;
			}
			else if(details[1]=='audio file')
			{
				fileContent = (
				<audio className='media-object' controls>
				  <source src={require('path').resolve(this.state.current_folder+"/"+this.state.selectedFile)}/>
				</audio>);
			}
			else if(details[1]=='video file')
			{
				fileContent = (
					 <video width="100%" height="100%" controls>
					  <source src={require('path').resolve(this.state.current_folder+"/"+this.state.selectedFile)}/>
					</video> 
				);
			}
			else
			{
				fileContent = "";
			}

			if(details[1]==='image file')
				img = (<img className="previewImage" width="75" src={require('path').resolve(this.state.current_folder+"/"+this.state.selectedFile)} alt="..."/>);
		}

		return (

			<div className="media">
			  <div className="media-left">
			    <a href="#">
			      {img}
			    </a>
			  </div>
			  <div className="media-body">
			    <h4 className="media-heading">{fileInfos}</h4>
			    {details[1]}
			  </div>
			  {fileContent}
			</div>

		);
	}

	render()
	{
		return (
			<div className="row">
				<div className="col-sm-7">
			  		{this.renderFilesAndFolders()}
			  	</div>
			  	<div className="col-sm-5">
			  		{this.renderSelectedFilePreview()} 
			  	</div>
			</div>
		);
	}
}
