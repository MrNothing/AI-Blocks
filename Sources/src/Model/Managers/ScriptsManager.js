var fs = require('fs');
const loadJsonFile = require('load-json-file');
import Script from '../Objects/Script';
const { lstatSync, readdirSync } = require('fs')
const { join } = require('path')
const isDirectory = source => lstatSync(source).isDirectory()

export default class ScriptsManager{
		constructor() {
			this.scripts = {};
		}

		compileAllScripts()
		{
			let scriptFiles = this.getAllScripts("py", "", window.service.project.projectpath);
			let scriptFiles2 = this.getAllScripts("py", "", "./scripts");

			scriptFiles = scriptFiles.concat(scriptFiles2);

			this.scripts = {};
			for(let i in scriptFiles)
			{
				let scriptpath = scriptFiles[i];
				let name = require('path').basename(scriptpath);
				if(this.scripts[name]==undefined)
				{
					let newScript = new Script(0, name);
					newScript.fullpath = scriptpath;
					newScript.loadParams(scriptpath);
					this.scripts[name] = newScript;
				}
				else
				{
					window.service.log("Error: the script: "+name+" already exists!", "Duplicates: '"+scriptpath+"' and: '"+this.scripts[name].fullpath+"'", 2);
				}
			}
		}

		CloneScript(script)
		{
			let newScript = new Script(window.service.getUniqueID(), script.name);
			newScript.fullpath = script.fullpath;
			newScript.source = script.source;
			newScript.params = JSON.parse(JSON.stringify(script.params));
			return newScript;
		}

		getScriptIcon(name)
		{
			let script = this.scripts[name]
			if(this.scripts[name]==undefined)
				return null;
			else
				return this.scripts[name].icon;
		}

		getAllScripts(ext, folder, root)
		{
			let scripts = this.findAllScriptsInFolders(ext, folder, root);

			for (let i in scripts)
				scripts[i] = root+scripts[i];

			return scripts;
		}

		findAllScriptsInFolders(ext, folder, root)
		{
			//let root = window.service.project.projectpath;
			let found = [];
			fs.readdirSync(root+"\\"+folder).forEach(file => {
				if(isDirectory(root+"\\"+folder+"\\"+file))
				{
				  	let sub_files = this.findAllScriptsInFolders(ext, folder+"\\"+file, root);

					for(let sub in sub_files)
						found.push(folder+"\\"+sub_files[sub]);
				}
				else
				{
					if(file.split('.')[1]==ext)
					{
						found.push(folder+"\\"+file);
					}
				}
			});

			return found;
		}

		addScriptInObject(object, scriptName)
		{
			let script = new Script(window.service.getUniqueID(), scriptName);
			script.params = this.clone(this.scripts[scriptName].params);
			object.scripts.push(script);
		}

		clone(obj) {
		    if (null == obj || "object" != typeof obj) return obj;
		    var copy = obj.constructor();
		    for (var attr in obj) {
		        if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
		    }
		    return copy;
		}

		updateAllProjectScriptInstances()
		{
			//todo...
			for(let i in window.service.objectsByID)
			{
				let object = window.service.objectsByID[i];
				for(let s in object.scripts)
				{
					let script = object.scripts[s];
					script.updateIndexParams();

					if(this.scripts[script.source]!=null)
					{
						let original_script = this.scripts[script.source];

						for(let p in script.params)
						{
							let param = script.params[p];
							if(original_script.paramsIndex[param.name]==null)
							{
								script.params.splice(p, 1);
							}
						}
						
						for(let p in original_script.params)
						{
							if(script.paramsIndex[original_script.params[p].name]==null)
							{
								let newParam = {name:original_script.params[p].name, value:original_script.params[p].value, type:original_script.params[p].type};
								script.params.splice(original_script.paramsIndex[original_script.params[p].name], 0, newParam);
							}
						}
					}
					else
					{
						//nothing to do, the script does not exist, a message is displayed in the inspector
					}
				}
			}
		}
}