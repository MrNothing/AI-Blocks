const fs = require('fs')
const path = require('path');
const os = require('os');

export default class ProjectBuilder{
	constructor(folder) {
		this.folder = folder;
		this.parsedScripts = [];
		this.imports = {};
		this.main = null;
		this.success = false;
	}

	BuildProject(silent)
	{
		window.service.enabledDynamicVars = false;

		let data = fs.readFileSync("build_scripts/global_functions.py");
	    let lines = [];

	    if(!silent)
	    	lines.push("EDITOR_MODE=False");
	    else
	    	lines.push("EDITOR_MODE=True");

	    let tmpdir = os.tmpdir();
	    lines.push("_aiblocks_default_tmp_folder = '"+tmpdir.split("\\").join("\\\\")+"'")

	    lines = lines.concat(data.toString().split("\n"));

	    let scripts_prebuild = fs.readFileSync("build_scripts/scripts_init.py");

		for(let o in window.service.objectsByID)
		{
			if(window.service.objectsByID[o].scripts.length>0 && window.service.objectsByID[o].scene==window.service.currentScene && window.service.objectsByID[o].enabled=="True")
			{
				let newLines = this.buildScript(window.service.objectsByID[o].scripts[0], window.service.objectsByID[o].id);

				lines.push("class object_"+window.service.objectsByID[o].id+":")
				lines.push("	def __init__(self):")
				lines.push("		self.id = '"+window.service.objectsByID[o].id+"'");
				lines.push("		self.name = '"+window.service.objectsByID[o].name+"'");
				lines.push("		self._aiblocks_vars_cache = {}");

				lines = lines.concat(newLines);
				lines = lines.concat(scripts_prebuild.toString().split("\n"));
				
				lines.push("instance_"+window.service.objectsByID[o].id+" = "+"object_"+window.service.objectsByID[o].id+"()");
		
			}	
		}
		
		lines.push("")
		lines.push("#binding instances:")

		for (let i in this.parsedScripts)
		{
			lines.push("instance_"+this.parsedScripts[i][0]+"."+this.parsedScripts[i][1]+" = "+"instance_"+this.parsedScripts[i][2]);
		}
		
		lines.push("")
		lines.push("#running:")

		if(this.main==null)
		{
			if(silent)
				alert("Build failed: No starting point!");
			window.service.log("Build failed! No starting point!", "At least one of your scripts must have a #Main=[Method] directive.", 2);	
		}
		else if(this.failed)
		{
			this.failed = false;
		}
		else
		{
			lines.push("instance_"+this.main[0]+"."+this.main[1]+"()");

			let data = "";

			for(let i in this.imports)
				data+=i+"\n";
			
			for(let l in lines)
				data+=lines[l]+"\n";

			console.log("data: "+data);

			fs.writeFileSync(this.folder+'/main.py', data);
			if(!silent)
				alert("Project was successfully built!");
			window.service.log("Project was successfully built!", "", 3);
			this.success = true;
		}

		$('#project-builder').modal("hide");
	}

