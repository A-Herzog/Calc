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

export {buildExpressions, getSymbolCount};

import {language} from './Language.js';
import {formatNumberMax} from './NumberTools.js';
import {getDistributions} from './MathJSDistributionTools.js';


const iconConst="123";
const iconBasic="calculator";
const iconRounding="arrow-down-up";
const iconTrigonometric="triangle";
const iconComplex="info-circle";
const iconStatistics="bar-chart";
const iconVector="table";
const iconStochastic="dice-6";
const iconLogic="shuffle";
const iconFunction="graph-up";
const iconNumeric="tools";
const iconSymbolic="puzzle";

const symbols=new Set();

function buildGroup(languageBase, icon, data) {
    const list=[];
    for (let record of data) {
      if (record.isGroup) {
        list.push(record);
        continue;
      }
      const entry={};
      if (!record.name) {
        record.name=languageBase[record.data].name;
        record.info=languageBase[record.data].info;
      }
      entry.name=record.name+" (<tt>"+record.symbol+"</tt>)";
      entry.info="<p><strong>"+language.expressionBuilder.labelExpression+":</strong></p><p><tt>"+(record.full?record.full:record.symbol)+"</tt></p><p><strong>"+language.expressionBuilder.labelDescription+":</strong></p><p>"+record.info+"</p>";
      if (record.examples && record.examples.length>0) {
        entry.info+="<p><strong>"+((record.examples.length>1)?language.expressionBuilder.labelExamples:language.expressionBuilder.labelExample)+":</strong></p>";
        entry.info+="<p><tt>"+record.examples.join("</tt><br><tt>")+"</tt></p>";
      }
      entry.icon=(!record.icon)?icon:record.icon;
      entry.symbol=record.full?record.full:record.symbol;
      entry.full=record.full?record.full:record.symbol;
      list.push(entry);
      symbols.add(record.symbol);
    }
    return {name: languageBase.name, list: list, isGroup: true};
}

function buildParameterInfoText(record) {
  let info="";

  if (record.discrete) {
    if (record.hasMinValue) info=record.id+"&ge;"+record.minValue; else info=language.expressionBuilder.stochastics.setZ;
  } else {
    if (!record.hasMinValue && !record.hasMaxValue) info=language.expressionBuilder.stochastics.setR; else {
      if (record.hasMinValue) {
        info+=formatNumberMax(record.minValue);
        if(record.minValueInclusive) info+="&le;"; else info+="&lt;";
      }
      info+=record.id;
      if (record.hasMaxValue) {
        if(record.maxValueInclusive) info+="&le;"; else info+="&lt;";
        info+=formatNumberMax(record.maxValue);
      }
    }
  }
  return "<li><tt>"+record.id+"</tt>: "+info+"</li>";
}

