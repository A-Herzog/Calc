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

export {preprocessInput, formatMathResult, loadMathJSExtensions, binomDirect}

import {formatNumber, getFloatBase} from './NumberTools.js';
import {betafn, lowRegGamma} from '../libs/jstat-special.js';
import {factorize, collectFactors, getPhi} from './PanelPrimeFactorsPanel.js';
import {getConvertData, convertValue} from './PanelUnitsConverter.js';
import {erlangC_Pt, erlangC_ENQ, erlangC_EN, erlangC_EW, erlangC_EV, extErlangC_Pt, extErlangC_ENQ, extErlangC_EN, extErlangC_EW, extErlangC_EV, extErlangC_PA, AC_ENQ, AC_EN, AC_EW, AC_EV} from './QTTools.js';

/* Math JS extensions */

/**
 * Calculates the binomial coefficient n over k
 * @param {Number} n n in n over k
 * @param {Number} k k in n over k
 * @returns Binomial coefficient n over k
 */
function binomDirect(n,k) {
  n=Math.round(n);
  k=Math.round(k);
  if (n<=0) throw new Error("n has to be larger than 0");
  if (k<0 || k>n) return 0;
  if (k==0 || k==n) return 1;
  /* binom(n;k)=n!/((n-k)!*k!))=(n*(n-1)*...*(n-k+1))(1*2*...*k) */
  let prod=1;
  for (let i=0;i<k;i++) prod*=(n-i)/(i+1);
  return prod;
}

/**
 * Generates a diagonal matrix with ones on the main diagonal.
 * @param {Number} n Number of rows and columns
 * @returns Diagonal matrix with ones on the main diagonal
 */
function eye(n) {
  n=Math.round(n);
  if (n<1) throw new Error("n has to be 1 or larger");
  const rows=[];
  for (let i=0;i<n;i++) {
    const row=[];
    for (let j=0;j<n;j++) row.push(i==j?'1':'0');
    rows.push("["+row.join(";")+"]");
  }
  return math.evaluate(preprocessInput("["+rows.join(";")+"]"));
}

/**
 * Preprocesses the parameters for a function that contains a term to be evaluated multiple times.
 * @param {String} name Name of the function in the parser
 * @param {Array} params Array of 3 or 4 parameters
 * @returns Object containing the data for evaluating the function
 */
function preprocessMultiFunction(name, params) {
  /* Test number of parameters */
  if (params.length<3 || params.length>4) throw new Error(name+" needs 3 or 4 paramerers.");

  /* Term parameter */
  if (typeof(params[0])!='string') throw new Error("First parameter of "+name+" has to be a string.");
  const term=math.compile(params[0]);

  /* Variable, min and max */
  let variable='x';
  let min;
  let max;
  if (params.length==4) {
    if (typeof(params[1])!='string') throw new Error("When "+name+" is called with 4 parameters, the second parameter has to be a string.");
    variable=params[1];
    min=params[2];
    max=params[3];
  } else {
    min=params[1];
    max=params[2];
  }
  if (typeof(min)!='number' || typeof(max)!='number') throw new Error("The last 2 parameters of "+name+" have to be numbers.");
  if (min>max) throw new Error("The last parameter of "+name+" cannot be smaller than the parameter before.");

  return {term: term, variable: variable, min: min, max: max};
}

/**
 * Definition of a function of type sumx("term","variable",min,max) summing "term" over variable "variable" from min to max (in steps of size 1)
 * @param  {...any} params Function parameters
 * @returns Sum
 */
function sumX(...params) {
  const expr=preprocessMultiFunction("sumx",params);

  let sum=0;
  for (let i=expr.min;i<=expr.max;i++) {
    const scope={};
    scope[expr.variable]=i;
    sum+=expr.term.evaluate(scope);
  }

  return sum;
}

/**
 * Definition of a function of type prodx("term","variable",min,max) multiplying "term" over variable "variable" from min to max (in steps of size 1)
 * @param  {...any} params Function parameters
 * @returns Product
 */
