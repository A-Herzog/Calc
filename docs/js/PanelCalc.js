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

export {CalcPanel};

import {Panel, setMinHeight} from './Panel.js';
import {CalcPanelSubMemory} from './PanelCalcSubMemory.js';
import {CalcPanelSubKeys} from './PanelCalcSubKeys.js';
import {CalcPanelSubConsts} from './PanelCalcSubConsts.js';
import {CalcPanelSubFunctions} from './PanelCalcSubFunctions.js';
import {CalcPanelSubInfo} from './PanelCalcSubInfo.js';
import {preprocessInput, formatMathResult} from './MathJSTools.js';
import {language} from './Language.js';


/**
 * Calculator panel
 * @see Panel
 */
class CalcPanel extends Panel {
  #editInput;
  #errorInfo;
  #editOutput;

  #currentSubPanel=-1;
  #buttons=[];
  #panels=[];
  #panelMemory;
  #panelConsts;
  #panelFunctions;

  constructor() {
    super();

    let div;

    /* Input / output lines */
    div=this.#createLine();
    this.#editInput=this._createInput(div,false,language.calc.input);
    div=this.#createLine();
    this.#errorInfo=this._createDiv(div);
    div=this.#createLine();
    this.#editOutput=this._createInput(div,true,language.calc.output);
    div=this.#createLine();
    this.#createButton(div,"C",language.calc.C,"danger",()=>{this.#editInput.value=''; this.#calc();})
    this.#createButton(div,"<span class='bi-arrow-right'></span>&nbsp;M",language.calc.M,"success",()=>{this.#panelMemory.save(this.#editOutput.value); if (this.#currentSubPanel!=0) this.#showSubPanel(0);});
    this.#errorInfo.className="small";
    this.#errorInfo.style.color="red";

    /* Primary buttons line */
    for (let i=0;i<5;i++) this.#buttons.push(this.#createButton(div,"","","primary",()=>this.#showSubPanel(i)));

    /* Sub panels */
    this.#panels.push(this.#panelMemory=new CalcPanelSubMemory(this._panel,()=>this.#editOutput.value,m=>this.#insertInInput(m)));
    this.#panels.push(new CalcPanelSubKeys(this._panel,cmd=>this.#insertInInput(cmd),()=>{this.#editInput.value=''; this.#calc();}));
    this.#panels.push(this.#panelConsts=new CalcPanelSubConsts(this._panel,()=>this.#calc()));
    this.#panels.push(this.#panelFunctions=new CalcPanelSubFunctions(this._panel,()=>this.#calc()));
    this.#panels.push(new CalcPanelSubInfo(this._panel));

    /* Start */
    this.#showSubPanel(-1);
    this.#editInput.oninput=()=>this.#calc();
    this.#showError();
    setTimeout(()=>setMinHeight(this._panel.scrollHeight,true),500);
  }

  #insertInInput(text) {
    const selStart=this.#editInput.selectionStart;
    const oldValue=this.#editInput.value;
    let newValue="";
    if (selStart>0) newValue+=oldValue.substring(0,selStart);
    newValue+=text;
    if (selStart<oldValue.length) newValue+=oldValue.substring(selStart);
    this.#editInput.value=newValue;

    this.#calc();

    this.#editInput.focus();
  }

  #createLine() {
    const line=this._createDiv(this._panel);
    line.style.padding="5px";
    return line;
  }

  #createButton(parent, text, tooltip, color, onclick) {
    const button=document.createElement("button");
    button.type="button";
    button.className="me-2 mb-1 btn btn-sm btn-"+color;
    button.innerHTML=text;
    if (tooltip!='') button.title=tooltip;
    button.onclick=onclick;
    parent.appendChild(button);
    return button;
  }

  #showError(msg='') {
    this.#errorInfo.innerHTML=msg;
    this.#errorInfo.style.display=(msg=='')?"none":"";
    this.#editInput.classList.toggle("is-invalid",msg!='');
  }

  #calc() {
    const scope={};
    this.#panelConsts.addToScope(scope);
    this.#panelFunctions.addToScope(scope);

    try {
      this.#editOutput.value=formatMathResult(math.evaluate(preprocessInput(this.#editInput.value),scope));
      this.#showError();
    } catch (e) {
      this.#editOutput.value='';
      this.#showError(e.message);
    }
  }

  #showSubPanel(nr) {
    if (nr<0 || this.#currentSubPanel==nr) this.#currentSubPanel=-1; else this.#currentSubPanel=nr;
    const current=this.#currentSubPanel;

    const iconDown="&nbsp;<span class='bi-caret-down-fill'></span>";
    const iconUp="&nbsp;<span class='bi-caret-up-fill'></span>";

    const buttonTitles=[
      language.calc.panelMemory,
      language.calc.panelKeys,
      language.calc.panelConsts,
      language.calc.panelFunctions,
      language.calc.panelInfo
    ];

    for (let i=0;i<this.#buttons.length;i++) this.#buttons[i].innerHTML=buttonTitles[i]+((current==i)?iconUp:iconDown);
    for (let i=0;i<this.#panels.length;i++) this.#panels[i].setVisible(current==i);

    setMinHeight(this._panel.scrollHeight,true);
  }
}