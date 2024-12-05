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

export {gaussianRandomPolar, zeta, distributions, loadMathJSDistributionExtensions}

import {formatNumber} from './NumberTools.js';
import {binomDirect as mathBinom} from './MathJSTools.js';
import {factorial, gammafn, lowRegGamma, gammap, betafn, betaln, ibeta, erf, erfc} from '../libs/jstat-special.js';


/**
 * Calculates the value of the Zeta function for an real, positive argument.
 * @param {Number} s Argument of the Zeta function (has to be &gt;0)
 * @returns Zeta(s)
 */
function zeta(s) {
  let z=0;
  let n=1;
  const minusS=-s;
  if (s<1.8) {
    while (n<5_000_000) {
      z+=Math.pow(n,minusS);
      n++;
    }
  } else {
    while (n<5_000_000) {
		  const add=Math.pow(n,minusS);
      z+=add;
      if (add<1E-12) break;
      n++;
    }
  }
  return z;
}


let polarSpare;
let polarHasSpare=false;

/**
 * Generates a gaussian distributed pseudo random number via the polar method
 * @param {Number} mean Mean (defaults to 0)
 * @param {Number} std Standard deviation (defaults to 1)
 * @returns Gaussian distributed pseudo random number
 */
function gaussianRandomPolar(mean=0, std=1) {
  if (polarHasSpare) {polarHasSpare=false; return polarSpare*std+mean;}

  let u, v, s;
  do {
    u=Math.random()*2-1;
    v=Math.random()*2-1;
    s=u**2+v**2;
  } while (s>= 1 || s==0);
  s=Math.sqrt(-2*Math.log(s)/s);
  polarSpare=v*s;
  polarHasSpare=true;
  return mean+std*u*s;
}


/**
 * Base class for calculating pdf, cdf and random numbers of continuous probability distributions
 */
class ContinuousProbabilityDistribution {
  #name;
  #displayName;
  #discrete;
  #parameters=[];

  /**
   * Constructor
   * @param {String} name Calculation function base name
   * @param {String} displayName  Optional name to be displayed
   * @param {Boolean} discrete Is this a discrete probability distribution (default to false)
   */
  constructor(name, displayName=null, discrete=false) {
    this.#name=name;
    this.#displayName=(displayName==null)?name:displayName;
    this.#discrete=discrete;
  }