function prodX(...params) {
  const expr=preprocessMultiFunction("sumx",params);

  let prod=1;
  for (let i=expr.min;i<=expr.max;i++) {
    const scope={};
    scope[expr.variable]=i;
    prod*=expr.term.evaluate(scope);
  }

  return prod;
}

/**
 * Definition of a function of type integrate("term","variable",min,max) calculating the integral over "term" using Simpsons rule.
 * @param  {...any} params Function parameters
 * @returns Integral value
 */
function integrate(...params) {
  const expr=preprocessMultiFunction("sumx",params);

  const STEPS=2**18+1; /* Must be multiple of 4 plus 1 */

  /* Simpsons rule */
  let sum=0;
  for (let i=0;i<STEPS;i++) {
    const x=expr.min+i/(STEPS-1)*(expr.max-expr.min);
    const factor=(i==0 || i==STEPS-1)?1:((i%2==1)?4:2);
    /* Rectangle rule: const factor=(i==0 || i==STEPS-1)?0.5:1; */

    const scope={};
    scope[expr.variable]=x;
    sum+=expr.term.evaluate(scope)*factor;
  }

  return sum/3*(expr.max-expr.min)/(STEPS-1);
  /* Rectangle rule: return sum*(expr.max-expr.min)/(STEPS-1); */
}

/**
 * Truncated the fraction part of the number.
 * @param {number} num Number
 * @returns Truncated number
 */
function trunc(num) {
  return (num>0)?Math.floor(num):Math.ceil(num);
}

/**
 * Integer part of the number.
 * @param {number} num Number
 * @returns Integer part of the number
 */
function roundInt(num) {
  return trunc(num);
}

/**
 * Fraction part of the number.
 * @param {number} num Number
 * @returns Fraction part of the number
 */
function frac(num) {
  return num-roundInt(num);
}

/**
 * Calculates the coefficient of variations of sample values.
 * @param  {...number} params Sample values
 * @returns Coefficient of variation
 */
function cv(...params) {
  const std=math.std(...params);
  const mean=math.mean(...params);
  if (mean==0) return Number.POSITIVE_INFINITY;
  return std/Math.abs(mean);
}

/**
 * Calculates the squared coefficient of variations of sample values.
 * @param  {...number} params Sample values
 * @returns Squared coefficient of variation
 */
function scv(...params) {
  const cvValue=cv(...params);
  return cvValue**2;
}

/**
 * Calculates the skewness of sample values.
 * @param  {...number} params Sample values
 * @returns Skewness
 */
function skewness(...params) {
  const n=params.length;
  const squaredSum=params.map(x=>x**2).reduce((a,b)=>a+b);
  const cubicSum=params.map(x=>x**3).reduce((a,b)=>a+b);
  const mean=math.mean(params);
  const std=math.std(params);
  if (n<3 || std==0.0) return 0;
  /* see https://en.wikipedia.org/wiki/Skewness */
  return n/(n-1)/(n-2)/Math.pow(std,3)*(cubicSum-3*mean*squaredSum+2*n*Math.pow(mean,3));
}

/**
 * Calculates the kurtosis of sample values.
 * @param  {...number} params Sample values
 * @returns Kurtosis
 */
function kurtosis(...params) {
  const n=params.length;
  const squaredSum=params.map(x=>x**2).reduce((a,b)=>a+b);
  const cubicSum=params.map(x=>x**3).reduce((a,b)=>a+b);
  const quarticSum=params.map(x=>x**4).reduce((a,b)=>a+b);
  const mean=math.mean(params);
  const std=math.std(params);
  if (n<4 || std==0.0) return 0;
  /* siehe: https://en.wikipedia.org/wiki/Kurtosis */
  const normDistComparision=3*Math.pow(n-1,2)/(n-2)/(n-3);
  return n*(n+1)/(n-1)/(n-2)/(n-3)/Math.pow(std,4)*(quarticSum-4*mean*cubicSum+6*Math.pow(mean,2)*squaredSum-3*n*Math.pow(mean,4))-normDistComparision;
}


/**
 * Calculates the geometric mean of sample values.
 * @param  {...number} params Sample values
 * @returns Geometric mean
 */
