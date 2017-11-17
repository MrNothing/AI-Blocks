import React from 'react';
import ReactDOM from 'react-dom';
import ProjectBuilder from '../Managers/ProjectBuilder';

export default class BuildProject extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {buildpath:""};
	}

	selectBuildFolder()
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
		      buildpath: selected_dir[0]
		    });
		}
	}

	updateBuildPath(evt)
	{
		this.setState({
	      buildpath: evt.target.value
	    });
	}

	buildProject()
	{
		console.log(this.state.buildpath);
		if(this.state.buildpath!="")
		{
			let builder = new ProjectBuilder(this.state.buildpath);
			builder.BuildProject();
		}
		else
		{
			alert("You must select a folder!");
		}
	}

	render() {
		let dropdown = (
					 <div className="dropdown">
					  <button className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">Engine:
					  <span className="caret"></span></button>
					  <ul className="dropdown-menu">
					    	<li><a href="#">"Tensorflow"</a></li>
					  </ul>
					</div> 
				);

		return (
		<div>
			<div className="input-group">
			  {dropdown}
		  	</div>
		  	<div className="input-group">
		      <input value={this.state.buildpath} onChange={evt => this.updateBuildPath(evt)} type="text" className="form-control" placeholder="Project folder..."/>
		      <span onClick={this.selectBuildFolder.bind(this)} type="button" className="input-group-addon"><i className="glyphicon glyphicon-folder-open"></i></span>
		    </div>
		    <button type="button" className="btn btn-default btn-sm" onClick={this.buildProject.bind(this)}>
				Build Project <i className="material-icons">build</i>
			</button>
	    </div>);
	}
}
