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

export {NumberSystemsPanel};

import {Panel} from './Panel.js';
import {formatNumberMax, getDecimalSeparatorCharacter} from './NumberTools.js';
import {language} from './Language.js';


/**
 * Number systems converter panel
 * @see Panel
 */
class NumberSystemsPanel extends Panel {
  #bases=[
    {name: language.numbers.base2, base: 2},
    {name: language.numbers.base8, base: 8},
    {name: language.numbers.base10, base: 10},
    {name: language.numbers.base16, base: 16},
    {name: language.numbers.baseFree, base: null},
  ];
  #freeBase;

  constructor() {
    super();
  }

  _firstShow() {
    /* Generate input lines */
    const table=document.createElement("table");
    this._panel.appendChild(table);
    for (let base of this.#bases) base.input=this.#generateLine(table,base);

    /* Start */
    this.#bases[2].edit.value="123";
    this.#calc(this.#bases[2].edit);
  }

  #generateLine(parent, setup) {
    const tr=document.createElement("tr");
    parent.appendChild(tr);

    let td;

    /* Name */
    tr.appendChild(td=document.createElement("td"));
    const label=document.createElement("label");
    td.appendChild(label);
    label.className="form-label";
    if (setup.base==null) {
      label.innerHTML=setup.name+":";
    } else {
      label.innerHTML=setup.name+" ("+language.numbers.base+" "+setup.base+"):";
    }
    label.style.paddingRight="10px";

    /* Input */
    tr.appendChild(td=document.createElement("td"));
    const edit=setup.edit=document.createElement("input");
    td.appendChild(edit);
    edit.type="text";
    edit.spellcheck=false;
    edit.className="form-control";
    edit.style.display="inline-block";
    edit.style.width="200px";
    edit.oninput=()=>this.#calc(edit);
    label.htmlFor=edit;

    /* Free mode? */
    if (setup.base==null) {
      const label2=document.createElement("label");
      td.appendChild(label2);
      label2.className="form-label";
      label2.innerHTML=language.numbers.base+":";
      label2.style.paddingLeft="10px";
      label2.style.paddingRight="10px";
      this.#freeBase=document.createElement("input");
      td.appendChild(this.#freeBase);
      this.#freeBase.type="number";
      this.#freeBase.min=2;
      this.#freeBase.step=1;
      this.#freeBase.max=36;
      this.#freeBase.value=10;
      this.#freeBase.className="form-control";
      this.#freeBase.style.display="inline-block";
      this.#freeBase.style.width="100px";
      this.#freeBase.oninput=()=>this.#calc(this.#freeBase);
      label2.htmlFor=this.#freeBase;
    }
  }

  #calc(input) {
    /* Find changed input line */
    let index=-1;
    for (let i=0;i<this.#bases.length;i++) if (this.#bases[i].edit==input || (this.#bases[i].base==null && this.#freeBase==input)) {index=i; break;}
    if (index<0) return;

    /* Free base */
    let freeBase=parseInt(this.#freeBase.value);
    if (isNaN(freeBase) || freeBase<2 || freeBase>36) freeBase=null;
    this.#freeBase.classList.toggle("is-invalid",freeBase==null);

    /* Get number */
    const oldBase=(this.#bases[index].base==null)?freeBase:this.#bases[index].base;
    let num;
    if (oldBase==null) {
      num=null;
    } else {
      num=this.#getNumber(this.#bases[index].edit.value,oldBase);
      this.#bases[index].edit.classList.toggle("is-invalid",num==null);
    }

    /* Transfer to all other lines */
    for (let i=0;i<this.#bases.length;i++) if (i!=index) {
      const newBase=(this.#bases[i].base==null)?freeBase:this.#bases[i].base;
      this.#bases[i].edit.classList.remove("is-invalid");
      if (newBase==null || num==null) {
        this.#bases[i].edit.value="";
      } else {
        this.#bases[i].edit.value=this.#toBase(num,newBase);
      }
    }
  }

  /*
  Tests:
  let numbers=[-3, 3.5, 3.25, 3.2, 12.9];
  const base=2;
  for (let n of numbers) {
    const s=this.#toBase(n,base);
    const n2=this.#getNumber(s,base);
    console.log(n.toLocaleString()+"\t->\t"+s+"\t->\t"+n2.toLocaleString());
  }
  */

  #getNumber(str, base) {
    /* Sign */
    str=str.trim();
    const minus=(str!='' && str[0]=='-');
    if (minus) str=str.substring(1);

    /* Test for invalid characters */
    for (let c of str) {
      if (c==',' || c=='.') continue;
      if (c>='0' && c<='9') {
        c=parseInt(c);
        if (isNaN(c)) return null;
        if (base<10 && c>=base) return null;
      } else {
        c=c.toUpperCase();
        c=c.charCodeAt()-'A'.charCodeAt()+10;
        if (c>=base) return null;
      }
    }

    /* Split integer and fraction part */
    const index1=str.indexOf('.');
    const index2=str.indexOf(',');
    if (index1>=0 && index2>=0) return null;
    let index=(index1>=0)?index1:index2;
    let intPart="";
    let fracPart="";
    if (index>=0) {
        intPart=str.substring(0,index);
        fracPart=str.substring(index+1);
    } else {
        intPart=str;
    }

    /* Integer part */
    const intPartBase10=parseInt(intPart,base);
    if (isNaN(intPartBase10)) return null;

    /* Fraction part */
    while (fracPart!='' && fracPart[fracPart.length-1]=='0') fracPart=fracPart.substring(0,fracPart.length-1);
    if (fracPart=='') return (minus?(-1):1)*intPartBase10;
    let fracPartBase10=parseInt(fracPart,base);
    if (isNaN(fracPartBase10)) return null;
    for (let i=0;i<fracPart.length;i++) fracPartBase10/=base;

    return (minus?(-1):1)*(intPartBase10+fracPartBase10);
  }

  #toBase(num, base) {
    if (base==10) return formatNumberMax(num);

    /* Sign */
    const minus=(num<0);
    if (minus) num=-num;

    /* Split integer and fraction part */
    let fracPart=num%1;
    const intPart=num-fracPart;

    /* Integer only? */
    if (fracPart==0)  {
      const intStr=intPart.toString(base);
      return (minus?"-":"")+intStr;
    }

    /* Mixed number */
    let steps=0;
    const maxSteps=Math.max(2,Math.floor(140/base));
    while (steps<maxSteps && num%1!=0) {
        num*=base;
        steps++;
    }
    num=Math.round(num);
    let str=num.toString(base);

    const c=getDecimalSeparatorCharacter();
    str=str.substring(0,str.length-steps)+c+str.substring(str.length-steps);

    return (minus?"-":"")+str;
  }
}
