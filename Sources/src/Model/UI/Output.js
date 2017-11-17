import React from 'react';
import ReactDOM from 'react-dom';

export default class Output extends React.Component {
	constructor(props) {
	    super(props);

	    /*let debugLogs = [
	    	{msg:"this is a test info output!", type:0, details:"at line test.py:99 stack trace blabalablabalbalblabalablabalbalblabalablabalbal"},
	    	{msg:"this is a test warning output!", type:1, details:"at line test.py:12 stack trace blabalablabalbalblabalablabalbalblabalablabalbal"},
	    	{msg:"this is a test error output!", type:2, details:"at line test.py:125 stack trace blabalablabalbalblabalablabalbal"}
	    ];*/

	    this.state = {logs:false};
	    this.update = this.update.bind(this);
	    window.service.outputUI = this;
	}

	componentDidMount() {
		this.setScrollBottom();
	}

	update()
	{
		this.setState({logs:true});
		this.setScrollBottom();
	}

	setScrollBottom()
	{
		let objDiv = document.getElementById("consoleWin");
		if(objDiv!=null)
			objDiv.scrollTop = objDiv.scrollHeight;
	}

	renderDetails(id, msg)
	{
		if(msg.length>0)
		{
			return (

				<div className="collapse" id={id}>
				  <div className="card card-body">
				    {msg}
				  </div>
				</div>

			);
		} else{
			return <div/>;
		}
		
	}

  	renderLogs() 
  	{
  		let logs = [];

  		for(let line in window.service.logs)
  		{
  			if(window.service.logs[line].type==0)
  			{
  				logs.push(<a href="#" className="list-group-item list-group-item-action" data-toggle="collapse" href={"#"+"console_details_"+line} aria-expanded="false" aria-controls={"console_details_"+line}><span className="glyphicon glyphicon-info-sign"></span> {window.service.logs[line].msg}{this.renderDetails("console_details_"+line, window.service.logs[line].details)}</a>);
  			}
  			else if(window.service.logs[line].type==1)
  			{
  				logs.push(<a href="#" className="list-group-item list-group-item-action list-group-item-warning" data-toggle="collapse" href={"#"+"console_details_"+line} aria-expanded="false" aria-controls={"console_details_"+line}><span className="glyphicon glyphicon-exclamation-sign"></span> {window.service.logs[line].msg}{this.renderDetails("console_details_"+line, window.service.logs[line].details)}</a>);
  			}
  			else if(window.service.logs[line].type==2)
  			{
  				logs.push(<a href="#" className="list-group-item list-group-item-action list-group-item-danger" data-toggle="collapse" href={"#"+"console_details_"+line} aria-expanded="false" aria-controls={"console_details_"+line}><span className="glyphicon glyphicon-remove"></span> {window.service.logs[line].msg}{this.renderDetails("console_details_"+line, window.service.logs[line].details)}</a>);
  			}
  			else if(window.service.logs[line].type==3)
  			{
  				logs.push(<a href="#" className="list-group-item list-group-item-action list-group-item-success" data-toggle="collapse" href={"#"+"console_details_"+line} aria-expanded="false" aria-controls={"console_details_"+line}><span className="glyphicon glyphicon-ok"></span> {window.service.logs[line].msg}{this.renderDetails("console_details_"+line, window.service.logs[line].details)}</a>);
  			}
  			else if(window.service.logs[line].type==4)
  			{
  				logs.push(<a href="#" className="list-group-item list-group-item-action list-group-item-info" data-toggle="collapse" href={"#"+"console_details_"+line} aria-expanded="false" aria-controls={"console_details_"+line}><span className="glyphicon glyphicon-info-sign"></span> {window.service.logs[line].msg}{this.renderDetails("console_details_"+line, window.service.logs[line].details)}</a>);
  			}
  		}

    	return <div className="list-group">{logs}</div>;
	}

	render() {
		return (
			<div id="consoleWin" className="scrollable_container">
			  		{this.renderLogs()}
		  	</div>
		);
	}
}
