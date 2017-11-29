//ctrl+z ctrl+y are handled here
var fs = require('fs');
const loadJsonFile = require('load-json-file');

export default class ActionsManager{
		constructor(json) {
			this.actions = [];
			this.head = 0;
		}

		cancel()
		{
			let index = this.actions.length-1-this.head;

			if(index>=0)
			{
				let action = this.actions[index];
				
			}
		}

		redo()
		{

		}

		insertAction(type, objectid, content)
		{
			this.actions.push({type:type, objectid:objectid, content:content});
			this.head=0;
		}

		insertValueAction(objectid, scriptid, paramid, value)
		{
			this.insertAction("value", objectid, [scriptid, paramid, value])	
		}

		insertTransformAction(objectid)
		{
			let object = window.service.objectsByID["widget_"+objectid];
			this.insertAction("transform", objectid, [object.position.x, object.position.y, object.scale.x, object.scale.y])	
		}

		insertAddObjectAction(object)
		{
			this.insertAction("addObject", object.id, object)	
		}

		insertDestroyObjectAction(objectid)
		{
			this.insertAction("destroyObject", objectid, null)	
		}

		insertAddScriptAction(objectid, script)
		{
			this.insertAction("addScript", objectid, script)	
		}

		insertDestroyScriptAction(objectid, scriptid)
		{
			this.insertAction("destroyScript", objectid, scriptid)	
		}

		insertSelectObjectAction(object, shift)
		{
			if(object)
				this.insertAction("selectObject", object.id, shift)	
		}

		insertUnselectObjectAction(objectid)
		{
			this.insertAction("unselectObject", objectid, null)	
		}

		insertClearSelectionAction()
		{
			this.insertAction("clearSelection", null, null)	
		}

		applyAction(action)
		{
			let type = action.type;
			let objectid = action.objectid;
			let content = action.content;
			let object = window.service.objectsByID["widget_"+objectid];
			
			if(type=="value")
			{
				
			} else if(type=="transform")
			{

			} else if(type=="addObject")
			{

			} else if(type=="destroyObject")
			{

			} else if(type=="addScript")
			{

			} else if(type=="destroyScript")
			{

			} else if(type=="selectObject")
			{

			} else if(type=="unselectObject")
			{

			} else if(type=="clearSelection")
			{

			}
		}
}