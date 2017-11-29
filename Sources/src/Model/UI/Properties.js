import React from 'react';
import ReactDOM from 'react-dom';
import TreeView from 'react-treeview';
const loadJsonFile = require('load-json-file');
import SceneObject from '../Objects/SceneObject';

export default class Properties extends React.Component {
	constructor(props) {
	    super(props);

	    this.state = {target:null, data:null, source:{}};

	    if(this.props.data!=null)
	    {
	    	loadJsonFile(this.props.data).then(json => {
			   this.setState({target:null, data:json, source:window.service.project==null?{}:window.service.project})
			});

	    	this.setSource = this.setSource.bind(this);
	    	window.service.projectPropertiesUI = this;
	    }
	    else
	    {	
	    	this.setSource = this.setSource.bind(this);
	    	this.setTarget = this.setTarget.bind(this);
	    	window.service.propertiesUI = this;
	    }
	}

	componentDidCatch(error, info) {
		// Display fallback UI
		this.setState({ hasError: true });
		// You can also log the error to an error reporting service
		window.service.log(error, info, 2);
	}

	setTarget()
	{	
		this.setState({target:true});
	}

	setSource()
	{
		this.setState({source:window.service.project});
	}

	editScript(script)
	{
		let fullpath = window.service.scriptsManager.scripts[script.source].fullpath;


		var open = require("open");
		open(fullpath);
	}

	onFilePickerSelected(file)
	{
		window.service.scriptsManager.addScriptInObject(window.service.selectedObject, file);
		this.forceUpdate();
		window.service.sceneUI.forceUpdate();
	}

	showFilePicker(target)
	{
		window.service.filePickerUI.showPicker(target, this.onFilePickerSelected.bind(this));
		$('#file-picker').modal("show");
	}

  	renderProperties() 
  	{
  		if(this.state.target==null)
  		{
  			if(this.props.data==null)
  			{
  	    		return <label></label>;
  			}
  			else
  			{
  				if(this.state.data==null)
  				{
					return <label>Error while loading json: {this.props.data}</label>;
  				}
  				else
  				{
  					return this.renderDataGrid(this.state.data);
  				}
  			}
  		}
  		else
  		{
  			if(window.service.selectedObject!=null)
  			{
	  			this.state.source = window.service.selectedObject.toJsonSource();
	  			//get the target's json object
	  			if(Object.keys(window.service.selectedObjects).length<=1)
	  				return this.renderDataGrid(window.service.selectedObject.toJsonDescriptor());
	  			else
	  			{
	  				return <div>{Object.keys(window.service.selectedObjects).length+""} objects selected</div>;
	  			}
  			}
  			else
  			{
  				return <label></label>;
  			}
  		}
	}
	
	onObjectPickerSelected(script, paramID, listIndex, obj_id)
	{
		if(obj_id!=null)
		{
			if(listIndex!=null)
			{
				let splitlist = script.params[paramID].value.split(";")
				splitlist[listIndex] = obj_id;
				script.params[paramID].value = splitlist.join(";");
			}
			else
			{
				script.params[paramID].value = obj_id;
			}
		}
		else
		{
			if(listIndex!=null)
			{
				let splitlist = script.params[paramID].value.split(";")
				splitlist[listIndex] = "null";
				script.params[paramID].value = splitlist.join(";");
			}
			else
			{
				script.params[paramID].value = "null";
			}
		}
		this.forceUpdate();
		window.service.sceneUI.forceUpdate();
	}

	showTargetPicker(script, paramID, listIndex)
	{
		window.service.filePickerUI.showObjectPicker(this.onObjectPickerSelected.bind(this, script, paramID, listIndex));
		$('#file-picker').modal("show");
	}

	filePicker(script, paramID, listIndex, isFile)
	{
		let selected_dir;
		if(isFile)
			selected_dir = require('electron').remote.dialog.showOpenDialog({title:"Select a file...", properties: ['openFile']});
		else
			selected_dir = require('electron').remote.dialog.showOpenDialog({title:"Select a directory...", properties: ['openDirectory']});
		
		if(selected_dir==null)
		{
			console.log("No dir selected");			
		}
		else
		{
			if(listIndex!=null)
			{
				let splitlist = script.params[paramID].value.split(";")
				splitlist[listIndex] = selected_dir;
				script.params[paramID].value = splitlist.join(";");
			}
			else
			{
				script.params[paramID].value = selected_dir;	
			}

			this.forceUpdate();
		}
	}

	addListItem(script, paramID)
	{
		script.params[paramID].value += ";";
		this.forceUpdate();
	}

