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

export {UnitsConverterPanel};

import {Panel} from './Panel.js';
import {getFloat, formatNumberMax} from './NumberTools.js';
import {language} from './Language.js';


/**
 * Units converter panel
 * @see Panel
 */
class UnitsConverterPanel extends Panel {
  #select;
  #options=[];
  #factors=[];

  constructor() {
    super();
  }

  _firstShow() {
    /* Unit type selector */
    const line=this.#addPanel();
    line.className="mb-3";
    const label=document.createElement("label");
    line.appendChild(label);
    label.className="form-label";
    label.innerHTML=language.units.category+":";
    label.style.paddingRight="10px";
    this.#select=document.createElement("select");
    line.appendChild(this.#select);
    this.#select.className="form-select";
    this.#select.onchange=()=>this.#selectPanel();
    this.#select.style.display="inline-block";
    this.#select.style.width="200px";
    label.htmlFor=this.#select;

    /* Panels */
    this.#buildUnitsPanel(language.units.length,[
      {name: language.units.lengthMeters, unit: "m", initialValue: 1},
      {name: language.units.lengthMillimeters, unit: "mm", factor: 1/1000},
      {name: language.units.lengthKilometers, unit: "km", factor: 1000},
      {name: language.units.lengthMiles, unit: "miles", factor: 1609.344, wiki: language.units.lengthMiles},
      {name: language.units.lengthYards, unit: "yd", factor: 0.3048*3, wiki: language.units.lengthYardsWiki},
      {name: language.units.lengthAngstroem, unit: '\u212B', factor: 1E-10, wiki: language.units.lengthAngstroemWiki},
      {name: language.units.lengthFeet, unit: 'ft', factor: 0.3048, wiki: language.units.lengthFeetWiki},
      {name: language.units.lengthInch, unit: 'in', factor: 0.0254, wiki: language.units.lengthInchWiki},
      {name: language.units.lengthSeaMiles, unit: "sm", factor: 1852, wiki: language.units.lengthSeaMilesWiki},
      {name: language.units.lengthPoints, unit: "pt" , factor: 1/72.27*0.0254, wiki: language.units.lengthPointsWiki},
      {name: language.units.lengthParsec, unit: "pc", factor: 3.09E16, wiki: language.units.lengthParsecWiki},
      {name: language.units.lengthAE, unit: "AE", factor: 149597870700, wiki: language.units.lengthAEWiki},
      {name: language.units.lengthLightSeconds, factor: 299792458, wiki: language.units.lengthLightSecondsWiki},
      {name: language.units.lengthKlafter, factor: 0.3048*6, wiki: language.units.lengthKlafterWiki},
      {name: language.units.lengthLachter, unit: "Ltr", factor: 1.9238, wiki: language.units.lengthLachterWiki, info: language.units.lengthLachterInfo}
    ]);