  /**
   * Adds a discrete valued parameter to the editor for the probability distribution
   * @param {String} id Internal id for the parameter
   * @param {Number} minValue Minimum value (typical 0 or 1)
   */
  _addDiscreteParameter(id, minValue) {
    this.#parameters.push({
      id: id,
      discrete: true,
      hasMinValue: (minValue!=null),
      minValue: minValue,
      minValueInclusive: true,
      hasMaxValue: false
    });
  }

  /**
   * Adds a discrete valued parameter to the editor for the probability distribution
   * @param {String} id Internal id for the parameter
   * @param {Number} minValue Minimum value (typical 0 or 1)
   * @param {Number} maxValue Maximum value
   */
  _addDiscreteParameterMinMax(id, minValue, maxValue) {
    this.#parameters.push({
      id: id,
      discrete: true,
      hasMinValue: (minValue!=null),
      minValue: minValue,
      minValueInclusive: true,
      hasMaxValue: (maxValue!=null),
      maxValue: maxValue,
      maxValueInclusive: true
    });
  }

  /**
   * Adds a continuous valued parameter to the editor for the probability distribution
   * @param {String} id Internal id for the parameter
   * @param {Number} minValue Minimum value (can be null for no minimum)
   * @param {Boolean} minValueInclusive Is the specified minimum a valid value?
   * @param {Number} maxValue Maximum value (can be null for no maximum)
   * @param {Boolean} maxValueInclusive Is the specified maximum a valid value?
   */
  _addContinuousParameter(id, minValue, minValueInclusive, maxValue, maxValueInclusive) {
    this.#parameters.push({
      id: id,
      discrete: false,
      hasMinValue: (minValue!==null),
      minValue: minValue,
      minValueInclusive: minValueInclusive,
      hasMaxValue: (maxValue!==null),
      maxValue: maxValue,
      maxValueInclusive: maxValueInclusive
    });
  }

  #prepareParameters(parameters) {
    if (parameters.length!=this.#parameters.length) throw new Error(this.#parameters.length+" parameters expected but "+parameters.length+" given.");

    const values={};
    for (let i=0;i<parameters.length;i++) {
      const setup=this.#parameters[i];
      const value=parameters[i];
      if (setup.discrete && value%1!=0) throw new Error(setup.id+" has to be an integer but is "+formatNumber(value));
      if (setup.hasMinValue) {
        if (setup.minValueInclusive) {
          if (value<setup.minValue) throw new Error(setup.id+" has to be >="+formatNumber(setup.minValue)+" but is "+formatNumber(value));
        } else {
          if (value<=setup.minValue) throw new Error(setup.id+" has to be >"+formatNumber(setup.minValue)+" but is "+formatNumber(value));
        }
      }
      if (setup.hasMaxValue) {
        if (setup.maxValueInclusive) {
          if (value>setup.maxValue) throw new Error(setup.id+" has to be <="+formatNumber(setup.maxValue)+" but is "+formatNumber(value));
        } else {
          if (value>=setup.maxValue) throw new Error(setup.id+" has to be <"+formatNumber(setup.maxValue)+" but is "+formatNumber(value));
        }
      }
      values[setup.id]=value;
    }

    return values;
  }

  #getPDFWithChecks(x,parameters) {
    if (this.#discrete && x%1!=0) return 0;
    const values=this.#prepareParameters(parameters);
    this._checkParameters(values);
    return this._getPDF(values,x);
  }

  #getCDFWithChecks(x,parameters) {
    if (this.#discrete) x=Math.floor(x);
    const values=this.#prepareParameters(parameters);
    this._checkParameters(values);
    return this._getCDF(values,x);
  }

  #getRandomWithChecks(parameters) {
    const values=this.#prepareParameters(parameters);
    this._checkParameters(values);
    return this._getRandomNumber(values);
  }

  /**
   * Optional additional parameter checks
   * @param {Object} values Object containing the values of the parameters
   */
  _checkParameters(values) {}

  /**
   * Generates a pseudo random number for the probability distribution
   * @param {Object} values Object containing the values of the parameters
   * @returns Pseudo random number
   */
  _getRandomNumber(values) {
    const limits=10_000_000;
    let a=-limits;
    let b=limits;

    const u=Math.random();
    if (this._getCDF(values,a)>u) return a;
    if (this._getCDF(values,b)<u) return b;
    while (b-a>0.001) {
      const m=(a+b)/2;
      const value=this._getCDF(values,m);
      if (value>u) b=m; else a=m;
    }

    return (a+b)/2;
  }

  /**
   * Is this a discrete distribution?
   */
  get isDiscrete() {
    return this.#discrete;
  }

  /**
   * Calculation symbol base name
   */
  get name() {
    return this.#name;
  }

  /**
   * Name of the distribution
   */
  get displayName() {
    return this.#displayName;
  }

  /**
   * Information about the parameters
   */
  get parameterInfo() {
    return this.#parameters;
  }

  /**
   * Added the calculation functions for calculating pdf, cdf and random numbers to a MathJS import object.
   * @param {Object} importFunctions MathJS import object
   */
  getFunctions(importFunctions) {
    importFunctions[this.#name+"_pdf"]=(x,...parameters)=>this.#getPDFWithChecks(x,parameters);
    importFunctions[this.#name+"_cdf"]=(x,...parameters)=>this.#getCDFWithChecks(x,parameters);
    importFunctions[this.#name+"_random"]=(...parameters)=>this.#getRandomWithChecks(parameters);
  }
}


/**
 * Base class for calculating pdf, cdf and random numbers of discrete probability distributions
 */
class DiscreteProbabilityDistribution extends ContinuousProbabilityDistribution {
  constructor(name, displayName=null) {
    super(name,displayName,true);
  }

  _getCDF(values, x) {
    let p=0;
    for (let i=-10;i<=x;i++) p+=this._getPDF(values,i);
    return p;
  }

  _getRandomNumber(values) {
    const u=Math.random();

    let i=-10;
    let p=0;
    while (p<u) {
      i++;
      p+=this._getPDF(values,i);
    }
    return i;
  }
}


/* ============================================================================
 * Definition of the discrete probability distributions
 * ============================================================================ */


/**
 * Discrete uniform distribution
 */
class DiscreteUniformDistribution extends DiscreteProbabilityDistribution {
  constructor() {
    super("discreteuniform");
    this._addDiscreteParameter("a",null);
    this._addDiscreteParameter("b",null);
  }

  _checkParameters(values) {
    if (values.a>values.b) throw new Error("b has to be >=a");
  }

  _getPDF(values, k) {
    if (k<values.a || k>values.b) return 0;
    return 1/(values.b-values.a+1);
  }
}

/**
 * Hypergeometric distribution
 */
class HypergeometricDistribution extends DiscreteProbabilityDistribution {
  constructor() {
    super("hypergeom");
    this._addDiscreteParameter("N",1);
    this._addDiscreteParameter("R",0);
    this._addDiscreteParameter("n",1);
  }

  _checkParameters(values) {
    if (values.R>values.N) throw new Error("R has to be <=N");
    if (values.n>values.N) throw new Error("n has to be <=N");
  }

  _getPDF(values, k) {
    if (k<0) return 0;
    return Math.max(0,mathBinom(values.R,k)*mathBinom(values.N-values.R,values.n-k)/mathBinom(values.N,values.n));
  }
}


/**
 * Binomial distribution
 */
class BinomialDistribution extends DiscreteProbabilityDistribution {
  constructor() {
    super("binomial");
    this._addDiscreteParameter("n",1);
    this._addContinuousParameter("p",0,true,1,true);
  }

  _getPDF(values, k) {
    if (k<0) return 0;
    return Math.max(0,mathBinom(values.n,k)*values.p**k*(1-values.p)**(values.n-k));
  }
}


/**
 * Poisson distribution
 */
class PoissonDistribution extends DiscreteProbabilityDistribution {
  constructor() {
    super("poisson");
    this._addContinuousParameter("lambda",0,false,null,false);
  }

  _getPDF(values, k) {
    if (k<0) return 0;
    const lambda=values.lambda;
    let frac=1;
    for (let i=1;i<=k;i++) frac*=lambda/i;
    return frac*Math.exp(-values.lambda);
  }
}


/**
 * Geometric distribution
 */
class GeometricDistribution extends DiscreteProbabilityDistribution {
  constructor() {
    super("geometric");
    this._addContinuousParameter("p",0,true,1,true);
  }

  _getPDF(values, k) {
    if (k<0) return 0;
    return values.p*(1-values.p)**k;
  }
}


/**
 * Negative hypergeometric distribution
 */
class NegativeHypergeometricDistribution extends DiscreteProbabilityDistribution {
  constructor() {
    super("negativehypergeom");
    this._addDiscreteParameter("N",1);
    this._addDiscreteParameter("R",1);
    this._addDiscreteParameter("n",1);
  }

  _checkParameters(values) {
    if (values.R>values.N) throw new Error("R has to be <=N");
    if (values.n>values.R) throw new Error("n has to be <=R");
  }

  _getPDF(values, k) {
    if (k<0) return 0;
    if (k<values.n) return 0;
    if (k>values.N) return 0;
    const result=Math.max(0,mathBinom(k-1,values.n-1)*mathBinom(values.N-k,values.R-values.n)/mathBinom(values.N,values.R));
    return result;
  }
}


/**
 * Negative binomial distribution
 */
class NegativeBinomialDistribution extends DiscreteProbabilityDistribution {
  constructor() {
    super("negativebinomial");
    this._addDiscreteParameter("r",1);
    this._addContinuousParameter("p",0,true,1,true);
  }

  _getPDF(values, k) {
    if (k<0) return 0;
    return mathBinom(k+values.r-1,k)*values.p**values.r*(1-values.p)**k;
  }
}

/**
 * Zeta distribution
 */
class ZetaDistribution extends DiscreteProbabilityDistribution {
  #lastS=-1;
  #lastZeta;

  constructor() {
    super("zeta");
    this._addDiscreteParameter("s",1);
  }

  _getPDF(values, k) {
    if (k<=0) return 0;
    const s=values.s;
    const z=(s==this.#lastS)?this.#lastZeta:zeta(s);
    this.#lastS=s;
    this.#lastZeta=z;
    return 1/(k**s)/z;
  }
}


/**
 * Rademacher distribution
 */
class RademacherDistribution extends DiscreteProbabilityDistribution {
  constructor() {
    super("rademacher");
  }

  _getPDF(values, k) {
    return (k==-1 || k==1)?0.5:0;
  }

  _getRandomNumber(values) {
    return (Math.random()>=0.5)?1:-1;
  }
}


/* ============================================================================
 * Definition of the continuous probability distributions
 * ============================================================================ */


/**
 * Continuous uniform distribution
 */
class UniformDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("uniform");
    this._addContinuousParameter("a",null,false,null,false);
    this._addContinuousParameter("b",null,false,null,false);
  }

  _checkParameters(values) {
    if (values.a>values.b) throw new Error("b has to be >=a");
  }

  _getPDF(values, x) {
    if (values.a==values.b) return (x==values.a)?Infinity:0;
    return (x<values.a || x>values.b)?0:(1/(values.b-values.a));
  }

  _getCDF(values, x) {
    if (values.a==values.b) return (x>=values.a)?1:0;
    if (x<values.a) return 0;
    if (x>values.b) return 1;
    return (x-values.a)/(values.b-values.a);
  }

  _getRandomNumber(values) {
    const u=Math.random();
    return values.a+(values.b-values.a)*u;
  }
}


/**
 * Exponential distribution
 */
class ExponentialDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("exp");
    this._addContinuousParameter("lambda",0,false,null,false);
  }

  _getPDF(values, x) {
    return (x<0)?0:(values.lambda*Math.exp(-values.lambda*x));
  }

  _getCDF(values, x) {
    return (x<0)?0:(1-Math.exp(-values.lambda*x));
  }

  _getRandomNumber(values) {
    const u=Math.random();
    /* F=1-exp(-lambda*x) <=> x=-log(1-F)/lambda */
    return -Math.log(1-u)/values.lambda;
  }
}


