import React from 'react';
import ReactDOM from 'react-dom';

import ChartModule from './Modules/Chart'
import ImageViewer from './Modules/ImageViewer'

export default class Scene extends React.Component {
	constructor(props) {
	    super(props);

		this.enableWidgets();

		this.state = {selectObject:null};
		
		window.service.objectsByID = {};
		window.service.sceneUI = this;
	}

	update()
	{
		this.forceUpdate();
		if(!window.service.sceneRedraw)
		{
			window.service.sceneRedraw = true;
			setTimeout(this.update.bind(this), 10);
		}
		else
			this.enableWidgets();
	}

	enableWidgets()
	{
		$( function() {
			$( ".scene-object" ).draggable({
		      stop: function(event) {
		      		let obj = window.service.objectsByID[event.target.id];
			        window.service.sceneUI.updateObject(obj, obj.id, true);
			      }
			});
			$( ".scene-object" ).resizable({
		      minHeight: 75,
		      minWidth: 75,
			  stop: function(event) {
		      		let obj = window.service.objectsByID[event.target.id];
			        window.service.sceneUI.updateObject(obj, obj.id, true);
			      }
		    });
		});
	}

	updateObject(object, id, silent)
	{
		let elem = document.getElementById("widget_"+id);
		if(elem.style.left!=null)
			object.position.x = parseInt(elem.style.left);
		if(elem.style.top!=null)
			object.position.y = parseInt(elem.style.top);
		if(elem.style.width!=null)
			object.scale.x = parseInt(elem.style.width);
		if(elem.style.height!=null)
			object.scale.y = parseInt(elem.style.height);

		if(!silent)
		{
			window.service.hierarchyUI.selectObject(object);
			this.state = {selectedObject:object};
		}
		else
		{
			this.forceUpdate();
		}

	}

	findAndDeleteRecursive(parent)
	{
		if(parent == null)
		{
			for (let i in window.service.scene)
	    	{
	    		if(window.service.scene[i].id==window.service.selectedObject.id)
	    		{
	    			window.service.scene.splice(i, 1);
	    			if(window.service.selectedObject.children.length>0)
		    		{
		    			this.findAndDeleteRecursive(window.service.selectedObject)
		    		}
	    			break;
	    		}
	    	}
		}
		else
		{
			for (let i in parent.children)
	    	{
	    		if(parent.children[i].id==window.service.selectedObject.id)
	    		{
	    			parent.children.splice(i, 1);
	    			break;
	    		}
	    		else
	    		{
	    			if(parent.children[i].children.length>0)
		    		{
		    			this.findAndDeleteRecursive(parent.children[i])
		    		}
	    		}
	    	}
		}
	}

	renderObjectModules(object)
	{
		let modules = [];
		for(let i in object.scripts)
		{
			if(object.scripts[i].source=="chart.py")
			{
				object.scripts[i].updateIndexParams();

				let id = "chart_"+object.id;
				let target = object.scripts[i].params[object.scripts[i].paramsIndex["_input"]].value;
				let filter = object.scripts[i].params[object.scripts[i].paramsIndex["filter"]].value;
				let limit = object.scripts[i].params[object.scripts[i].paramsIndex["limit"]].value;
				let obj = object.scripts[i].params[object.scripts[i].paramsIndex["type"]];
				let type = "line";
				if(obj)
					type = obj.value;
				let chart = <ChartModule 
									key={id} 
									id={id} 
									target={target} 
									filter={filter} 
									limit={limit}
									type={type}
									width={object.scale.x}
									height={object.scale.y}></ChartModule>;
				modules.push(chart);
			}
			else if(object.scripts[i].source=="image_viewer.py")
			{
				object.scripts[i].updateIndexParams();

				let id = "img_viewer_"+object.id;
				let filter = object.scripts[i].params[object.scripts[i].paramsIndex["filter"]].value;
				let target = object.scripts[i].params[object.scripts[i].paramsIndex["_input"]].value;
				let viewer = <ImageViewer 
									key={id} 
									id={id} 
									target={target} 
									filter={filter} 
									width={object.scale.x}
									height={object.scale.y}></ImageViewer>;
				modules.push(viewer);
			}
		}
		return modules;
	}

	renderProgressbar(object)
	{
		if(object.status>0)
		{
			if(object.status>=1)
			{
				return (<div className="row container-fluid">
			    	<div className="progress">
					  <div  style={{width:"100%", color:"#FFFFFF"}}
					  		className="progress-bar" 
					  		role="progressbar" 
					  		aria-valuenow="100"
					  		aria-valuemin="0" 
					  		aria-valuemax="100">
					    Done! 
					  </div>
					</div>
				</div>);
			}
			else
			{
				return (<div className="row container-fluid">
			    	<div className="progress">
					  <div  style={{width:object.status*100+"%"}}
					  		className="progress-bar progress-bar-striped active" 
					  		role="progressbar" 
					  		aria-valuenow={'"'+object.status*100+'"'}
					  		aria-valuemin="0" 
					  		aria-valuemax="100">
					    Running... 
					  </div>
					</div>
				</div>);
			}
		}
		else
		{
			return null;
		}
	}

