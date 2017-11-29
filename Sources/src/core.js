import React from 'react';
import ReactDOM from 'react-dom';
import Menu from './Model/UI/Menu';
import Window from './Model/UI/Window';
import Grid from './Model/UI/Grid';
import Scene from './Model/UI/Scene';
import Properties from './Model/UI/Properties';
import BuildProject from './Model/UI/BuildProject';
import Hierarchy from './Model/UI/Hierarchy';
import Project from './Model/UI/Project';
import Output from './Model/UI/Output';
import Popup from './Model/UI/Popup';
import CreateProject from './Model/UI/CreateProject';
import CreateScript from './Model/UI/CreateScript';
import Footer from './Model/UI/Footer';
import FilePicker from './Model/UI/FilePicker';
import RunningItems from './Model/UI/RunningItems';
import GlobalService from './Model/Controllers/GlobalService';
import InputService from './Model/Controllers/InputService';

//global elements
const service = new GlobalService();
window.service = service;

import Analytics from 'electron-google-analytics';
window.analytics = new Analytics('UA-109954925-2');
window.analytics.pageview('http://ai-blocks.com', '/home', 'Start App')
.then((response) => {
  console.log(response);
}).catch((err) => {
  console.log(err);
});


// ========================================
window.onload = function(){
  ReactDOM.render(
     <Grid>
        <Window paddingBottom="8px" color="#EEE" scene_selector="1" tabs={['Scene 1', 'Scene 2', 'Scene 3', 'Scene 4']} icons={['picture', 'picture', 'picture', 'picture']}>
          <Scene/>
        </Window>
        <Window color="#DDD" gridIDH="2" padding="0 0 0 8px" tabs={['Properties']} icons={['info-sign']}>
          <Properties/>
        </Window>
        <Window gridID="1" tabs={['Hierarchy']} icons={['th-list']}>
          <Hierarchy/>
        </Window>
        <Window color="#FFF" gridIDH="3" gridID="1" hasConsole="1" padding="0 0 40px 8px" tabs={['Project', 'Output']} icons={['folder-close', 'comment']}>
          <Project/>
          <Output/>
        </Window>
      </Grid>,
    document.getElementById('scene')
  );

  ReactDOM.render(
    <Menu/>,
    document.getElementById('menu')
  );

  ReactDOM.render(
    <div>
      <Popup title="Project Properties" id="project-properties">
        <Properties data="./src/Static/ProjectProperties.json"/>
      </Popup>
      <Popup title="Project Properties" id="project-builder">
        <BuildProject/>
      </Popup>
      <CreateProject title="Create New Project" id="new-project-popup"/>
      <InputService/>
      <Popup title="Project browser" id="file-picker">
        <FilePicker/>
      </Popup>
      <CreateScript title="Create new script" id="script-creator">
      </CreateScript>
    </div>,
    document.getElementById('popups')
  );

  ReactDOM.render(
    <Footer/>,
    document.getElementById('footer')
  );

  ReactDOM.render(
    <RunningItems/>,
    document.getElementById('running_items')
  );

}

setInterval(loop, 33)

let desiredZoom = 0.75;
let realX = 0;
let realY = 0;
function loop()
{
  window.service.zoom = lerp(window.service.zoom, desiredZoom, 0.1);
  if(document.getElementById("scene_draggable"))
  {
      document.getElementById("scene_draggable").style.zoom = window.service.zoom;
  
      realX = lerp(realX, window.service.offset.x, 0.3);
      realY = lerp(realY, window.service.offset.y, 0.3);
      document.getElementById("scene_draggable").style.left = (realX*window.service.zoom)+"px";
      document.getElementById("scene_draggable").style.top = (realY*window.service.zoom)+"px";
      document.getElementById("minimap_draggable").style.left = (realX*window.service.zoom)/20+"px";
      document.getElementById("minimap_draggable").style.top = (realY*window.service.zoom)/20+"px";
  }
}

window.onmousewheel = function MouseWheelHandler(e) {

  if(document.activeElement!=null && document.activeElement.id=="body")
  {
    let scene_rect = document.getElementById("scene_rect").getBoundingClientRect();
    if(
        scene_rect.right>window.service.mouse_pos.x &&
        scene_rect.left<window.service.mouse_pos.x &&
      scene_rect.top<window.service.mouse_pos.y &&
      scene_rect.bottom>window.service.mouse_pos.y

      )
    {
        let delta = window.event.wheelDelta
        if(delta>0)
          desiredZoom -= 0.1;
        else
          desiredZoom += 0.1;

        desiredZoom = Math.max(desiredZoom, 0.5);
        desiredZoom = Math.min(desiredZoom, 2);
    }
  }
  return true;
}

function lerp(a, b, t)
{
  return a+(b-a)*t;
}

window.onfocus = function() {
  if(window.service.projectUI)
    window.service.projectUI.updateFolder();
  if(window.service.scriptsManager)
  {
    if(window.service.project!=null)
    {
      window.service.scriptsManager.compileAllScripts();
      window.service.scriptsManager.updateAllProjectScriptInstances();
    }
      
    if(window.service.propertiesUI!=null)
      window.service.propertiesUI.forceUpdate();
  }
}