function generateProbabilityDistributionsRecords(distributions) {
  const list=[];

  for (let distribution of distributions) {
    const parameters=distribution.parameterInfo.map(p=>p.id).join(";");
    const semicolonParameters=(parameters=='')?'':(';'+parameters);
    const parameterTexts=distribution.parameterInfo.map(p=>buildParameterInfoText(p)).join("");

    const group=[
      {
        name: (distribution.isDiscrete?language.expressionBuilder.stochastics.pdfDiscreteName:language.expressionBuilder.stochastics.pdfName)+" (<tt>"+distribution.name+"_pdf</tt>)",
        info:
          "<p><strong>"+language.expressionBuilder.labelExpression+":</strong></p>"+
          "<p><tt>"+distribution.name+"_pdf(x"+semicolonParameters+")</tt></p>"+
          "<p><strong>"+language.expressionBuilder.labelDescription+":</strong></p>"+
          "<p>"+(distribution.isDiscrete?language.expressionBuilder.stochastics.pdfDiscreteInfo:language.expressionBuilder.stochastics.pdfInfo)+"</p>"+
          "<ul>"+
          "<li><tt>x</tt>: "+language.expressionBuilder.stochastics.pdfParameterX+"</li>"+
          parameterTexts+
          "</ul>",
        full: distribution.name+"_pdf(x"+semicolonParameters+")",
        symbol: distribution.name+"_pdf(x"+semicolonParameters+")"
      },
      {
        name: language.expressionBuilder.stochastics.cdfName+" (<tt>"+distribution.name+"_cdf</tt>)",
        info:
          "<p><strong>"+language.expressionBuilder.labelExpression+":</strong></p>"+
          "<p><tt>"+distribution.name+"_cdf(x"+semicolonParameters+")</tt></p>"+
          "<p><strong>"+language.expressionBuilder.labelDescription+":</strong></p>"+
          "<p>"+language.expressionBuilder.stochastics.cdfInfo+"</p>"+
          "<ul>"+
          "<li><tt>x</tt>: "+language.expressionBuilder.stochastics.cdfParameterX+"</li>"+
          parameterTexts+
          "</ul>",
        full: distribution.name+"_cdf(x"+semicolonParameters+")",
        symbol: distribution.name+"_cdf(x"+semicolonParameters+")"
      },
      {
        name: language.expressionBuilder.stochastics.randomName+" (<tt>"+distribution.name+"_random</tt>)",
        info:
          "<p><strong>"+language.expressionBuilder.labelExpression+":</strong></p>"+
          "<p><tt>"+distribution.name+"_random("+parameters+")</tt></p>"+
          "<p><strong>"+language.expressionBuilder.labelDescription+":</strong></p>"+
          "<p>"+language.expressionBuilder.stochastics.randomInfo+"</p>"+
          "<ul>"+
          parameterTexts+
          "</ul>",
        full: distribution.name+"_random("+parameters+")",
        symbol: distribution.name+"_random("+parameters+")"
      }
    ];
    symbols.add(distribution.name+"_pdf");
    symbols.add(distribution.name+"_cdf");
    symbols.add(distribution.name+"_random");
    list.push({name: distribution.displayName, list: group, isGroup: true});
  }

  return list;
}

/**
 * Builds the expression builder data tree structure.
 * @returns Expression builder symbols
 */
