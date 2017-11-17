import Script from './Script';

export default class SceneObject{
	  	constructor(id, name) {
		  	this.id = id;
	  		window.service.checkMaxID(this.id);

		  	this.position = {x:0, y:0};
		  	this.scale = {x:95, y:95};
		  	this.status = 0;
		 	this.name = name;
		 	this.children = [];
		 	this.scripts = [];
		 	this.toJsonDescriptor = this.toJsonDescriptor.bind(this);
		 	this.toJsonSource = this.toJsonSource.bind(this);
		 	this.scene = 0;
		 	this.enabled = "True"
	  	}

	  	fromJson(json)
	  	{
	  		this.id = json.params.id;
	  		this.name=json.params.name;
	  		this.position = json.params.position;
	  		this.scale = json.params.scale;
	  		
	  		if(json.params.enabled)
	  			this.enabled = json.params.enabled

	  		if(json.params.scene)
	  			this.scene = json.params.scene;

	  		for (let c in json.children)
	  		{
	  			let obj = new SceneObject(json.children[c].params.id, "");
	  			obj.fromJson(json.children[c]);
	  			this.children.push(obj);
	  		}

	  		for (let i in json.scripts)
	  		{
	  			let script = new Script(window.service.getUniqueID(), json.scripts[i].source);
	  			script.params = json.scripts[i].params;
	  			this.scripts.push(script);
	  		}
	  	}

		toJsonDescriptor()
		{
		  	let json = {
						  //"id": ["Object ID", "info"],
						  //"position": ["Position", "vector"],
						  //"scale": ["Scale", "vector"],
						  "name": ["Name", "text", ""],
						  "enabled": ["Enabled", "bool"],
						  "scripts": ["Scripts", "scripts"]
						};
			return json;
	  	}

		toJsonSource()
		{				
		  	let json = {
					  "id": this.id,
					  "name": this.name,
					  "position": this.position,
					  "scale": this.scale,
					  "scene": this.scene,
					  "enabled": this.enabled
					};
			return json;
		}

		toJson()
		{				
		  	let params = this.toJsonSource();
		  	let children = [];
		  	let scripts = [];

		  	for (let c in this.children)
	  		{
	  			children.push(this.children[c].toJson());
	  		}

		  	for (let i in this.scripts)
		  	{
		  		scripts.push(this.scripts[i].toJson())
		  	}

			return {params:params, children:children, scripts:scripts};
		}

		getObjectIcon()
		{
			if(this.scripts.length==0)
				return "fa fa-cube";
			else
			{
			 	let icon = window.service.scriptsManager.getScriptIcon(this.scripts[0].source);
			 	if(icon!=null)
					return icon;
				else
					return "fa fa-cube";
			} 
		}
}
