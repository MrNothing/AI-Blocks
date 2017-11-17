import Chart from 'chart.js';
import React from 'react';

export default class ChartModule extends React.Component {
    constructor(props) {
        super(props);

        this.state = {};

        window.service.charts[this.props.id] = this;

        this.state.data = {
            labels: [],
            datasets: []
          };
    }

    drawLines()
    {
        if(window.service.pending_charts[this.props.target])
        {
            let labels = [];
            let datasets = [];

            for (let u in window.service.pending_charts[this.props.target])
            {
                let pendingData = window.service.pending_charts[this.props.target][u][0];
                for(let i in pendingData)
                {
                    labels.push(i);
                }
                break;
            }
            
            for (let u in window.service.pending_charts[this.props.target])
            {
                let data = [];
                let label = u;

                let pendingData = window.service.pending_charts[this.props.target][u][0];
                
                for(let i in pendingData)
                {
                    data.push(pendingData[i]);
                }

                datasets.push({ 
                        data: data,
                        label: label,
                        borderColor: "#3e95cd",
                        fill: true
                      });
            }

            return {
                labels: labels,
                datasets: datasets
                };
        }
    }

    componentDidMount() {
        let ctx = document.getElementById(this.props.id);
        this.state.chart = new Chart(ctx, {
            type: (this.props.type+"").trim(),
            data: this.state.data,
            options: {}
        });
    }

    updateChart()
    {  
        let newData = this.drawLines();
        this.state.chart.data.labels = newData.labels;
        this.state.chart.data.datasets[0].data = newData.datasets[0].data;
        this.state.chart.update();
    }

    pushData(target, name, value, color)
    {  
        if((this.props.type+"").trim()=="line")
        {
            if(target==this.props.target && ((this.props.filter+"").trim().indexOf(name)!=-1 || (this.props.filter.trim()+"").length==0))
            {
                let found = false;

                for(let i in this.state.chart.data.datasets)
                {
                    let dataset = this.state.chart.data.datasets[i];
                    if(dataset.label==name)
                    {
                        found = true;

                        dataset.data.push(value);
                        if(dataset.data.length>this.props.limit)
                        {
                            dataset.splice(0, 1)
                        }

                        if(this.state.chart.data.labels.length<dataset.data.length)
                            this.state.chart.data.labels.push(this.state.chart.data.labels.length);
                    }
                }

                if(!found)
                {
                    if(this.state.chart.data.labels.length==0)
                        this.state.chart.data.labels.push(0);

                    this.state.chart.data.datasets.push({ 
                            data: [value],
                            label: name,
                            borderColor: color,
                            fill: false
                    });
                }
            }
        }
        
        this.state.chart.update();
    }

    pushPieData(target, name, color)
    {  
        if((this.props.type+"").trim()=="pie")
        {
            if(target==this.props.target && ((this.props.filter+"").trim().indexOf(name)!=-1 || (this.props.filter.trim()+"").length==0))
            {
                if(this.state.chart.data.labels.indexOf(name)!=-1)
                {
                    for(let i in this.state.chart.data.datasets)
                    {   
                        let dataset = this.state.chart.data.datasets[i];
                        dataset.data[this.state.chart.data.labels.indexOf(name)] += 1;
                    }
                }
                else
                {
                    this.state.chart.data.labels.push(name);
                    this.state.chart.data.datasets[0].data.push(1);
                    this.state.chart.data.datasets[0].backgroundColor.push(color);
                }
            }
        }
        
        this.state.chart.update();
    }

    clearChart()
    {  
        if((this.props.type+"").trim()=="line")
        {
            this.state.chart.data = {
                labels: [],
                datasets: []
            };
        }
        else
        {
            this.state.chart.data = {
                labels: [],
                datasets: [{
                    data:[],
                    backgroundColor: []
                }]
            };
        }

        this.state.chart.update();
    }

    render() {
        return <canvas id={this.props.id} width="100%" height="100%" style={{width:"100%", height:"100%"}}></canvas>;
    }
}
