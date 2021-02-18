import React from 'react';
import JsonManager from '../Managers/JsonManager';

export default class Menu extends React.Component {
	constructor(props) {
	    super(props);
	    this.refresh = this.refresh.bind(this);
	    window.service.menuUI = this;
	}

	openProjectClicked(){

		require('electron').remote.dialog.showOpenDialog(require('electron').remote.getCurrentWindow(), {title:"Select a folder...", properties: ['openDirectory']})
		.then(result => {	
			if(!result.canceled)
			{
				console.log(result.filePaths)

				var selected_dir = result.filePaths;
				if(selected_dir==null)
				{
					window.service.log("Failed to load project: No directory selected", "", 2);			
				}
				else
				{
					window.service.loading = {properties:null, scene:null};
					
					let loader = new JsonManager(null);
					loader.load(selected_dir[0]+"/Properties.json").then(json => {
						window.service.loading.properties = json;
						window.service.loading.properties.projectpath = selected_dir[0];
						window.service.checkLoadingComplete();
					}).catch(err => {
						alert("Failed to load project: "+err);
						window.service.log("Failed to load project!", err+" "+err.stack, 2);
					});

					let loader2 = new JsonManager(null);
					loader2.load(selected_dir[0]+"/Scene.json").then(json => {
						window.service.loading.scene = json;
						window.service.checkLoadingComplete();
					}).catch(err => {
						alert("Failed to load project: "+err);
						window.service.log("Failed to load project!", err+" "+err.stack, 2);		
					});
				}
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

	refresh(){
		this.forceUpdate();
	}

	saveProjectClicked(){
		let saver = new JsonManager(window.service.project);
		saver.save(window.service.project.projectpath+"/Properties.json")

		let scene_saver = new JsonManager(window.service.getSceneJson());
		scene_saver.save(window.service.project.projectpath+"/Scene.json")

		window.service.log("Project saved: "+window.service.project.projectname, window.service.project.projectpath, 4);	
	}

	checkDisabled()
	{
		if(window.service.project==null)
		{
			return true;
		}
		else
		{
			return false;
		}
	}

	render() {
		return (
			<div className="btn-group">
				<button type="button" className="btn btn-default btn-sm menubtn" data-toggle="modal" data-target="#new-project-popup">
					<span className="glyphicon glyphicon-plus"></span> New Project
				</button>
				<button type="button" className="btn btn-default btn-sm menubtn" onClick={this.openProjectClicked}>
					<span className="glyphicon glyphicon-folder-open"></span>
				</button>
				<button type="button" className="btn btn-default btn-sm menubtn" disabled={this.checkDisabled()} onClick={this.saveProjectClicked}>
					<span className="glyphicon glyphicon-floppy-disk"></span>
				</button>
				<button type="button" className="btn btn-default btn-sm menubtn" disabled={this.checkDisabled()} data-toggle="modal" data-target="#project-properties">
					<span className="glyphicon glyphicon-cog"></span>
				</button>
				<button type="button" className="btn btn-default btn-sm menubtn" disabled={this.checkDisabled()} data-toggle="modal" data-target="#project-builder">
					<i className="material-icons">build</i>
				</button>
			</div>
		);
	}
}