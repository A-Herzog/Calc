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

export {StatisticsPanel};

import {Panel} from './Panel.js';
import {getFloat, formatNumber} from './NumberTools.js';
import {language} from './Language.js';


/**
 * Units converter panel
 * @see Panel
 */
class StatisticsPanel extends Panel {
  #input;
  #output;

  constructor() {
    super();
  }

  _firstShow() {
    /* Create row */
    const outer=this._createDiv(this._panel);
    outer.className="container";
    const inner=this._createDiv(outer);
    inner.className="row";

    let cardBody;

    /* Input values */
    cardBody=this.#createCard(inner,language.statistics.MeasuredValues);
    cardBody.appendChild(this.#input=document.createElement("textarea"));
    this.#input.className="form-control";
    this.#input.rows="20";
    this.#input.placeholder=language.statistics.MeasuredValuesInfo;
    this.#input.oninput=()=>this.#update();

    /* Characteristics */
    cardBody=this.#createCard(inner,language.statistics.Characteristics);
    this.#output=this._createDiv(cardBody);

    /* Start */
    this.#update();
  }

  #createCard(parent, title) {
    const col=this._createDiv(parent);
    col.className="col-md-6";

    const card=this._createDiv(col);
    card.className="card mb-3";

    const header=this._createDiv(card);
    header.className="card-header";
    header.innerHTML=title;

    const body=this._createDiv(card);
    body.className="card-body";
    return body;
  }

  #update() {
    /* Formulas */
    const mathXi="<msub><mi>x</mi><mi>i</mi></msub>";
    const mathXn="<msub><mi>x</mi><mi>n</mi></msub>";
    const mathSum="<math><mo>&sum;</mo>"+mathXi+"</math>";
    const mathMin="<math><mo>min</mo><mo>(</mo>"+mathXi+"<mo>)</mo></math>";
    const mathMax="<math><mo>max</mo><mo>(</mo>"+mathXi+"<mo>)</mo></math>";
    const mathMean="<math><mover>"+mathXn+"<mo accent='true'>―</mo></mover></math>";
    const mathMeanGeo="<math><mover><msub><mi>x</mi><mtext>geo</mtext></msub><mo accent='true'>―</mo></mover></math>";
    const mathMeanHarm="<math><mover><msub><mi>x</mi><mtext>harm</mtext></msub><mo accent='true'>―</mo></mover></math>";
    const mathMedian="<math><mover><msub><mi>x</mi><mn>"+(0.5).toLocaleString()+"</mn></msub><mo accent='true'>~</mo></mover></math>";
    const mathVariance="<math><mover><msubsup><mi>s</mi><mi>n</mi><mn>2</mn></msubsup><mo accent='true'>^</mo></mover></math>";
    const mathSD="<math><mover><msub><mi>s</mi><mi>n</mi></msub><mo accent='true'>^</mo></mover></math>";
    const mathCV="<math><mo>CV</mo><mo>(</mo><mi>x</mi><mo>)</mo></math>";

    /* Characteristics */
    let linesCount=0;
    let emptyCount=0;
    let invalidCount=0;
    let numberCount=0;
    let sum=0;
    let sumSquared=0;
    let prod=1;
    let sumReciprocal=0;
    let min=null;
    let max=null;
    let arr=[];

    /* Calculate characteristics */
    for (let line of this.#input.value.split("\n").map(line=>line.trim())) {
      /* Test if line is number */
      linesCount++;
      if (line=='') {emptyCount++; continue;}
      const num=getFloat(line);
      if (num==null) {invalidCount++; continue;}
      numberCount++;

      /* Process number */
      sum+=num;
      sumSquared+=(num**2);
      prod*=num;
      sumReciprocal+=1/num;
      if (min==null) min=num; else min=Math.min(min,num);
      if (max==null) max=num; else max=Math.max(max,num);
      arr.push(num);
    }
    const mean=(numberCount>0)?(sum/numberCount):null;
    arr.sort();
    let median=null;
    if (arr.length>0) median=(arr.length%2==0)?((arr[arr.length/2-1]+arr[arr.length/2])/2):arr[(arr.length-1)/2];

    /* Output characteristics */
    const output=[];
    output.push(language.statistics.countLines+"="+linesCount);
    output.push(language.statistics.countEmpty+"="+emptyCount);
    output.push(language.statistics.countInvalid+"="+invalidCount);
    output.push("");
    output.push(language.statistics.countNumbers+": <b>n="+numberCount+"</b>");
    output.push(language.statistics.sum+": <b>"+mathSum+"="+formatNumber(sum,8)+"</b>");
    if (min!=null) output.push(language.statistics.min+": <b>"+mathMin+"="+formatNumber(min,8)+"</b>");
    if (max!=null) output.push(language.statistics.max+": <b>"+mathMax+"="+formatNumber(max,8)+"</b>");
    if (min!=null && max!=null) output.push(language.statistics.range+": <b>"+formatNumber(max-min,8)+"</b>");
    if (mean!=null) output.push(language.statistics.meanArithmetic+": <b>"+mathMean+"="+formatNumber(mean,8)+"</b>");
    if (mean!=null) output.push(language.statistics.meanGeometric+": <b>"+mathMeanGeo+"="+formatNumber(Math.pow(prod,1/numberCount),8)+"</b>");
    if (mean!=null) output.push(language.statistics.meanHarmonic+": <b>"+mathMeanHarm+"="+formatNumber(numberCount/sumReciprocal,8)+"</b>");
    if (median!=null) output.push(language.statistics.median+": <b>"+mathMedian+"="+formatNumber(median,8)+"</b>");
    if (numberCount>1) {
      const variance=(1/(numberCount-1))*(sumSquared-numberCount*(mean**2));
      const sd=Math.sqrt(variance);
      output.push(language.statistics.variance+": <b>"+mathVariance+"="+formatNumber(variance,8)+"</b>");
      output.push(language.statistics.sd+": <b>"+mathSD+"="+formatNumber(sd,8)+"</b>");
      if (mean!=0) output.push(language.statistics.cv+": <b>"+mathCV+"="+formatNumber(sd/Math.abs(mean),8)+"</b>");
      for (let level of [0.9, 0.95, 0.99]) output.push(language.statistics.confidenceInterval+" "+(level*100).toLocaleString()+"%: "+this.#getConfidenceInterval(numberCount,mean,sd,level));
    }
    this.#output.innerHTML=output.join("<br>");
  }

  #getConfidenceInterval(n, mean, sd, level) {
    const alpha=1-level;
    const radius=this.#getTDistQuantil(n-1,1-alpha/2)*sd/Math.sqrt(n);
    const lower=mean-radius;
    const upper=mean+radius;
    return "<b>["+formatNumber(lower,8)+";"+formatNumber(upper,8)+"]</b>, "+language.statistics.confidenceIntervalRadius+"=<b>"+formatNumber(radius)+"</b>";
  }

  #getTDistQuantil(nu, level) {
    let min=0;
    let max=10E10;

    while (max-min>10E-8) {
      const m=(min+max)/2;
      const x=nu/(m**2+nu);
      const p=1-0.5*jStat.ibeta(x,nu/2,0.5);
      if (p>level) max=m; else min=m;
    }

    return (min+max)/2;
  }
}