	buildScript(script, objID)
	{
		script.updateIndexParams();

		script.fullpath = window.service.scriptsManager.scripts[script.source].fullpath;

		console.log("script.fullpath: "+script.fullpath);

		let data = fs.readFileSync(script.fullpath);
	    let lines = data.toString().split("\n");
	    let next_is_param = false;
	    let inRunFunc = false;

		for(let l in lines)
		{
			let line = lines[l];

			if(line.indexOf("import ")!=-1)
			{
				this.imports[line.trim()] = true;
				lines[l] = "";
			}
			else
			{
				if(line.indexOf("def ")==0)
					inRunFunc = true;
				if(line.indexOf("MAIN=")!=-1)
					this.main = [objID, line.split('=')[1].replace(/\s/g, '').replace("\n", '')];
				if(line.indexOf("GetDynamicValue")!=-1)
					window.service.enabledDynamicVars = true

				if(next_is_param==true)
		        {
		        	let param_name = line.split('=')[0].replace(/\s/g, '');
		        	
	        		if(script.paramsIndex[param_name]!=null)
	        		{
	        			let param = script.params[script.paramsIndex[param_name]];
	        			if(param.type.trim()=="object")
	        			{
	        				lines[l] = "self."+param.name+" = None";
	        				if(window.service.findObjectInScene(param.value)!=null)
	        					this.parsedScripts.push([objID, param.name, param.value]);
	        			}
	        			else if(param.type.trim()=="array|object")
	        			{
	        				let targets = (param.value+"").trim().split(";");
							lines[l] = "self."+param.name+" = [None]*"+targets.length;
	        				
	        				for(let t in targets)
	        				{
	        					if(window.service.findObjectInScene(targets[t])!=null)
	        						this.parsedScripts.push([objID, param.name+"["+t+"]", targets[t]])
	        				}
	        			}
	        			else if(param.type.trim()=="string")
	        			{
	        				lines[l] = "self."+param.name+" = \""+(param.value+"").trim()+"\"";
	        			}
	        			else if(param.type.trim()=="eval")
	        			{
	        				lines[l] = "self."+param.name+" = "+eval(param.value);
	        			}
	        			else if (param.type.trim()=="folder" || param.type.trim()=="file")
	    				{
	        				lines[l] = "self."+param.name+" = \""+(param.value+"").split("\\").join("\\\\").trim()+"\"";
	        			}
	        			else if(param.type.trim().indexOf("list")==0)
	        			{
							lines[l] = "self."+param.name+" = \""+(param.value+"").trim()+"\"";
	        			}
	        			else
	        			{
	        				if(param.type.trim().indexOf("array|")==0)
		        			{
		        				
		        				let val = "";
		        				let targets = (param.value+"").trim().split(";");

		        				if(param.type.trim()=="array|string")
		        				{
									for(let t in targets)
			        					val+="\""+targets[t].trim()+"\""+","
		        				}
		        				else if(param.type.trim()=="array|folder" || param.type.trim()=="array|file")
		        				{
			        				for(let t in targets)
			        					val+="\""+targets[t].split("\\").join("\\\\").trim()+"\""+","
		        				}
		        				else if(param.type.trim()=="array|eval")
		        				{
		        					for(let t in targets)
		        					{
		        						try 
		        						{
											val+=eval(targets[t])+",";
		        						} catch(e)
		        						{
		        							this.failed = true;
											window.service.log("Build error: eval failed! Field: '"+param.name+"' value: '"+targets[t]+"'","script: "+script.fullpath+" at line: "+l, 2);
		        						}
		        					}
		        				}
		        				else if(param.type.trim()=="array|int")
		        				{
		        					for(let t in targets)
		        						val+=parseInt(targets[t])+","
		        				}
		        				else if(param.type.trim()=="array|float")
		        				{
		        					for(let t in targets)
		        						val+=parseFloat(targets[t])+","
		        				}
		        				else
		        				{
		        					for(let t in targets)
		        						val+=targets[t]+","
		        				}

		        				lines[l] = "self."+param.name+" = ["+val.substring(0, val.length-1)+"]";
		        			}
		        			else
		        			{
	        					lines[l] = "self."+param.name+" = "+(param.value+"").trim();
		        			}
	        			}

	        		}

		        	next_is_param = false;
		        }

		        if(inRunFunc)
	        		lines[l]="	"+lines[l]
	        	else
	        		lines[l]="		"+lines[l]

				if(line.indexOf("#param")==0)
		        {
		        	next_is_param = true;
		        }
			}
		}

		return lines;
	}

	getConnectionsMap()
	{
		let connections = {};

		for(let o in window.service.objectsById)
		{
			for(let s in window.service.objectsById[o].scripts)
			{
				let script = window.service.objectsById[o].scripts[s];

				for (let p in script.params)
				{
					let param = script.params[p];
					if(param.type=="object")
					{
						if(connections[o]==null)
						{
							connections[o] = [param[p].value];
						}
						else
						{
							connections[o].push(params[p].value);
						}
					}
				}
			}
		}

		return connections;
	}

	updateDynamicVariables()
	{
		let tmpdir = os.tmpdir();

		for(let o in window.service.objectsByID)
		{
			if(window.service.objectsByID[o].scripts.length>0 && window.service.objectsByID[o].scene==window.service.currentScene && window.service.objectsByID[o].enabled=="True")
			{
				let lines = [];
				for (let i in window.service.objectsByID[o].scripts[0].params)
				{
					let param = window.service.objectsByID[o].scripts[0].params[i];

					lines.push(param.name)
					lines.push(param.type)
					lines.push(param.value)
				}
				
				fs.writeFile(tmpdir+"\\variables_"+window.service.objectsByID[o].id, lines.join('\n'), (err) => {
		        if(err){
			            window.service.log("An error ocurred creating the file ", err.message, 2);
			        }
				});
			}	
		}
	}
}