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
import {preprocessInput, formatMathResult} from './MathJSTools.js';
import {ibeta} from '../libs/jstat-special.js';
import {language} from './Language.js';


/**
 * Units converter panel
 * @see Panel
 */
class StatisticsPanel extends Panel {
  #calc;
  #errorInfo;
  #inputCard;
  #input;
  #output;
  #canvas;
  #chart;
  #xValues=[];

  constructor() {
    super();
  }

  _firstShow() {
    /* Create row */
    const outer=this._createDiv(this._panel);
    outer.className="container";
    const inner=this._createDiv(outer);
    inner.className="row";

    let col;
    let cardBody;
    let line;
    let button;
    let tr, td;
    let li;

    /* Left column */
    col=this.#createCol(inner);

    /* Repeated calculation */
    cardBody=this.#createCard(col,language.statistics.repeatedEvaluation,false);
    line=this.#createLine(cardBody);
    tr=this.#createTable(line);
    tr.appendChild(td=document.createElement("td"));
    this.#calc=this._createInput(td,false,language.calc.input);
    tr.appendChild(td=document.createElement("td"));
    td.style.width="1px";
    button=this.#createButton(td,"","bi-code",language.calc.ExpressionBuilder,"primary",()=>{
      if (isDesktopApp) {
        Neutralino.storage.setData('selectSymbol',null).then(()=>{
          Neutralino.storage.setData('returnID','100').then(()=>window.open("info_webapp.html"));
        });
      } else {
        const popup=window.open("info.html");
        setTimeout(()=>popup.postMessage("100"),1500);
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

    line=this.#createLine(cardBody);
    this.#errorInfo=this._createDiv(line);
    this.#errorInfo.className="small";
    this.#errorInfo.style.color="red";

    line=this.#createLine(cardBody);
    const div=document.createElement("div");
    line.appendChild(div);
    div.className="btn-group";
    div.role="group";
    this.#createButton(div,language.statistics.evaluate,"bi-calculator","","primary",()=>this.#runCalc(10000),false);
    button=this.#createButton(div,"","","","primary",null);
    button.classList.add("dropdown-toggle","dropdown-toggle-split");
    button.dataset.bsToggle="dropdown";
    button.ariaExpanded="false";
    button.innerHTML='<span class="visually-hidden">Toggle Dropdown</span>';
    const ul=document.createElement("ul");
    div.appendChild(ul);
    ul.className="dropdown-menu";
    ul.appendChild(li=document.createElement("li"));
    li.innerHTML='<span class="dropdown-item-text small">'+language.statistics.evaluateCount+'</span>';
    ul.appendChild(li=document.createElement("li"));
    li.innerHTML='<hr class="dropdown-divider">';
    ul.appendChild(li=document.createElement("li"));
    li.appendChild(button=document.createElement("button"));
    button.type="button";
    button.className="dropdown-item";
    button.innerHTML=language.statistics.evaluateCountFew+" ("+(new Number(1000).toLocaleString())+")";
    button.onclick=()=>this.#runCalc(1000);
    li.appendChild(button=document.createElement("button"));
    button.type="button";
    button.className="dropdown-item";
    button.innerHTML="<b>"+language.statistics.evaluateCountMore+" ("+(new Number(10000).toLocaleString())+")</b>";
    button.onclick=()=>this.#runCalc(10000);
    li.appendChild(button=document.createElement("button"));
    button.type="button";
    button.className="dropdown-item";
    button.innerHTML=language.statistics.evaluateCountMany+" ("+(new Number(100000).toLocaleString())+")";
    button.onclick=()=>this.#runCalc(100000);
    li.appendChild(button=document.createElement("button"));
    button.type="button";
    button.className="dropdown-item";
    button.innerHTML=language.statistics.evaluateCountVeryMany+" ("+(new Number(200000).toLocaleString())+")";
    button.onclick=()=>this.#runCalc(200000);

    /* Input values */
    this.#inputCard=this.#createCard(col,language.statistics.MeasuredValues,false);
    line=this.#createLine(this.#inputCard);
    line.className="mb-2";
    button=this.#createButton(line,language.statistics.clear,"bi-trash","","danger",()=>this.#input.value="");

    this.#inputCard.appendChild(this.#input=document.createElement("textarea"));
    this.#input.className="form-control";
    this.#input.rows="20";
    this.#input.placeholder=language.statistics.MeasuredValuesInfo;
    this.#input.oninput=()=>this.#update();

    this.#inputCard.ondragenter=e=>this.#inputValuesDrag(e);
    this.#inputCard.ondragleave=e=>this.#inputValuesDrag(e);
    this.#inputCard.ondragover=e=>this.#inputValuesDrag(e);
    this.#inputCard.ondrop=e=>this.#inputValuesDrag(e);

    /* Right column: Characteristics */
    cardBody=this.#createCard(inner,language.statistics.Characteristics);
    this.#output=this._createDiv(cardBody);
    this.#createCanvas(cardBody);

    /* Start */
    this.#update();
  }

  #dragEnterCount=0;

  /**
 * Handles drag and drop events for loading input values.
 * @param {Object} ev Drag and drop events
 */
  #inputValuesDrag(ev) {
    if (ev.type=='dragenter') {
      this.#inputCard.style.border="3px dashed green";
      this.#dragEnterCount++;
      return;
    }

    if (ev.type=='dragleave') {
      if (this.#dragEnterCount>0) this.#dragEnterCount--;
      if (this.#dragEnterCount>0) return;
      this.#inputCard.style.border="";
      return;
    }

    if (ev.type=='dragover') {
      ev.preventDefault();
      return;
    }

    if (ev.type=='drop') {
      ev.preventDefault();
      this.#dragEnterCount=0;
      this.#inputCard.style.border="";
      if (typeof(ev.dataTransfer)=='undefined' || ev.dataTransfer==null) return;
      if (typeof(ev.dataTransfer.files)=='undefined' || ev.dataTransfer.files.length!=1) return;
      ev.dataTransfer.files[0].text().then(response=>{
        this.#input.value=response.trim();
        this.#update();
      });
      return;
    }
  }

  #insertSymbol(jsonString) {
    const json=JSON.parse(jsonString);
    if (json.ID!=100) return;
    const str=this.#calc.value;
    const caret=this.#calc.selectionStart;
    this.#calc.value=str.substring(0,caret)+json.symbol+str.substring(caret);
  }

  #createCol(parent) {
    const col=this._createDiv(parent);
    col.className="col-md-6";
    return col;
  }