	renderObjects(objects)
	{
		let output = [];
		for(let i in objects)
		{
			let object = objects[i];
			window.service.objectsByID["widget_"+object.id] = object;
			if(object.scene == window.service.currentScene)
			{
				let hasPlug = false;
				for(let s in object.scripts)
				{
					let params = object.scripts[s].params;
					for(let p in params)
					{
						let param = params[p];
						if(param.type.trim()=='object')
						{
							hasPlug = true;
						}

						if(param.type.trim()=="object" && (param.value+"").trim()!="null")
						{
							if(window.service.objectsLinksValidator[param.value+"_"+object.id]==null && 
								window.service.objectsLinksValidator[object.id+"_"+param.value]==null)
							{
								window.service.objectsLinks.push([param.value, object.id]);
								window.service.objectsLinksValidator[param.value+"_"+object.id] = true;
								window.service.objectsLinksValidator[object.id+"_"+param.value] = true;
							}
						}
					}
				}


				let selected = "";
				if(window.service.selectedObject!=null)
				{
					if(window.service.selectedObject.id==object.id)
					{
						selected = "selected";
					}
				}

				let x = object.position.x+"px";
				if(object.position.x==null)
					x = "0px";
				let y = object.position.y+"px";
				if(object.position.y==null)
					y = "0px";
				let w = object.scale.x+"px";
				if(object.scale.x==null)
					w = "200px";
				let h = object.scale.y+"px";
	  			if(object.scale.y==null)
	  				h = "200px";

	  			let styleObj = {top:y, left:x, width:w, height:h, background: "rgb(255, 216, 216)"}
	  			if(object.enabled=="True")
	  			{
	  				styleObj["background"] = "rgb(255, 255, 255)";
	  			}

	  			let plug;
	  			if(hasPlug)
	  			{
	  				plug = <span className="fa fa-dot-circle-o plug" id={"target_"+object.id}></span>;
	  			}
	  			else
	  			{
					plug = <span style={{visibility:"hidden"}} className="fa fa-dot-circle-o plug" id={"target_"+object.id}></span>;
	  			}

				output.push(<div style={styleObj} 
						onClick={this.updateObject.bind(this, object, object.id, false)}
						id={"widget_"+object.id} 
						className={"scene-object "+selected}>
						<span style={{fontSize:"30px"}} className={object.getObjectIcon()}/> {object.name}
						{this.renderObjectModules(object)}
						{this.renderProgressbar(object)}
						{plug}
					 </div>);

	  			if(object.children.length>0)
	  			{
					output = output.concat(this.renderObjects(object.children));
	  			}
			}

		}
			
		return output;
	}

	clearSelection()
	{
		window.service.hierarchyUI.selectObject(null);
		this.state = {selectedObject:null};
	}

  	renderElements() 
  	{
  		if(window.service.scene.length>0)
  		{
  			window.service.objectsByID = {};
  			window.service.objectsLinks = [];
  			window.service.objectsLinksValidator = {};
  			let scene = this.renderObjects(window.service.scene);
  			let links = this.renderLinks();
  			window.service.sceneReady = true;
			return (<div>
						{scene}
						{links}
						<div onClick={this.clearSelection.bind(this)} style={{ width: "9999px",height: "9999px"}} id="sceneBg"/>
					</div>);
  		}
  		else
  		{
    		return <div className="add-info">Add an object to the scene to get started!</div>;
  		}
	}

	renderLinks()
	{
		if(window.service.scene.length>0)
  		{
  			let counter = 0;
  			let output = [];

  			for(let l in window.service.objectsLinks)
  			{
  				let link = window.service.objectsLinks[l];
  				let obj1 = window.service.objectsByID['widget_'+link[0]];
  				let obj2 = window.service.objectsByID['widget_'+link[1]];

  				if(obj1!=null && obj2!=null)
  				{
  					let elem0 = document.getElementById("target_"+obj1.id);
  					let elem1 = document.getElementById("target_"+obj2.id);
  					
  					if(elem0!=null && elem1!=null)
  					{
  						let target0 = this.cumulativeOffset(elem0);
		  				let target1 = this.cumulativeOffset(elem1);

		  				let maxTop = Math.max(target0.top, target1.top);
		  				let diff = Math.abs(target0.top-target1.top);

		  				let minLeft = Math.min(target0.left, target1.left);
		  				let maxLeft = Math.max(target0.left, target1.left);
		  				let hdiff = Math.abs(target0.left-target1.left);

		  				let maxLeftTop = target1.top;
		  				let maxLeftLeft = target1.left;
		  				if(target0.top<target1.top)
		  				{
		  					maxLeftTop = target0.top;
		  					if(target0.left>target1.left)
		  						maxLeftLeft = target0.left-2;
		  					else
		  						maxLeftLeft = target0.left;
		  				}
		  				else
		  				{
		  					if(target0.left<target1.left)
		  						maxLeftLeft = target1.left-2;
		  				}

		  				let div0 = <div key={"link0_"+l} className="link_line" style={{position:'absolute', left:minLeft+8, top:maxTop-62, width:hdiff, height:15+counter*5}}/>;
		  				let div1 = <div key={"link1_"+l} className="link_line2" style={{position:'absolute', left:maxLeftLeft+8, top:maxLeftTop-62, width:0, height:diff}}/>;
		  				output.push(div0);
		  				output.push(div1);
		  				counter++;
  					}
  				}
  			}	

  			return output;
  		}
	}

	cumulativeOffset(element) {
	    let top = 0, left = 0;
	    let last = false;
	    do {
	        top += element.offsetTop  || 0;
	        left += element.offsetLeft || 0;

	        element = element.offsetParent;
	    } while(element && !last);

	    return {
	        top: top,
	        left: left
	    };
	};

	render() {
		return (
			<div className="global_container">
				{this.renderElements()}
		  	</div>
		);
	}
}
