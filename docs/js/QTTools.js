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

export {erlangC_Pt, erlangC_ENQ, erlangC_EN, erlangC_EW, erlangC_EV, extErlangC_Pt, extErlangC_ENQ, extErlangC_EN, extErlangC_EW, extErlangC_EV, extErlangC_PA, AC_ENQ, AC_EN, AC_EW, AC_EV}

/* === === === General helper functions === === === */

/**
 * Calculates a^n/n!.
 * @param {Number} a Value a
 * @param {Number} n Value n
 */
function powerFactorial(a, n) {
  if (n==0) return 1;
  if (n==1) return a;

  let result=a;
  for (let i=2;i<=n;i++) result*=a/i;
  return result;
}

/* === === === Erlang C === === === */

function erlangC_P1(a, c) {
    const numerator=powerFactorial(a,c)*c/(c-a);

    let denominator=0;
    for (let n=0;n<=c-1;n++) denominator+=powerFactorial(a,n);
    denominator=denominator+numerator;

    return numerator/denominator;
}

/**
 * Checks if the parameters for an Erlang C model are in valid ranges
 * @param {Number} lambda Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Erlang C parameter &mu; (service rate)
 * @param {Number} c Erlang C parameter c (number of operators)
 */
function erlangC_checkInput(lambda, mu, c) {
  if (typeof(lambda)!='number' || lambda<0) throw new Error("lambda has to be >=0");
  if (typeof(mu)!='number' || mu<=0) throw new Error("mu has to be >0");
  if (typeof(c)!='number' || c<1 || c%1!=0) throw new Error("c has to be a natural number");
}

/**
 * Calculates P(W&le;t) for an Erlang C model.
 * @param {Number} lambda Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Erlang C parameter &mu; (service rate)
 * @param {Number} c Erlang C parameter c (number of operators)
 * @param {Number} t Parameter t for P(W&le;t)
 * @returns P(W&le;t)
 */
function erlangC_Pt(lambda, mu, c, t) {
  erlangC_checkInput(lambda,mu,c);
  const a=lambda/mu;
  if (a>=c) return 0;
  const P1=erlangC_P1(a,c);
  t=Math.max(0,t);
  return 1-P1*Math.exp(-(c-a)*mu*t);
}

/**
 * Calculates E[NQ] for an Erlang C model.
 * @param {Number} lambda Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Erlang C parameter &mu; (service rate)
 * @param {Number} c Erlang C parameter c (number of operators)
 * @returns E[NQ]
 */
function erlangC_ENQ(lambda, mu, c) {
  erlangC_checkInput(lambda,mu,c);
  const a=lambda/mu;
  if (a>=c) return Number.POSITIVE_INFINITY;
  const P1=erlangC_P1(a,c);
  return P1*a/(c-a);
}

/**
 * Calculates E[N] for an Erlang C model.
 * @param {Number} lambda Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Erlang C parameter &mu; (service rate)
 * @param {Number} c Erlang C parameter c (number of operators)
 * @returns E[N]
 */
function erlangC_EN(lambda, mu, c) {
  erlangC_checkInput(lambda,mu,c);
  const a=lambda/mu;
  if (a>=c) return Number.POSITIVE_INFINITY;
  const P1=erlangC_P1(a,c);
  return P1*a/(c-a)+a;
}

/**
 * Calculates E[W] for an Erlang C model.
 * @param {Number} lambda Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Erlang C parameter &mu; (service rate)
 * @param {Number} c Erlang C parameter c (number of operators)
 * @returns E[W]
 */
function erlangC_EW(lambda, mu, c) {
  erlangC_checkInput(lambda,mu,c);
  const a=lambda/mu;
  if (a>=c) return Number.POSITIVE_INFINITY;
  const P1=erlangC_P1(a,c);
  return P1/(c*mu-lambda);
}

/**
 * Calculates E[V] for an Erlang C model.
 * @param {Number} lambda Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Erlang C parameter &mu; (service rate)
 * @param {Number} c Erlang C parameter c (number of operators)
 * @returns E[V]
 */