/**
 * Normal distribution
 */
class NormalDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("normal");
    this._addContinuousParameter("mu",null,false,null,false);
    this._addContinuousParameter("sigma",0,true,null,false);
  }

  _getPDF(values, x) {
    if (values.sigma==0) return (x==values.mu)?Infinity:0;
    return 1/Math.sqrt(2*Math.PI*values.sigma**2)*Math.exp(-(((x-values.mu)/values.sigma)**2)/2);
  }

  _getCDF(values, x) {
    if (values.sigma==0) return (x<values.mu)?0:1;
    return 0.5*(1+erf(1/Math.sqrt(2*values.sigma**2)*(x-values.mu)));
  }

  _getRandomNumber(values) {
    return gaussianRandomPolar(values.mu,values.sigma);
  }
}


/**
 * Log-normal distribution
 */
class LogNormalDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("lognormal");
    this._addContinuousParameter("mean",0,false,null,false);
    this._addContinuousParameter("std",0,true,null,false);
  }

  _getPDF(values, x) {
    if (x<=0) return 0;
    if (values.std==0) return (x==values.mean)?Infinity:0;

    const sigma2=Math.log((values.std/values.mean)**2+1);
	  const mu=Math.log(values.mean)-sigma2/2;
	  const sigma=Math.sqrt(sigma2);
    const densityFactor1=1/(sigma*Math.sqrt(2*Math.PI));
	  const densityFactor2=1/(2*sigma**2);
    return densityFactor1/x*Math.exp(-Math.pow((Math.log(x)-mu),2)*densityFactor2);
  }

  _getCDF(values, x) {
    if (x<=0) return 0;
    if (values.std==0) return (x<values.mean)?0:1;

    const sigma2=Math.log((values.std/values.mean)**2+1);
	  const mu=Math.log(values.mean)-sigma2/2;
	  const sigma=Math.sqrt(sigma2);
    const stdNormX=(Math.log(x)-mu)/sigma;
    if (Math.abs(stdNormX)>40) return (stdNormX<0)?0:1;
    return 0.5*erfc(-stdNormX/Math.SQRT2);
  }

  getRandomNumber(values) {
    const sigma2=Math.log((values.std/values.mean)**2+1);
	  const mu=Math.log(values.mean)-sigma2/2;
	  const sigma=Math.sqrt(sigma2);

    let q=10, u=0, v=0;
		while (q==0 || q>=1) {
			u=2*Math.random()-1;
			v=2*Math.random()-1;
			q=u*u+v*v;
		}
		const p=Math.sqrt(-2*Math.log(q)/q);
		const product=p*sigma;
		return Math.exp(u*product+mu);
  }
}


/**
 * Arcsine distribution
 */
class ArcsineDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("arcsine");
    this._addContinuousParameter("a",null,false,null,false);
    this._addContinuousParameter("b",null,false,null,false);
  }

  _checkParameters(values) {
    if (values.a>values.b) throw new Error("a has to be <=b");
  }

  _getPDF(values, x) {
    x=(x-values.a)/(values.b-values.a);
    if (x<=0 || x>=1) return 0;
     return 1/(Math.PI*Math.sqrt(x*(1-x)));
  }

  _getCDF(values, x) {
    x=(x-values.a)/(values.b-values.a);
    if (x<=0) return 0;
    if (x>=1) return 1;
    return 2/Math.PI*Math.asin(Math.sqrt(x));
  }

  _getRandomNumber(values) {
    /* p=2/pi*arcsin(sqrt(x)) => (sin(pi*p/2))^2=x */
    const u=Math.random();
    const x=(Math.sin(Math.PI*u/2))**2;
    return x*(values.b-values.a)+values.a;
  }
}


/**
 * Beta distribution
 */
class BetaDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("beta");
    this._addContinuousParameter("alpha",0,false,null,false);
    this._addContinuousParameter("beta",0,false,null,false);
    this._addContinuousParameter("a",null,false,null,false);
    this._addContinuousParameter("b",null,false,null,false);
  }

  _checkParameters(values) {
    if (values.a>values.b) throw new Error("a has to be <=b");
  }

  #lastAlpha=NaN;
  #lastBeta=NaN;
  #pdfFactor;

  _getPDF(values, x) {
    if (x<values.a || x>values.b) return 0;
    if (values.a==values.b) return (x==values.a)?Infinity:0;

    if (values.alpha!=this.#lastAlpha || values.beta!=this.#lastBeta) {
      this.#pdfFactor=1/betafn(values.alpha,values.beta);
      this.#lastAlpha=values.alpha;
      this.#lastBeta=values.beta;
    }

    x=(x-values.a)/(values.b-values.a);
    return x**(values.alpha-1)*(1-x)**(values.beta-1)*this.#pdfFactor;
  }

  _getCDF(values, x) {
    if (x<values.a) return 0;
    if (x>values.b) return 1;
    if (values.a==values.b) return (x<values.a)?0:1;

    x=(x-values.a)/(values.b-values.a);
    return ibeta(x,values.alpha,values.beta);
  }
}


/**
 * Cauchy distribution
 */
class CauchyDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("cauchy");
    this._addContinuousParameter("t",null,false,null,false);
    this._addContinuousParameter("s",0,false,null,false);
  }

  _getPDF(values, x) {
    return 1/Math.PI*values.s/(values.s**2+(x-values.t)**2);
  }

  _getCDF(values, x) {
    return 0.5+1/Math.PI*Math.atan((x-values.t)/values.s);
  }

  _getRandomNumber(values) {
    const u=Math.random();
    if (u==0) return -Infinity;
    return values.t+values.s*Math.tan(Math.PI*(u-0.5));
  }
}


/**
 * Chi distribution
 */
class ChiDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("chi");
    this._addDiscreteParameter("k",1);
  }

  _getPDF(values, x) {
    if (x<=0) return 0;
    const kHalf=values.k/2;
    return 1/(2**(kHalf-1)*gammafn(kHalf))*x**(values.k-1)*Math.exp(-(x**2)/2);
  }

  _getCDF(values, x) {
    if (x<=0) return 0;
    const kHalf=values.k/2;
    return lowRegGamma(kHalf,x**2/2);
  }
}


/**
 * Chi^2 distribution
 */
class Chi2Distribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("chisquared");
    this._addDiscreteParameter("k",1);
  }

  _getPDF(values, x) {
    if (x<=0) return 0;
    const kHalf=values.k/2;
    return 1/(2**kHalf*gammafn(kHalf))*x**(kHalf-1)*Math.exp(-x/2);
  }

  _getCDF(values, x) {
    if (x<=0) return 0;
    const kHalf=values.k/2;
    return lowRegGamma(kHalf,x/2);
  }
}


/**
 * Erlang distribution
 */
class ErlangDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("erlang");
    this._addDiscreteParameter("n",1);
    this._addContinuousParameter("lambda",0,false,null,false);
  }

  _getPDF(values, x) {
    if (x<=0) return 0;
    const pdfFactor=1/(values.lambda**values.n*gammafn(values.n));
    return x**(values.n-1)*Math.exp(-x/values.lambda)*pdfFactor;
  }

  _getCDF(values, x) {
    if (x<=0) return 0;
    const cdfFactor=1/gammafn(values.n);
    return cdfFactor*gammap(values.n,x/values.lambda);
  }
}


/**
 * F distribution
 */
class FDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("f");
    this._addContinuousParameter("m",0,false,null,false);
    this._addContinuousParameter("n",0,false,null,false);
  }

  _getPDF(values, x) {
    if (x<=0) return 0;
    const pdfFactor=values.m**(values.m/2)*values.n**(values.n/2)*gammafn((values.m+values.n)/2)/gammafn(values.m/2)/gammafn(values.n/2);
    return pdfFactor*x**(values.m/2-1)/((values.m*x+values.n)**((values.m+values.n)/2));
  }

  _getCDF(values, x) {
    if (x<=0) return 0;
    return ibeta(values.m*x/(values.m*x+values.n),values.m/2,values.n/2);
  }
}


/**
 * Gamma distribution
 */
class GammaDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("gamma");
    this._addContinuousParameter("alpha",0,false,null,false);
    this._addContinuousParameter("beta",0,false,null,false);
  }

  _getPDF(values, x) {
    if (x<=0) return 0;
    const pdfFactor=1/(values.beta**values.alpha*gammafn(values.alpha));
    return x**(values.alpha-1)*Math.exp(-x/values.beta)*pdfFactor;
  }

  _getCDF(values, x) {
    if (x<=0) return 0;
    const cdfFactor=1/gammafn(values.alpha);
    return cdfFactor*gammap(values.alpha,x/values.beta);
  }
}


/**
 * Gumbel distribution
 */
class GumbelDistribution extends ContinuousProbabilityDistribution {
  /**
   * Approximation of Euler's constant
   * see https://mathworld.wolfram.com/Euler-MascheroniConstantApproximations.html
   */
  #euler;

  #betaFactor;

  constructor() {
    super("gumbel");
    this.#euler=Math.PI/(2*Math.E);
    this.#betaFactor=Math.sqrt(6)/Math.PI;
    this._addContinuousParameter("mean",null,false,null,false);
    this._addContinuousParameter("std",0,false,null,false);
  }

  _getPDF(values, x) {
    if (values.std==0) return (x==values.mean)?Infinity:0;

    const beta=values.std*this.#betaFactor;
		const mu=values.mean-beta*this.#euler;

    const z=(x-mu)/beta;
    const t=Math.exp(-z);
    return Math.exp(-z-t)/beta;
  }

  _getCDF(values, x) {
    if (values.std==0) return (x<values.mean)?0:1;

    const beta=values.std*this.#betaFactor;
		const mu=values.mean-beta*this.#euler;

    const z=(x-mu)/beta;
    return Math.exp(-Math.exp(-z));
  }

  _getRandomNumber(values) {
    const beta=values.std*this.#betaFactor;
		const mu=values.mean-beta*this.#euler;

    /* p=exp(-exp(-z)) <=> -log(-log(p))=z */
    const p=Math.random();
    const z=-Math.log(-Math.log(p));

    /* z=(x-mu)/beta <=> z*beta+mu */
    return z*beta+mu;
  }
}


