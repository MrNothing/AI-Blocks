import Chart from 'chart.js';
import React from 'react';

export default class InputService extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    
	componentWillMount() {
		document.addEventListener("keydown", this.handleKey.bind(this));
		document.addEventListener("keyup", this.handleKeyUp.bind(this));
	}

	componentWillUnmount() {
		document.removeEventListener("keydown", this.handleKey.bind(this));
		document.removeEventListener("keyup", this.handleKeyUp.bind(this));
	}   
	
	handleKey(event) {
		window.service.keysPressed[event.key]=1;

		if(this.isKeyPressed("Control"))
  		{
		  	if(event.key == 's'){
		  			if(window.service.project!=null)
		  				window.service.menuUI.saveProjectClicked();
		  	}

		  	if(event.key == 'c'){
		  			if(window.service.project!=null)
		  				window.service.copySelection();
		  	}

		  	if(event.key == 'v'){
		  			if(window.service.project!=null)
		  				window.service.pasteSelection();
		  	}
	  	}
	}

	handleKeyUp(event)
	{
		window.service.keysPressed[event.key]=0;

		if(document.activeElement!=null && document.activeElement.id=="body")
		{
			if(event.key == 'Delete'){
			    if(window.service.selectedObject!=null)
			    {
			    	window.service.sceneUI.findAndDeleteRecursive(null);
			    }
			    window.service.hierarchyUI.selectObject(null);
			    window.service.hierarchyUI.forceUpdate();
				window.service.sceneUI.update();
		  	} 
		}	
	}

	isKeyPressed(key)
	{
		if(window.service.keysPressed[key])
		{
			if(window.service.keysPressed[key]==1)
				return 1;
			else
				return 0;
		}
		else
		{
			return 0;
		}
	}

    render() {
        return <div id="InputServiceLoaded"/>;
    }
}