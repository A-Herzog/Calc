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

  #navUl;
  #mainDiv;

  /**
   * Adds a panel to the panels list.
   * @param {String} name Title of the panel (shown in the navigation bar)
   * @param {String} icon Bootstrap icon to be displayed next to the title (can be empty for no icon)
   * @param {Object} tab Panel object
   * @param {Number} index Index where to insert the panel (default: at the end)
   */
  add(name, icon, tab, index=-1) {
    if (index<0 || index>this.#data.length) {
      this.#data.push({name: name, icon: icon, tab: tab, panel: tab.panel});
    } else {
      this.#data.splice(index,0,{name: name, icon: icon, tab: tab, panel: tab.panel});
    }
  }

  /**
   * Adds a panel to the panels list after GUI is already generated.
   * @param {String} name Title of the panel (shown in the navigation bar)
   * @param {String} icon Bootstrap icon to be displayed next to the title (can be empty for no icon)
   * @param {Object} tab Panel object
   * @param {Number} index Index where to insert the panel (default: at the end)
   */
  addAndUpdate(name, icon, tab, index=-1) {
    this.add(name, icon, tab, index);
    this.addNav((index<0 || index>this.#data.length)?this.#data.length-1:index);
    this.addMain((index<0 || index>this.#data.length)?this.#data.length-1:index);
  }

  /**
   * Adds a new entry to the navigation bar.
   * @param {Number} index Position to insert the new navigation bar entry
   * @param {Boolean} active Is the new entry active?
   */
  addNav(index, active=false) {
    const rec=this.#data[index];

    const li=document.createElement("li");
    if (this.#navUl.children.length<=index) {
      this.#navUl.appendChild(li);
    } else {
      this.#navUl.insertBefore(li,this.#navUl.children[index]);
    }
    li.className="nav-item";
    const a=document.createElement("button");
    li.appendChild(a);
    a.className="nav-link"+(active?" active":"");
    a.style.cursor="pointer";
    rec.a=a;
    a.onclick=()=>this.#showTab(a);
    let text="";
    if (rec.icon) text+="<span class='bi-"+rec.icon+"' title='"+rec.name+"'></span>"
    text+="<span class='menuTabTitle'>&nbsp;"+rec.name+"</span>";
    a.innerHTML=text;
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
    span.innerHTML='<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABYAAAAgBAMAAADkuZW4AAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAPUExURX9/fwAAAL+/vwD+/v4AAFx0dcIAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAA1SURBVCjPY2AQhAEGFLagEgwIEsmGasXGNgZCbGys6nGaD4No7IFU7+LigsHGrh5rOAsyAABndiRDJc3cTQAAAABJRU5ErkJggg==" srcset="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACEAAAAwCAMAAACosONjAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAVUExURX5+fgAAAL6+vr+/vwD+/gD9/f0AABDyw+IAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAYdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCA1LjEuOBtp6qgAAAC2ZVhJZklJKgAIAAAABQAaAQUAAQAAAEoAAAAbAQUAAQAAAFIAAAAoAQMAAQAAAAIAAAAxAQIAEAAAAFoAAABphwQAAQAAAGoAAAAAAAAAYAAAAAEAAABgAAAAAQAAAFBhaW50Lk5FVCA1LjEuOAADAACQBwAEAAAAMDIzMAGgAwABAAAAAQAAAAWgBAABAAAAlAAAAAAAAAACAAEAAgAEAAAAUjk4AAIABwAEAAAAMDEwMAAAAACrgCETU544KAAAAHdJREFUOE/V1MkOgCAMRdEO4P9/sil1aDAFNG/jXbxEPBs1kYiI88jrj0NrgplFRO8kZuhvon/KFlao6nVaSmXmWm2/Cr83EjG4mLzTJeGfpm0i2tq1r997I+L1cw+RhRWDBYosrBgsUGRhRdztDC6yUGL+1waIHfx6CnZJB98XAAAAAElFTkSuQmCC 1.5x" width="22" height="32" alt="Logo">';
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
    this.#navUl=ul;
    for (let i=0;i<this.#data.length;i++) this.addNav(i,i==0);

    /* Language switcher */
    const langButton=document.createElement("button");
    divCollapse.appendChild(langButton);
    langButton.type="button";
    langButton.className="btn btn-outline-light bi-globe btn-sm me-2 headerbutton";
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
    colorButton.className="btn btn-outline-light bi-sun btn-sm dropdown-toggle headerbutton";
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
   * Adds a new panel to the main area.
   * @param {Number} index Position to insert the new tab
   * @param {Boolean} active Is the new tab active?
   */
  addMain(index, active=false) {
    const rec=this.#data[index];
    if (this.#mainDiv.children.length<=index) {
      this.#mainDiv.appendChild(rec.panel);
    } else {
      this.#mainDiv.insertBefore(rec.panel,this.#mainDiv.children[index]);
    }
    rec.panel.style.display=active?"":"none";
  }

  /**
   * Returns the main area.
   */
  get main() {
    const div=document.createElement("div");
    div.className=(document.documentElement.dataset.bsTheme=='light')?"bg-light":"bg-dark";
    div.style.padding="10px";
    this.#mainDiv=div;

    for (let i=0;i<this.#data.length;i++) this.addMain(i,i==0);

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