/**
 * Half normal distribution
 */
class HalfNormalDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("halfnormal");
    this._addContinuousParameter("s",null,false,null,false);
    this._addContinuousParameter("mu",0,false,null,false);
  }

  _getPDF(values, x) {
    if (values.mu==0) return (x==values.s)?Infinity:0;
    if (x<values.s) return 0;
    const theta=1/values.mu;
    const pdfFactor1=2*theta/Math.PI;
    const pdfFactor2=theta**2/Math.PI;
    return pdfFactor1*Math.exp(-((x-values.s)**2)*pdfFactor2);
  }

  _getCDF(values, x) {
    if (values.mu==0) return (x<values.s)?0:1;
    if (x<values.s) return 0;
    const theta=1/values.mu;
    const cdfFactor=theta/Math.sqrt(Math.PI);
    return erf((x-values.s)*cdfFactor);
  }
}


/**
 * Hyperbolic secant distribution
 */
class HyperbolicSecantDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("hyperbolicsecant");
    this._addContinuousParameter("mu",null,false,null,false);
    this._addContinuousParameter("sigma",0,false,null,false);
  }

  _getPDF(values, x) {
    if (values.sigma==0) return (x==values.mu)?Infinity:0;

    const z=(x-values.mu)/values.sigma;
	  return (1/(Math.cosh(Math.PI*z/2)*2*values.sigma));
  }

  _getCDF(values, x) {
    if (values.sigma==0) return (x==values.mu)?Infinity:0;

    const z=(x-values.mu)/values.sigma;
    const arg=Math.PI*z*0.5;
	  if (arg>=750) return 1;
	  return (2*Math.atan(Math.exp(arg)))/Math.PI;
  }

  _getRandomNumber(values) {
    const u=Math.random();
    /*
    y=2/pi*atan(exp(pi*(x-mu)/(2*sigma)))
    log(tan(y*pi/2))=pi*(x-mu)/(2*sigma)
    log(tan(y*pi/2))/pi*2*sigma+mu=x
    */
    return Math.log(Math.tan(u*Math.PI/2))/Math.PI*2*values.sigma+values.mu;
  }
}


/**
 * Inverse Gaussian distribution
 */
class InverseGaussianDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("inversegaussian")
    this._addContinuousParameter("lambda",0,false,null,false);
    this._addContinuousParameter("mu",0,false,null,false);
  }

  _getPDF(values, x) {
    if (x<=0) return 0;
    return Math.sqrt(values.lambda/2/Math.PI/(x**3))*Math.exp(-values.lambda*(x-values.mu)**2/2/(values.mu**2)/x);
  }

  #getStdNormCDF(x) {
    return 0.5*(1+erf(1/Math.sqrt(2)*x));
  }

  _getCDF(values, x) {
    if (x<=0) return 0;
    return this.#getStdNormCDF(Math.sqrt(values.lambda/x)*(x/values.mu-1))+Math.exp(2*values.lambda/values.mu)*this.#getStdNormCDF(-Math.sqrt(values.lambda/x)*(x/values.mu+1));
  }
}


/**
 * Irwin-Hall distribution
 */
class IrwinHallDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("irwinhall");
    this._addDiscreteParameterMinMax("n",1,25);
  }

  _getPDF(values, x) {
    if (x<0 || x>values.n) return 0;

    const pdfFactor=1/factorial(values.n-1);

    let sum=0;
    for (let k=0;k<=Math.floor(x);k++) {
      sum+=(-1)**k*mathBinom(values.n,k)*(x-k)**(values.n-1);
    }

    return pdfFactor*sum;
  }

  _getCDF(values, x) {
    if (x<0) return 0;
    if (x>values.n) return 1;

    const pdfFactor=1/factorial(values.n-1);
    const cdfFactor=pdfFactor/values.n;

    let sum=0;
    for (let k=0;k<=Math.floor(x);k++) {
      sum+=(-1)**k*mathBinom(values.n,k)*(x-k)**(values.n);
    }

    return cdfFactor*sum;
  }
}


/**
 * Johnson SU distribution
 */
class JohnsonSUDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("johnsonsu");
    this._addContinuousParameter("gamma",0,false,null,false);
    this._addContinuousParameter("xi",0,false,null,false);
    this._addContinuousParameter("delta",0,false,null,false);
    this._addContinuousParameter("lambda",0,false,null,false);
  }

  _getPDF(values, x) {
    const frac=(x-values.xi)/values.lambda;
	  const exponentPart=values.gamma+values.delta*Math.asinh(frac);
	  return values.delta/(values.lambda*Math.sqrt(2*Math.PI))*1/Math.sqrt(1+frac**2)*Math.exp(-0.5*exponentPart**2);
  }

  #getStdNormCDF(x) {
    return 0.5*(1+erf(1/Math.sqrt(2)*x));
  }

  #getStdNormRandom() {
    return gaussianRandomPolar(0,1);
  }

  _getCDF(values, x) {
    return this.#getStdNormCDF(values.gamma+values.delta*Math.asinh((x-values.xi)/values.lambda));
  }

  _getRandomNumber(values) {
    return values.lambda*Math.sinh((this.#getStdNormRandom()-values.gamma)/values.delta)+values.xi;
  }
}


/**
 * Kumaraswamy distribution
 */
class KumaraswamyDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("kumaraswamy");
    this._addContinuousParameter("a",0,false,null,false);
    this._addContinuousParameter("b",0,false,null,false);
  }

  _getPDF(values, x) {
    if (x<=0 || x>=1) return 0;
    const a=values.a;
    const b=values.b;
    return a*b*x**(a-1)*(1-x**a)**(b-1);
  }

  _getCDF(values, x) {
    if (x<=0) return 0;
    if (x>=1) return 1;
    return 1-(1-x**values.a)**values.b;
  }
}


/**
 * Laplace distribution
 */
class LaplaceDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("laplace");
    this._addContinuousParameter("mu",null,false,null,false);
    this._addContinuousParameter("sigma",0,false,null,false);
  }

  _getPDF(values, x) {
    const pdfFactor=1/(2*values.sigma);
    return pdfFactor*Math.exp(-Math.abs(x-values.mu)/values.sigma);
  }

  _getCDF(values, x) {
    return 0.5+0.5*Math.sign(x-values.mu)*(1-Math.exp(-Math.abs(x-values.mu)/values.sigma));
  }

  _getRandomNumber(values) {
    const u=Math.random();
    return values.mu-values.sigma*Math.sign(u-0.5)*Math.log(1-2*Math.abs(u-0.5));
  }
}


/**
 * Levy distribution
 */
class LevyDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("levy");
    this._addContinuousParameter("mu",null,false,null,false);
    this._addContinuousParameter("gamma",0,false,null,false);
  }

  _getPDF(values, x) {
    if (x<=values.mu) return 0;
    const pdfFactor=Math.sqrt(values.gamma/2/Math.PI);
    return pdfFactor*Math.exp(-values.gamma/2/(x-values.mu))/Math.pow(x-values.mu,1.5);
  }

  #getStdNormCDF(x) {
    return 0.5*(1+erf(1/Math.sqrt(2)*x));
  }

  _getCDF(values, x) {
    if (x<=values.mu) return 0;
    return 2-2*this.#getStdNormCDF(Math.sqrt(values.gamma/(x-values.mu)));
  }
}


/**
 * Logistic distribution
 */
class LogisticDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("logistic");
    this._addContinuousParameter("mu",null,false,null,false);
    this._addContinuousParameter("s",0,false,null,false);
  }

  _getPDF(values, x) {
    const part=Math.exp(-(x-values.mu)/values.s);
	  return part/(values.s*(1+part)*(1+part));
  }

  _getCDF(values, x) {
    return 1/(1+Math.exp(-(x-values.mu)/values.s));
  }

  _getRandomNumber(values) {
    const u=Math.random();
    /*
    u=1/(1+Math.exp(-(x-values.mu)/values.s))
    -(x-values.mu)/values.s=Math.log(1/u-1)
    x=-Math.log(1/u-1)*values.s+values.mu
    */
   return -Math.log(1/u-1)*values.s+values.mu;
  }
}


/**
 * Log-logistic distribution
 */
class LogLogisticDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("loglogistic");
    this._addContinuousParameter("alpha",0,false,null,false);
    this._addContinuousParameter("beta",0,false,null,false);
  }

  _getPDF(values, x) {
    if (x<0) return 0;
		const xalpha=x/values.alpha;
		const denominator=1+xalpha**values.beta;
		return (values.beta/values.alpha)*xalpha**(values.beta-1)/(denominator**2);
  }

  _getCDF(values, x) {
    if (x<0) return 0;
    return 1/(1+(x/values.alpha)**(-values.beta));
  }

  _getRandomNumber(values) {
    const u=Math.random();
    const inverseBeta=1/values.beta;
    return values.alpha*(u/(1-u))**inverseBeta;
  }
}


/**
 * Maxwell-Boltzmann distribution
 */
class MaxwellBoltzmannDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("maxwellboltzmann");
    this._addContinuousParameter("a",0,false,null,false);
  }

  _getPDF(values, x) {
    if (x<0) return 0;

    const densityFactor=Math.sqrt(2/Math.PI)/(values.a**3);

    const x2=x**2;
    return densityFactor*x2*Math.exp(-x2/2/values.a**2);
  }

  _getCDF(values, x) {
    if (x<0) return 0;

    const cumulativeProbabilityFactor=Math.sqrt(2/Math.PI)/values.a;
    const erfFactor=1/Math.sqrt(2)/values.a;

    return erf(x*erfFactor)-cumulativeProbabilityFactor*x*Math.exp(-(x**2)/2/values.a**2);
  }
}


/**
 * Pareto distribution
 */
class ParetoDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("pareto");
    this._addContinuousParameter("xm",0,false,null,false);
    this._addContinuousParameter("alpha",0,false,null,false);
  }

  _getPDF(values, x) {
    if (x<values.xm) return 0;
    return values.alpha*values.xm**values.alpha/(x**(values.alpha+1));
  }

  _getCDF(values, x) {
    if (x<values.xm) return 0;
    return 1-(values.xm/x)**values.alpha;
  }

  _getRandomNumber(values) {
    const u=Math.random();
    /* y=1-(xm/x)^alpha <=> x=xm/(1-y)^(1/alpha)  */
    return values.xm/((1-u)**(1/values.alpha));
  }
}


/**
 * Pert distribution
 */
class PertDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("pert");
    this._addContinuousParameter("a",null,false,null,false);
    this._addContinuousParameter("b",null,false,null,false);
    this._addContinuousParameter("c",null,false,null,false);
  }

  _checkParameters(values) {
    if (values.b<values.a) throw new Error("b has to be >=a");
    if (values.c<values.b) throw new Error("c has to be >=b");
  }

  _getPDF(values, x) {
    if (x<values.a || x>values.c) return 0;
    if (values.a==values.c) return (x==values.a)?Infinity:0;

    const alpha=1+4*(values.b-values.a)/(values.c-values.a);
		const beta=1+4*(values.c-values.b)/(values.c-values.a);
		const factorPDF=1/Math.exp(betaln(alpha,beta))/Math.pow(values.c-values.a,alpha+beta-1);

    return factorPDF*Math.pow(x-values.a,alpha-1)*Math.pow(values.c-x,beta-1);
  }

  _getCDF(values, x) {
    if (x<values.a) return 0;
    if (x>values.c) return 1;
    if (values.a==values.c) return (x>=values.a)?1:0;

    const alpha=1+4*(values.b-values.a)/(values.c-values.a);
		const beta=1+4*(values.c-values.b)/(values.c-values.a);
		const factorCDF=1/(values.c-values.a);

    const z=(x-values.a)*factorCDF;
	  return ibeta(z,alpha,beta);
  }
}


/**
 * Reciprocal distribution
 */
class ReciprocalDistribution extends ContinuousProbabilityDistribution {

  constructor() {
    super("reciprocal");
    this._addContinuousParameter("a",null,false,null,false);
    this._addContinuousParameter("b",null,false,null,false);
  }

