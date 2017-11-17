import React from 'react';
import ReactDOM from 'react-dom';
const os = require('os');
import ProjectBuilder from '../Managers/ProjectBuilder';
import ProjectRunner from '../Managers/ProjectRunner';

export default class RunningItems extends React.Component {
	constructor(props) {
	    super(props);
	    window.service.runningUI = this;
	}

	Run()
	{
		if(window.service.project!=null)
		{
			let tmpDir = os.tmpdir();

			console.log("tmpDir: "+tmpDir)

			if(window.service.running==false)
			{
				window.service.running = true;
				window.service.log("Building project: "+window.service.project.projectname, "", 1);
				
				for(let u in window.service.charts)
				{
					window.service.charts[u].clearChart();
				}

				let builder = new ProjectBuilder(tmpDir);
				builder.BuildProject(true);
				if(builder.success)
				{
					window.service.logs = [];
					let runner = new ProjectRunner(tmpDir)
				}
				else
				{
					window.service.running = false;
				}
			}
			else
			{
				window.service.log("this project is already running!", "", 1);
			}
		}
	}

	Stop()
	{
		if(window.service.runningProcess)
			window.service.runningProcess.kill();
		else
			window.service.log("The project is not running yet!", "", 1);
	}

	isDisabled()
	{
		if(window.service.project=null)
			return true;
		else
		{
			if(window.service.running)
			{
				return true;
			}
			else
			{
				return false;
			}
		}
	}

	render() {
		return (
			<div class="btn-group">
	        	<button type="button" class="btn btn-default btn-sm" onClick={this.Run.bind(this)}>
		  			<span class="glyphicon glyphicon-play"></span>
				</button>
				<button type="button" class="btn btn-default btn-sm" onClick={this.Stop.bind(this)}>
					<span class="glyphicon glyphicon-stop"></span>
				</button>
				<button type="button" class="btn btn-default btn-sm" disabled>
					<span class="glyphicon glyphicon-pause"></span>
				</button>
	        </div>
		);
	}
}