function buildExpressions() {
  const expressions=[];

  /* Consts */
  expressions.push(buildGroup(language.expressionBuilder.consts,iconConst,[
    {symbol: "pi", data: "pi"},
    {symbol: "tau", data: "tau"},
    {symbol: "e", data: "e"},
    {symbol: "phi", data: "phi"},
    {symbol: "i", data: "i"}
  ]));

  /* Basic calculations */
  expressions.push(buildGroup(language.expressionBuilder.basic,iconBasic,[
    {symbol: "+", full: "a+b", data: "plus"},
    {symbol: "-", full: "a-b", data: "minus"},
    {symbol: "*", full: "a*b", data: "multiply"},
    {symbol: "/", full: "a/b", data: "divide"},
    {symbol: "^", full: "a^b", data: "power"},
    {symbol: "mod", full: "mod(a;b)", data: "modulo", examples: ["mod(5;3)=2","mod(-5;3)=1","mod("+formatNumberMax(1.5)+";1)="+formatNumberMax(0.5)]}
  ]));

  /* Rounding */
  expressions.push(buildGroup(language.expressionBuilder.rounding,iconRounding,[
    {symbol: "round", full: "round(x;n)", data: "round", examples: ["round("+formatNumberMax(-3.5)+")=-4","round("+formatNumberMax(-3.4)+")=-3","round(3)=3","round("+formatNumberMax(3.4)+")=3","round("+formatNumberMax(3.5)+")=4","round("+formatNumberMax(1.234)+";2)="+formatNumberMax(1.23)]},
    {symbol: "floor", full: "floor(x)", data: "floor", examples: ["floor("+formatNumberMax(-3.5)+")=-4","floor("+formatNumberMax(-3.4)+")=-4","floor(3)=3","floor("+formatNumberMax(3.4)+")=3","floor("+formatNumberMax(3.5)+")=3"]},
    {symbol: "ceil", full: "ceil(x)", data: "ceil", examples: ["ceil("+formatNumberMax(-3.5)+")=-3","ceil("+formatNumberMax(-3.4)+")=3","ceil(3)=3","ceil("+formatNumberMax(3.4)+")=4","ceil("+formatNumberMax(3.5)+")=4"]},
    {symbol: "trunc", full: "trunc(x)", data: "trunc", examples: ["trunc("+formatNumberMax(-3.5)+")=-3","trunc("+formatNumberMax(-3.4)+")=-3","trunc(3)=3","trunc("+formatNumberMax(3.4)+")=3","trunc("+formatNumberMax(3.5)+")=3"]}
  ]));

  /* Mathematical functions */
  expressions.push(buildGroup(language.expressionBuilder.functions,iconBasic,[
    {symbol: "pow", full: "pow(a;b)", data: "pow"},
    {symbol: "abs", full: "abs(x)", data: "abs", examples: ["abs(3)=3","abs(-5)=5", "abs(0)=0", "abs("+formatNumberMax(0.5)+")="+formatNumberMax(0.5)]},
    {symbol: "sign", full: "sign(x)", data: "sign", examples: ["sign(-3)=-1","sign(0)=0","sign(5)=1"]},
    {symbol: "inv", full: "inv(x)", data: "inv", examples: ["inv(2)=0.5"]},
    {symbol: "sqr", full: "sqr(x)", data: "sqr", examples: ["sqr(3)=9", "sqr(-2)=4"]},
    {symbol: "cube", full: "cube(x)", data: "cube", examples: ["cube(3)=27", "cube(-3)=-27"]},
    {symbol: "sqrt", full: "sqrt(x)", data: "sqrt", examples: ["sqrt(4)=2","sqrt(-1)=i"]},
    {symbol: "cbrt", full: "cbrt(x)", data: "cbrt", examples: ["sqrt(27)=3", "sqrt(-27)-3"]},
    {symbol: "exp", full: "exp(x)", data: "exp", examples: ["exp(1)=e", "exp(0)=1", "exp(2)=e^2"]},
    {symbol: "log", full: "log(a;b)", data: "log", examples: ["log(3^5;3)=5","log(1;3)=0","log(e)=1"]},
    {symbol: "ln", full: "ln(x)", data: "ln", examples: ["ln(e^3)=3"]},
    {symbol: "lg", full: "lg(x)", data: "lg", examples: ["lg(10^3)=3"]},
    {symbol: "ld", full: "ld(x)", data: "ld", examples: ["ld(2^3)=3"]},
    {symbol: "int", full: "int(x)", data: "int", examples: ["int("+formatNumberMax(-3.5)+")=-3","int("+formatNumberMax(-3.4)+")=-3","int(3)=3","int("+formatNumberMax(3.4)+")=3","int("+formatNumberMax(3.5)+")=3"]},
    {symbol: "frac", full: "frac(x)", data: "frac", examples: ["frac("+formatNumberMax(-3.5)+")=-"+formatNumberMax(0.5),"frac("+formatNumberMax(-3.4)+")=-"+formatNumberMax(0.4),"frac(3)=3","frac("+formatNumberMax(3.4)+")="+formatNumberMax(0.4),"frac("+formatNumberMax(3.5)+")="+formatNumberMax(0.5)]},
    {symbol: "!", full: "x!", data: "factorial", examples: ["3!=6","1!=1","0!=1"]},
    {symbol: "binom", full: "binom(n;k)", data: "binomial", examples: ["binom(5;0)=1","binom(5;1)=5","binom(5;2)=10","binom(5;4)=4"]},
    {symbol: "gcd", full: "gcd(a;b;...)", data: "gcd", examples: ["gcd(2*3*5;2*5;2*3)=2"]},
    {symbol: "lcm", full: "lcm(a;b;...)", data: "lcm", examples: ["lcm(2*3;3*5)=2*3*5"]},
    {symbol: "gamma", full: "gamma(x)", data: "gamma", examples: ["gamma(3+1)=6=3!"]},
    {symbol: "lgamma", full: "lgamma(x)", data: "lgamma", examples: ["lgamma(3+1)=log(6)=log(3!)"]},
    {symbol: "lowerRegGamma", full: "lowerRegGamma(s,x)", data: "lowerRegGamma"},
    {symbol: "upperRegGamma", full: "upperRegGamma(s,x)", data: "upperRegGamma"},
    {symbol: "beta", full: "beta(x,y)", data: "beta"},
    {symbol: "zeta", full: "zeta(x)", data: "zeta"},
    {symbol: "erf", full: "erf(x)", data: "erf"},
    {symbol: "isPrime", full: "isPrime(n)", data: "isPrime", examples: ["isPrime(10007)=1","isPrime(2*3*5)=0"]},
    {symbol: "eulerphi", full: "eulerphi(n)", data: "eulerphi", examples: ["eulerphi(17)=16","eulerphi(100)=40"]}
  ]));

  /* Trigonometric functions */
  expressions.push(buildGroup(language.expressionBuilder.trigonometric,iconTrigonometric,[
    {symbol: "sin", full: "sin(x)", data: "sin", examples: ["sin(0)=0","sin(pi/2)=1"]},
    {symbol: "cos", full: "cos(x)", data: "cos", examples: ["cos(0)=1","cos(pi/2)=0"]},
    {symbol: "tan", full: "tan(x)", data: "tan", examples: ["tan(0)=0"]},
    {symbol: "cot", full: "cot(x)", data: "cot", examples: ["cot(pi/2)=0"]},
    {symbol: "asin", full: "asin(x)", data: "asin"},
    {symbol: "acos", full: "acos(x)", data: "acos"},
    {symbol: "atan", full: "atan(x)", data: "atan"},
    {symbol: "acot", full: "acot(x)", data: "acot"},
    {symbol: "sinh", full: "sinh(x)", data: "sinh"},
    {symbol: "cosh", full: "cosh(x)", data: "cosh"},
    {symbol: "tanh", full: "tanh(x)", data: "tanh"},
    {symbol: "coth", full: "coth(x)", data: "coth"},
    {symbol: "asinh", full: "asinh(x)", data: "asinh"},
    {symbol: "acosh", full: "acosh(x)", data: "acosh"},
    {symbol: "atanh", full: "atanh(x)", data: "atanh"},
    {symbol: "acoth", full: "acoth(x)", data: "acoth"}
  ]));

  /* Number systems */
  expressions.push(buildGroup(language.expressionBuilder.numberSystems,iconConst,[
    {symbol: "binnumber", full: "binnumber(x)", data: "binnumber", examples: ["binnumber(10)=2","binnumber("+formatNumberMax(1.1)+")="+formatNumberMax(1.5)]},
    {symbol: "octnumber", full: "octnumber(x)", data: "octnumber", examples: ["octnumber(10)=8","octnumber("+formatNumberMax(1.4)+")="+formatNumberMax(1.5)]},
    {symbol: "hexnumber", full: "hexnumber(x)", data: "hexnumber", examples: ["hexnumber(10)=16","hexnumber(f)=15"]},
    {symbol: "bin", full: "bin(x)", data: "bin", examples: ["bin(3)=0b11"]},
    {symbol: "oct", full: "oct(x)", data: "oct", examples: ["oct(9)=0o11"]},
    {symbol: "hex", full: "hex(x)", data: "hex", examples: ["hex(31)=0h1f"]}
  ]));

  /* Complex numbers */
  expressions.push(buildGroup(language.expressionBuilder.complex,iconComplex,[
    {symbol: "i", data: "i", icon: iconConst},
    {symbol: "complex", full: "complex(x;y)", data: "complex", examples: ["complex(3;5)=3+5i"]},
    {symbol: "re", full: "re(x)", data: "re", examples: ["re(3+5i)=3"]},
    {symbol: "im", full: "im(x)", data: "im", examples: ["im(3+5i)=5"]},
    {symbol: "conj", full: "conj(x)", data: "conj", examples: ["conj(3+5i)=3-5i"]},
    {symbol: "arg", full: "arg(x)", data: "arg", examples: ["arg(1+i)=pi/4"]}
  ]));

  /* Statistics functions */
  expressions.push(buildGroup(language.expressionBuilder.statistics,iconStatistics,[
    {symbol: "min", full: "min(a;b;c;...)", data: "min", examples: ["min(1;2;3;4)=1"]},
    {symbol: "max", full: "max(a;b;c;...)", data: "max", examples: ["max(1;2;3;4)=4"]},
    {symbol: "sum", full: "sum(a;b;c;...)", data: "sum", examples: ["sum(1;2;3;4)=10"]},
    {symbol: "cumsum", full: "cumsum(a;b;c;...)", data: "cumsum", examples: ["cumsum(1;2;3;4)=[1;3;6;10]"]},
    {symbol: "mean", full: "mean(a;b;c;...)", data: "mean", examples: ["mean(1;2;3;4)="+formatNumberMax(2.5)]},
    {symbol: "geomean", full: "geomean(a;b;c;...)", data: "geomean", examples: ["geomean(1;2)&approx;"+formatNumberMax(Math.sqrt(2))]},
    {symbol: "harmonicmean", full: "harmonicmean(a;b;c;...)", data: "harmonicmean", examples: ["harmonicmean(5;20)=8"]},
    {symbol: "std", full: "std(a;b;c;...)", data: "std", examples: ["std(1;2;3)=1","std(1;3;5)=2"]},
    {symbol: "variance", full: "variance(a;b;c;...)", data: "variance", examples: ["variance(1;2;3)=1","variance(1;3;5)=4"]},
    {symbol: "median", full: "median(a;b;c;...)", data: "median", examples: ["median(1;2;10)=2","median(1;2;4;10)=3"]},
    {symbol: "cv", full: "cv(a;b;c;...)", data: "cv", examples: ["cv(1;2;3)="+formatNumberMax(0.5)+"=std(1;2;3)/mean(1;2;3)=1/2","cv(1;3;5)&approx;"+formatNumberMax(2/3)+"&approx;std(1;3;5)/mean(1;3;5)=2/3"]},
    {symbol: "scv", full: "scv(a;b;c;...)", data: "scv", examples: ["scv(1;2;3)="+formatNumberMax(0.25)+"=variance(1;2;3)/(mean(1;2;3))^2=1/2^2","scv(1;3;5)&approx;"+formatNumberMax(4/9)+"&approx;variance(1;3;5)/(mean(1;3;5))^2=4/3^2"]},
    {symbol: "skewness", full: "skewness(a;b;c;...)", data: "skewness"},
    {symbol: "kurtosis", full: "kurtosis(a;b;c;...)", data: "kurtosis"}
  ]));

  /* Stochastic functions */
  expressions.push(buildGroup(language.expressionBuilder.stochastics,iconStochastic,[
    {symbol: "random", full: "random(a;b)", data: "random",  examples: ["random()","random(0;"+formatNumberMax(7.5)+")"]},
    {symbol: "randomInt", full: "randomInt(a;b)", data: "randomInt", examples: ["randomInt(0;10)"]},
    buildGroup(language.expressionBuilder.stochastics.discrete,iconFunction,generateProbabilityDistributionsRecords(getDistributions().filter(dist=>dist.isDiscrete).sort((d1,d2)=>d1.displayName.localeCompare(d2.displayName)))),
    buildGroup(language.expressionBuilder.stochastics.continuous,iconFunction,generateProbabilityDistributionsRecords(getDistributions().filter(dist=>!dist.isDiscrete).sort((d1,d2)=>d1.displayName.localeCompare(d2.displayName)))),
    buildGroup(language.expressionBuilder.stochastics.erlangC,iconFunction,[
      {symbol: "erlangC_Pt", full: "erlangC_Pt(lambda;mu;c;t)", data: "erlangC_Pt"},
      {symbol: "erlangC_ENQ", full: "erlangC_ENQ(lambda;mu;c)", data: "erlangC_ENQ"},
      {symbol: "erlangC_EN", full: "erlangC_EN(lambda;mu;c)", data: "erlangC_EN"},
      {symbol: "erlangC_EW", full: "erlangC_EW(lambda;mu;c)", data: "erlangC_EW"},
      {symbol: "erlangC_EV", full: "erlangC_EV(lambda;mu;c)", data: "erlangC_EV"}
    ]),
    buildGroup(language.expressionBuilder.stochastics.extErlangC,iconFunction,[
      {symbol: "extErlangC_Pt", full: "extErlangC_Pt(lambda;mu;nu;c;K;t)", data: "extErlangC_Pt"},
      {symbol: "extErlangC_ENQ", full: "extErlangC_ENQ(lambda;mu;nu;c;K)", data: "extErlangC_ENQ"},
      {symbol: "extErlangC_EN", full: "extErlangC_EN(lambda;mu;nu;c;K)", data: "extErlangC_EN"},
      {symbol: "extErlangC_EW", full: "extErlangC_EW(lambda;mu;nu;c;K)", data: "extErlangC_EW"},
      {symbol: "extErlangC_EV", full: "extErlangC_EV(lambda;mu;nu;c;K)", data: "extErlangC_EV"},
      {symbol: "extErlangC_PA", full: "extErlangC_PA(lambda;mu;nu;c;K)", data: "extErlangC_PA"}
    ]),
    buildGroup(language.expressionBuilder.stochastics.AC,iconFunction,[
      {symbol: "AC_ENQ", full: "AC_ENQ(lambda;mu;CVI;CVS;c)", data: "AC_ENQ"},
      {symbol: "AC_EN", full: "AC_EN(lambda;mu;CVI;CVS;c)", data: "AC_EN"},
      {symbol: "AC_EW", full: "AC_EW(lambda;mu;CVI;CVS;c)", data: "AC_EW"},
      {symbol: "AC_EV", full: "AC_EV(lambda;mu;CVI;CVS;c)", data: "AC_EV"}
    ]),
  ]));

  /* Logic functions */
  expressions.push(buildGroup(language.expressionBuilder.logic,iconLogic,[
    {symbol: "and", full: "and(a;b;c;...)", data: "and", examples: ["and(0;0)=0","and(0;1)=0","and(1;0)=1","and(1;1)=1","and(1;2)=1","and(1;1;1)=1","and(1;0;1)=0"]},
    {symbol: "not", full: "not(x)", data: "not", examples: ["not(1)=0","not(2)=0","not(0)=1"]},
    {symbol: "or", full: "or(a;b;c;...)", data: "or", examples: ["or(0;0)=0","or(0;1)=1","or(1;0)=1","or(1;1)=1","or(1;2)=1","or(0;0;0)=0","or(0;0;1)=1"]},
    {symbol: "xor", full: "xor(a;b)", data: "xor", examples: ["xor(0;0)=0","xor(0;1)=1","xor(1;0)=1","xor(1;1)=0","xor(0;2)=1"]},
  ]));

  /* Vector and matrix functions */
  expressions.push(buildGroup(language.expressionBuilder.vector,iconVector,[
    {symbol: "zeros", full: "zeros(m;n)", data: "zeros",  examples: ["zeros(2)=[0;0]","zeros(2;3)=[[0;0;0];[0;0;0]]"]},
    {symbol: "ones", full: "ones(m;n)", data: "ones",  examples: ["ones(2)=[1;1]","ones(2;3)=[[1;1;1];[1;1;1]]"]},
    {symbol: "eye", full: "eye(n)", data: "eye",  examples: ["eye(3)=[[1;0;0];[0;1;0];[0;0;1]]"]},
    {symbol: "t", full: "t(matrix)", data: "t",  examples: ["t([[1;2];[3;4]])=[[1;3];[2;4]]"]},
    {symbol: "size", full: "size(matrix)", data: "size",  examples: ["size([1;2])=[2]","size([[1;2;3];[4;5;6]])=[2;3]"]},
    {symbol: "range", full: "range(a;b;c)", data: "range",  examples: ["range(1;7;2)=[1;3;5;7]"]},
    {symbol: "trace", full: "trace(matrix)", data: "trace",  examples: ["trace([[1;2];[3;4]])=5"]},
    {symbol: "dotMuliply", full: "dotMuliply(A;B)", data: "dotMuliply", examples: ["dotMuliply([1;2];[3;4])=[3;8]"]},
    {symbol: "dotDivide", full: "dotDivide(A;B)", data: "dotDivide", examples: ["dotDivide([6;8];[2;4])=[3;2]"]},
    {symbol: "dotPow", full: "dotPow(A;B)", data: "dotPow", examples: ["dotPow([2;2];[2;3])=[4;8]"]},
    {symbol: "cross", full: "cross(A;B)", data: "cross", examples: ["cross([1;1;0];[0;1;1])=[1;-1;1]","cross([3;-3;1];[4;9;2])=[-15;-2;39]","cross([2;3;4]; [5;6;7])=[-3;6;-3]"]},
    {symbol: "inv", full: "inv(matrix)", data: "inv", examples: [" inv([[1;2];[3;4]])=[[-2;1];["+formatNumberMax(1.5)+";-"+formatNumberMax(0.5)+"]] "]},
    {symbol: "diag", full: "diag(A)", data: "diag", examples: ["diag([1;2;3])=[[1;0;0];[0;2;0];[0;0;3]]","diag([[1;2;3];[4;5;6];[7;8;9]])=[1;5;7]"]},
    {symbol: "det", full: "det(matrix)", data: "det", examples: ["det([[1;2];[3;4]])=-2","det([[1;2;3];[4;5;6];[7;8;9]])=0"]},
    {symbol: "eigs", full: "eigs(matrix)", data: "eigs", examples: ["eigs([[5;"+formatNumberMax(2.3)+"];["+formatNumberMax(2.3)+";1]])"]},
    {symbol: "lusolve", full: "lusolve(M;b)", data: "lusolve", examples: ["lusolve([[-2;3];[2;1]];[[11];[9]])=[[2];[5]]"]}
  ]));

  /* Functions that require numerical calculation */
  expressions.push(buildGroup(language.expressionBuilder.numericCalculations,iconNumeric,[
    {symbol: "sumx", full: "sumx('Term';'variable';a;b)", data: "sumx", examples: ["sumx('x^2';'x';1;10)=385"]},
    {symbol: "prodx", full: "prodx('Term';'variable';a;b)", data: "prodx", examples: ["prodx('x';'x';1;10)('x';'x';1;10)=3628800=10!"]},
    {symbol: "integrate", full: "integrate('Term';'variable';a;b)", data: "integrate", examples: ["integrate('x^2';'x';0;10)&approx;"+formatNumberMax(333+1/3)]}
  ]));

  /* Symbolic calculations */
  expressions.push(buildGroup(language.expressionBuilder.symbolic,iconSymbolic,[
    {symbol: "simplify", full: "simplify('Term')", data: "simplify",  examples: ["simplify('x+x')='2*x'"]},
    {symbol: "derivative", full: "derivative('Term';'variable')", data: "derivative",  examples: ["derivative('x^2';'x')='2*x'"]}
  ]));

  return expressions;
}

/**
 * Returns the number of symbols in the expression builder.<br>
 * Has to be called after <tt>buildExpressions()</tt>
 * @see buildExpressions
 * @returns Number of symbols in the expression builder
 */
function getSymbolCount() {
  return symbols.size;
}