function erlangC_EV(lambda, mu, c) {
  erlangC_checkInput(lambda,mu,c);
  const a=lambda/mu;
  if (a>=c) return Number.POSITIVE_INFINITY;
  const P1=erlangC_P1(a,c);
  return P1/(c*mu-lambda)+1/mu;
}

/* === === === Extended Erlang C === === === */

/**
 * Calculates the Cn vector for an extended Erlang C model.
 * @param {Number} lambda Extended Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Extended Erlang C parameter &mu; (service rate)
 * @param {Number} nu Extended Erlang C parameter &nu; (cancelation rate)
 * @param {Number} c Extended Erlang C parameter c (number of operators)
 * @param {Number} K Extended Erlang C parameter K (system size)
 */
function extErlangCCn(lambda, mu, nu, c, K) {
    /* Work load */
    const a=lambda/mu;

    /* System size */
    if (K==Number.MAX_SAFE_INTEGER) K=Math.min(100*c,5000);

    /* Calculate Cn */
    const Cn=Array.from({length: K+1},()=>0);

    for (let n=0;n<=Math.min(c,K);n++) if (n<=3) {
      Cn[n]=powerFactorial(a,n);
    } else {
      Cn[n]=Cn[n-1]*a/n;
    }

    let temp=powerFactorial(a,c);
    if (a>0) for (let n=c+1;n<=K;n++) {
      if (Cn[n-1]<=10E-20) {Cn[n]=0; continue;}
      let p=1; for (let i=1;i<=n-c;i++) p*=a/(c+i*nu/mu);
      Cn[n]=temp*p;
    }

    return Cn;
}

/**
 * Checks if the parameters for an extended Erlang C model are in valid ranges
 * @param {Number} lambda Extended Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Extended Erlang C parameter &mu; (service rate)
 * @param {Number} nu Extended Erlang C parameter &nu; (cancelation rate)
 * @param {Number} c Extended Erlang C parameter c (number of operators)
 * @param {Number} K Extended Erlang C parameter K (system size)
 */
function extErlang_checkInput(lambda, mu, nu, c, K) {
  if (typeof(lambda)!='number' || lambda<0) throw new Error("lambda has to be >=0");
  if (typeof(mu)!='number' || mu<=0) throw new Error("mu has to be >0");
  if (typeof(nu)!='number' || nu<0) throw new Error("nu has to be >=0");
  if (typeof(c)!='number' || c<1 || c%1!=0) throw new Error("c has to be a natural number");
  if (typeof(K)!='number' || K<c || K%1!=0) throw new Error("K has to be an an integer >=c");
}

/**
 * Calculates P(W&le;t) for an extended Erlang C model.
 * @param {Number} lambda Extended Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Extended Erlang C parameter &mu; (service rate)
 * @param {Number} nu Extended Erlang C parameter &nu; (cancelation rate)
 * @param {Number} c Extended Erlang C parameter c (number of operators)
 * @param {Number} K Extended Erlang C parameter K (system size)*
 * @param {Number} t Parameter t for P(W&le;t)
 * @returns P(W&le;t)
 */
function extErlangC_Pt(lambda, mu, nu, c, K, t) {
  extErlang_checkInput(lambda,mu,nu,c,K);
  if (t<0) throw new Error("t has to be >=0");

  const Cn=extErlangCCn(lambda,mu,nu,c,K);
  const pi0=1/Cn.reduce((a,b)=>a+b);

  let Pt;
  if (pi0==0) Pt=1; else Pt=1-Cn[K]*pi0;
  for (let n=c;n<=K-1;n++) {
      const g=lowRegGamma(n-c+1,(c*mu+nu)*t);
      Pt-=pi0*Cn[n]*g;
  }
  if (isNaN(Pt) || Pt<0) Pt=0;

  return Pt;
}

/**
 * Calculates E[NQ] for an extended Erlang C model.
 * @param {Number} lambda Extended Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Extended Erlang C parameter &mu; (service rate)
 * @param {Number} nu Extended Erlang C parameter &nu; (cancelation rate)
 * @param {Number} c Extended Erlang C parameter c (number of operators)
 * @param {Number} K Extended Erlang C parameter K (system size)*
 * @returns E[NQ]
 */
