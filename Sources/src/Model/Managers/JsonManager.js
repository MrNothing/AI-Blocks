var fs = require('fs');
const loadJsonFile = require('load-json-file');

export default class JsonManager{
		constructor(json) {
			this.json = json;
		}

		load(source) {
		  return new Promise((resolve, reject) => {
		   	loadJsonFile(source).then(json => {
		   		this.json = json;
		   		resolve(json);
			}).catch(err => {
		   		reject(err);
			});
		  });
		}

		save(path)
		{
		  	fs.writeFile(path, JSON.stringify(this.json), (err) => {
		        if(err){
		            alert("An error ocurred creating the file "+ err.message);
		        }
			});
		}

}