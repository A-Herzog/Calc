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

export {CalcPanelSubFunctions};

import {CalcPanelSub} from './PanelCalcSub.js';
import {language} from './Language.js';
import { preprocessInput } from './MathJSTools.js';

/**
 * Calculator sub panel for editing functions
 * @see CalcPanel
 */
class CalcPanelSubFunctions extends CalcPanelSub {
  #recalc;
  #lines=[];

  /**
   * Constructor
   * @param {Object} parent HTML parent element
   * @param {Object} recalc Callback which is executed when the entered expression needs to be reevaluated
   */
  constructor(parent, recalc) {
    super(parent);
    this.#recalc=recalc;

    const storedData=this._browserRestore();
    if (storedData!=null && storedData.length>0) {
      for (let record of storedData) {
        this.#addLine();
        const newLine=this.#lines[this.#lines.length-1];
        newLine.editName.value=record.name;
        newLine.editParameters.value=record.param;
        newLine.editValue.value=record.value;
      }
    } else {
      this.#addLine();
    }
    this.#checkInput();
  }

  #addLine() {
    let span;

    const div=this._createDiv(this._panel);
    div.style.marginBottom="10px";

    this._createButton(div,"C","","danger",()=>this.#clear(div));

    const editName=this._createInput(div,false,language.calc.panelFunctionsName);
    editName.style.display="inline-block";
    editName.style.width="100px";
    editName.oninput=()=>this.#change(div);

    div.appendChild(span=document.createElement("span"));
    span.innerHTML="&nbsp;(&nbsp;";

    const editParameters=this._createInput(div,false,language.calc.panelFunctionsParameters);
    editParameters.style.display="inline-block";
    editParameters.style.width="75px";
    editParameters.oninput=()=>this.#change(div);

    div.appendChild(span=document.createElement("span"));
    span.innerHTML="&nbsp;):=&nbsp;";

    const editValue=this._createInput(div,false,language.calc.panelFunctionsValue);
    editValue.style.display="inline-block";
    editValue.style.width="200px";
    editValue.oninput=()=>this.#change();

    div.appendChild(span=document.createElement("span"));
    span.innerHTML="&nbsp;&nbsp;";

    div.appendChild(span=document.createElement("span"));
    span.className="small";

    this.#lines.push({div: div, editName: editName, editParameters: editParameters, editValue: editValue, info: span});
    this._panel.appendChild(div);
  }

  #clear(div) {
    const line=this.#lines.filter(rec=>rec.div==div)[0];

    line.editName.value='';
    line.editParameters.value='';
    line.editValue.value='';

    this.#addOrRemoveLines();
    this.#checkInput();
    this.#recalc();
  }

  #change() {
    this.#addOrRemoveLines();
    this.#checkInput();
    this.#recalc();
  }

  #addOrRemoveLines() {
    const empty=[];

    for (let i=0;i<this.#lines.length;i++) {
      const line=this.#lines[i];
      if (line.editName.value.trim()=='' && line.editParameters.value.trim()=='' && line.editValue.value.trim()=='') empty.push(i);
    }

    if (empty.length==0) {
      this.#addLine();
      return;
    }

    while (empty.length>1) {
      const index=empty.pop();
      const emptyLine=this.#lines[index];
      this._panel.removeChild(emptyLine.div);
      this.#lines.splice(index,1);
    }
  }

  #checkInput() {
    const usedNames=[];
    const alpha=new RegExp("^[a-zA-Z]+$");
    const paramAlpha=new RegExp("^[a-zA-Z;]+$");
    for (let line of this.#lines) {
      line.info.classList.remove("text-danger");
      line.info.innerHTML="";
      line.value=null;

      const name=line.editName.value;
      const params=line.editParameters.value;
      const valueStr=line.editValue.value;

      line.editName.classList.remove("is-invalid");
      line.editParameters.classList.remove("is-invalid");
      line.editValue.classList.remove("is-invalid");

      if (name=='') {line.info.innerHTML=language.calc.panelFunctionsNameErrorEmpty; line.editName.classList.add("is-invalid"); line.info.classList.add("text-danger"); continue;}
      if (!alpha.test(name)) {line.info.innerHTML=language.calc.panelFunctionsNameError; line.editName.classList.add("is-invalid"); line.info.classList.add("text-danger"); continue;}
      if (usedNames.indexOf(name)>=0) {line.info.innerHTML=language.calc.panelFunctionsNameErrorInUse; line.editName.classList.add("is-invalid"); line.info.classList.add("text-danger"); continue;}
      usedNames.push(name);

      if (params=='') {line.info.innerHTML=language.calc.panelFunctionsParametersErrorEmpty; line.editParameters.classList.add("is-invalid"); line.info.classList.add("text-danger"); continue;}
      if (!paramAlpha.test(params)) {line.info.innerHTML=language.calc.panelFunctionsParametersError; line.editParameters.classList.add("is-invalid"); line.info.classList.add("text-danger"); continue;}

      if (valueStr=='') {line.info.innerHTML=language.calc.panelFunctionsValueErrorEmpty; line.editValue.classList.add("is-invalid"); line.info.classList.add("text-danger"); continue;}
      try {
        const value=math.evaluate(name+'('+preprocessInput(params)+')='+preprocessInput(valueStr));
        line.value=value;
      } catch (e) {
        line.editValue.classList.add("is-invalid");
        line.info.innerHTML=e.message; line.info.classList.add("text-danger");
        continue;
      }
    }

    const store=[];
    for (let line of this.#lines) store.push({name: line.editName.value, param: line.editParameters.value, value: line.editValue.value});
    this._browserStore(store);
  }

  /**
   * Adds the constants to a MathJS scope object
   * @param {Object} scope Scope object for the MathJS evaluator
   */
  addToScope(scope) {
    for (let line of this.#lines) if (line.value) scope[line.editName.value]=line.value;
  }
}
