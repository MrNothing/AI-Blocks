import React from 'react';
import ReactDOM from 'react-dom';

export default class Window extends React.Component {
	constructor(props) {
	    super(props);
	    this.state = {activeTab:0};
	    window.service.current_scene = 0;
	}

  	renderTabs() {
  		let first = true;
  		let counter = 0;
		const listItems = this.props.tabs.map((element) => {
				counter++;
				if (counter-1==this.state.activeTab)
				{
					return <li key={counter} className="active"><a><span className={"glyphicon glyphicon-"+this.props.icons[counter-1]}></span> {element}</a></li>;
				}
				else
				{
					return <li key={counter}><a href="#" onClick={this.selectTab.bind(this, counter-1)}><span className={"glyphicon glyphicon-"+this.props.icons[counter-1]}></span> {element}</a></li>;
				}
		});

    	return listItems;
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
	    }

	    this.setState({
	      activeTab: id
	    });
	}

	render() {
		return (
		  	<div className={"panel panel-default global_container"}>
				<ul className="nav nav-tabs">
				   {this.renderTabs()}
				</ul>
				<div className="panel-body">
				   {this.getActiveChild()}
				</div>
			</div>
		);
	}
}