function extErlangC_ENQ(lambda, mu, nu, c, K) {
  extErlang_checkInput(lambda,mu,nu,c,K);

  const Cn=extErlangCCn(lambda,mu,nu,c,K);
  const pi0=1/Cn.reduce((a,b)=>a+b);

  let ENQ=0;
  for (let i=c+1;i<Cn.length;i++) ENQ+=(i-c)*Cn[i]*pi0;
  return ENQ;
}

/**
 * Calculates E[N] for an extended Erlang C model.
 * @param {Number} lambda Extended Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Extended Erlang C parameter &mu; (service rate)
 * @param {Number} nu Extended Erlang C parameter &nu; (cancelation rate)
 * @param {Number} c Extended Erlang C parameter c (number of operators)
 * @param {Number} K Extended Erlang C parameter K (system size)*
 * @returns E[N]
 */
function extErlangC_EN(lambda, mu, nu, c, K) {
  extErlang_checkInput(lambda,mu,nu,c,K);

  const Cn=extErlangCCn(lambda,mu,nu,c,K);
  const pi0=1/Cn.reduce((a,b)=>a+b);

  let EN=0;
  for (let i=1;i<Cn.length;i++) EN+=i*Cn[i]*pi0;
  return EN;
}

/**
 * Calculates E[W] for an extended Erlang C model.
 * @param {Number} lambda Extended Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Extended Erlang C parameter &mu; (service rate)
 * @param {Number} nu Extended Erlang C parameter &nu; (cancelation rate)
 * @param {Number} c Extended Erlang C parameter c (number of operators)
 * @param {Number} K Extended Erlang C parameter K (system size)*
 * @returns E[W]
 */
function extErlangC_EW(lambda, mu, nu, c, K) {
  if (lambda==0) return 0;
  return extErlangC_ENQ(lambda,mu,nu,c,K)/lambda;
}

/**
 * Calculates E[W] for an extended Erlang C model.
 * @param {Number} lambda Extended Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Extended Erlang C parameter &mu; (service rate)
 * @param {Number} nu Extended Erlang C parameter &nu; (cancelation rate)
 * @param {Number} c Extended Erlang C parameter c (number of operators)
 * @param {Number} K Extended Erlang C parameter K (system size)*
 * @returns E[W]
 */
function extErlangC_EV(lambda, mu, nu, c, K) {
  return extErlangC_EN(lambda,mu,nu,c,K)/lambda;
  /* Alternative, more computing intensive: extErlangC_EW(lambda,mu,nu,c,K)+1/mu*(1-extErlangC_PA(lambda,mu,nu,c,K)); */
}

/**
 * Calculates P(A) for an extended Erlang C model.
 * @param {Number} lambda Extended Erlang C parameter &lambda; (arrival rate)
 * @param {Number} mu Extended Erlang C parameter &mu; (service rate)
 * @param {Number} nu Extended Erlang C parameter &nu; (cancelation rate)
 * @param {Number} c Extended Erlang C parameter c (number of operators)
 * @param {Number} K Extended Erlang C parameter K (system size)*
 * @returns P(A)
 */
function extErlangC_PA(lambda, mu, nu, c, K) {
  if (lambda==0) return 0;
  return extErlangC_ENQ(lambda,mu,nu,c,K)*nu/lambda;
}

/* === === === Allen Cunneen === === === */

/**
 * Checks if the parameters for an Allen Cunneen model are in valid ranges
 * @param {Number} lambda Allen Cunneen parameter &lambda; (arrival rate)
 * @param {Number} mu Allen Cunneen parameter &mu; (service rate)
 * @param {Number} CVI Allen Cunneen parameter CV[I] (coefficient of variation of the inter-arrival times)
 * @param {Number} CVS Allen Cunneen parameter CV[S] (coefficient of variation of the service times)
 * @param {Number} c Allen Cunneen parameter c (number of operators)
 */
