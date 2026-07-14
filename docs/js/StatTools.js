/*
Copyright 2026 Alexander Herzog

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

export {autocorrelation}

/**
 * Calculates the autocorrelation.
 * @param x Array of input values
 * @param maxLag Maximum lag to calculate the autocorrelation for
 * @returns Autocorrelation vector
 */
function autocorrelation(x, maxLag) {
  const n = x.length;
  if (n < 2) return {};

  // mean
  let mean = 0;
  for (let i = 0; i < n; i++) mean += x[i];
  mean /= n;

  // center data: optional
  const denom = (() => {
    // sqrt( sum (x-mean)^2 ) * sqrt( sum (x-mean)^2 )
    let sxx = 0;
    for (let i = 0; i < n; i++) {
      const d = x[i] - mean;
      sxx += d * d;
    }
    return sxx;
  })();

  if (denom === 0) {
    // all values identically -> Variance 0 -> autocorrelation not defined
    // here: 0 for all lags
    const res = [];
    res.push(1);
    for (let lag = 1; lag <= maxLag; lag++) res.push = 0;
    return res;
  }

  const res = [];
  res.push(1);

  for (let lag = 1; lag <= maxLag; lag++) {
    if (lag >= n) break;

    // Numerator: sum_{t=0..n-lag-1} (x[t]-mean)(x[t+lag]-mean)
    let num = 0;
    // Denominator: sum_{t=0..n-lag-1} (x[t]-mean)^2
    let den1 = 0;
    // Denominator: sum_{t=0..n-lag-1} (x[t+lag]-mean)^2
    let den2 = 0;

    for (let t = 0; t < n - lag; t++) {
      const a = x[t] - mean;
      const b = x[t + lag] - mean;
      num += a * b;
      den1 += a * a;
      den2 += b * b;
    }

    // Pearson-like: r = cov(x_t, x_{t+lag}) / (std(x_t)*std(x_{t+lag}))
    const den = Math.sqrt(den1 * den2);
    res.push((den === 0) ? 0 : (num / den));
  }

  return res;
}