    this.#buildUnitsPanel(language.units.area,[
      {name: language.units.areaSquaremeters, unit: "m<sup>2</sup>", initialValue: 1},
      {name: language.units.areaSquarekilometers, unit: "km<sup>2</sup>", factor: 1000000},
      {name: language.units.areaHektar, unit: "ha", factor: 10000, wiki: language.units.areaHektarWiki},
      {name: language.units.areaAr, unit: "a", factor: 100, wiki: language.units.areaArWiki},
      {name: language.units.areaMorgen, unit: "mg", factor: 2500, wiki: language.units.areaMorgenWiki},
      {name: language.units.areaSoccerFields, factor: 7140, wiki: language.units.areaSoccerFieldsWiki},
      {name: language.units.areaSaarland, factor: 1000000*2569.69, wiki: language.units.areaSaarlandWiki}
    ]);

    this.#buildUnitsPanel(language.units.volume,[
      {name: language.units.volumeCubicMeters, unit: "m<sup>3</sup>", initialValue: 1},
      {name: language.units.volumeCubikMillimeters, unit: "mm<sup>3</sup>", calcToBase: x=>x/1E9, calcFromBase: x=>x*1E9},
      {name: language.units.volumeLiters, unit: "l", factor: 1/1000},
      {name: language.units.volumeGalons, unit: "gal" ,factor: 0.0037854111013237, wiki: language.units.volumeGalonsWiki},
      {name: language.units.volumeBarrels ,factor: 0.15898728912522, wiki: language.units.volumeBarrelsWiki},
      {name: language.units.volumePints, unit: "pt", factor: 480/1000000, wiki: language.units.volumePintsWiki},
      {name: language.units.volumeOkerReservoirs ,factor: 46850000, wiki: language.units.volumeOkerReservoirsWiki},
      {name: language.units.volumeCups, factor: 0.24, wiki: language.units.volumeCupsWiki},
      {name: language.units.volumeTeaspoons, factor: 1/202884.1, wiki: language.units.volumeTeaspoonsWiki},
      {name: language.units.volumeTablespoons, factor: 1/67628.04, wiki: language.units.volumeTablespoonsWiki}
    ]);

    this.#buildUnitsPanel(language.units.velocity,[
      {name: language.units.velocityKmh, unit: "km/h", initialValue: 1},
      {name: language.units.velocityMs, unit: language.units.velocityMsUnit, factor: 3.6},
      {name: language.units.velocityMih, unit: "miles/h", factor: 1.609344},
      {name: language.units.velocityKnots, unit: language.units.velocityKnotsUnit, factor: 1.852, wiki: language.units.velocityKnotsWiki},
      {name: language.units.velocityMach, unit: "Mach", factor: 1236, wiki: language.units.velocityMachWiki},
      {name: language.units.velocityLightspeed, factor: 3.6*299792458, wiki: language.units.velocityLightspeedWiki},
      {name: language.units.velocityWarpFaktor, calcToBase: x=>warpTokmh(x), calcFromBase: x=>kmhToWarp(x), wiki: language.units.velocityWarpFaktorWiki}
    ]);

    this.#buildUnitsPanel(language.units.power,[
      {name: language.units.powerW, unit: "W", initialValue: 1, wiki: language.units.powerWWiki},
      {name: language.units.powerPS, unit: language.units.powerPSUnit, factor: 735.49875, wiki: language.units.powerPSWiki},
    ]);

    this.#buildUnitsPanel(language.units.energy,[
      {name: language.units.energyJoule, unit: "J", initialValue: 1},
      {name: language.units.energyWh, unit: "Wh", factor: 3600},
      {name: language.units.energyWs, unit: "Ws", factor: 1},
      {name: language.units.energyCal, unit: "cal", factor: 180/43, wiki: language.units.energyCalWiki},
      {name: language.units.energyEV, unit: "eV", factor: 1.602176634E-19, wiki: language.units.energyEVWiki},
      {name: language.units.energyNm, unit: "Nm", factor: 1},
      {name: language.units.energySKE, unit: "SKE", factor:  29307600, wiki: language.units.energySKEWiki},
      {name: language.units.energyBTU, unit: "BTU", factor: 1055.05585262, wiki: language.units.energyBTUWiki}
    ]);

    this.#buildUnitsPanel(language.units.temperature,[
      {name: language.units.temperatureCelsius, unit: "°C", initialValue: 20, wiki: language.units.temperatureCelsiusWiki},
      {name: language.units.temperatureFahrenheit, unit: "°F", calcToBase: x=>(x-32)*5/9 , calcFromBase: x=>x*9/5+32, wiki: language.units.temperatureFahrenheitWiki},
      {name: language.units.temperatureKelvin, unit: "K", calcToBase: x=>x-273.15, calcFromBase: x=>x+273.15, wiki: language.units.temperatureKelvinWiki}
    ]);

    this.#buildUnitsPanel(language.units.pressure,[
      {name: language.units.pressurePa, unit: "Pa", initialValue: 101300},
      {name: language.units.pressurehPa, unit: "hPa", factor: 100},
      {name: language.units.pressuremBar, unit: "mBar", factor: 100},
      {name: language.units.pressureBar, unit: "Bar", factor: 100000},
      {name: language.units.pressuremmHg, unit: "mmHg", factor: 101325/760, wiki: language.units.pressuremmHgWiki},
      {name: language.units.pressureATM, unit: "atm", factor: 1.0133E5, wiki: language.units.pressureATMWiki},
      {name: language.units.pressurePSI, unit: "psi", factor: 6894.8, wiki: language.units.pressurePSIWiki}
    ]);

    this.#buildUnitsPanel(language.units.WeightAndMass,[
      {name: language.units.WeightAndMassKilogramm, unit: "kg", initialValue: 1},
      {name: language.units.WeightAndMassGramm, unit: "g", factor: 1/1000},
      {name: language.units.WeightAndMassPfund, factor: 1/2},
      {name: language.units.WeightAndMassZentner, factor: 50},
      {name: language.units.WeightAndMassTons, unit: "t", factor: 1000},
      {name: language.units.WeightAndMassNewton, unit: "N" ,factor: 0.10197160050137, wiki: language.units.WeightAndMassNewtonWiki},
      {name: language.units.WeightAndMassPound ,factor: 0.37324170498304, wiki: language.units.WeightAndMassPoundWiki},
      {name: language.units.WeightAndMassOunces, factor: 0.031103473480401, wiki: language.units.WeightAndMassOuncesWiki},
      {name: language.units.WeightAndMassCarat, factor: 0.2/1000, wiki: language.units.WeightAndMassCaratWiki}
    ]);

    this.#buildUnitsPanel(language.units.angle,[
      {name: language.units.angleDEG, unit: '° DEG', initialValue: 360, wiki: language.units.angleDEGWiki},
      {name: language.units.angleRAD, unit: "RAD", factor: 180/Math.PI, wiki: language.units.angleRADWiki},
      {name: language.units.angleGON, unit: "gon", factor: 360/400, wiki: language.units.angleGONWiki},
      {name: language.units.angleFullCircle, factor: 360}
    ]);

    /* Start */
    this.#selectPanel();
    for (let i=0;i<this.#factors.length;i++) for (let j=0;j<this.#factors[i].length;j++) if (this.#factors[i][j].initialValue) this.#inputChanged(this.#factors[i][j].edit);
  }

  #addPanel() {
    const div=document.createElement("div");
    this._panel.appendChild(div);
    return div;
  }

  #addOption(name, panel) {
    const option=document.createElement("option");
    this.#select.appendChild(option);
    option.value=this.#options.length+1;
    option.selected=(this.#options.length==0);
    option.innerHTML=name;

    this.#options.push(panel);
  }

  #buildUnitsPanel(name, data) {
    this.#factors.push(data);

    const div=this.#addPanel();
    const table=document.createElement("table");
    div.appendChild(table);

    for (let rec of data) {
      const tr=document.createElement("tr");
      table.appendChild(tr);

      let td;

      tr.appendChild(td=document.createElement("td"));
      const label=document.createElement("label");
      td.appendChild(label);
      label.className="form-label";
      label.innerHTML=rec.name+":";
      label.style.paddingRight="10px";
      if (rec.info) label.title=rec.info;

      tr.appendChild(td=document.createElement("td"));
      const edit=document.createElement("input");
      rec.edit=edit;
      td.appendChild(edit);
      edit.className="form-control";
      edit.type="text";
      edit.spellcheck=false;
      label.htmlFor=label;
      if (rec.initialValue) edit.value=formatNumberMax(rec.initialValue);
      edit.oninput=()=>this.#inputChanged(edit);

      if (rec.unit || rec.wiki) {
        tr.appendChild(td=document.createElement("td"));
        if (rec.unit) {
          const span=document.createElement("span");
          td.appendChild(span);
          span.innerHTML=rec.unit;
          span.style.paddingLeft="10px";
        }
        if (rec.wiki) {
          const span=document.createElement("span");
          td.appendChild(span);
          span.innerHTML="(<a href='"+rec.wiki+"' target='_blank'>Wikipedia</a>)";
          span.style.paddingLeft="10px";
        }
      }
    }

    this.#addOption(name,div);
  }

  #selectPanel() {
    const index=this.#select.value-1;
    for (let i=0;i<this.#options.length;i++) this.#options[i].style.display=(i==index)?"":"none";
  }

  #inputChanged(edit) {
    for (let units of this.#factors) {
      /* Find record */
      const oldUnit=units.find(unit=>unit.edit==edit);
      if (typeof(oldUnit)=='undefined') continue;

      /* Load changed value */
      let num=getFloat(edit);
      edit.classList.toggle("is-invalid",num==null);

      /* Transform to base unit */
      if (num!=null) {
        if (oldUnit.factor) num=num*oldUnit.factor;
        if (oldUnit.calcToBase) num=oldUnit.calcToBase(num);
      }

      /* Set other input fields */
      for (let unit of units.filter(unit=>unit!=oldUnit)) {
        /* No invalid state on target input elements */
        unit.edit.classList.remove("is-invalid");

        /* No value? */
        if (num==null) {unit.edit.value=""; continue;}

        /* Transform to new unit */
        let targetNum=num;
        if (unit.factor) targetNum=targetNum/unit.factor;
        if (unit.calcFromBase) targetNum=unit.calcFromBase(targetNum);

        /* Set value */
        unit.edit.value=formatNumberMax(targetNum);
      }
    }
  }
}

function warpToLightSpeed(x) {
  if (x<=0) return 0;
  return x**((10/3) / (1 - (x/10)**(( 91.28 / (10-x)**0.27))));
}

function lightSpeedToWarp(x) {
  if (x<=0) return 0;

  let w1=0;
  let w2=9.9999;
  while (w2-w1>0.000000001) {
    const w=(w1+w2)/2;
    const l=warpToLightSpeed(w);
    if (l>x) w2=w; else w1=w;
  }
  return Math.round((w1+w2)/2*1000000000)/1000000000;
}

function warpTokmh(x) {
  return warpToLightSpeed(x)*3.6*299792458;
}

function kmhToWarp(x) {
  return lightSpeedToWarp(x/(3.6*299792458));
}
