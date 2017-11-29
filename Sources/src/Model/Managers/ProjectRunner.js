const fs = require('fs')
const { spawn } = require('child_process');

export default class ProjectRunner{
	constructor(folder) {
		this.folder = folder;
		window.service.log("Running scene: "+window.service.currentScene, "", 0);
		window.service.consoleWindow.selectTab(1)
		
		const exec = spawn('python', [folder+'/main.py']);
		window.service.runningProcess = exec;
		exec.stdout.on('data', (data) => {
		  	let msgs = data.toString().split("\n");

		  	for (let i in msgs)
		  	{
		  		let msg = msgs[i];
		  		if(msg.indexOf("status:")==0)
			  	{
			  		let status = msg.split(":")[2].trim();
			  		let target = msg.split(":")[1].trim();

			  		window.service.onRunUpdate(target, status);
			  	}
			  	else if(msg.indexOf("img_data,")==0)
			  	{
			  		let path = msg.split(",")[2].trim();
			  		let target = msg.split(",")[1].trim();
			  		let name = msg.split(",")[3].trim();

			  		for(let u in window.service.image_viewers)
		  			{
		  				window.service.image_viewers[u].setPath(path, target, name);
		  			}
			  	}
			  	else if(msg.indexOf("chart:")==0)
			  	{
			  		let target = msg.split(":")[1].trim();
			  		let name = msg.split(":")[2].trim();
					let value = msg.split(":")[3].trim();
			  		let color = msg.split(":")[4].trim();

			  		/*if(window.service.pending_charts[target])
		  			{
		  				if(window.service.pending_charts[target][name])
		  					window.service.pending_charts[target][name].push(value);
		  				else
		  					window.service.pending_charts[target][name] = [value];
		  			}
		  			else
		  			{
		  				window.service.pending_charts[target] = {};
		  			}*/

		  			for(let u in window.service.charts)
		  			{
		  				window.service.charts[u].pushData(target, name, value, color);
		  			}
			  		
			  	}
			  	else if(msg.indexOf("err:")==0)
			  	{
			  		window.service.log(msg.replace("err:", ""), "", 2);
			  	}
			  	else if(msg.indexOf("pie:")==0)
			  	{
			  		let target = msg.split(":")[1].trim();
			  		let name = msg.split(":")[2].trim();
			  		let color = msg.split(":")[3].trim();

		  			for(let u in window.service.charts)
		  			{
		  				window.service.charts[u].pushPieData(target, name, color);
		  			}
			  		
			  	}
			  	else
			  	{
			  		if(msg.trim()!="")
			  			window.service.log(msg, "", 0);
			  	}
		  	}
		  	
		});

		exec.stderr.on('data', (data) => {
		  	console.log(data.toString());
		  	window.service.log(data.toString(), "", 2);
		});

		exec.on('exit', (code) => {
		  	console.log('Child exited with code '+code);
		  	window.service.pending_charts = {};
			window.service.running = false;
			window.service.runningProcess = null;
			window.service.onRunEnd();
		});
	}
}