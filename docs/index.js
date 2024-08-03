/*
Copyright 2024 Alexander Herzog

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import {Tabs} from './js/Tabs.js';
import {initSizeCalculation, setMinWidth} from './js/Panel.js';
import {CalcPanel} from './js/PanelCalc.js';
import {PlotPanel} from './js/PanelPlot.js';
import {TablePanel} from './js/PanelTable.js';
import {NumberSystemsPanel} from './js/PanelNumberSystems.js';
import {PrimeFactorsPanel} from './js/PanelPrimeFactorsPanel.js';
import {UnitsConverterPanel} from './js/PanelUnitsConverter.js';
import {StatisticsPanel} from './js/PanelStatistics.js';
import {language, initLanguage} from './js/Language.js';

/* Init language */
let selectedLanguage=localStorage.getItem('selectedLanguage');
if (selectedLanguage==null) selectedLanguage=(navigator.language || navigator.userLanguage).toLocaleLowerCase();
if (selectedLanguage.indexOf("-")>=0) selectedLanguage=selectedLanguage.substring(0,selectedLanguage.indexOf("-"));
console.log(selectedLanguage);
if (selectedLanguage.length!='default') document.documentElement.lang=selectedLanguage;
initLanguage();
document.getElementsByTagName('title')[0].innerHTML=language.GUI.name;
for (let meta of document.getElementsByTagName('meta')) if (meta.name=='description' || meta.name=='keywords') meta.content=language.GUI.name;
if (isDesktopApp) Neutralino.window.setTitle(document.getElementsByTagName('title')[0].innerHTML);

/* Select color mode */
let selectedColorMode=localStorage.getItem('selectedColorMode');
if (selectedColorMode==null) selectedColorMode=(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)?"dark":"light";
document.documentElement.dataset.bsTheme=selectedColorMode;

/* Init tabs */
const tabs=new Tabs();
tabs.add(language.GUI.tabCalculator,"calculator",new CalcPanel());
tabs.add(language.GUI.tabPlotter,"graph-up",new PlotPanel());
tabs.add(language.GUI.tabTable,"table",new TablePanel());
tabs.add(language.GUI.tabNumberSystems,"123",new NumberSystemsPanel());
tabs.add(language.GUI.tabPrimeFactors,"grid-3x3-gap",new PrimeFactorsPanel());
tabs.add(language.GUI.tabUnits,"globe",new UnitsConverterPanel());
tabs.add(language.GUI.tabStatistics,"bar-chart",new StatisticsPanel());

/* Add tabs to DOM */
mainContent.appendChild(tabs.nav);
mainContent.appendChild(tabs.main);

/* Make GUI visible */
mainContent.style.display="";
infoLoading.style.display="none";

/* Calculate size for window */
setTimeout(()=>{
  initSizeCalculation();
  setMinWidth(1000,mainContent.scrollHeight);
},0);