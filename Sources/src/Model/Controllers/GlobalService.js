import SceneObject from '../Objects/SceneObject';
import Script from '../Objects/Script';
import ScriptsManager from '../Managers/ScriptsManager';
import ActionsManager from '../Managers/ActionsManager';

export default class GlobalService
{
	constructor() {
	    this.project = null;
	    this.scene = [];
		this.selectedObject = null; //used by property window
		this.selectedObjects = {};
		this.logs = [];
	 	this.charts = {};
	 	this.image_viewers = {};
	 	this.audio_viewers = {};
	 	this.loading = {properties:null, scene:null};
	 	this.objectsByID = {};
  		this.objectsLinks = [];
  		this.objectsLinksValidator = {};
  		this.pending_charts = {};
  		this.currentScene = 0;
	 	
		this.sceneReady = false;
		this.hierarchyReady = false;
	    this.running = false;
		
		this.propertiesUI = null;
		this.projectPropertiesUI = null;
		this.projectUI = null;
		this.menuUI = null;
	    this.sceneUI = null;
	    this.hierarchyUI = null;
	    this.outputUI = null;
	    this.createProjectUI = null;
	    this.footerUI = null;
	    this.filePickerUI = null;
	    this.runningUI = null;

	    this.mainGrid = null;
	    this.UID_Counter = 0;

	    this.keysPressed = {};

	    this.scriptsManager = new ScriptsManager();
	    this.actionsManager = new ActionsManager();

	    this.mouse_pos = {x:0, y:0};
	    this.offset = {x:0, y:0};
	    this.zoom =1;

	    //scene test
	    /*let obj1 = new SceneObject(-3, "obj0");
	    obj1.children.push(new SceneObject(3, "child0"));
	    obj1.children.push(new SceneObject(4, "child1"));

	    let script1 = new Script(0, "optimizer.py");

	    script1.params.push({name:"path", value:"minst.tar.gz", type:"string"});
	    script1.params.push({name:"batch_size", value:"128", type:"int"});

	    obj1.scripts.push(script1);

	    let obj2 = new SceneObject(-1, "obj0");

	    let script2 = new Script(0, "neuron.py");
	    script2.params.push({name:"test", value:"0.5", type:"float"});

	    obj2.scripts.push(script2);

	    let scene = [
	    	obj1,
	    	obj2,
	    	new SceneObject(-2, "obj2")
	    ]

	    this.scene = scene;*/
	}

	log(msg, details, type)
	{
		if(this.logs.length>50)
			this.logs.splice(0, 1);

		this.logs.push({msg:msg, type:type, details:details});
		if(this.outputUI!=null)
			this.outputUI.update();
		if(this.footerUI!=null)
			this.footerUI.forceUpdate();
	}

	getUniqueID()
	{
		this.UID_Counter++;

		while (this.findObjectInScene(this.UID_Counter))
			this.UID_Counter++;

		return this.UID_Counter;
	}

	checkMaxID(id)
	{
		if(this.UID_Counter<id)
		{
			this.UID_Counter = id+1;
		}
	}

	getSceneJson(parent)
	{
		if(parent==null)
			parent = this.scene;

		let output = [];
		for(let i in parent)
		{
			let obj = parent[i];
			output.push(obj.toJson());
		}

		return output;
	}

	loadSceneFromJson(json)
	{
		this.scene = [];
		for(let i in json)
		{
			let obj = new SceneObject(this.getUniqueID(), "");
			obj.fromJson(json[i]);
			this.scene.push(obj);
		}
	}

    updateChart(data)
    {  
        this.charts[this.props.id].updateChart(data);
    }

    checkLoadingComplete()
    {
    	if(this.loading.properties!=null && this.loading.scene!=null)
    	{
    		if(this.outputUI!=null)
				this.outputUI.forceUpdate();

	    	this.log("Project loaded: "+this.loading.properties.projectname, this.loading.properties.projectpath, 3);	

	   		this.project = this.loading.properties;

	   		if(!this.project.sceneNames)
	   		{
	   			this.project.sceneNames = ['Scene 1', 'Scene 2', 'Scene 3', 'Scene 4']
	   		}

			this.loadSceneFromJson(this.loading.scene);

			window.service.charts = {};

			window.service.scriptsManager.compileAllScripts();
			window.service.scriptsManager.updateAllProjectScriptInstances();

			if(this.projectUI!=null)
				this.projectUI.selectFolder(this.loading.properties.projectpath, true);

			if(this.projectPropertiesUI!=null)
			{
				this.projectPropertiesUI.setSource();
			}

			this.mainGrid.forceUpdate();
			this.menuUI.refresh();
			if(this.sceneUI!=null)
				this.sceneUI.update();
			if(this.footerUI!=null)
				this.footerUI.forceUpdate();
    	}
    }

    findObjectInScene(id)
    {
    	return this.objectsByID["widget_"+id];
    }

    onRunUpdate(target, status)
    {
    	this.findObjectInScene(target).status = status;
    	this.sceneUI.forceUpdate();
    	this.footerUI.updateBar();
    }

    onRunStart()
    {
    	this.log("Running project...", "", 3);
    	this.footerUI.forceUpdate();
    	this.runningUI.forceUpdate();
    	this.footerUI.updateBar();
    	this.sceneUI.forceUpdate();

    	for(let u in this.image_viewers)
		{
			this.image_viewers[u].setPath("");
		}
    }

    onRunEnd()
    {
    	for (let o in this.objectsByID)
    	{
    		this.objectsByID[o].status = 0;
    	}


    	this.log("Running ended, Lasted: "+((performance.now() - this.t0)/1000) + " seconds.", "", 4);
    	this.footerUI.forceUpdate();
    	this.runningUI.forceUpdate();
    	this.sceneUI.forceUpdate();
    	window.service.builder = null;
    }

    copySelection()
    {
    	this.offset_copy = 1;
    	this.copied_obj = this.selectedObjects;
    }

    pasteSelection()
    {
    	window.service.sceneUI.clearSelection(true);
    	this.log(this.selectedObjects+"", "", 0);

    	let linksMap = {}
    	for(let i in this.copied_obj)
    	{
    		linksMap[i] = this.pasteObject(this.copied_obj[i])
    	}

		
    	for(let i in linksMap)
    	{
			for(let s in linksMap[i].scripts)
    		{
				let params = linksMap[i].scripts[s].params;
    			for(let p in params)
    			{
    				let param = params[p];
    				if(param.type.trim()=="object")
    				{
    					if(linksMap[param.value])
    					{
    						param.value = linksMap[param.value].id;
    					}
    				}
    			}
    		}
    	}

		this.hierarchyUI.forceUpdate();
		this.sceneUI.update();
		this.offset_copy+=1;
    }

    pasteObject(object)
    {
    	let parent = window.service.selectedObject

		let obj = new SceneObject(window.service.getUniqueID(), object.name);

		obj.position.x = object.position.x+this.offset_copy*5;
		obj.position.y = object.position.y+this.offset_copy*5;
		obj.scale.x = object.scale.x;
		obj.scale.y = object.scale.y;
		
		obj.scene = window.service.currentScene;

		for (let s in object.scripts)
		{
			obj.scripts.push(window.service.scriptsManager.CloneScript(object.scripts[s]));
		}

		this.hierarchyUI.selectObject(obj, true);

		//if(parent==null)
		window.service.scene.push(obj);
		//else
		//	parent.children.push(obj);

		return obj;
    }
}
