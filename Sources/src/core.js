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
import Footer from './Model/UI/Footer';
import FilePicker from './Model/UI/FilePicker';
import RunningItems from './Model/UI/RunningItems';
import GlobalService from './Model/Controllers/GlobalService';
import InputService from './Model/Controllers/InputService';

//global elements
const service = new GlobalService();
window.service = service;

// ========================================
window.onload = function(){

  ReactDOM.render(
     <Grid>
        <Window scene_selector="1" pos="9" tabs={['Scene 1', 'Scene 2', 'Scene 3', 'Scene 4']} icons={['picture']}>
          <Scene/>
        </Window>
        <Window pos="3" tabs={['Properties']} icons={['info-sign']}>
          <Properties/>
        </Window>
        <Window pos="6" tabs={['Hierarchy']} icons={['th-list']}>
          <Hierarchy/>
        </Window>
        <Window pos="6" tabs={['Project', 'Output']} icons={['folder-close', 'comment']}>
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