  _checkParameters(values) {
    if (values.a>values.b) throw new Error("b has to be >=a");
  }

  _getPDF(values, x) {
    if (values.a==values.b) return (x==values.a)?Infinity:0;
    if (x<values.a || x>values.b) return 0;

    return 1/(x*Math.log(values.b/values.a));
  }

  _getCDF(values, x) {
    if (values.a==values.b) return (x>=values.a)?1:0;
    if (x<values.a) return 0;
    if (x>values.b) return 1;

    return Math.log(x/values.a)/Math.log(values.b/values.a);
  }

  _getRandomNumber(values) {
    const u=Math.random();
    /*
    u=log(x/a)/log(b/a)
    u*log(b/a)=log(x/a)
    a*exp(u*log(b/a))=x
    */
    return values.a*Math.exp(u*Math.log(values.b/values.a));
  }
}


/**
 * Sine distribution
 */
class SineDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("sine");
    this._addContinuousParameter("a",null,false,null,false);
    this._addContinuousParameter("b",null,false,null,false);
  }

  _checkParameters(values) {
    if (values.a>values.b) throw new Error("b has to be >=a");
  }

  _getPDF(values, x) {
    x=(x-values.a)/(values.b-values.a);
    if (x<=0 || x>=1) return 0;
    return Math.PI/2*Math.sin(Math.PI*x);
  }

  _getCDF(values, x) {
    x=(x-values.a)/(values.b-values.a);
    if (x<=0) return 0;
    if (x>=1) return 1;
    return 0.5*(1-Math.cos(Math.PI*x));
  }

  _getRandomNumber(values) {
    /* p=0.5*(1-cos(pi*x)) => arccos(1-2p)/pi=x */
    const u=Math.random();
    const x=Math.acos(1-2*u)/Math.PI;
    return x*(values.b-values.a)+values.a;
  }
}


/**
 * Student-t distribution
 */
class StudentTDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("studentt");
    this._addContinuousParameter("nu",0,false,null,false);
    this._addContinuousParameter("mu",null,false,null,false);
  }

  _getPDF(values, x) {
    x=x-values.mu;
    const pdfFactor=gammafn((values.nu+1)/2)/(Math.sqrt(values.nu*Math.PI)*gammafn(values.nu/2));
    return pdfFactor*(1+x**2/values.nu)**(-(values.nu+1)/2);
  }

  _getCDF(values, x) {
    x=x-values.mu;
    if (x>=0) {
      x=values.nu/(x**2+values.nu);
      return 1-0.5*ibeta(x,values.nu/2,0.5);
    } else {
      x=values.nu/(x**2+values.nu);
      return 0.5*ibeta(x,values.nu/2,0.5);
    }
  }
}


/**
 * Trapezoid distribution
 */
class TrapezoidDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("trapezoid");
    this._addContinuousParameter("a",null,false,null,false);
    this._addContinuousParameter("b",null,false,null,false);
    this._addContinuousParameter("c",null,false,null,false);
    this._addContinuousParameter("d",null,false,null,false);
  }

  _checkParameters(values) {
    if (values.b<values.a) throw new Error("b has to be >=a");
    if (values.c<values.b) throw new Error("c has to be >=b");
    if (values.d<values.c) throw new Error("d has to be >=c");
  }

  _getPDF(values, x) {
    if (x<=values.a || x>=values.d) return 0;
    if (values.a==values.d) return (x==values.a)?Infinity:0;

    const h=2.0/(values.c+values.d-values.a-values.b);
    /*
    this.#pdfB=(values.b-values.a)*this.#h/2.0;
    this.#pdfC=1-(values.d-values.c)*this.#h/2.0;
    */
    if (x>values.a && x<values.b) return h*(x-values.a)/(values.b-values.a);
		if (x>values.c && x<values.d) return h*(values.d-x)/(values.d-values.c);
    return h;
  }

  _getCDF(values, x) {
    if (x<=values.a) return 0;
    if (x>=values.d) return 1;
    if (values.a==values.d) return 1;

    const h=2.0/(values.c+values.d-values.a-values.b);
		if (x>values.a && x<values.b) return h*(x-values.a)**2/(values.b-values.a)/2;
		if (x>values.c && x<values.d) return 1-h*(values.d-x)**2/(values.d-values.c)/2;
		return h*(2*x-values.a-values.b)/2;
  }

  _getRandomNumber(values) {
    const u=Math.random();

    if (values.a==values.d) return values.d;

    const h=2.0/(values.c+values.d-values.a-values.b);
    const pdfB=(values.b-values.a)*h/2.0;
    const pdfC=1-(values.d-values.c)*h/2.0;

		if (u<pdfB) {
			if (values.a==values.b) return values.a;
			return Math.sqrt(u*2*(values.b-values.a)/h)+values.a;
		}

		if (u>pdfC) {
			if (values.c==values.d) return values.c;
			return values.d-Math.sqrt((1-u)*2*(values.d-values.c)/h);
		}

		if (values.b==values.c) return values.b;
		const relativePosition=(u-pdfB)/(pdfC-pdfB);
		return values.b+(values.c-values.b)*relativePosition;
  }
}


/**
 * Triangular distribution
 */
class TriangularDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("triangular");
    this._addContinuousParameter("a",null,false,null,false);
    this._addContinuousParameter("c",null,false,null,false);
    this._addContinuousParameter("b",null,false,null,false);
  }

  _checkParameters(values) {
    if (values.c<values.a) throw new Error("b has to be >=a");
    if (values.b<values.c) throw new Error("c has to be >=b");
  }

  _getPDF(values, x) {
    if (x<values.a || x>values.b) return 0;
    if (values.a==values.b) return (x==values.a)?Infinity:0;

    const factor1=1/(values.b-values.a)/(values.c-values.a);
    const factor2=1/(values.b-values.a)/(values.b-values.c);

    if (x<=values.c) {
      return 2*(x-values.a)*factor1;
    } else {
      return 2*(values.b-x)*factor2;
    }
  }

  _getCDF(values, x) {
    if (x<values.a) return 0;
    if (x>values.b) return 1;
    if (values.a==values.b) return (x>=values.a)?1:0;

    const factor1=1/(values.b-values.a)/(values.c-values.a);
    const factor2=1/(values.b-values.a)/(values.b-values.c);

    if (x<=values.c) {
      return (x-values.a)**2*factor1;
    } else {
      return 1-(values.b-x)**2*factor2;
    }
  }

  _getRandomNumber(values) {
    const u=Math.random();

    if (values.a==values.b) return values.a;

    const factorRndSelect=(values.c-values.a)/(values.b-values.a);
    const factorRnd1=Math.sqrt((values.b-values.a)*(values.c-values.a));
    const factorRnd2=Math.sqrt((values.b-values.a)*(values.b-values.c));

    if (u<=factorRndSelect) {
      return values.a+Math.sqrt(u)*factorRnd1;
    } else {
      return values.b-Math.sqrt(1-u)*factorRnd2;
    }
  }
}


