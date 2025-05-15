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

import {initSizeCalculation, setMinWidth} from './js/Panel.js';
import {language, initLanguage} from './js/Language.js';
import {buildExpressions, getSymbolCount} from './js/ExpressionBuilder.js';


/* Init language */
let selectedLanguage=localStorage.getItem('selectedLanguage');
if (selectedLanguage==null) selectedLanguage=(navigator.language || navigator.userLanguage).toLocaleLowerCase();
if (selectedLanguage.indexOf("-")>=0) selectedLanguage=selectedLanguage.substring(0,selectedLanguage.indexOf("-"));
if (selectedLanguage.length!='default') document.documentElement.lang=selectedLanguage;
initLanguage();
document.getElementsByTagName('title')[0].innerHTML=language.GUI.name;
for (let meta of document.getElementsByTagName('meta')) if (meta.name=='description' || meta.name=='keywords') meta.content=language.GUI.name;
if (isDesktopApp) Neutralino.window.setTitle(document.getElementsByTagName('title')[0].innerHTML);

/* Select color mode */
let selectedColorMode=localStorage.getItem('selectedColorMode');
if (selectedColorMode==null) selectedColorMode=(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)?"dark":"light";
document.documentElement.dataset.bsTheme=selectedColorMode;

/* Selected tree entry */
let selected=null;

/* Build tree */
function buildTree(parent, list) {
  const ul=document.createElement("ul");
  if (parent==null) {
      ul.className="tree";
      treeArea.appendChild(ul);
  } else {
      parent.appendChild(ul);
  }

  for (let entry of list) {
      const li=document.createElement("li");
      ul.appendChild(li);
      li.data=entry;
      entry.li=li;
      const table=document.createElement("table");
      li.appendChild(table);
      const tr=document.createElement("tr");
      table.appendChild(tr);
      let td;
      tr.appendChild(td=document.createElement("td"));
      td.style.verticalAlign="top";
      const marker=document.createElement("span");
      td.appendChild(marker);
      li.marker=marker;
      tr.appendChild(td=document.createElement("td"));
      td.style.verticalAlign="top";
      const span=document.createElement("span");
      span.innerHTML=entry.name;
      td.appendChild(span);
      span.li=li;
      li.span=span;
      if (entry.list) {
          li.className="closed";
          marker.className="bi bi-caret-right-fill";
          buildTree(li,entry.list);
      } else {
          li.className="leaf";
          marker.className="bi bi-"+entry.icon;
      }
      span.onclick=()=>treeClick(li);
      marker.onclick=()=>treeClick(li);

      span.ondblclick=()=>{
        treeClick(li);
        if (!li.data.list) sendSymbol();
      };
  }
}

function treeClick(li) {
  if (li.data.list) {
    /* Click on group */
    if (li.classList.contains("closed")) {
      li.classList.remove("closed");
      li.classList.add("open");
      li.marker.className="bi bi-caret-down-fill";
    } else {
      li.classList.remove("open");
      li.classList.add("closed");
      li.marker.className="bi bi-caret-right-fill";
    }
  } else {
    /* Click on leaf */
    if (selected!=null) selected.classList.remove("selected");
    selected=li.span;
    selected.classList.add("selected");
    infoArea.innerHTML=li.data.info;
    insertButton.style.display="";
  }
}

function sendSymbol() {
  if (!selected) {
    alert(language.expressionBuilder.errorNoSelection);
    return;
  }
  const sendData=JSON.stringify({ID: sourceID, symbol: selected.li.data.symbol});
  if (isDesktopApp) {
    Neutralino.storage.setData('selectSymbol',sendData).then(()=>window.close());
  } else {
    sourceWindow.postMessage(sendData);
    window.close();
  }
}

/* Init GUI */

/* Main area */
const main=document.createElement("div");
mainContent.appendChild(main);
main.className="container-fluid";
const row=document.createElement("div");
main.appendChild(row);
row.className="row align-items-start";

/* Tree */
const treeArea=document.createElement("div");
row.appendChild(treeArea);
treeArea.className="col-3 h-100";
treeArea.style.overflowY="scroll";

/* Info */
const infoArea=document.createElement("div");
row.appendChild(infoArea);
infoArea.className="col-9 h-100";
infoArea.innerHTML=language.expressionBuilder.placeholderInfo;
infoArea.style.overflowY="scroll";

/* Footer */
const nav=document.createElement("nav");
mainContent.appendChild(nav);
nav.className="navbar sticky-bottom navbar-expand navbar-dark p-3";
const insertButton=document.createElement("button");
nav.appendChild(insertButton);
insertButton.type="button";
insertButton.className="btn btn-primary me-3";
insertButton.innerHTML="Einfügen &amp; schließen";
insertButton.style.display="none";
insertButton.onclick=()=>sendSymbol();
const closeButton=document.createElement("button");
nav.appendChild(closeButton);
closeButton.type="button";
closeButton.className="btn btn-danger me-3";
closeButton.innerHTML="Schließen";
closeButton.onclick=()=>window.close();
const infoSpan=document.createElement("span");
infoSpan.className="ms-2";
infoSpan.style.display="table-cell";
infoSpan.style.verticalAlign="middle";
nav.appendChild(infoSpan);

/* Build expressions tree */
buildTree(null,buildExpressions());
infoSpan.innerHTML=getSymbolCount()+" "+language.expressionBuilder.symbolCount;

/* Make GUI visible */
mainContent.style.display="";
if (typeof(infoLoading)!='undefined') infoLoading.style.display="none";

/* Calculate size for window */
setTimeout(()=>{
  initSizeCalculation();
  setMinWidth(800);
},0);

/* Update size */
function updateSize() {
  const availableHeight=window.innerHeight-nav.clientHeight-10;
  row.style.height=availableHeight+"px";
  infoSpan.style.lineHeight=Math.round(nav.clientHeight/window.devicePixelRatio)+"px";
}
addEventListener("resize",()=>updateSize());
updateSize();

/* Connection to main window */
let sourceWindow=null;
let sourceID=null;
if (isDesktopApp) {
  Neutralino.storage.setData('selectSymbol',null);
  Neutralino.storage.getData("returnID").then(data=>{
    sourceID=parseInt(data);
    Neutralino.storage.setData("returnID",null);
  });
} else {
  window.addEventListener("message",event=>{
    sourceWindow=event.source;
    sourceID=event.data;
  });
}