  #createCard(parent, title, createCol=true) {
    let cardParent;
    if (createCol) {
      cardParent=this.#createCol(parent);
    } else {
      cardParent=parent;
    }

    const card=this._createDiv(cardParent);
    card.className="card mb-3";

    const header=this._createDiv(card);
    header.className="card-header";
    header.innerHTML=title;

    const body=this._createDiv(card);
    body.className="card-body";
    return body;
  }

  #createLine(parent) {
    const line=this._createDiv(parent);
    line.style.padding="5px";
    return line;
  }

  #createTable(parent) {
    const table=document.createElement("table");
    table.style.width="100%";
    parent.appendChild(table);
    const tr=document.createElement("tr");
    table.appendChild(tr);
    return tr;
  }

  #createButton(parent, text, icon, tooltip, color, onclick, margin=true) {
    const button=document.createElement("button");
    button.type="button";
    button.className=(margin?"me-2 ":"")+"mb-1 btn btn-sm btn-"+color+((icon!='')?" ":"")+icon;
    button.innerHTML=((text!='' && icon!='')?"&nbsp;":"")+text;
    if (tooltip!='') button.title=tooltip;
    if (onclick!=null) button.onclick=onclick;
    parent.appendChild(button);
    return button;
  }

  #runCalc(repeatCount) {
    try {
      const text=preprocessInput(this.#calc.value);
      const expression=math.compile(text);
      const results=[];
      for (let i=0;i<repeatCount;i++) {
        results.push(formatMathResult(expression.evaluate()));
      }
      this.#input.value=results.join("\n");
      this.#showError();
    } catch (e) {
      this.#input.value="";
      this.#showError(e.message);
    }
    this.#update();
  }

  #showError(msg='') {
    this.#errorInfo.innerHTML=msg;
    this.#errorInfo.style.display=(msg=='')?"none":"";
    this.#calc.classList.toggle("is-invalid",msg!='');
  }

  #createCanvas(parent) {
    this.#canvas=document.createElement("canvas");
    if (document.documentElement.dataset.bsTheme!='light') this.#canvas.style.backgroundColor="darkgray";
    this.#canvas.classList.add("mt-3");

    parent.appendChild(this.#canvas);
    this.#chart=new Chart(this.#canvas, {
      data: {labels: [],  datasets: [{type: 'line', label: '', data: [0]}]}, /* Dummy data on init needed; otherwise later updates will fail */
      options: this.#getChartOptions()
    });
  }

    #getChartOptions() {
    return {
      scales: {
        x: {
          title: {display: true, text: "x"},
          ticks: {callback: (value, index, ticks)=>this.#xValues[index]} /* for some unknown reasons value and index returning the same number, so we have to get the actual value from the original array */
        },
        y : {
          title: {display: true, text: language.statistics.frequency},
          ticks: {callback: (value, index, ticks)=>formatNumber(value*100,1)+"%"}
        }
      },
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label=context.dataset.label || '';
              if (label) label+=': ';
              if (context.parsed.y!==null) label+=formatNumber(context.parsed.y*100,1)+"%";
              return label;
            }
          }
        }
      },
      animation: {duration: 0}
    };
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

    this.#updateHistogram(arr);
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
      const p=1-0.5*ibeta(x,nu/2,0.5);
      if (p>level) max=m; else min=m;
    }

    return (min+max)/2;
  }

  #maxHistogramSteps=20;

  #updateHistogram(values) {
    /* Prepare chart */
    if (typeof(values)=='undefined' || !Array.isArray(values) || values.length<2) {
      this.#canvas.style.display='none';
      return;
    }
    this.#canvas.style.display='';

    /* Calculate histogram */
    let min=values.reduce((x,y)=>Math.min(x,y));
    let max=values.reduce((x,y)=>Math.max(x,y));
    const isDiscrete=values.filter(x=>x%1!=0).length==0;
    let yValues;
    if (isDiscrete) {
      if (min>0 && min<=10) min=0;
      if (max-min<=this.#maxHistogramSteps+1) {
        /* Discrete, small range */
        min=min-1;
        max=max+1;
        this.#xValues=Array.from({length: max-min+1}, (_,i)=>i+min);
        yValues=Array.from({length: this.#xValues.length}, ()=>0);
        for (let value of values) yValues[value-min]++;
        yValues=yValues.map(x=>x/values.length);
      } else {
        /* Discrete, large range */
        let step=1;
        while ((max-min)/step>this.#maxHistogramSteps+1) step++;
        min=min-step;
        max=max+2*step;
        const steps=Math.ceil((max-min)/step);
        this.#xValues=Array.from({length: steps}, (_,i)=>"["+(min+i*step)+";"+(min+i*step+step-1)+"]");
        yValues=Array.from({length: this.#xValues.length}, ()=>0);
        for (let value of values) yValues[Math.floor((value-min)/step)]++;
        yValues=yValues.map(x=>x/values.length);
      }
    } else {
      /* Continuous values */
        let step=1;
        if (max-min<this.#maxHistogramSteps) {
          let mul=0;
          while ((max-min)*step*(1+mul)<this.#maxHistogramSteps/2) mul+=0.1;
          step=step*(1+mul);
        } else {
          while ((max-min)/step>this.#maxHistogramSteps+1) step++;
        }
        min=min-step;
        max=max+2*step;
        const steps=Math.ceil((max-min)/step);
        this.#xValues=Array.from({length: steps}, (_,i)=>"["+formatNumber(min+i*step)+";"+formatNumber(min+(i+1)*step)+")");
        yValues=Array.from({length: this.#xValues.length}, ()=>0);
        for (let value of values) yValues[Math.floor((value-min)/step)]++;
        yValues=yValues.map(x=>x/values.length);
    }

    /* Output histogram */
    const data={
      labels: this.#xValues,
      datasets: [{type: 'bar', data: yValues, borderColor: 'red', backgroundColor: 'rgba(255,0,0,0.25)', borderWidth: 2}]
    };
    this.#chart.data=data;
    this.#chart.update();
  }
}