	removeListItem(script, paramID, listIndex)
	{
		let splitlist = script.params[paramID].value.split(";")
		splitlist.splice(listIndex, 1);
		script.params[paramID].value = splitlist.join(";");
		this.forceUpdate();
	}

	renderScript(id, script)
	{
		let params = [];

		let ref_script = window.service.scriptsManager.scripts[script.source];
		if(ref_script==null)
		{
			params.push(<a className="list-group-item list-group-item-action list-group-item-danger"><span className="glyphicon glyphicon-exclamation-sign"/> Missing script: {script.source}</a>);
		}
		else
		{
			for(let p in script.params)
			{
				let allowed_cond = false;
				let ref_param = ref_script.params[ref_script.paramsIndex[script.params[p].name]]
				
				if(ref_param && ref_param.condition.length!=0)
				{
					if(script.paramsIndex.length==0)
						script.updateIndexParams();

					let cond_params = ref_param.condition.split("==");
					let cond_param = script.params[script.paramsIndex[cond_params[0]]];
					if(cond_param && cond_param.value.trim()==cond_params[1].trim())
					{
						allowed_cond = true;
					}
				}
				else
				{
					allowed_cond = true;
				}

				//window.service.log(ref_script.params[p].name+" allow: "+allowed_cond, "cond: "+ref_script.params[p].condition, 1)

				if(allowed_cond==true)
				{
					//window.service.log("PASS", "OK", 4)

					if(script.params[p].type.trim()=="object")
					{
						let targetName = "";
						let target = window.service.findObjectInScene(script.params[p].value);

						if(target!=null)
							targetName = target.name+" ["+target.id+"]";

						params.push(
							<div key={script.params[p].name+"_"+script.id+"_"+p} className="input-group">
						      <span className="input-group-addon input-group-small input-group-addon-small">{script.params[p].name}:</span>
						      <input type="text" className="form-control" placeholder="Select..." aria-label="Select..." value={targetName}/>
						      <span className="input-group-btn">
						        <button onClick={this.showTargetPicker.bind(this, script, p, null)} className="btn btn-secondary prop-button" type="button"><i className="fa fa-crosshairs"></i></button>
						      </span>
						    </div>
						);
					}
					else if(script.params[p].type.trim()=="folder" || script.params[p].type.trim()=="file")
					{
						
						params.push(
							<div key={script.params[p].name+"_"+script.id+"_"+p} className="input-group">
						      <span className="input-group-addon input-group-small input-group-addon-small">{script.params[p].name}:</span>
						      <input type="text" className="form-control" placeholder="Browse..." aria-label="Browse..." value={script.params[p].value}/>
						      <span className="input-group-btn">
						        <button onClick={this.filePicker.bind(this, script, p, null, script.params[p].type.trim()=="file")} className="btn btn-secondary prop-button" type="button"><i className="fa fa-folder-open-o"></i></button>
						      </span>
						    </div>
						);
					}
					else if(script.params[p].type.trim()=="bool")
					{
						let domID = "script_input_"+p;

						let classToggle = "fa fa-toggle-off toggle-prop";
						if(script.params[p].value.trim()=="True")
						{
							classToggle = "fa fa-toggle-on toggle-prop";
						}

						params.push((

							<div key={script.params[p].name+"_"+script.id+"_"+p} className="input-group">
							  <span className="input-group-addon input-group-small input-group-addon-small no_b_right">{script.params[p].name}:</span>
							  <i onClick={this.toggleScript.bind(this, script, p, null)} className={classToggle} title={script.params[p].value}/>
							</div>

					    ));
					}
					else if(script.params[p].type.trim().indexOf("list")==0)
					{
						let domID = "script_input_"+p;

						let elems = [];
						let list = script.params[p].type.substring(5, script.params[p].type.length).split(',');

						for(let e in list)
							elems.push(<li><a href="#" onClick={this.updateScriptFieldWithVal.bind(this, script, p, domID, list[e].trim())}>{list[e].trim()}</a></li>);

						let dropdown = (
						 	<div className="dropdown">
						 	  <button className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown">{script.params[p].value} <span className="caret"></span></button>
							  <ul className="dropdown-menu">
							    	{elems}
							  </ul>
							</div> 
						);

						params.push(
							<div key={script.params[p].name+"_"+script.id+"_"+p} className="input-group">
						      <span className="input-group-addon input-group-small input-group-addon-small">{script.params[p].name}: </span>
						      	{dropdown}
						    </div>
						);
					}
					else if(script.params[p].type.trim().indexOf("array|object")==0)
					{
						let elems = [];
						let list = script.params[p].value.split(';');
						
						for(let l in list)
						{
							let targetName = "";
							let target = window.service.findObjectInScene(list[l]);

							if(target!=null)
								targetName = target.name+" ["+target.id+"]";

							elems.push(
								<div className="input-group">
							      <input type="text" className="form-control" placeholder="Select..." aria-label="Select..." value={targetName}/>
							      <span className="input-group-btn">
							        <button onClick={this.showTargetPicker.bind(this, script, p, l)} className="btn btn-secondary prop-button" type="button"><i className="fa fa-crosshairs"></i></button>
							        <button onClick={this.removeListItem.bind(this, script, p, l)} className="btn btn-secondary prop-button" type="button"><i className="fa fa-times"></i></button>
							      </span>
							    </div>
							);
						}

						elems.push(
							<button style={{padding:"0px 2px", float: "right", "margin-top": "2px"}} className="btn btn-light" onClick={this.addListItem.bind(this, script, p)}>
								Add <span className="glyphicon glyphicon-plus"/>
							</button>
						);


						let tmpid = script.params[p].name+"_"+script.id+"_"+p;

						params.push(<div key={tmpid} className="panel panel-default">
									  		<div style={{cursor:"pointer"}}className="panel-heading insert collapsed" href={"#"+tmpid}  data-toggle="collapse" aria-expanded="true" aria-controls={tmpid}> {script.params[p].name+" ("+list.length+")"}</div>
										  	<div className="collapse" id={tmpid}>
												<div className="panel-body">{elems}</div>
											</div>
									</div>);
					}
					else if(script.params[p].type.trim().indexOf("array|folder")==0 || script.params[p].type.trim().indexOf("array|file")==0)
					{
						let elems = [];
						let list = script.params[p].value.split(';');
						let isFile = script.params[p].type.trim().indexOf("array|file")==0;
						
						for(let l in list)
						{
							elems.push(
								<div className="input-group">
							      <input type="text" className="form-control" placeholder="Browse..." aria-label="Browse..." value={list[l]}/>
							      <span className="input-group-btn">
							        <button onClick={this.filePicker.bind(this, script, p, l, isFile)} className="btn btn-secondary prop-button" type="button"><i className="fa fa-folder-open-o"></i></button>
							        <button onClick={this.removeListItem.bind(this, script, p, l)} className="btn btn-secondary prop-button" type="button"><i className="fa fa-times"></i></button>
							      </span>
							    </div>
							);
						}

						elems.push(
							<button style={{padding:"0px 2px", float: "right", "margin-top": "2px"}} className="btn btn-light" onClick={this.addListItem.bind(this, script, p)}>
								Add <span className="glyphicon glyphicon-plus"/>
							</button>
						);


						let tmpid = script.params[p].name+"_"+script.id+"_"+p;

						params.push(<div key={tmpid} className="panel panel-default">
									  		<div style={{cursor:"pointer"}}className="panel-heading insert collapsed" href={"#"+tmpid}  data-toggle="collapse" aria-expanded="true" aria-controls={tmpid}> {script.params[p].name+" ("+list.length+")"}</div>
										  	<div className="collapse" id={tmpid}>
												<div className="panel-body">{elems}</div>
											</div>
									</div>);
					}
					else if(script.params[p].type.trim().indexOf("array|bool")==0)
					{
						let elems = [];
						let list = script.params[p].value.split(';');
						
						for(let l in list)
						{
							let classToggle = "fa fa-toggle-off toggle-prop";
							if(list[l].trim()=="True")
							{
								classToggle = "fa fa-toggle-on toggle-prop";
							}

							elems.push(
								<div className="input-group">
							      <span className="input-group-btn">
							        <i onClick={this.toggleScript.bind(this, script, p, l)} className={classToggle} title={list[l]}/>
							        <button onClick={this.removeListItem.bind(this, script, p, l)} className="btn btn-secondary prop-button" type="button"><i className="fa fa-times"></i></button>
							      </span>
							    </div>
							);
						}

						elems.push(
							<button style={{padding:"0px 2px", float: "right", "margin-top": "2px"}} className="btn btn-light" onClick={this.addListItem.bind(this, script, p)}>
								Add <span className="glyphicon glyphicon-plus"/>
							</button>
						);

						let tmpid = script.params[p].name+"_"+script.id+"_"+p;

						params.push(<div key={tmpid} className="panel panel-default">
									  		<div style={{cursor:"pointer"}}className="panel-heading insert collapsed" href={"#"+tmpid}  data-toggle="collapse" aria-expanded="true" aria-controls={tmpid}> {script.params[p].name+" ("+list.length+")"}</div>
										  	<div className="collapse" id={tmpid}>
												<div className="panel-body">{elems}</div>
											</div>
									</div>);
					}
					else
					{
						if(script.params[p].type.trim().indexOf("array|")==0)
						{
							let elems = [];
							let list = script.params[p].value.split(';');
							
							for(let l in list)
							{
								let domID = "script_list_"+l+"_input_"+p;
								
								elems.push(
									<div className="input-group">
									  <input type="text" id={domID} placeholder={script.params[p].type.trim()} onChange={this.updateScriptField.bind(this, script, p, domID, l)} className="form-control input-group-small" value={list[l]}/>
									  <span className="input-group-btn">
									  	<button onClick={this.removeListItem.bind(this, script, p, l)} className="btn btn-secondary prop-button" type="button"><i className="fa fa-times"></i></button>
							      	  </span>
							      	</div>
								);
							}

							elems.push(
								<button style={{padding:"0px 2px", float: "right", "margin-top": "2px"}} className="btn btn-light" onClick={this.addListItem.bind(this, script, p)}>
									Add <span className="glyphicon glyphicon-plus"/>
								</button>
							);
							
							let tmpid = script.params[p].name+"_"+script.id+"_"+p;

							params.push(<div key={tmpid} className="panel panel-default">
										  		<div style={{cursor:"pointer"}}className="panel-heading insert collapsed" href={"#"+tmpid}  data-toggle="collapse" aria-expanded="true" aria-controls={tmpid}> {script.params[p].name+" ("+list.length+")"}</div>
											  	<div className="collapse" id={tmpid}>
													<div className="panel-body">{elems}</div>
												</div>
										</div>);
						}
						else
						{
							let domID = "script_input_"+p;
							params.push((

								<div key={script.params[p].name+"_"+script.id+"_"+p} className="input-group">
								  <span className="input-group-addon input-group-small input-group-addon-small">{script.params[p].name}:</span>
								  <input type="text" placeholder={script.params[p].type.trim()} id={domID} onChange={this.updateScriptField.bind(this, script, p, domID, null)} className="form-control input-group-small" value={script.params[p].value}/>
								</div>

						    ));
						}
					}
				}
				else
				{
					//window.service.log("PASS KO", "", 2)	
					//params.push(<div>{ref_script.params[p].name+" allow: "+allowed_cond+" n2: "+script.params[p].name}</div>);
				}
			}
		}

		return (

			<div className="card card-body">
			   	{params}
		  	</div>

		);
		
	}