function geomean(...params) {
  if (params.filter(x<=0).length>0) return Number.NaN;
  const n=params.length;
  const prod=params.reduce((a,b)=>a*b,1);
  return Math.pow(prod,1/n);
}

/**
 * Calculates the harmonic mean of sample values.
 * @param  {...number} params Sample values
 * @returns Harmonic mean
 */
function harmonicmean(...params) {
  const n=params.length;
  if (params.filter(x=>x==0).length>0) return Number.NaN;
  const sumInv=params.map(x=>1/x).reduce((a,b)=>a+b);
  return n/sumInv;
}

/**
 * Calculates Eulers phi function value for the given number.
 * @param {number} num Number for which phi is to be calculated
 * @returns Eulers phi number
 */
function eulerphi(num) {
  if (typeof(num)!='number') return Number.NaN;
  const factors=factorize(BigInt(Math.round(num)));
  const collectedFactors=collectFactors(factors);
  return getPhi(collectedFactors);
}

function unitConvert(value, oldName, newName) {
  if (typeof(value)!='number') return Number.NaN;
  if (typeof(oldName)!='string') return Number.NaN;
  if (typeof(newName)!='string') return Number.NaN;

  oldName=oldName.toLowerCase();
  newName=newName.toLowerCase();

  let oldRecord=null;
  let newRecord=null;
  let oldTopicIndex=-1;
  let newTopicIndex=-1;

  const data=getConvertData();
  for (let i=0;i<data.length;i++) {
    const topic=data[i];
    for (let unit of topic) {
      if (oldRecord==null) {
        if (unit.name.toLowerCase()==oldName) {oldRecord=unit; oldTopicIndex=i;}
        if (unit.unit && unit.unit.toLowerCase()==oldName) {oldRecord=unit; oldTopicIndex=i;}
        if (unit.moreNames) for (let test of unit.moreNames) if (test.toLowerCase()==oldName) {oldRecord=unit; oldTopicIndex=i; break;}
      }
      if (newRecord==null) {
        if (unit.name.toLowerCase()==newName) {newRecord=unit; newTopicIndex=i;}
        if (unit.unit && unit.unit.toLowerCase()==newName) {newRecord=unit; newTopicIndex=i;}
        if (unit.moreNames) for (let test of unit.moreNames) if (test.toLowerCase()==newName) {newRecord=unit; newTopicIndex=i; break;}
      }
      if (oldRecord!=null && newRecord!=null) break;
    }
    if (oldRecord!=null && newRecord!=null) break;
  }

  if (oldRecord==null || newRecord==null) return Number.NaN;
  if (oldTopicIndex!=newTopicIndex) return Number.NaN;

  return convertValue(value,oldRecord,newRecord);
}

/**
 * Loads the MathJS extensions
 */
function loadMathJSExtensions() {
  if (typeof(math)=='undefined' || !math.import) {setTimeout(loadMathJSExtensions,100); return;}
  math.import({
    sqr: param=>param*param,
    ln: param=>math.log(param),
    lg: param=>math.log10(param),
    ld: param=>math.log2(param),
    binom: (n,k)=>binomDirect(n,k),
    binomial: (n,k)=>binomDirect(n,k),
    eye: n=>eye(n),
    //t: m=>math.transpose(m),
    // transpose([[1;2];[3;4]])
    sumx: sumX,
    prodx: prodX,
    integrate: integrate,
    trunc: trunc,
    int: roundInt,
    frac: frac,
    beta: betafn,
    lowerRegGamma: lowRegGamma, /* P(a,x) */
    upperRegGamma: (a,x)=>1-lowRegGamma(a,x), /* Q(a,x)=1-P(a,x) */
    cv: cv,
    scv: scv,
    geomean: geomean,
    harmonicmean: harmonicmean,
    skewness: skewness,
    kurtosis: kurtosis,
    eulerphi: eulerphi,
    erlangC_Pt: erlangC_Pt,
    erlangC_ENQ: erlangC_ENQ,
    erlangC_EN: erlangC_EN,
    erlangC_EW: erlangC_EW,
    erlangC_EV: erlangC_EV,
    extErlangC_Pt: extErlangC_Pt,
    extErlangC_ENQ: extErlangC_ENQ,
    extErlangC_EN: extErlangC_EN,
    extErlangC_EW: extErlangC_EW,
    extErlangC_EV: extErlangC_EV,
    extErlangC_PA: extErlangC_PA,
    AC_ENQ: AC_ENQ,
    AC_EN: AC_EN,
    AC_EW: AC_EW,
    AC_EV: AC_EV,
    convert: unitConvert,
  });
}