function AC_checkInput(lambda, mu, CVI, CVS, c) {
  if (typeof(lambda)!='number' || lambda<0) throw new Error("lambda has to be >=0");
  if (typeof(mu)!='number' || mu<=0) throw new Error("mu has to be >0");
  if (typeof(CVI)!='number' || CVI<0) throw new Error("CV[I] has to be >=0");
  if (typeof(CVS)!='number' || CVS<0) throw new Error("CV[S] has to be >=0");
  if (typeof(c)!='number' || c<1 || c%1!=0) throw new Error("c has to be a natural number");
}

/**
 * Calculates E[NQ] for an Allen Cunneen model.
 * @param {Number} lambda Allen Cunneen parameter &lambda; (arrival rate)
 * @param {Number} mu Allen Cunneen parameter &mu; (service rate)
 * @param {Number} CVI Allen Cunneen parameter CV[I] (coefficient of variation of the inter-arrival times)
 * @param {Number} CVS Allen Cunneen parameter CV[S] (coefficient of variation of the service times)
 * @param {Number} c Allen Cunneen parameter c (number of operators)
 * @returns E[NQ]
 */
function AC_ENQ(lambda, mu, CVI, CVS, c) {
  AC_checkInput(lambda,mu,CVI,CVS,c);
  const baseENQ=erlangC_ENQ(lambda,mu,c);
  const scaleFactor=(CVI**2+CVS**2)/2;
  return baseENQ*scaleFactor;

}

/**
 * Calculates E[N] for an Allen Cunneen model.
 * @param {Number} lambda Allen Cunneen parameter &lambda; (arrival rate)
 * @param {Number} mu Allen Cunneen parameter &mu; (service rate)
 * @param {Number} CVI Allen Cunneen parameter CV[I] (coefficient of variation of the inter-arrival times)
 * @param {Number} CVS Allen Cunneen parameter CV[S] (coefficient of variation of the service times)
 * @param {Number} c Allen Cunneen parameter c (number of operators)
 * @returns E[N]
 */
function AC_EN(lambda, mu, CVI, CVS, c) {
  AC_checkInput(lambda,mu,CVI,CVS,c);
  const baseENQ=erlangC_ENQ(lambda,mu,c);
  const scaleFactor=(CVI**2+CVS**2)/2;
  const a=lambda/mu;
  return baseENQ*scaleFactor+a;
}

/**
 * Calculates E[W] for an Allen Cunneen model.
 * @param {Number} lambda Allen Cunneen parameter &lambda; (arrival rate)
 * @param {Number} mu Allen Cunneen parameter &mu; (service rate)
 * @param {Number} CVI Allen Cunneen parameter CV[I] (coefficient of variation of the inter-arrival times)
 * @param {Number} CVS Allen Cunneen parameter CV[S] (coefficient of variation of the service times)
 * @param {Number} c Allen Cunneen parameter c (number of operators)
 * @returns E[W]
 */
function AC_EW(lambda, mu, CVI, CVS, c) {
  AC_checkInput(lambda,mu,CVI,CVS,c);
  const baseENQ=erlangC_ENQ(lambda,mu,c);
  const scaleFactor=(CVI**2+CVS**2)/2;
  return baseENQ*scaleFactor/lambda;
}

/**
 * Calculates E[V] for an Allen Cunneen model.
 * @param {Number} lambda Allen Cunneen parameter &lambda; (arrival rate)
 * @param {Number} mu Allen Cunneen parameter &mu; (service rate)
 * @param {Number} CVI Allen Cunneen parameter CV[I] (coefficient of variation of the inter-arrival times)
 * @param {Number} CVS Allen Cunneen parameter CV[S] (coefficient of variation of the service times)
 * @param {Number} c Allen Cunneen parameter c (number of operators)
 * @returns E[V]
 */
function AC_EV(lambda, mu, CVI, CVS, c) {
  AC_checkInput(lambda,mu,CVI,CVS,c);
  const baseENQ=erlangC_ENQ(lambda,mu,c);
  const scaleFactor=(CVI**2+CVS**2)/2;
  return baseENQ*scaleFactor/lambda+1/mu;
}
