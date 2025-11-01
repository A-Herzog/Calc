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

export {TablePanel};

import {Panel} from './Panel.js';
import {getFloat, getPositiveFloat, getPositiveInt, formatNumber} from './NumberTools.js';
import {preprocessInput, formatMathResult} from './MathJSTools.js';
import {language} from './Language.js';


/**
 * Units converter panel
 * @see Panel
 */
class TablePanel extends Panel {
  #mode;
  #functionLine1;
  #functionLine2;
  #sequenceLine1;
  #sequenceLine2;

  #functionInput;
  #functionMin;
  #functionMax;
  #functionWide;
  #sequenceInput;
  #sequenceStart;
  #sequenceSteps;

  #tableHead;
  #tableBody;
  #tableData="";

  /** Maximum number of lines to be displayed */
  MAX_LINES=10_000;

  constructor() {
    super();
  }

  _firstShow() {
    let div;

    /* Line 1 */
    div=this._createDiv(this._panel);

    /* Mode select label */
    const label=this.#createLabel(div,language.table.mode+":");

    /* Mode select */
    div.appendChild(this.#mode=document.createElement("select"));
    this.#mode.className="form-select me-3";
    this.#mode.style.display="inline-block";
    this.#mode.style.width="unset";
    let option;
    this.#mode.appendChild(option=document.createElement("option"));
    option.innerHTML=language.table.modeFunction;
    option.value=0;
    this.#mode.appendChild(option=document.createElement("option"));
    option.innerHTML=language.table.modeSequence;
    option.value=1;
    label.htmlFor=this.#mode;
    this.#mode.onchange=()=>this.#updateTable();

    /* Function input - line 1 */
    div.appendChild(this.#functionLine1=document.createElement("span"));
    this.#functionInput=this.#createInput(this.#functionLine1,500,"x^2",language.table.functionPlaceholder,"f(x):=");

    /* Sequence input - line 1 */
    div.appendChild(this.#sequenceLine1=document.createElement("span"));
    this.#sequenceInput=this.#createInput(this.#sequenceLine1,500,"-a/2",language.table.sequencePlaceholder,"a<sub>n+1</sub>:=");

    const button=this.#createButton(div,"",language.calc.ExpressionBuilder,"code",()=>{
    if (isDesktopApp) {
        Neutralino.storage.setData('selectSymbol',null).then(()=>{
          Neutralino.storage.setData('returnID','200').then(()=>window.open("info_webapp.html"));
        });
      } else {
        const popup=window.open("info.html");
        setTimeout(()=>popup.postMessage("200"),1500);
      }
    });
    if (isDesktopApp) setInterval(()=>{
      Neutralino.storage.getData('selectSymbol').then(data=>{
        Neutralino.storage.setData('selectSymbol',null);
        this.#insertSymbol(data);
      }).catch(()=>{});
    },250);
    window.addEventListener("message",event=>this.#insertSymbol(event.data));
    button.style.marginLeft="5px";

    /* Line 2 */
    div=this._createDiv(this._panel);
    div.className="mt-2";

    /* Function input - line 2 */
    div.appendChild(this.#functionLine2=document.createElement("span"));
    this.#functionMin=this.#createInput(this.#functionLine2,100,"-10",null,"x<sub>min</sub>:=");
    this.#functionMax=this.#createInput(this.#functionLine2,100,"10",null,"x<sub>max</sub>:=");
    this.#functionWide=this.#createInput(this.#functionLine2,100,0.5.toLocaleString(),null,language.table.functionStepWide+":=");

    /* Sequence input - line 2 */
    div.appendChild(this.#sequenceLine2=document.createElement("span"));
    this.#sequenceStart=this.#createInput(this.#sequenceLine2,100,"10",null,"a<sub>0</sub>:=");
    this.#sequenceSteps=this.#createInput(this.#sequenceLine2,100,"20",null,language.table.sequenceSteps+":");

    /* Table */
    const table=document.createElement("table")
    this._panel.appendChild(table);
    table.className="table table-striped table-sm mt-3 mb-2 me-2 border table-fit";
    table.appendChild(this.#tableHead=document.createElement("thead"));
    table.appendChild(this.#tableBody=document.createElement("tbody"));

    /* Copy & save buttons */
    div=this._createDiv(this._panel);
    div.className="mt-4";
    this.#createButton(div,language.table.copy,language.table.copyHint,"clipboard",()=>navigator.clipboard.writeText(this.#tableData));
    this.#createButton(div,language.table.save,language.table.saveHint,"download",()=>this.#saveTable());

    /* Start */
    this.#updateTable();
  }

  #insertSymbol(jsonString) {
    const json=JSON.parse(jsonString);
    if (json.ID!=200) return;
    let input=null;
    switch (parseInt(this.#mode.value)) {
      case 0: input=this.#functionInput; break;
      case 1: input=this.#sequenceInput; break;
    }
    if (input==null) return;
    const str=input.value;
    const caret=input.selectionStart;
    input.value=str.substring(0,caret)+json.symbol+str.substring(caret);
  }

  #createLabel(parent, text) {
    const label=document.createElement("label");
    parent.appendChild(label);
    label.className="form-label pe-2";
    label.innerHTML=text;
    return parent;
  }

  #createInput(parent, width, value, placeholder, labelText) {
    const label=this.#createLabel(parent,labelText);

    const input=document.createElement("input");
    parent.appendChild(input);
    input.className="form-control me-2";
    input.style.display="inline-block";
    input.style.width=width+"px";
    if (value) input.value=value;
    if (placeholder) input.placeholder=placeholder;
    label.htmlFor=input;
    input.oninput=()=>this.#updateTable();

    return input;
  }

  #createButton(parent, text, tooltip, icon, action) {
    const button=document.createElement("button");
    parent.appendChild(button);
    button.type="button";
    button.className="btn btn-sm btn-primary bi bi-"+icon+" me-3";
    button.innerHTML=" "+text;
    button.title=tooltip;
    button.onclick=action;
    return button;
  }

  #updateTable() {
    /* Update GUI */
    const mode=this.#mode.value;
    this.#functionLine1.style.display=(mode==0)?"":"none";
    this.#functionLine2.style.display=(mode==0)?"":"none";
    this.#sequenceLine1.style.display=(mode==1)?"":"none";
    this.#sequenceLine2.style.display=(mode==1)?"":"none";

    this.#tableHead.innerHTML="";
    this.#tableBody.innerHTML="";
    this.#tableData="";

    if (mode==0) {
      this.#updateFunction();
    } else {
      this.#updateSequence();
    }
  }

  #updateFunction() {
    /* Interpret input */
    const minX=getFloat(this.#functionMin);
    const maxX=getFloat(this.#functionMax);
    const stepWide=getPositiveFloat(this.#functionWide);

    let ok=true;

    this.#functionMin.classList.toggle("is-invalid",minX==null); if (minX==null) ok=false;
    this.#functionMax.classList.toggle("is-invalid",maxX==null || (minX!=null && minX>=maxX)); if (maxX==null || (minX!=null && minX>=maxX)) ok=false;
    this.#functionWide.classList.toggle("is-invalid",stepWide==null); if (stepWide==null) ok=false;

    let expr;
    try {
      expr=math.compile(preprocessInput(this.#functionInput.value));
      this.#functionInput.classList.remove("is-invalid");
    } catch (e) {
      this.#functionInput.classList.add("is-invalid");
      ok=false;
    }

    if (!ok) return;

    /* Build output */
    this.#outputLine(this.#tableHead,"th","x","f(x)");
    let count=0;
    for (let x=minX;x<=maxX;x+=stepWide) {
      if (count>this.MAX_LINES) {
        this.#outputLine(this.#tableBody,"td","...","...");
        break;
      }
      try {
        const y=expr.evaluate({x: x});
        this.#outputLine(this.#tableBody,"td",formatNumber(x),formatMathResult(y));
      } catch (e) {
        this.#outputLine(this.#tableBody,"td",formatNumber(x),"???");
      }
      count++;
    }
  }

  #updateSequence() {
    /* Interpret input */
    const a0=getFloat(this.#sequenceStart);
    const steps=getPositiveInt(this.#sequenceSteps);

    let ok=true;

    this.#sequenceStart.classList.toggle("is-invalid",a0==null); if (a0==null) ok=false;
    this.#sequenceSteps.classList.toggle("is-invalid",steps==null); if (steps==null) ok=false;

    let expr;
    try {
      expr=math.compile(preprocessInput(this.#sequenceInput.value));
      this.#sequenceInput.classList.remove("is-invalid");
    } catch (e) {
      this.#sequenceInput.classList.add("is-invalid");
      ok=false;
    }

    if (!ok) return;

    /* Build output */
    this.#outputLine(this.#tableHead,"th","n","a(n)");
    this.#outputLine(this.#tableBody,"td","0",formatMathResult(a0));
    let a=a0;
    let count=0;
    for (let i=0;i<steps;i++) {
      if (count>this.MAX_LINES) {
        this.#outputLine(this.#tableBody,"td","...","...");
        break;
      }
      try {
        a=expr.evaluate({a: a});
        this.#outputLine(this.#tableBody,"td",i+1,formatMathResult(a));
      } catch (e) {
        this.#outputLine(this.#tableBody,"td",i+1,"???");
        break;
      }
      count++;
    }
  }

  #outputLine(parent, type, ...cells) {
    cells=cells.map(cell=>(typeof(cell)=='number')?formatNumber(cell):cell);

    const tr=document.createElement("tr");
    parent.appendChild(tr);
    for (let cell of cells) {
      const td=document.createElement(type);
      if (type=='th') td.scope="col";
      tr.appendChild(td);
      td.innerHTML=cell;
    }
    this.#tableData+=cells.join("\t")+"\n";
  }

  #saveTable() {
    if (isDesktopApp) {
      Neutralino.os.showSaveDialog(language.table.saveTitle, {defaultPath: 'table.txt', filters: [
        {name: language.table.saveTextFiles+' (*.txt)', extensions: ['txt']}
      ]}).then(file=>{
        file=file.trim();
        if (file=='') return;
        if (!file.toLocaleLowerCase().endsWith(".txt")) file+=".txt";
        Neutralino.filesystem.writeFile(file,this.#tableData);
      });
    } else {
      const element=document.createElement('a');
      element.setAttribute('href','data:text/plain;charset=utf-8,'+encodeURIComponent(this.#tableData));
      element.setAttribute('download','table.txt');
      element.style.display='none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  }

  getMinHeight() {
    return 850;
  }
}
