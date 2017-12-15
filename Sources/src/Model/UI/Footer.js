import React from 'react';
import ReactDOM from 'react-dom';
import Window from './Window'

export default class Footer extends React.Component {
	constructor(props) {
	    super(props);
	    window.service.footerUI = this;
	    this.state = {bar:0};
	}

	updateBar()
	{
		let state = 0;
		let maxstate = 0;
		let percent = 0;
		for(let o in window.service.objectsByID)
		{
			if(window.service.objectsByID[o].status>0)
			{
				state+=parseFloat(window.service.objectsByID[o].status);
				maxstate+=1;
			}
		}

		maxstate = Math.max(maxstate, 1);
		percent = (state/maxstate)*100;

		try
		{
			let win = require('electron').remote.getCurrentWindow();
			win.setProgressBar(state/maxstate);
		}
		catch(e)
		{
			console.log("Warning: Failed to get window remote object, state did not render on window.")
		}
		
		this.setState({bar:percent});
	}

	renderProgressbar()
	{
		if (window.service.running)
		{
			let state = this.state.bar;
			return (
				<div className="row container-fluid">
			    	<div className="progress">
					  <div style={{width:state+'%'}} className="progress-bar progress-bar-striped active" 
					  		role="progressbar" 
					  		aria-valuenow={state+""} 
					  		aria-valuemin="0" 
					  		aria-valuemax="100">
					    Running...
					  </div>
					</div>
				</div>);
		}
		else
		{
			return (<div className="row container-fluid">
		    	<div className="progress">
				  <div  className="progress-bar progress-bar-striped active" 
				  		role="progressbar" 
				  		aria-valuenow="60" 
				  		aria-valuemin="0" 
				  		aria-valuemax="100">
				     
				  </div>
				</div>
			</div>);
		}
	}

	getIcon()
	{
		if(window.service.logs[window.service.logs.length-1].type==0)
			return ["item-info", "info-sign"];
		else if(window.service.logs[window.service.logs.length-1].type==1)
			return ["item-warning", "exclamation-sign"];
		else if(window.service.logs[window.service.logs.length-1].type==2)
			return ["item-danger", "remove"];
		else if(window.service.logs[window.service.logs.length-1].type==3)
			return ["item-success", "ok"];
		else if(window.service.logs[window.service.logs.length-1].type==4)
			return ["item-info", "info-sign"];
		else
			return ["item-success", "info-sign"];
	}

	getMsg()
	{
		if(window.service.logs[window.service.logs.length-1].msg.length>25)
		{
			return window.service.logs[window.service.logs.length-1].msg.substring(0, 25)+"...";
		} else {
			return window.service.logs[window.service.logs.length-1].msg;
		}
	}

	renderInfo()
	{
		if(window.service.logs.length>0)
		{
			return (<a href="#" className={"list-group-item list-group-item-action list-group-"+this.getIcon()[0]+" log-item"}>
					 <span className={"glyphicon glyphicon-"+this.getIcon()[1]}></span> {this.getMsg()}
				</a>);
		}
		else
		{
			return <div/>;
		}
	}

	render() {
		if(window.service.project!=null)
		{
			return (
				<div className="row progress_bottom">
					<div className="col-sm-9">{this.renderProgressbar()}</div>
					<div className="col-sm-3">{this.renderInfo()}</div>
				</div>
			);
		}
		else
		{
			return <div/>;
		}
	}
}
