const fs = require('fs');
const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')
const isDirectory = source => lstatSync(source).isDirectory()

export default class Script{
	  constructor(id, source) {
	  	this.id = id;
  		window.service.checkMaxID(this.id);
	  	this.description = "";
	 	this.source = source;
	 	this.fullpath = null;
	 	this.params = [];
	 	this.paramsIndex = {};
	 	this.icon = null;
	  }

	  getFile()
	  {
	  	let filepath = this.findFileInFolder(this.source, "");

	  	if(filepath=="")
	  	{
	  		window.service.log("Could not find the Script: "+this.source, "", 2);
	  		return "";	  		
	  	}
	  	else
	  	{
	  		filepath = require('path').resolve(window.service.project.projectpath+filepath);

	  		return filepath;
	  	}
	  }
	  
	  loadParams(filepath)
	  {
	  	let context = this;

		let data = fs.readFileSync(filepath);
		    
	    let array = data.toString().split("\n");

	    let next_is_param = false;
	    let type = 'string';
	    let condition = "";

	    for(let i in array) {

	        let line = array[i];

	        if(line.indexOf("#description")==0)
		    {
		    	this.description += line.substring(13, line.length)+"\n";
		    }

		    if(line.indexOf("#icon")==0)
		    {
		    	this.icon = line.substring(6, line.length).trim();
		    }

		    if(line.indexOf("#zone")==0)
		    	condition = line.replace("#zone", "").trim()

		    if(line.indexOf("#endzone")==0)
		    	condition = "";

	        if(next_is_param==true)
	        {
	        	let param = line.split('=')[0].replace(/\s/g, '');
	        	let value = line.split('=')[1].replace('"', '').replace('"', '').replace("\n", "");
	        	if(type.indexOf("array|")==0)
	        	{

	        		try
	        		{
						let vals = JSON.parse(line.split('=')[1])
		        		value = ""
		        		for(let v in vals)
		        		{
		        			if(v!=vals.length-1)
		        				value+=vals[v]+";";
		        			else
		        				value+=vals[v];
		        		}
	        		}
	        		catch(e)
	        		{
	        			window.service.log("Could not parse array! "+this.source+" at line: "+i, e.message, 1);
	        		}
	        		
	        	}

	        	this.params.push({name:param, value:value, type:type, condition:condition});
	        	this.paramsIndex[param] = this.params.length-1;

	        	next_is_param = false;
	        }

	        if(line.indexOf("#param")==0)
	        {
	        	type = line.substring(7, line.length);

	        	if(type=="")
	        	{
	        		type = 'string';
	        	}

	        	next_is_param = true;
	        }
	    }
	  }

	  findFileInFolder(f, folder)
	  {
	  	let root = window.service.project.projectpath;
	  	let found = "";
  		fs.readdirSync(root+"\\"+folder).forEach(file => {
  		  if(isDirectory(root+"\\"+folder+"\\"+file))
  		  {
  		  	let sub_file = this.findFileInFolder(f, folder+"\\"+file);
			if(sub_file!="")
				found = folder+"\\"+sub_file;
  		  }
		  else
		  {
  		  	if(f==file)
			{
				found = folder+"\\"+file;
			}
		  }
		});

  		return found;
	  }

	  toJson()
	  {
	  		return {
	  			source:this.source,
	  			params:this.params,
	  			id:this.id,
	  		}
	  }

	  updateIndexParams()
	  {
	  	this.paramsIndex = {};
	  	for (let p in this.params)
	  	{
	  		this.paramsIndex[this.params[p].name] = p;
	  	}
	  }
}
