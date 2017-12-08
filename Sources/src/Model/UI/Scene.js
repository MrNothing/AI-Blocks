import React from 'react';
import ReactDOM from 'react-dom';

import ChartModule from './Modules/Chart'
import ImageViewer from './Modules/ImageViewer'
import AudioViewer from './Modules/AudioViewer'

export default class Scene extends React.Component {
	constructor(props) {
	    super(props);

		this.enableWidgets();

		this.state = {selectObject:null, drag_state:[0, 0]};
		
		window.service.objectsByID = {};
		window.service.sceneUI = this;

		window.service.offset = {x:0, y:0};
	}

	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({ hasError: true });
		// You can also log the error to an error reporting service
		window.service.log(error, info, 2);
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
			  start: function(event) {
			  	    let obj = window.service.objectsByID[event.target.id];
			  	    window.service.draggedobj = obj;
		      		window.service.using_widget = true;
			      },
		      stop: function(event) {
		      		window.service.draggedobj = null;
		      		let obj = window.service.objectsByID[event.target.id];
			        window.service.sceneUI.updateObject(obj, obj.id, true);
		      		window.service.using_widget = false;
			      }
			});
			$( ".scene-object" ).resizable({
		      minHeight: 50,
		      minWidth: 50,
		      start: function(event) {
		      		window.service.using_widget = true;
			      },
			  stop: function(event) {
		      		let obj = window.service.objectsByID[event.target.id];
			        window.service.sceneUI.updateObject(obj, obj.id, true);
		      		window.service.using_widget = false;
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
	    			break;
	    		}
	    		else
	    		{
	    			if(window.service.scene[i].children.length>0)
		    		{
		    			this.findAndDeleteRecursive(window.service.scene[i])
		    		}
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

	findAndDeleteRecursive2(parent, target)
	{
		if(parent == null)
		{
			for (let i in window.service.scene)
	    	{
	    		if(window.service.scene[i].id==target.id)
	    		{
	    			window.service.scene.splice(i, 1);
	    			break;
	    		}
	    		else
	    		{
	    			if(window.service.scene[i].children.length>0)
		    		{
		    			this.findAndDeleteRecursive2(window.service.scene[i], target)
		    		}
	    		}

	    	}
		}
		else
		{
			for (let i in parent.children)
	    	{
	    		if(parent.children[i].id==target.id)
	    		{
	    			parent.children.splice(i, 1);
	    			break;
	    		}
	    		else
	    		{
	    			if(parent.children[i].children.length>0)
		    		{
		    			this.findAndDeleteRecursive2(parent.children[i], target)
		    		}
	    		}
	    	}
		}
	}

	replaceObjects(obj1, obj2)
	{
		let container1 = this.findObjectContainerRecursive(null, obj1.id);
		let container2 = this.findObjectContainerRecursive(null, obj2.id);

		let index1 = container1.indexOf(obj1);
		let index2 = container2.indexOf(obj2);

		if(container1==container2)
		{
			container1[index1] = obj2;
			container1[index2] = obj1;
		}
		else
		{
			container1.splice(index1, 1);
			container2.splice(index2, 0, obj1);
		}
	}

	findObjectContainerRecursive(parent, id)
	{
		let array = null;

		if(parent == null)
		{
			for (let i in window.service.scene)
	    	{
	    		if(window.service.scene[i].id==id)
	    		{
	    			array = window.service.scene;
	    			break;
	    		}
	    		else
	    		{
	    			if(window.service.scene[i].children.length>0)
		    		{
		    			let result = this.findObjectContainerRecursive(window.service.scene[i], id)
		    			if(result!=null)
		    			{
		    				array = result;
		    				break;
		    			}
		    		}
	    		}
	    	}
		}
		else
		{
			for (let i in parent.children)
	    	{
	    		if(parent.children[i].id==id)
	    		{
	    			array = parent.children;
	    			break;
	    		}
	    		else
	    		{
	    			if(parent.children[i].children.length>0)
		    		{
		    			let result = this.findObjectContainerRecursive(parent.children[i], id)
		    			if(result!=null)
		    			{
		    				array = result;
		    				break;
		    			}
		    		}
	    		}
	    	}
		}

		return array;
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
			else if(object.scripts[i].source=="audio_player.py")
			{
				object.scripts[i].updateIndexParams();

				let id = "img_viewer_"+object.id;
				let filter = object.scripts[i].params[object.scripts[i].paramsIndex["filter"]].value;
				let target = object.scripts[i].params[object.scripts[i].paramsIndex["_input"]].value;
				let viewer = <AudioViewer 
									key={id} 
									id={id} 
									target={target} 
									filter={filter} 
									width={object.scale.x}
									height={object.scale.y}></AudioViewer>;
				modules.push(viewer);
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
		let minimap_out = [];
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

				if(window.service.selectedObjects[object.id])
					selected = "selected";

				let x = object.position.x;
				if(object.position.x==null)
					x = "0";
				let y = object.position.y;
				if(object.position.y==null)
					y = "0";
				let w = object.scale.x;
				if(object.scale.x==null)
					w = "200";
				let h = object.scale.y;
	  			if(object.scale.y==null)
	  				h = "200";

	  			let styleObj = {top:y+"px", left:x+"px", width:w+"px", height:h+"px", background: "rgba(255, 255, 255, 0.5)", borderStyle: "dashed"}
	  			if(object.enabled=="True")
	  			{
	  				styleObj["background"] = "#FFF";
	  				styleObj["borderStyle"] = "solid";
	  			}
	  			else
	  			{
	  				styleObj["color"] = "rgba(41, 114, 160, 0.34)";
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

	  			let name = object.name;
	  			let fsize = "20px";
	  			let progressbar = this.renderProgressbar(object);
	  			if(w<75 || h<75)
	  			{
	  				name = "";
	  				fsize = "30px";
	  				progressbar = (<div/>);
	  			}

				output.push(<div style={styleObj} 
						onClick={this.updateObject.bind(this, object, object.id, false)}
						id={"widget_"+object.id} 
						className={"scene-object "+selected}>
						<span style={{fontSize:fsize}} className={object.getObjectIcon()}/> {name}
						{this.renderObjectModules(object)}
						{progressbar}
						{plug}
					 </div>);

				let zoom = {x:20, y:20}; 

				let minimap_styleObj = {top:(y/zoom.y+10)+"px", left:(x/zoom.x+25)+"px", width:(w/zoom.x)+"px", height:(h/zoom.y)+"px", background: styleObj["background"]}

				minimap_out.push(<div style={minimap_styleObj} 
									className={"tiny-object "+selected}>
					 			</div>)

	  			if(object.children.length>0)
	  			{
	  				let obj = this.renderObjects(object.children);
					output = output.concat(obj.scene);
					minimap_out = minimap_out.concat(obj.minimap);
	  			}
			}

		}
			
		return {scene: output, minimap: minimap_out};
	}

	clearSelection(force)
	{
		window.service.actionsManager.insertClearSelectionAction();
		
		if(!window.service.ignoreNextClear || force)
		{
			window.service.selectedObjects = {};
			window.service.hierarchyUI.selectObject(null);
			this.state = {selectedObject:null};
		}

		window.service.ignoreNextClear = false;
	}

	start_drag()
	{
		window.service.nextdrag = false;
		window.service.dragging = true;
		window.service.init_select_pos = {x:window.service.mouse_pos.x, y:window.service.mouse_pos.y};

		document.getElementById("selection_rect").style.width = "0px";
    	document.getElementById("selection_rect").style.height = "0px";
    	document.getElementById("selection_rect").style.left = window.service.mouse_pos.x+"px";
    	document.getElementById("selection_rect").style.top = (window.service.mouse_pos.y-100)+"px";
	}

	stop_drag()
	{
		if(window.service.draggedHierarchyObj)
		{
			if(window.service.hoveredSeparatorObject)
			{	
				this.replaceObjects(window.service.draggedHierarchyObj, window.service.hoveredSeparatorObject);
			}
			else if(window.service.hoveredObject)
			{
				if(window.service.hoveredObject.id!=window.service.draggedHierarchyObj.id)
		      	{	
		      		window.service.sceneUI.findAndDeleteRecursive2(null, window.service.draggedHierarchyObj);
			        window.service.hoveredObject.children.push(window.service.draggedHierarchyObj);
		      	}
			}
			else
			{
				
				window.service.sceneUI.findAndDeleteRecursive2(null, window.service.draggedHierarchyObj);
	    	    window.service.scene.push(window.service.draggedHierarchyObj);
			}
	        
	        window.service.hierarchyUI.forceUpdate();
	        window.service.sceneUI.forceUpdate();
		}

		window.service.dragging = false;
		window.service.draggingWindow = false;
		window.service.draggingHierarchy = false;
		window.service.draggedHierarchyObj = null;
        document.getElementById("selection_rect").style.display = "none";
	}

  	renderElements() 
  	{
  		if(window.service.scene.length>0)
  		{
  			window.service.objectsByID = {};
  			window.service.objectsLinks = [];
  			window.service.objectsLinksValidator = {};
  			let objects = this.renderObjects(window.service.scene);
  			let scene = objects.scene;
  			let links = this.renderLinks();
  			let minimap = objects.minimap;
  			window.service.sceneReady = true;
			return (<div>
						<div className="minimap">
							<div id="minimap_draggable" style={{position:"relative", top:"0px", left:"0px"}}>
								{minimap}
							</div>
						</div>

						<div id="scene_draggable" style={{position:"relative", top:"0px", left:"0px"}}>
							{scene}
							{links}
							<div onClick={this.clearSelection.bind(this)} style={{ width: "0px",height: "0px", "user-select": "none"}} id="sceneBg"/>
						</div>
					</div>
					);
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

		  				let div0 = <div key={"link0_"+l} className="link_line" style={{position:'absolute', left:minLeft+40, top:maxTop-10, width:hdiff, height:15+counter*5}}/>;
		  				let div1 = <div key={"link1_"+l} className="link_line2" style={{position:'absolute', left:maxLeftLeft+40, top:maxLeftTop-10, width:0, height:diff}}/>;
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
	    } while(element);

	    top += -43-window.service.offset.y*window.service.zoom;
	    left += -30-window.service.offset.x*window.service.zoom;

	    return {
	        top: top,
	        left: left
	    };
	};

	render() {
		return (
			<div id="scene_rect" className="global_container" style={{overflow: "hidden", height:"97%"}} onMouseDown={e => this.start_drag (e)} >
				{this.renderElements()}
				<div className="selection_rect" id="selection_rect" style={{width: "100px", height:"100px"}}/>
		  	</div>
		);
	}
}
