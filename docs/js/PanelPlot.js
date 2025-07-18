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

export {PlotPanel};

import {Panel} from './Panel.js';
import {preprocessInput} from './MathJSTools.js';
import {getFloat, formatNumber} from './NumberTools.js';
import {language} from './Language.js';


/**
 * Function plotter panel
 * @see Panel
 */
class PlotPanel extends Panel {
  #xSteps=500;

  #graphData=[
    {name: 'f(x)', color: '#008C4F', text: 'x^2'},
    {name: 'g(x)', color: '#8C1C00', text: 'sin(t*x)'},
    {name: 'h(x)', color: '#000000', text: 'exp(x)'}
  ];
  #canvas;
  #chart;
  #xValues;
  #inputXMin;
  #inputXMax;
  #inputYMin;
  #inputYMax;
  #inputTMin;
  #inputTMax;
  #rangeTLabel;
  #rangeT;
  #inputGraph=[];
  #tableData="";
  #axisCenter=false;

  constructor() {
    super();
  }

  _firstShow() {
    let line;
    let button;

    /* Chart */
    this.#canvas=document.createElement("canvas");
    if (document.documentElement.dataset.bsTheme!='light') {
      this.#canvas.style.backgroundColor="darkgray";
    }
    this._panel.appendChild(this.#canvas);
    this.#chart=new Chart(this.#canvas, {
      data: {labels: [],  datasets: [{type: 'line', label: '', data: [0]}]}, /* Dummy data on init needed; otherwise later updates will fail */
      options: this.#getChartOptions()
    });

    /* Zoom info line */
    const canvasInfo=document.createElement("div");
    this._panel.appendChild(canvasInfo);
    canvasInfo.className="mt-3";
    const span=document.createElement("div");
    canvasInfo.appendChild(span);
    span.className="small";
    span.innerHTML=language.plot.zoomInfo;

    /* Buttons line */

    /* Reset zoom button */
    this.#addButton(canvasInfo,"zoom-out","warning",language.plot.resetZoom,language.plot.resetZoomHint,()=>{
      this.#inputXMin.value="-10";
      this.#inputXMax.value="10";
      this.#inputYMin.value="-10";
      this.#inputYMax.value="10";
      this.#updateChart();
    });

    /* Aspect ratio button */
    this.#addButton(canvasInfo,"aspect-ratio","warning",language.plot.resetZoomAspectRatio,language.plot.resetZoomAspectRatioHint,()=>{
      const ratio=this.#canvas.width/this.#canvas.height;
      const xMin=getFloat(this.#inputXMin.value);
      const xMax=getFloat(this.#inputXMax.value);
      const yMin=getFloat(this.#inputYMin.value);
      const yMax=getFloat(this.#inputYMax.value);
      if (xMin==null || xMax==null || yMin==null || yMax==null) return;
      const xRange=xMax-xMin;
      const yMiddle=(yMin+yMax)/2;
      this.#inputYMin.value=formatNumber(yMiddle-xRange/ratio/2);
      this.#inputYMax.value=formatNumber(yMiddle+xRange/ratio/2);
      this.#updateChart();
    });

    /* Size button */
    this.#addMenuButton(canvasInfo,"arrows-fullscreen","warning",language.plot.size,[
      language.plot.sizeFull,
      "-",
      language.plot.sizeLarge,
      language.plot.sizeMedium,
      language.plot.sizeSmall
    ],[
      ()=>this.#setSize(0),
      null,
      ()=>this.#setSize(3),
      ()=>this.#setSize(2),
      ()=>this.#setSize(1)
    ]);

    /* Axis position */
    this.#addButton(canvasInfo,"border","warning",language.plot.axis,language.plot.axisHint,()=>{
      if (this.#axisCenter) {
        this.#chart.options.scales.x.position = 'bottom';
        this.#chart.options.scales.y.position = 'left';
      } else {
        this.#chart.options.scales.x.position = 'center';
        this.#chart.options.scales.y.position = 'center';
      }
      this.#chart.update();
      this.#axisCenter=!this.#axisCenter;
    });

    /* Copy button */
    this.#addMenuButton(canvasInfo,"clipboard","primary",language.GUI.copy,[language.GUI.copyDiagramTable,language.GUI.copyDiagramImage],[()=>this.#copyTable(),()=>this.#copyChart()]);

    /* Save button */
    this.#addMenuButton(canvasInfo,"download","primary",language.GUI.save,[language.GUI.saveDiagramTable,language.GUI.saveDiagramImage],[()=>this.#saveTable(),()=>this.#saveChart()]);

    /* Delete all button */
    this.#addButton(canvasInfo,"trash","danger",language.plot.clearInputAll,language.plot.clearInputAllHint,()=>{
      this.#inputGraph.forEach(input=>input.value="");
      this.#updateChart();
    });

    /* Axis setup */
    this._panel.appendChild(line=document.createElement("div"));
    line.className="mt-3 mb-3";
    this.#inputXMin=this.#generateInput(line,"x<sub>min</sub>:=&nbsp;",null,100,"-10");
    this.#inputXMin.classList.add("me-3");
    this.#inputXMin.oninput=()=>this.#updateChart();
    this.#inputXMax=this.#generateInput(line,"x<sub>max</sub>:=&nbsp;",null,100,"10");
    this.#inputXMax.classList.add("me-3");
    this.#inputXMax.oninput=()=>this.#updateChart();
    this.#inputYMin=this.#generateInput(line,"y<sub>min</sub>:=&nbsp;",null,100,"-10");
    this.#inputYMin.classList.add("me-3");
    this.#inputYMin.oninput=()=>this.#updateChart();
    this.#inputYMax=this.#generateInput(line,"y<sub>max</sub>:=&nbsp;",null,100,"10");
    this.#inputYMax.oninput=()=>this.#updateChart();

    /* Functions */
    const table=document.createElement("table");
    table.style.width="100%";
    this._panel.appendChild(table);
    let index=0;
    for (let graph of this.#graphData) {
      const tr=document.createElement("tr");
      table.appendChild(tr);
      const nodes=this.#generateInputElements(graph.name+':=',graph.color,null,graph.text);
      const tdLeft=document.createElement("td");
      tr.appendChild(tdLeft);
      tdLeft.style.width="60px";
      tdLeft.appendChild(nodes.label);
      const tdCenter=document.createElement("td");
      tr.appendChild(tdCenter);
      tdCenter.appendChild(nodes.input);
      nodes.input.oninput=()=>this.#updateChart();
      this.#inputGraph.push(nodes.input);
      const tdRight=document.createElement("td");
      tdRight.style.width="100px";

      tr.appendChild(tdRight);
      const input=nodes.input;

      /* Delete button */
      tdRight.appendChild(button=document.createElement("button"));
      button.type="button";
      button.className="btn btn-danger btn-sm bi bi-trash";
      button.title=language.plot.clearInput;
      button.style.marginLeft="5px";
      button.onclick=()=>{input.value=""; this.#updateChart();};

      /* Expression build button */
      tdRight.appendChild(button=document.createElement("button"));
      button.type="button";
      button.className="btn btn-primary btn-sm bi bi-code";
      button.title=language.calc.ExpressionBuilder;
      button.style.marginLeft="5px";
      const currentIndex=index;
      button.onclick=()=>{
        if (isDesktopApp) {
          Neutralino.storage.setData('selectSymbol',null).then(()=>{
            Neutralino.storage.setData('returnID',''+(currentIndex+1)).then(()=>window.open("info_webapp.html"));
          });
        } else {
          const popup=window.open("info.html");
          setTimeout(()=>popup.postMessage(currentIndex+1),1500);
        }
      };
      index++;
    }

    if (isDesktopApp) setInterval(()=>{
      Neutralino.storage.getData('selectSymbol').then(data=>{
        Neutralino.storage.setData('selectSymbol',null);
        this.#insertSymbol(data);
      }).catch(()=>{});
    },250);

    window.addEventListener("message",event=>this.#insertSymbol(event.data));

    /* Additional parameter */
    this._panel.appendChild(line=document.createElement("div"));
    line.className="mt-3";
    this.#inputTMin=this.#generateInput(line,"t<sub>min</sub>:=&nbsp;",null,100,"-10");
    this.#inputTMin.classList.add("me-3");
    this.#inputTMin.oninput=()=>this.#updateChart();
    this.#inputTMax=this.#generateInput(line,"t<sub>max</sub>:=&nbsp;",null,100,"10");
    this.#inputTMax.classList.add("me-3");
    this.#inputTMax.oninput=()=>this.#updateChart();
    this.#rangeT=document.createElement("input");
    line.appendChild(this.#rangeT);
    this.#rangeT.className="form-range";
    this.#rangeT.type="range";
    this.#rangeT.min="0";
    this.#rangeT.max="1000";
    this.#rangeT.value=550;
    this.#rangeT.style.width="300px";
    this.#rangeT.style.paddingTop="12px";
    this.#rangeT.oninput=()=>this.#updateChart();
    line.appendChild(this.#rangeTLabel=document.createElement("label"));
    this.#rangeTLabel.htmlFor=this.#rangeT;
    this.#rangeTLabel.style.marginLeft="15px";

    /* Start */
    this.#updateChart();
  }

  #insertSymbol(jsonString) {
    const json=JSON.parse(jsonString);
    if (json.ID<1 || json.ID>this.#inputGraph.length) return;
    const input=this.#inputGraph[json.ID-1];
    const str=input.value;
    const caret=input.selectionStart;
    input.value=str.substring(0,caret)+json.symbol+str.substring(caret);
    this.#updateChart();
  }

  #generateInputElements(labelText, labelColor, width, value) {
    const label=document.createElement("label");
        label.className="form-label";
    label.innerHTML=labelText;
    if (labelColor) label.style.color=labelColor;

    const input=document.createElement("input");
    input.type="text";
    input.spellcheck=false;
    input.className="form-control";
    if (width) {
      input.style.display="inline-block";
      input.style.width=width+"px";
    }
    input.value=value;

    label.htmlFor=input;

    return {label: label, input: input};
  }

  #generateInput(parent, labelText, labelColor, width, value) {
    const nodes=this.#generateInputElements(labelText,labelColor,width,value);
    parent.appendChild(nodes.label);
    parent.appendChild(nodes.input);
    return nodes.input;
  }

  #addButton(parent, icon, color, text, hint, action) {
    const button=document.createElement("button");
    parent.appendChild(button);
    button.type="button";
    button.className="btn btn-"+color+" btn-sm bi-"+icon;
    button.style.marginRight="10px";
    button.innerHTML=" "+text;
    button.title=hint;
    button.onclick=action;
  }

  #addMenuButton(parent, icon, color, text, subText, subAction) {
    const div=document.createElement("div");
    parent.appendChild(div);
    div.class="dropdown";
    div.style.display="inline-block";
    div.style.marginRight="10px";

    const button=document.createElement("button");
    div.appendChild(button);
    button.className="btn btn-"+color+" btn-sm bi-"+icon+" dropdown-toggle my-1";
    button.type="button";
    button.dataset.bsToggle="dropdown";
    button.innerHTML=" "+text;

    const ul=document.createElement("ul");
    div.appendChild(ul);
    ul.className="dropdown-menu";

    for (let i=0;i<Math.min(subText.length,subAction.length);i++) {
      const li=document.createElement("li");
      ul.appendChild(li);
      if (subText[i]=='-') {
        const hr=document.createElement("hr");
        hr.className="dropdown-divider";
        li.appendChild(hr);
      } else {
        const a=document.createElement("a");
        li.appendChild(a);
        a.className="dropdown-item";
        a.style.cursor="pointer";
        a.onclick=subAction[i];
        a.innerHTML=subText[i];
      }
    }
  }

  #getChartOptions() {
    return {
      scales: {
        x: {
          title: {display: true, text: "x"},
          ticks: {callback: (value, index, ticks)=>formatNumber(this.#xValues[index],5)} /* for some unknown reasons value and index returning the same number, so we have to get the actual value from the original array */
        },
        y : {
          title: {display: true, text: "y"}
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'bottom'
        },
        zoom: {
          zoom: {
            wheel: {
              enabled: true,
              modifierKey: "ctrl",
            },
            pinch: {
              enabled: true
            },
            drag: {
              enabled: true,
              modifierKey: "ctrl",
            },
            mode: 'xy',
            onZoomComplete: ()=>this.#userClickZoomDone()
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label=context.dataset.label || '';
              if (label) label+=': ';
              if (context.parsed.y!==null) label+=formatNumber(context.parsed.y,5);
              return label;
            }
          }
        }
      },
      animation: {duration: 0}
    };
  }

  #updateChart() {
    let ok=true;

    /* Get axis ranges */
    const minX=getFloat(this.#inputXMin);
    const maxX=getFloat(this.#inputXMax);
    const minY=getFloat(this.#inputYMin);
    const maxY=getFloat(this.#inputYMax);
    this.#inputXMin.classList.toggle("is-invalid",minX==null); if (minX==null) ok=false;
    this.#inputXMax.classList.toggle("is-invalid",maxX==null || (minX!=null && minX>=maxX)); if (maxX==null || (minX!=null && minX>=maxX)) ok=false;
    this.#inputYMin.classList.toggle("is-invalid",minY==null); if (minY==null) ok=false;
    this.#inputYMax.classList.toggle("is-invalid",maxY==null || (minY!=null && minY>=maxY)); if (maxY==null || (minY!=null && minY>=maxY)) ok=false;

    /* Get functions */
    const graphObjects=[];
    for (let input of this.#inputGraph) {
      try {
        const expr=math.compile(preprocessInput(input.value));
        graphObjects.push(expr);
        input.classList.remove("is-invalid");
      } catch (e) {
        graphObjects.push(math.compile("0"));
        input.classList.add("is-invalid");
        ok=false;
      }
    }

    /* Get additional parameter */
    const minT=getFloat(this.#inputTMin);
    const maxT=getFloat(this.#inputTMax);
    this.#inputTMin.classList.toggle("is-invalid",minT==null); if (minT==null) ok=false;
    this.#inputTMax.classList.toggle("is-invalid",maxT==null || (minT!=null && minT>=maxT)); if (maxT==null || (minT!=null && minT>=maxT)) ok=false;

    if (!ok) return;

    /* Setup y axis */
    this.#chart.options.scales.y.min=minY;
    this.#chart.options.scales.y.max=maxY;

    /* Setup x axis */
    this.#xValues=Array.from({length: this.#xSteps+1},(_,i)=>minX+i/this.#xSteps*(maxX-minX));

    /* Additional parameter */
    const tIndex=this.#rangeT.value;
    const t=minT+(maxT-minT)*tIndex/1000;
    this.#rangeTLabel.innerHTML="t:="+formatNumber(t);

    /* Draw graphs */
    const yValuesAll=[];
    const data={
      labels: this.#xValues,
      datasets: []
    };
    for (let i=0;i<graphObjects.length;i++) {
      const yValues=this.#xValues.map(x=>{
        try {
          const res=graphObjects[i].evaluate({x: x, t: t});
          if (typeof(res)=='number') return res; return NaN; /* complex numbers */
        } catch (e) {
          return NaN;
        }
      });
      data.datasets.push({type: 'line', pointRadius: 0, label: this.#graphData[i].name+':='+this.#inputGraph[i].value, data: yValues, borderColor: this.#graphData[i].color, pointHitRadius: 30});
      yValuesAll.push(yValues);
    }

    /* Update chart */
    this.#chart.data=data;
    this.#chart.update();

    /* Build table data (for export) */
    const firstRow=["x"];
    this.#graphData.forEach(graph=>firstRow.push(graph.name));
    const table=[firstRow.join("\t")];
    for (let i=0;i<this.#xValues.length;i++) {
      const row=[formatNumber(this.#xValues[i],8)];
      yValuesAll.map(graphY=>graphY[i]).map(y=>(typeof(y)=='undefined')?0:formatNumber(y,8)).forEach(y=>row.push(y));
      table.push(row.join("\t"));
    }

    this.#tableData=table.join("\n");
  }

  #justZooming=false;

  #userClickZoomDone() {
    if (this.#justZooming) return;
    const minXIndex=this.#chart.options.scales.x.min;
    const maxXIndex=this.#chart.options.scales.x.max;
    const minX=this.#xValues[Math.max(0,minXIndex)];
    const maxX=this.#xValues[Math.min(this.#xValues.length-1,maxXIndex)];
    const minY=this.#chart.options.scales.y.min;
    const maxY=this.#chart.options.scales.y.max;
    this.#inputXMin.value=formatNumber(minX);
    this.#inputXMax.value=formatNumber(maxX);
    this.#inputYMin.value=formatNumber(minY);
    this.#inputYMax.value=formatNumber(maxY);

    setTimeout(()=>{
      this.#justZooming=true;
      this.#chart.resetZoom();
      this.#updateChart();
      this.#justZooming=false;
    },0);
  }

  #setSize(mode) {
    switch (mode) {
      case 0: /* Maximum size */
        this.#canvas.style.maxHeight="";
        break;
      case 1: /* Minimum size */
        this.#canvas.style.maxHeight="568px";
        break;
      case 2: /* Medium size */
        this.#canvas.style.maxHeight="800px";
        break;
      case 3: /* Large size */
        this.#canvas.style.maxHeight="1024px";
        break;
    }
    this.#canvas.style.width="";
    this.#canvas.style.height="";
    this.#chart.update();
  }

  #copyTable() {
    navigator.clipboard.writeText(this.#tableData);
  }

  #saveTable() {
    if (isDesktopApp) {
      Neutralino.os.showSaveDialog(language.plot.infoDiagramSaveValues, {defaultPath: 'table.txt', filters: [
        {name: language.plot.infoDiagramSaveValuesTextFiles+' (*.txt)', extensions: ['txt']}
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

  #copyChart() {
    if (typeof(ClipboardItem)!="undefined") {
      this.#canvas.toBlob(blob=>navigator.clipboard.write([new ClipboardItem({"image/png": blob})]));
   } else {
     alert(language.GUI.copyDiagramImageError);
   }
  }

  #saveChart() {
    if (isDesktopApp) {
      Neutralino.os.showSaveDialog(language.plot.infoDiagramSaveValues, {defaultPath: 'plot.png', filters: [
        {name: language.plot.infoDiagramSaveValuesGraphics+' (*.png)', extensions: ['png']}
      ]}).then(file=>{
        file=file.trim();
        if (file=='') return;
        if (!file.toLocaleLowerCase().endsWith(".png")) file+=".png";
        this.#canvas.toBlob(blob=>{
          blob.arrayBuffer().then(arr=>Neutralino.filesystem.writeBinaryFile(file,arr));
        });
      });
    } else {
      const element=document.createElement("a");
      element.href=this.#canvas.toDataURL("image/png");
      element.download="plot.png";
      element.click();
    }
  }

  getMinHeight() {
    return 1000;
  }
}
