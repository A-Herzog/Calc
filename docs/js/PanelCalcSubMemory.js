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

export {CalcPanelSubMemory};

import {CalcPanelSub} from './PanelCalcSub.js';
import {language} from './Language.js';

/**
 * Calculator sub panel for showing the stored values (memory function)
 * @see CalcPanel
 */
class CalcPanelSubMemory extends CalcPanelSub {
  #lines=[];
  #doMR;
  #getOutput;

  /**
   * Constructor
   * @param {Object} parent HTML parent element
   * @param {Object} getOutput  Callback for getting the current value from the output edit field
   * @param {Object} doMR Callback for writing back a value from memory to the input edit field
   */
  constructor(parent, getOutput, doMR) {
    super(parent);
    this.#doMR=doMR;
    this.#getOutput=getOutput;

    const storedData=this._browserRestore();
    if (storedData!=null && storedData.length>0) {
      storedData.forEach(value=>this.save(value));
    } else {
      this.#addLine();
    }
  }

  #addLine() {
    const div=this._createDiv(this._panel);
    div.style.marginBottom="10px";

    this._createButton(div,"<span class='bi-arrow-left'></span>&nbsp;MR",language.calc.MR,"success",()=>this.#MR(div));
    this._createButton(div,"<span class='bi-arrow-right'></span>&nbsp;M",language.calc.M,"success",()=>this.save(this.#getOutput(),div));
    this._createButton(div,"MC",language.calc.MC,"danger",()=>this.#MC(div));
    const edit=this._createInput(div,false,language.calc.panelMemory);
    edit.style.display="inline-block";
    edit.style.width="auto";
    edit.oninput=()=>{
      this._browserStore(this.#lines.filter(rec=>rec.edit.value!='').map(rec=>rec.edit.value));
    };

    this.#lines.push({div: div, edit: edit});
  }

  #MR(div) {
    const line=this.#lines.filter(rec=>rec.div==div)[0];
    this.#doMR(line.edit.value)
  }

  #MC(div) {
    if (this.#lines.length==1) {
      this.#lines[0].edit.value='';
    } else {
      let index;
      for (let i=0;i<this.#lines.length;i++) if (this.#lines[i].div==div) {index=i; break;}
      this._panel.removeChild(this.#lines[index].div);
      this.#lines.splice(index,1);
    }

    this._browserStore(this.#lines.filter(rec=>rec.edit.value!='').map(rec=>rec.edit.value));
  }

  /**
   * Stores a value in the memory system.
   * @param {String} output Value to be stored in memory
   * @param {Object} div Line of the memory to write to (can be null for using a new line)
   */
  save(output, div=null) {
    let line=null;
    if (div==null) {
      for (let i=0;i<this.#lines.length;i++) if (this.#lines[i].edit.value=='') {line=this.#lines[i]; break;}
      if (line==null) {
        if (this.#lines.length<5) this.#addLine();
        line=this.#lines[this.#lines.length-1];
      }
    } else {
      line=this.#lines.filter(rec=>rec.div==div)[0];
    }
    line.edit.value=output;

    this._browserStore(this.#lines.filter(rec=>rec.edit.value!='').map(rec=>rec.edit.value));
  }
}