const decimalSeparatorReplace=new RegExp('\\,|\\;','g');

const bin=new RegExp("(binnumber\\()([01\.]+)(\\))",'i');
const oct=new RegExp("(octnumber\\()([0-7\.]+)(\\))",'i');
const hex=new RegExp("(hexnumber\\()([0-9a-f\.]+)(\\))",'i');

/**
 * Tries to find a number base conversion function and the process the base transformation.
 * @param {String} input Input to be evaluated
 * @param {RegExp} matcher Regular expression to be applied
 * @param {Number} base Base to be used for the parameter of the function
 * @returns Preprocessed input
 */
function preprocessBaseUnit(input, matcher, base) {
  const data=input.match(matcher);
  if (data==null) return input;

  const result=getFloatBase(data[2],base);
  if (result==null) return input;
  return input.substring(0,data.index)+result+input.substring(data.index+data[0].length);
}

/**
 * Preprocesses an input string before giving it to Math.evaluate(...).
 * @param {String} input Input to be evaluated
 * @returns Preprocessed input
 */
function preprocessInput(input) {
    input=input.replace(decimalSeparatorReplace,match=>match===','?'.':',');

    input=preprocessBaseUnit(input,bin,2);
    input=preprocessBaseUnit(input,oct,8);
    input=preprocessBaseUnit(input,hex,16);

    return input;
}

/**
 * Formats an evaluation result of MathJS.
 * @param result Result of math.evaluate(...).
 * @returns Result as string
 */
function formatMathResult(result) {
  /* Empty */
  if (typeof(result)=='undefined') return '';

  /* Function name */
  if (typeof(result)=='function') return '';

  /* Boolean */
  if (typeof(result)=='boolean') {
    return result?1:0;
  }

  /* Reel number */
  if (typeof(result)=='number') return formatNumber(result,12);

  /* Non-object / unknown format */
  if (typeof(result)!='object') return ""+result;

  /* Complex number */
  if (typeof(result.im)!='undefined') {
    const re=formatNumber(result.re,12);
    const im=formatNumber(result.im,12);
    /* Empty */
    if (re=='0' && im=='0') return '0';
    /* Imaginary only */
    if (re=='0') {
      if (im=='1') return "i";
      if (im=='-1') return "-i";
      return im+"i";
    }
    /* Reel only */
    if (im=='0') return re;
    /* Complex */
    if (im[0]=='-') {
      if (im=='-1') return re+"-i";
      return re+im+"i";
     } else {
       if (im=='1') return re+"+i";
      return re+"+"+im+"i";
     }
  }

  /* Eigenvectors */
  if (typeof(result.eigenvectors)=='object') {
    return result.eigenvectors.map(eig=>formatMathResult(eig.value)+": "+formatMathResult(eig.vector)).join("; ");
  }

  /* Matrix or vector */
  if (typeof(result.size)=='function') {
    const size=result.size();
    const arr=result.toArray();
    if (size.length==1) {
      /* Vector */
      return "["+arr.map(cell=>formatMathResult(cell)).join(";")+"]";
    }
    if (size.length==2) {
      /* Matrix */
      return "["+arr.map(row=>"["+row.map(cell=>formatMathResult(cell)).join(";")+"]").join(";")+"]";
    }
  }
  if (typeof(result.length)=='number') {
    return "["+result.map(cell=>formatMathResult(cell)).join(";")+"]";
  }

  /* Unknown object format */
  return ""+result;
}
