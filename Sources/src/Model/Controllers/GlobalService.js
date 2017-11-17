import SceneObject from '../Objects/SceneObject';
import Script from '../Objects/Script';
import ScriptsManager from '../Managers/ScriptsManager';

export default class GlobalService
{
	constructor() {
	    this.project = null;
	    this.scene = [];
		this.selectedObject = null; //used by property window
		this.logs = [];
	 	this.charts = {};
	 	this.image_viewers = {};
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
		return this.UID_Counter-1;
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

    	this.log("Running ended.", "", 4);
    	this.footerUI.forceUpdate();
    	this.runningUI.forceUpdate();
    	this.sceneUI.forceUpdate();
    }

    copySelection()
    {
    	this.offset = 0
    	this.copied_obj = window.service.selectedObject;
    }

    pasteSelection()
    {
    	let parent = window.service.selectedObject

		let obj = new SceneObject(window.service.getUniqueID(), this.copied_obj.name);

		obj.position.x = this.copied_obj.position.x+this.offset*5;
		obj.position.y = this.copied_obj.position.y+this.offset*5;
		obj.scale.x = this.copied_obj.scale.x;
		obj.scale.y = this.copied_obj.scale.y;
		
		obj.scene = window.service.currentScene;

		for (let s in this.copied_obj.scripts)
		{
			obj.scripts.push(window.service.scriptsManager.CloneScript(this.copied_obj.scripts[s]));
		}

		if(parent==null)
			window.service.scene.push(obj);
		else
			parent.children.push(obj);

		this.hierarchyUI.forceUpdate();
		this.sceneUI.update();

		this.offset+=1;
    }
}
