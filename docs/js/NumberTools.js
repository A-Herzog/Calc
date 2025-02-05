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

export {getFloat, getPositiveFloat, getNotNegativeFloat, getInt, getBigInt, getPositiveInt, getPositiveBigInt, getNotNegativeInt, formatNumber, formatNumberMax, formatNumberWithTitle, formatPercent, getDecimalSeparatorCharacter, getFloatBase}

/**
 * Parses a string to a floating point number
 * @param {string} str String to be parsed to a floating point number (decimal separator has to be ".")
 * @returns Floating point number or NaN, if the string could not be parsed to a floating point number
 */
function parseFloatStrict(str) {
  if(/^(\-|\+)?([0-9]+(\.[0-9]+)?|Infinity)$/.test(str)) return Number(str);
  return NaN;
}

/**
 * Parses a string to an integer number
 * @param {string} str String to be parsed to an integer number
 * @returns Integer number or NaN, if the string could not be parsed to an integer number
 */
function parseIntStrict(str) {
  if(/^(\-|\+)?([0-9]+|Infinity)$/.test(str)) return Number(str);
  return NaN;
}

/**
 * Parses a string to a BigInt
 * @param {string} str String to be parsed to an integer number
 * @returns BigInt or null, if the string could not be parsed to an integer number
 */
function parseBigIntStrict(str) {
  try {
    if(/^(\-|\+)?([0-9]+|Infinity)$/.test(str)) return BigInt(str);
  } catch (e) {
    return null;
  }
  return null;
}

/**
 * If the parameter is an object and has a "value" property, the content of this property is returned. Otherwise the parameter itself is returned.
 * @param {any} elementOrString Object with "value" property or String
 * @returns Content of the "value" property of (for example in case of a string) the parameter itself
 */
function getString(elementOrString) {
  if (typeof(elementOrString)=='object' && typeof(elementOrString.value)=='string') return elementOrString.value;
  return elementOrString;
}

/**
 * Parses a string or the content of a value attribute of a HTML element to a floating point number
 * @param {any} elementOrString HTML element with value property or a string
 * @returns Content as floating point number or null, if the content could not be parsed to a floating point number
 */
function getFloat(elementOrString) {
  let str=getString(elementOrString);
  if (typeof(str.replaceAll)=='function') str=str.replaceAll(",",".");
  const num=parseFloatStrict(str);
  if (isNaN(num)) return null;
  return num;
}

/**
 * Parses a string or the content of a value attribute of a HTML element to a floating point number
 * @param {any} elementOrString HTML element with value property or a string
 * @returns Content as floating point number or null, if the content could not be parsed to a positive floating point number
 */
function getPositiveFloat(elementOrString) {
  let result=getFloat(elementOrString);
  if (result==null || result<=0) return null;
  return result;
}

/**
 * Parses a string or the content of a value attribute of a HTML element to a floating point number
 * @param {any} elementOrString HTML element with value property or a string
 * @returns Content as floating point number or null, if the content could not be parsed to a non-negative floating point number
 */
function getNotNegativeFloat(elementOrString) {
  let result=getFloat(elementOrString);
  if (result==null || result<0) return null;
  return result;
}

/**
 * Parses a string or the content of a value attribute of a HTML element to an integer number
 * @param {any} elementOrString HTML element with value property or a string
 * @returns Content as integer number or null, if the content could not be parsed to an integer number
 */
function getInt(elementOrString) {
const str=getString(elementOrString);
const num=parseIntStrict(str);
if (isNaN(num)) return null;
return num;
}

/**
 * Parses a string or the content of a value attribute of a HTML element to a BigInt
 * @param {any} elementOrString HTML element with value property or a string
 * @returns Content as BigInt or null, if the content could not be parsed to an integer number
 */
function getBigInt(elementOrString) {
  const str=getString(elementOrString);
  const num=parseBigIntStrict(str);
  return num;
}

/**
 * Parses a string or the content of a value attribute of a HTML element to an integer number
 * @param {any} elementOrString HTML element with value property or a string
 * @returns Content as integer number or null, if the content could not be parsed to a positive integer number
 */
function getPositiveInt(elementOrString) {
  let result=getInt(elementOrString);
  if (result==null || result<=0) return null;
  return result;
}

/**
 * Parses a string or the content of a value attribute of a HTML element to a BigInt
 * @param {any} elementOrString HTML element with value property or a string
 * @returns Content as BigInt or null, if the content could not be parsed to a positive integer number
 */
function getPositiveBigInt(elementOrString) {
  let result=getBigInt(elementOrString);
  if (result==null || result<=0) return null;
  return result;
}

/**
 * Parses a string or the content of a value attribute of a HTML element to an integer number
 * @param {any} elementOrString HTML element with value property or a string
 * @returns Content as integer number or null, if the content could not be parsed to a non-negative integer number
 */
function getNotNegativeInt(elementOrString) {
  let result=getInt(elementOrString);
  if (result==null || result<0) return null;
  return result;
}

/**
 * Formats a number as a local string.
 * @param {Number} number Number to be formatted
 * @param {Number} digits Maximum number of decimal digits to use (if missing: use locale default value)
 * @returns Formatted number
 */
function formatNumber(number, digits) {
  if (typeof(digits)=='undefined') return number.toLocaleString(undefined, {useGrouping: false});

  let usedDigits=0;
  let x=number%1;
  while (x!=0 && usedDigits<digits) {
    x*=10;
    x=x%1;
    usedDigits++;
  }

  let str=number.toLocaleString(undefined, {minimumFractionDigits: usedDigits, useGrouping: false});
  if (str.indexOf(".")>=0 || str.indexOf(",")>=0) {
    while (str[str.length-1]=='0') str=str.substring(0,str.length-1);
    if (str[str.length-1]=='.' || str[str.length-1]==',') str=str.substring(0,str.length-1);
  }

  if (str=='-0') str='0';

  return str;
}

/**
 * Formats a number as a local string with maximum number of digits.
 * @param {Number} number Number to be formatted
 * @returns Formatted number
 */
function formatNumberMax(number) {
  return formatNumber(number,14);
}

/**
 * Formats a number as a local string and returns a string containing a HTML span
 * containing the number and a title attribute with more digits.
 * @param {Number} number Number to be formatted
 * @param {Number} digits Maximum number of decimal digits to use (if missing: use locale default value)
 * @returns Formatted number
 */
function formatNumberWithTitle(number, digits) {
  return "<span title='"+formatNumber(number,8)+"'>"+formatNumber(number,digits)+"</span>";
}

/**
 * Formats a number as a local string percent value.
 * @param {Number} number Number to be formatted
 * @param {Number} digits Maximum number of decimal digits to use (if missing: use locale default value)
 * @returns Formatted number
 */
function formatPercent(number, digits) {
  return formatNumber(number*100,digits)+"%";
}

/**
 * Returns the language default decimal separator character
 * @returns Language default decimal separator character
 */
function getDecimalSeparatorCharacter() {
    const n=1.1;
    return n.toLocaleString().substring(1,2);
}

/**
 * Parses a string to a floating point number
 * @param {String} str String to be parsed
 * @param {Number}  Base for the number in the string (for example 16 to interpret a hexdecimal string)
 * @returns Content as floating point number (with base 10) or null, if the content could not be parsed
 */
function getFloatBase(str, base) {
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
