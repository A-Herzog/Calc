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

export {CalcPanelSubKeys};

import {CalcPanelSub} from './PanelCalcSub.js';
import {language} from './Language.js';
import {getDecimalSeparatorCharacter} from './NumberTools.js';

/**
 * Calculator sub panel showing the calculator keyboard
 * @see CalcPanel
 */
class CalcPanelSubKeys extends CalcPanelSub {
  #insertCmd;

  /**
   * Constructor
   * @param {Object} parent HTML parent element
   * @param {Object} insertCmd Callback for writing a command into the edit field
   * @param {Object} clearInput Callback for clearing the input edit field
   */
  constructor(parent, insertCmd, clearInput) {
    super(parent);
    this.#insertCmd=insertCmd;

    let tr;

    const table=document.createElement("table");
    this._panel.appendChild(table);

    table.appendChild(tr=document.createElement("tr"));
    this.#addCalcButtonB(tr,"(");
    this.#addCalcButtonB(tr,")");
    this.#addCalcButtonB(tr,"^",language.calc.panelKeysPower);
    this.#addCalcButtonB(tr,"m",language.calc.panelKeysMod,"mod(");
    this.#addSeparator(tr);
    this.#addCalcButtonB(tr,"pi");
    this.#addCalcButtonB(tr,"e");
    this.#addCalcButtonB(tr,"i");
    this.#addCalcButton(tr,"sqrt",language.calc.panelKeysSqrt);
    this.#addCalcButton(tr,"exp",language.calc.panelKeysExp);
    this.#addSeparator(tr);
    this.#addCalcButton(tr,"ln",language.calc.panelKeysLn);
    this.#addCalcButton(tr,"lg",language.calc.panelKeysLg);
    this.#addCalcButton(tr,"ld",language.calc.panelKeysLd);
    this.#addCalcButton(tr,"log",language.calc.panelKeysLog);
    this.#addCalcButton(tr,"zeros",language.calc.panelKeysZeros);
    this.#addSeparator(tr);
    this.#addCalcIcon(tr,"balloon-heart",language.expressionBuilder.symbolic.simplify.name+" simplify('Term')","simplify('Term')");

    table.appendChild(tr=document.createElement("tr"));
    this.#addCalcButtonB(tr,"7");
    this.#addCalcButtonB(tr,"8");
    this.#addCalcButtonB(tr,"9");
    this.#addCalcButtonB(tr,"/");
    this.#addSeparator(tr);
    this.#addCalcButton(tr,"abs",language.calc.panelKeysAbs);
    this.#addCalcButton(tr,"sign",language.calc.panelKeysSign);
    this.#addCalcButton(tr,"round",language.calc.panelKeysRound);
    this.#addCalcButton(tr,"floor",language.calc.panelKeysFloor);
    this.#addCalcButton(tr,"ceil",language.calc.panelKeysCeil);
    this.#addSeparator(tr);
    this.#addCalcButton(tr,"sin",language.calc.panelKeysSin);
    this.#addCalcButton(tr,"cos",language.calc.panelKeysCos);
    this.#addCalcButton(tr,"tan",language.calc.panelKeysTan);
    this.#addCalcButton(tr,"cot",language.calc.panelKeysCot);
    this.#addCalcButton(tr,"ones",language.calc.panelKeysOnes);
    this.#addSeparator(tr);
    this.#addCalcIcon(tr,"bezier",language.expressionBuilder.symbolic.derivative.name+" derivative('Term';'variable')","derivative('Term';'variable')");

    table.appendChild(tr=document.createElement("tr"));
    this.#addCalcButtonB(tr,"4");
    this.#addCalcButtonB(tr,"5");
    this.#addCalcButtonB(tr,"6");
    this.#addCalcButtonB(tr,"*");
    this.#addSeparator(tr);
    this.#addCalcButton(tr,"min",language.calc.panelKeysMin);
    this.#addCalcButton(tr,"max",language.calc.panelKeysMax);
    this.#addCalcButton(tr,"sum",language.calc.panelKeysSum);
    this.#addCalcButton(tr,"range",language.calc.panelKeysRange);
    this.#addCalcButton(tr,"random",language.calc.panelKeysRandom);
    this.#addSeparator(tr);
    this.#addCalcButton(tr,"asin",language.calc.panelKeysAsin);
    this.#addCalcButton(tr,"acos",language.calc.panelKeysAcos);
    this.#addCalcButton(tr,"atan",language.calc.panelKeysAtan);
    this.#addCalcButton(tr,"acot",language.calc.panelKeysAcot);
    this.#addCalcButton(tr,"eye",language.calc.panelKeysEye);

    table.appendChild(tr=document.createElement("tr"));
    this.#addCalcButtonB(tr,"1");
    this.#addCalcButtonB(tr,"2");
    this.#addCalcButtonB(tr,"3");
    this.#addCalcButtonB(tr,"-");
    this.#addSeparator(tr);
    this.#addCalcButton(tr,"!",language.calc.panelKeysFactorial,"!");
    this.#addCalcButton(tr,"(n/k)",language.calc.panelKeysBinom,"binom(");
    this.#addCalcButton(tr,"gcd",language.calc.panelKeysGcd);
    this.#addCalcButton(tr,"lcm",language.calc.panelKeysLcd);
    this.#addCalcButton(tr,"gamma",language.calc.panelKeysGamma);
    this.#addSeparator(tr);
    this.#addCalcButton(tr,"sinh",language.calc.panelKeysSinh);
    this.#addCalcButton(tr,"cosh",language.calc.panelKeysCosh);
    this.#addCalcButton(tr,"tanh",language.calc.panelKeysTanh);
    this.#addCalcButton(tr,"coth",language.calc.panelKeysCoth);
    this.#addCalcButton(tr,"diag",language.calc.panelKeysDiag);

    table.appendChild(tr=document.createElement("tr"));
    this.#addCalcButtonB(tr,"0");
    this.#addCalcButtonB(tr,getDecimalSeparatorCharacter());
    this.#addCalcButtonB(tr,"C",language.calc.C,()=>clearInput());
    this.#addCalcButtonB(tr,"+");
    this.#addSeparator(tr);
    this.#addCalcButton(tr,"cmplx",language.calc.panelKeysComplex,"complex");
    this.#addCalcButton(tr,"re",language.calc.panelKeysRe);
    this.#addCalcButton(tr,"im",language.calc.panelKeysIm);
    this.#addCalcButton(tr,"conj",language.calc.panelKeysConj);
    this.#addCalcButton(tr,"arg",language.calc.panelKeysArg);
    this.#addSeparator(tr);
    this.#addCalcButton(tr,"cross",language.calc.panelKeysCross);
    this.#addCalcButton(tr,"transpose",language.calc.panelKeysT);
    this.#addCalcButton(tr,"size",language.calc.panelKeysSize);
    this.#addCalcButton(tr,"inv",language.calc.panelKeysInv);
    this.#addCalcButton(tr,"det",language.calc.panelKeysDet);
  }

