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

export {Tabs};

import {setMinHeight} from './Panel.js';
import {language} from './Language.js';

/**
 * Holder for the function tabs
 */
class Tabs {
  #data=[];

  /**
   * Adds a panel to the panels list.
   * @param {String} name Title of the panel (shown in the navigation bar)
   * @param {String} icon Bootstrap icon to be displayed next to the title (can be empty for no icon)
   * @param {Object} tab Panel object
   */
  add(name, icon, tab) {
    this.#data.push({name: name, icon: icon, tab: tab, panel: tab.panel});
  }

  /**
   * Returns the navigation area.
   */
  get nav() {
    const nav=document.createElement("nav");
    nav.className="navbar navbar-expand navbar-dark bg-primary sticky-top";
    const div=document.createElement("div");
    nav.appendChild(div);
    div.className="container-fluid";

    /* Icon */
    const span=document.createElement("span");
    div.appendChild(span);
    span.className="navbar-brand mb-0 h1";
    span.innerHTML='<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAgBAMAAADkuZW4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAPUExURX9/fwAAAL+/vwD+/v4AAFx0dcIAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA1SURBVCjPY2AQhAEGFLagEgwIEsmGasXGNgZCbGys6nGaD4No7IFU7+LigsHGrh5rOAsyAABndiRDJc3cTQAAAABJRU5ErkJggg==" width="22" height="32" alt="Logo">';
    span.title=language.GUI.name+" by Alexander Herzog";

    /* Small menu button */
    const button=document.createElement("button");
    div.appendChild(button);
    button.className="navbar-toggler";
    button.type="button";
    button.dataset.bsToggle="collapse";
    button.dataset.bsTarget="#navbarSupportedContent";
    button.innerHTML='<span class="navbar-toggler-icon"></span>';

    const divCollapse=document.createElement("div");
    div.appendChild(divCollapse);
    divCollapse.className="collapse navbar-collapse";
    divCollapse.id="navbarSupportedContent";

    /* Tab buttons */
    const ul=document.createElement("ul");
    divCollapse.appendChild(ul);
    ul.className="navbar-nav me-auto";
    let index=0;
    for (let rec of this.#data) {
      const li=document.createElement("li");
      ul.appendChild(li);
      li.className="nav-item";
      const a=document.createElement("button");
      li.appendChild(a);
      a.className="nav-link"+((index==0)?" active":"");
      a.style.cursor="pointer";
      rec.a=a;
      a.onclick=()=>this.#showTab(a);
      let text="";
      if (rec.icon) text+="<span class='bi-"+rec.icon+"' title='"+rec.name+"'></span>"
      text+="<span class='menuTabTitle'>&nbsp;"+rec.name+"</span>";
      a.innerHTML=text;
      index++;
    }

    /* Language switcher */
    const langButton=document.createElement("button");
    divCollapse.appendChild(langButton);
    langButton.type="button";
    langButton.className="btn btn-outline-light bi-globe btn-sm me-2";
    langButton.title=language.GUI.switchLanguageHint;
    langButton.onclick=()=>{
      localStorage.setItem('selectedLanguage',language.GUI.switchLanguageMode);
      document.location.href=(isDesktopApp?"index_webapp.html":"")+"?";
    };
    const langSpanOuter=document.createElement("span");
    langButton.appendChild(langSpanOuter);
    langSpanOuter.className="menuButtonTitle";
    let langSpan;
    langSpanOuter.appendChild(langSpan=document.createElement("span"));
    langSpan.className="menuButtonTitleShort";
    langSpan.innerHTML=" "+language.GUI.switchLanguageShort;
    langSpanOuter.appendChild(langSpan=document.createElement("span"));
    langSpan.className="menuButtonTitleLong";
    langSpan.innerHTML=" "+language.GUI.switchLanguage;

    /* Color switcher */
    const selectedColorMode=localStorage.getItem('selectedColorMode');
    const colorDiv=document.createElement("div");
    divCollapse.appendChild(colorDiv);
    colorDiv.className="dropdown";
    colorDiv.style.display="inline-block";
    const colorButton=document.createElement("button");
    colorDiv.appendChild(colorButton);
    colorButton.type="button";
    colorButton.className="btn btn-outline-light bi-sun btn-sm dropdown-toggle";
    colorButton.dataset.bsToggle="dropdown";
    colorButton.title=language.GUI.tabColorMode;
    const colorUl=document.createElement("ul");
    colorDiv.appendChild(colorUl);
    colorUl.className="dropdown-menu dropdown-menu-end";
    colorUl.role="tablist";
    let li, a;
    colorUl.appendChild(li=document.createElement("li"));
    li.role="tab";
    li.appendChild(a=document.createElement("a"));
    a.className="dropdown-item";
    a.innerHTML=language.GUI.tabColorModeLight;
    if (selectedColorMode!=null && document.documentElement.dataset.bsTheme!='dark') a.classList.add("bi-check");
    a.href=(isDesktopApp?"index_webapp.html":"")+"?";
    a.onclick=()=>localStorage.setItem('selectedColorMode','light');
    colorUl.appendChild(li=document.createElement("li"));
    li.role="tab";
    li.appendChild(a=document.createElement("a"));
    a.className="dropdown-item";
    a.innerHTML=language.GUI.tabColorModeDark;
    if (selectedColorMode!=null && document.documentElement.dataset.bsTheme=='dark') a.classList.add("bi-check");
    a.href=(isDesktopApp?"index_webapp.html":"")+"?";
    a.onclick=()=>localStorage.setItem('selectedColorMode','dark');
    colorUl.appendChild(li=document.createElement("li"));
    li.role="tab";
    li.appendChild(a=document.createElement("a"));
    a.className="dropdown-item";
    if (selectedColorMode==null) {
      a.classList.add("bi-check");
      const defaultMode=(document.documentElement.dataset.bsTheme=='dark')?language.GUI.tabColorModeDark:language.GUI.tabColorModeLight;
      a.innerHTML=language.GUI.tabColorModeSystemDefault+" ("+defaultMode+")";
    } else {
      a.innerHTML=language.GUI.tabColorModeSystemDefault;
    }
    a.href=(isDesktopApp?"index_webapp.html":"")+"?";
    a.onclick=()=>localStorage.removeItem('selectedColorMode');

    return nav;
  }

  /**
   * Returns the main area.
   */
  get main() {
    const div=document.createElement("div");
    div.className=(document.documentElement.dataset.bsTheme=='light')?"bg-light":"bg-dark";
    div.style.padding="10px";

    let index=0;
    for (let rec of this.#data) {
      div.appendChild(rec.panel);
      rec.panel.style.display=(index==0)?"":"none";
      index++;
    }
    return div;
  }

  #showTab(a) {
    let index=0;
    for (let i=0;i<this.#data.length;i++) if (this.#data[i].a==a) {index=i; break;}
    for (let i=0;i<this.#data.length;i++) {
      const rec=this.#data[i];
      rec.a.classList.toggle("active",index==i);
      if (index==i) rec.tab.showNotify();
      rec.panel.style.display=(index==i)?"":"none";
    }

    const rec=this.#data[index];
    const requestedMinHeight=rec.tab.getMinHeight();
    setTimeout(()=>{
      if (requestedMinHeight==null) {
        setMinHeight(rec.panel.scrollHeight,true);
      } else {
        if (requestedMinHeight>0)
        setMinHeight(requestedMinHeight,false);
      }
    },10);
  }
}
