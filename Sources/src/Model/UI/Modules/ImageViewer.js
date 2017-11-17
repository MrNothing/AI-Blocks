import React from 'react';

export default class ImageViewer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {counter:0};

        window.service.image_viewers[this.props.id] = this;
    }

    setPath (path, target, name)
    {
        if(target==this.props.target && ((this.props.filter+"").trim().indexOf(name)!=-1 || (this.props.filter.trim()+"").length==0))
        {
            //console.log("path: "+path+"?reset="+this.state.counter);
            this.state.counter+=1;
            document.getElementById(this.props.id).src = path+"?reset="+this.state.counter;
        }
    }

    render() {
        return <img className="previewImage" id={this.props.id} width="100%"/>;
    }
}