  #addCalcButton(tr, text, tooltip, onclick) {
    if (typeof(onclick)=='undefined') onclick=text+"(";

    const td=document.createElement("td");
    tr.appendChild(td);

    const button=document.createElement("button");
    td.appendChild(button);

    button.className="btn btn-sm border "+(((document.documentElement.dataset.bsTheme=='light'))?"btn-light":"btn-dark");
    button.innerHTML=text;
    if (tooltip!='') button.title=tooltip;
    if (typeof(onclick)=='string') {
      button.onclick=()=>this.#insertCmd(onclick);
    } else {
      button.onclick=onclick;
    }
    button.style.width="100%";
  }

  #addCalcIcon(tr, icon, tooltip, onclick) {
    const td=document.createElement("td");
    tr.appendChild(td);

    const button=document.createElement("button");
    td.appendChild(button);

    button.className="btn btn-sm border bi bi-"+icon+" "+(((document.documentElement.dataset.bsTheme=='light'))?"btn-light":"btn-dark");
    if (tooltip!='') button.title=tooltip;
    if (typeof(onclick)=='string') {
      button.onclick=()=>this.#insertCmd(onclick);
    } else {
      button.onclick=onclick;
    }
    button.style.width="100%";
  }

  #addCalcButtonB(tr, text, tooltip, onclick) {
    if (typeof(tooltip)=='undefined') tooltip='';
    if (typeof(onclick)=='undefined') onclick=text;
    this.#addCalcButton(tr,"<b>"+text+"</b",tooltip,onclick);
  }

  #addSeparator(tr) {
    const td=document.createElement("td");
    tr.appendChild(td);
    td.innerHTML="&nbsp";
  }
}