	removeScript(scriptID)
	{
		window.service.selectedObject.scripts.pop(scriptID);
		this.forceUpdate();
		window.service.sceneUI.forceUpdate();
	}

	renderScriptsPanel()
	{
		let line = 0;
		let output = [];
		for(let s in window.service.selectedObject.scripts)
		{
			let script =  window.service.selectedObject.scripts[s];
			output.push(<div className="list-group-item input-group">
				<span onClick={this.removeScript.bind(this, s)} className="glyphicon glyphicon-remove" style={{cursor:'pointer'}}></span> 
				{script.source}
				<span onClick={this.editScript.bind(this, script)} className="glyphicon glyphicon-edit pull-right" style={{cursor:'pointer'}}></span> 
				{this.renderScript("console_details_"+line, script)}
			</div>);
			line++;
		}

		return output;
	}

	renderObjectProperties(objects)
	{
		let elems = [];
    	for (let i in objects)
		{
			if(typeof objects[i] === 'object')
			{
				elems.push(this.renderObjectProperties(objects[i]));
			}
			else
			{
				elems.push(<div className="info">{i}: {objects[i]}</div>);
			}
			
		}

		let label2 = <span className="node">object</span>;
		return <TreeView className="node object" defaultCollapsed={true} nodeLabel={label2}>{elems}</TreeView>;
	}