/**
 * U-quadratic distribution
 */
class UQuadraticDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("uquadratic");
    this._addContinuousParameter("a",null,false,null,false);
    this._addContinuousParameter("b",null,false,null,false);
  }

  _checkParameters(values) {
    if (values.a>values.b) throw new Error("b has to be >=a");
  }

  _getPDF(values, x) {
    if (values.a==values.b) return (x==values.a)?Infinity:0;
    if (x<values.a || x>values.b) return 0;

    const alpha=12/((values.b-values.a)**3);
    const beta=(values.a+values.b)/2;

    return alpha*(x-beta)**2;
  }

  _getCDF(values, x) {
    if (values.a==values.b) return (x>=values.a)?1:0;
    if (x<values.a) return 0;
    if (x>values.b) return 1;

    const alpha=12/((values.b-values.a)**3);
    const beta=(values.a+values.b)/2;

    return alpha/3*((x-beta)**3+(beta-values.a)**3);
  }

  _getRandomNumber(values) {
    const u=Math.random();

    const alpha=12/((values.b-values.a)**3);
    const beta=(values.a+values.b)/2;
    /*
    u=alpha/3*((x-beta)**3+(beta-values.a)**3)
    3/alpha*u=(x-beta)**3+(beta-values.a)**3
    3/alpha*u-(beta-values.a)**3=(x-beta)**3
    (3/alpha*u-(beta-values.a)**3)**(1/3)=x-beta
    */
    const v=3/alpha*u-(beta-values.a)**3;
    const w=(Math.abs(v))**(1/3);
    return ((v<0)?(-w):w)+beta;
  }
}


/**
 * Weibull distribution
 */
class WeibullDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("weibull");
    this._addContinuousParameter("beta",0,false,null,false);
    this._addContinuousParameter("lambda",0,false,null,false);
  }

  _getPDF(values, x) {
    if (x<0) return 0;
    return values.lambda*values.beta*(values.lambda*x)**(values.beta-1)*Math.exp(-((values.lambda*x)**values.beta));
  }

  _getCDF(values, x) {
    if (x<0) return 0;
    return 1-Math.exp(-((values.lambda*x)**values.beta));
  }

  _getRandomNumber(values) {
    const u=Math.random();
    /* y=1-exp(-(lambda*x)^beta) <=> x=(-log(1-y))^(1/beta)/lambda */
    return (-Math.log(1-u))**(1/values.beta)/values.lambda;
  }
}


/**
 * Wigner semicircle distribution
 */
class WignerSemicircleDistribution extends ContinuousProbabilityDistribution {
  constructor() {
    super("wignersemicircle");
    this._addContinuousParameter("m",null,false,null,false);
    this._addContinuousParameter("R",0,false,null,false);
  }

  _getPDF(values, x) {
    x=x-values.m;
    if (x<=-values.R || x>=values.R) return 0;

    const pdfFactor=2/Math.PI/(values.R**2);
    return pdfFactor*Math.sqrt(values.R**2-x**2);
  }

  _getCDF(values, x) {
    x=x-values.m;
    if (x<=-values.R) return 0;
    if (x>=values.R) return 1;

    const R=values.R;
    const cdfFactor=Math.PI*values.R**2;
    return 0.5+x*Math.sqrt(R**2-x**2)/cdfFactor+Math.asin(x/R)/Math.PI;
  }
}


/* ============================================================================
 * Setup
 * ============================================================================ */

/**
 * Array of all available distribution objects
 */
const distributions=[
  /* Discrete distributions */
  new DiscreteUniformDistribution(),
  new HypergeometricDistribution(),
  new BinomialDistribution(),
  new PoissonDistribution(),
  new GeometricDistribution(),
  new NegativeHypergeometricDistribution(),
  new NegativeBinomialDistribution(),
  new ZetaDistribution(),
  new RademacherDistribution(),

  /* Continuous distributions */
  new UniformDistribution(),
  new ExponentialDistribution(),
  new NormalDistribution(),
  new LogNormalDistribution(),
  new ArcsineDistribution(),
  new BetaDistribution(),
  new CauchyDistribution(),
  new ChiDistribution(),
  new Chi2Distribution(),
  new ErlangDistribution(),
  new FDistribution(),
  new GammaDistribution(),
  new GumbelDistribution(),
  new HalfNormalDistribution(),
  new HyperbolicSecantDistribution(),
  new InverseGaussianDistribution(),
  new IrwinHallDistribution(),
  new JohnsonSUDistribution(),
  new KumaraswamyDistribution(),
  new LaplaceDistribution(),
  new LevyDistribution(),
  new LogisticDistribution(),
  new LogLogisticDistribution(),
  new MaxwellBoltzmannDistribution(),
  new ParetoDistribution(),
  new PertDistribution(),
  new ReciprocalDistribution(),
  new SineDistribution(),
  new StudentTDistribution(),
  new TrapezoidDistribution(),
  new TriangularDistribution(),
  new UQuadraticDistribution(),
  new WeibullDistribution(),
  new WignerSemicircleDistribution()
];

/**
 * Loads the probability distributions as MathJS extensions.
 */
function loadMathJSDistributionExtensions() {
  if (!math || !math.import) {setTimeout(loadMathJSDistributionExtensions,100); return;}

  const importFunctions={};
  distributions.forEach(distribution=>distribution.getFunctions(importFunctions));
  math.import(importFunctions);
}
