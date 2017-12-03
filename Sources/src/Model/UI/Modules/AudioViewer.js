import React from 'react';

export default class AudioViewer extends React.Component {
    constructor(props) {
        super(props);

        this.state = {counter:0};

        window.service.audio_viewers[this.props.id] = this;
    }

    setPath (path, target, name)
    {
        if(target==this.props.target && ((this.props.filter+"").trim().indexOf(name)!=-1 || (this.props.filter.trim()+"").length==0))
        {
            //console.log("path: "+path+"?reset="+this.state.counter);
            this.state.counter+=1;
            document.getElementById("audio_source_"+this.props.id).src = path+"?reset="+this.state.counter;
            document.getElementById("audio_"+this.props.id).load(); //call this to just preload the audio without playing
            document.getElementById("audio_"+this.props.id).play(); //call this to play the song right away
        }
    }

    render() {
        return (
        <audio id={"audio_"+this.props.id} style={{width: "100%"}} className='media-object' controls>
          <source id={"audio_source_"+this.props.id}/>
        </audio>);
    }
}