	updateField(field, domID)
	{
		let newVal = document.getElementById(domID).value;
		if(this.state.target==null)
  		{
  			if(this.state.data!=null)
			{
				//update json properties...
			}
  		}
  		else
  		{
  			if(window.service.selectedObject!=null)
  			{
	  			//update selected object...
	  			window.service.selectedObject[field] = newVal;
	  			this.forceUpdate();
				window.service.sceneUI.forceUpdate();
				window.service.hierarchyUI.forceUpdate();
  			}
  		}
	}

	toggleField(field)
	{
		let val = window.service.selectedObject[field];
		//window.service.log(val, "", 1)
		if (val=="True")
		{
			val = "False"
		}
		else
		{
			val = "True"
		}
		window.service.selectedObject[field] = val;
		this.forceUpdate();
		window.service.sceneUI.forceUpdate();
		window.service.hierarchyUI.forceUpdate();
	}

	updateScriptField(script, field, domID, listIndex)
	{
		if(listIndex!=null)
		{
			let splitlist = script.params[field].value.split(";")
			splitlist[listIndex] = document.getElementById(domID).value;
			script.params[field].value = splitlist.join(";");
		}
		else
		{
			script.params[field].value = document.getElementById(domID).value;
		}

		this.forceUpdate();
	}

	toggleScript(script, field, listIndex)
	{
		if(listIndex!=null)
		{
			let splitlist = script.params[field].value.split(";")

			let val = splitlist[listIndex].trim();
			if(val=="True")
				val = "False";
			else
				val = "True";

			splitlist[listIndex] = val;
			script.params[field].value = splitlist.join(";");
		}
		else
		{
			let val = script.params[field].value.trim();
			if(val=="True")
				val = "False";
			else
				val = "True";
			script.params[field].value = val;
		}

		this.forceUpdate();
	}

