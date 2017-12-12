import React from 'react';
import ReactDOM from 'react-dom';

export default class Window extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {activeTab:0};
	    if (this.props.hasConsole)
	    {
	    	window.service.consoleWindow = this;
	    }
	    window.service.current_scene = 0;
	}

	editSceneName(sceneID)
	{
		this.setState({editing:true, sceneEdit:sceneID, newSceneName:window.service.project.sceneNames[sceneID]});
	}

	updateNewSceneName(evt)
	{
		this.setState({newSceneName:evt.target.value})
	}

	saveNewName()
	{
		window.service.project.sceneNames[this.state.sceneEdit] = this.state.newSceneName;
		this.setState({editing:false, newSceneName:""});
	}

	addScene()
	{
		window.service.project.sceneNames.push("New Scene");
		this.forceUpdate();
	}

	removeScene()
	{
		window.service.project.sceneNames.splice(this.state.activeTab, 1);
		this.setState({editing:false, newSceneName:""});
	}

  	renderTabs() {
  		let first = true;
  		let counter = 0;

		if(this.props.scene_selector)
		{
			let listItems = [];

	  		for (let i in window.service.project.sceneNames) {
				let name = window.service.project.sceneNames[i];
				let edit = (<span onClick={this.editSceneName.bind(this, counter)} className="glyphicon glyphicon-edit" style={{cursor:'pointer'}}></span>);

				if (counter==this.state.activeTab)
				{
					listItems.push(<li key={counter} className="active"><a style={{"user-select":"none", background:this.props.color}}><span id={"activeTab_"+counter} className={"glyphicon glyphicon-"+this.props.icons[0]}></span> {name} {edit}</a></li>);
				}
				else
				{
					listItems.push(<li key={counter} className="inactivetab"><a className="inactivetabLink" style={{"user-select":"none"}} href="#" onClick={this.selectTab.bind(this, counter)}><span id={"activeTab_"+counter} className={"glyphicon glyphicon-"+this.props.icons[0]}></span> {name}</a></li>);
				}
				counter++;
			}
			
			listItems.push(<li key={counter} className="inactivetab"><a className="inactivetabLink" style={{"user-select":"none"}} href="#" onClick={this.addScene.bind(this)}><span class="glyphicon glyphicon-plus"></span> Add Scene</a></li>)
			return listItems;
		}
		else
		{

			const listItems = this.props.tabs.map((element) => {
				counter++;

				let name = element;

				if (counter-1==this.state.activeTab)
				{
					return <li key={counter} className="active"><a style={{"user-select":"none", background:this.props.color}}><span className={"glyphicon glyphicon-"+this.props.icons[counter-1]}></span> {name}</a></li> ;
				}
				else
				{
					return <li key={counter} className="inactivetab"><a className="inactivetabLink" style={{"user-select":"none"}} href="#" onClick={this.selectTab.bind(this, counter-1)}><span className={"glyphicon glyphicon-"+this.props.icons[counter-1]}></span> {name}</a></li>;
				}
			});

			return listItems;
		}

    	
	}

	getActiveChild() {
		let count = React.Children.count(this.props.children);
  		if (count>1)
  		{
  			return this.props.children[this.state.activeTab];
		}
		else
		{
			return this.props.children;
		}
	}

	selectTab(id) {
	    if(this.props.scene_selector==1)
	    {
			window.service.currentScene = id;
			window.service.sceneRedraw = false;
			window.service.sceneUI.update();
			window.service.sceneUI.clearSelection();
			window.service.hierarchyUI.forceUpdate();
			this.setState({editing:false, newSceneName:""});
	    }

	    this.setState({
	      activeTab: id
	    });
	}

	startDrag()
	{
		if(this.props.gridID)
		{
			window.service.draggingWindow = this.props.gridID;
		}
	}

	startDragH()
	{
		if(this.props.gridIDH)
		{
			window.service.draggingWindow = this.props.gridIDH;
		}
	}

	updateCommand(evt)
	{
		this.setState({command:evt.target.value})
		window.service.command = evt.target.value;
	}

	sendCommandKey(e)
	{
	 	if (e.key === 'Enter') {
      		this.sendCommand()
    	}
	}

	sendCommand()
	{
		window.service.runningProcess.stdin.write(window.service.command+"\n");
		this.setState({command:""})
		window.service.command = "";
	}

	render() {

		let console = "";
		if(this.props.hasConsole && this.state.activeTab==1)
		{
			console = (
				<div className="input-group console">
				    <input type="text" className="form-control" value={window.service.command} placeholder="Command" onChange={this.updateCommand.bind(this)} onKeyPress={this.sendCommandKey.bind(this)}/>
				    <div className="input-group-btn">
				      <button className="btn btn-default" type="submit" onClick={this.sendCommand.bind(this)} style={{height: "31px"}}>
				        <i className="fa fa-share"></i>
				      </button>
				    </div>
		  		</div>);
		}

		let edit = "";
		
		if(this.state.editing)	
		{
			let left = document.getElementById("activeTab_"+window.service.currentScene).getBoundingClientRect().left-17;
			edit =  (
				<div className="input-group editSceneName" style={{left:left+"px"}}>
				    <input type="text" className="form-control" value={this.state.newSceneName} placeholder="Scene Name" onChange={this.updateNewSceneName.bind(this)}/>
				    <div className="input-group-btn">
				      <button className="btn btn-default" type="submit" onClick={this.removeScene.bind(this)} style={{height: "31px"}}>
				        <i className="fa fa-trash"></i>
				      </button>
				       <button className="btn btn-default" type="submit" onClick={this.saveNewName.bind(this)} style={{height: "31px"}}>
				        <i className="fa fa-check"></i>
				      </button>
				    </div>
		  		</div>
		  		);
		}
		let padding = this.props.padding;
		let paddingBottom = this.props.paddingBottom;
		if(this.props.hasConsole && this.props.activeTab==1)
		{
			padding = "0 0 40px 8px";
			paddingBottom = "";
		}
		
		return (
		  	<div className={"panel panel-default global_container non-draggable"} style={{overflow: "hidden"}}>
				<ul className="nav nav-tabs" onMouseDown={this.startDrag.bind(this)}>
				   {this.renderTabs()}
				</ul>
				{edit}
				<div className="resizeHandle" onMouseDown={this.startDragH.bind(this)}/>
				<div className="panel-body" style={{background:this.props.color, padding:padding }}>
				   {this.getActiveChild()}
				</div>
				{console}
			</div>
		);
	}
}