window.onmove = function(e) {
  let delta = {x:window.service.mouse_pos.x-e.clientX, y:window.service.mouse_pos.y-e.clientY};

  if(window.service.draggingWindow)
  {
    if(window.service.draggingWindow==1)
    {
      window.service.gridHandles[window.service.draggingWindow]+=delta.y;
      document.getElementById("drag_win_"+window.service.draggingWindow).style.height = window.service.gridHandles[window.service.draggingWindow]+"px";
    }
    else
    {
      window.service.gridHandles[window.service.draggingWindow]+=delta.x;
      document.getElementById("drag_win_"+window.service.draggingWindow).style.width = window.service.gridHandles[window.service.draggingWindow]+"px";
    }
    window.service.mouse_pos = {x:e.clientX, y:e.clientY};
    return;
  }

  if(window.service.dragging && !window.service.using_widget && window.service.keysPressed["Control"])
  {
    let selection_rect = document.getElementById("selection_rect");
    selection_rect.style.display = "block";

    if(window.service.init_select_pos.x>e.clientX)
    {
      let width =  parseFloat(selection_rect.style.width)+delta.x;
      let left =  parseFloat(selection_rect.style.left)-delta.x;
      selection_rect.style.width = width+"px";
      selection_rect.style.left = left+"px";
    }
    else
    {
      let width =  parseFloat(selection_rect.style.width)-delta.x;
      selection_rect.style.width = width+"px"; 
    }
    
    if(window.service.init_select_pos.y>e.clientY)
    {
      let height =  parseFloat(selection_rect.style.height)+delta.y;
      let top =  parseFloat(selection_rect.style.top)-delta.y;
      selection_rect.style.height = height+"px";
      selection_rect.style.top = top+"px";
    }
    else
    {
      let height =  parseFloat(selection_rect.style.height)-delta.y;
      selection_rect.style.height = height+"px"; 
    }

    for(let i in window.service.objectsByID)
    {
      let obj = document.getElementById("widget_"+window.service.objectsByID[i].id);
      if(obj && window.service.objectsByID[i].scene==window.service.currentScene)
      {
        let rect1 = obj.getBoundingClientRect();
        let rect2 = selection_rect.getBoundingClientRect();

        let overlap = !(rect1.right < rect2.left/window.service.zoom || 
                        rect1.left > rect2.right/window.service.zoom || 
                        rect1.bottom < rect2.top/window.service.zoom || 
                        rect1.top > rect2.bottom/window.service.zoom);

        if(overlap && !window.service.selectedObjects[window.service.objectsByID[i].id])
        {
          window.service.hierarchyUI.selectObject(window.service.objectsByID[i]);
        }

        if(!overlap && window.service.selectedObjects[window.service.objectsByID[i].id])
        {
          window.service.hierarchyUI.unselectObject(window.service.objectsByID[i]);
        }
      }
    }
  }
  else
  {
    if (window.service.dragging && !window.service.using_widget)
    { 
        window.service.ignoreNextClear = true;
        if(window.service.nextdrag)
        {
            let left =  window.service.offset.x-delta.x/window.service.zoom;
            let top =  window.service.offset.y-delta.y/window.service.zoom;

            window.service.offset = {x:left, y:top};
        }
        window.service.nextdrag = true;
     }

     if(window.service.draggedobj)
     {
        let children = window.service.draggedobj.getAllChildrenRecursive();
        let already_dragged = {};
        for(let i in children)
        {
            let left =  parseFloat(document.getElementById("widget_"+children[i].id).style.left)-delta.x;
            let top =  parseFloat(document.getElementById("widget_"+children[i].id).style.top)-delta.y;

            if(isNaN(left))
              left=0;

            if(isNaN(top))
              top=0;

            already_dragged[children[i].id].position.x = left;
            already_dragged[children[i].id].position.y = top;

            document.getElementById("widget_"+children[i].id).style.left = left+"px";
            document.getElementById("widget_"+children[i].id).style.top = top+"px";

            already_dragged[children[i].id] = true;
        }

        if(window.service.selectedObjects[window.service.draggedobj.id])
        {
          for(let i in window.service.selectedObjects)
          {
            let object = window.service.selectedObjects[i];
            if(!already_dragged[object.id])
            {
               let left =  parseFloat(document.getElementById("widget_"+object.id).style.left)-delta.x;
               let top =  parseFloat(document.getElementById("widget_"+object.id).style.top)-delta.y;

               if(isNaN(left))
                  left=0;

               if(isNaN(top))
                  top=0;

               document.getElementById("widget_"+object.id).style.left = left+"px";
               document.getElementById("widget_"+object.id).style.top = top+"px";
            }
          }
        }
     }
  }

   window.service.mouse_pos = {x:e.clientX, y:e.clientY};
}