	updateScriptFieldWithVal(script, field, domID, val)
	{
		script.params[field].value = val;
		this.forceUpdate();
	}

	renderDataGrid(data)
	{	
		let counter = 0;
		let rows = []
		for(let index in data)
		{
			let cols = [];
			let val = "";
	    
			if(this.state.source[index]!=null)
			{
				if(typeof this.state.source[index] === 'object')
				{
					val = this.renderObjectProperties(this.state.source[index]);
				}
				else
					val = this.state.source[index];
			}

			if(data[index][1]!="scripts")
			{
				if(data[index][1]=="bool")
					cols.push(<span className="input-group-addon input-group-small input-group-addon-small no_b_right" key={counter+"_0"}>{data[index][0]}:</span>);
				else
					cols.push(<span className="input-group-addon input-group-small input-group-addon-small" key={counter+"_0"}>{data[index][0]}:</span>);
			}
			else
			{
				cols.push(<span className="" key={counter+"_0"}>scripts:</span>);
			}

			if(data[index][1]=="text")
			{
				let domID = "prop_"+counter;
				cols.push(<input key={counter+"_1"} onChange={this.updateField.bind(this, index, domID)} type="text" className="form-control input-group-small" id={domID} value={val}/>);
			}
			else if(data[index][1]=="bool")
			{
				let classToggle = "fa fa-toggle-off toggle-prop";
				if(val=="True")
				{
					classToggle = "fa fa-toggle-on toggle-prop";
				}

				cols.push((
					<i onClick={this.toggleField.bind(this, index)} className={classToggle} title={val}/>
			    ));
			}
			else if(data[index][1]=="checkbox")
			{
				cols.push(<input key={counter+"_1"} type="checkbox" id={"prop_"+counter} value=""/>);
			}
			else if(data[index][1]=="dropdown")
			{
				let elems = [];
				for(let i in data[index][2])
				{
					elems.push(<li key={counter+"_li"+i}><a href="#">{data[index][2][i]}</a></li>);
				}

				let dropdown = (
					 <div className="dropdown" key={counter+"_d1"} >
					  <button key={counter+"_b1"} className="btn btn-default dropdown-toggle" type="button" data-toggle="dropdown" id={"prop_"+counter}>{val}
					  <span className="caret" key={counter+"_s1"}></span></button>
					  <ul className="dropdown-menu" key={counter+"_u1"} style={{left: 149}}>
					    {elems}
					  </ul>
					</div> 
				);

				cols.push(dropdown);
			} 
			else if(data[index][1]=="scripts")
			{
				if(window.service.selectedObject.scripts.length>0)
				{
					cols.push(<div className="" key={counter+"_1"}>{this.renderScriptsPanel()}</div>);
				}
				
				cols.push(<a onClick={this.showFilePicker.bind(this, "py")} className="list-group-item list-group-item-action list-group-item-info">Add a script <span className="glyphicon glyphicon-plus"/></a>);
				
			}
			else
			{
				cols.push(<div className="form-control input-group-small gray-bg" key={counter+"_1"}>{val}</div>);	
			}

			rows.push(<div className="input-group input-group-max" key={counter+"_t"}>{cols}</div>);
			counter++;
		}
		return rows;
	}

	render() {
		return (
			<div className="scrollable_container">
		  		{this.renderProperties()}
		  	</div>
		);
	}
}
