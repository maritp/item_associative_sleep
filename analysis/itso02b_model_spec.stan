

data {
  int<lower=1> N;
  int<lower=1> S;
  int<lower=1> nGroup;
  int trMax;
  int gr[N];
  int x1[N, S, trMax];
  int x2[N, S, trMax];
  int x3[N, S, trMax];
  int y1[N, S, trMax];
  int y2[N, S, trMax];
  int y3[N, S, trMax];
  int nObserved[N, S];
  
}

parameters {
  real d[N,S];
  real b1[N,S];
  real b2[N,S];
  real b3[N,S];
  real eps1[N,S];
  real eps2[N,S];
  real eps3[N,S];
  

  
  real dH[S, nGroup];
  
  real<lower=0> dH_sigma[S, nGroup];
  real b1H[S, nGroup];
  real<lower=0> b1H_sigma[S, nGroup];
  real b2H[S, nGroup];
  real<lower=0> b2H_sigma[S, nGroup];
  real b3H[S, nGroup];
  real<lower=0> b3H_sigma[S, nGroup];
  real eps1H[S, nGroup];
  real<lower=0> eps1H_sigma[S, nGroup];
  real eps2H[S, nGroup];
  real<lower=0> eps2H_sigma[S, nGroup];
  real eps3H[S, nGroup];
  real<lower=0> eps3H_sigma[S, nGroup];

}

transformed parameters {
  real z[N, S, trMax]; 
  real za[N, S, trMax];
  real zb[N, S, trMax];
  real z1[N, S, trMax];
  real z2[N, S, trMax];
  real z3[N, S, trMax];
  real<lower=0, upper=1> p1[N, S, trMax];
  //vector<lower=0, upper=1>[N, S, trMax,2] p1;
  real<lower=0, upper=1> p2[N, S, trMax];
  real<lower=0, upper=1> p3[N, S, trMax];

  for (i in 1:N) {
    for (s in 1:S) {
      for (t in 1:trMax) {
        z[i,s,t] = x1[i,s,t] - x2[i,s,t];
        za[i,s,t] = x1[i,s,t] - x3[i,s,t];
        zb[i,s,t] = x2[i,s,t] - x3[i,s,t];
        z1[i,s,t] = 1 - 2 * x1[i,s,t] - x2[i,s,t] - x3[i,s,t];
        z2[i,s,t] = 1 - x1[i,s,t] - 2 * x2[i,s,t] - x3[i,s,t];
        z3[i,s,t] = 1 - x1[i,s,t] - x2[i,s,t] - 2 * x3[i,s,t];
        
        if (t <= nObserved[i,s]) {
          p1[i,s,t] = Phi(b1[i,s] - b2[i,s] + d[i,s] * z[i,s,t] + eps1[i,s]) * Phi(b1[i,s] - b3[i,s] + d[i,s] * za[i,s,t] + eps1[i,s]) * Phi(b1[i,s] - d[i,s] * z1[i,s,t] + eps1[i,s]);
          p2[i,s,t] = Phi(b2[i,s] - b1[i,s] - d[i,s] * z[i,s,t] + eps2[i,s]) * Phi(b2[i,s] - b3[i,s] + d[i,s] * zb[i,s,t] + eps2[i,s]) * Phi(b2[i,s] - d[i,s] * z2[i,s,t] + eps2[i,s]);
          p3[i,s,t] = Phi(b3[i,s] - b1[i,s] - d[i,s] * za[i,s,t] + eps3[i,s]) * Phi(b3[i,s] - b2[i,s] - d[i,s] * zb[i,s,t] + eps3[i,s]) * Phi(b3[i,s] - d[i,s] * z3[i,s,t] + eps3[i,s]); 
      
        } else {
          p1[i,s,t] = 0;
          p2[i,s,t] = 0;
          p3[i,s,t] = 0;
        }
      }
    }
  }
}

model {

  
  // hyperpriors
  for (s in 1:S) {
    for (g in 1:nGroup) {
      dH[s,g] ~ normal(0, 10);
      dH_sigma[s,g] ~ cauchy(0,2.5);
      
      b1H[s,g] ~ normal(0, 10);
      b1H_sigma[s,g] ~ cauchy(0,2.5);
      
      b2H[s,g] ~ normal(0, 10);
      b2H_sigma[s,g] ~ cauchy(0,2.5);
      
      b3H[s,g] ~ normal(0, 10);
      b3H_sigma[s,g] ~ cauchy(0,2.5);
      
      eps1H[s,g] ~ normal(0, 10);
      eps1H_sigma[s,g] ~ cauchy(0,2.5);
      
      eps2H[s,g] ~ normal(0, 10);
      eps2H_sigma[s,g] ~ cauchy(0,2.5);
      
      eps3H[s,g] ~ normal(0, 10);
      eps3H_sigma[s,g] ~ cauchy(0,2.5);
    }
  }
  
  // Likelihood
  for (i in 1:N) {
    for (s in 1:S) {
      // Priors
      d[i,s] ~ normal(dH[s,gr[i]], dH_sigma[s,gr[i]]);
      b1[i,s] ~ normal(b1H[s,gr[i]], b1H_sigma[s,gr[i]]);
      b2[i,s] ~ normal(b2H[s,gr[i]], b2H_sigma[s,gr[i]]);
      b3[i,s] ~ normal(b2H[s,gr[i]], b2H_sigma[s,gr[i]]);
      
      // priors on error terms
      eps1[i,s] ~ normal(eps1H[s,gr[i]], eps1H_sigma[s,gr[i]]);
      eps2[i,s] ~ normal(eps2H[s,gr[i]], eps2H_sigma[s,gr[i]]);
      eps3[i,s] ~ normal(eps3H[s,gr[i]], eps3H_sigma[s,gr[i]]);
    
      y1[i,s,1:nObserved[i,s]] ~ bernoulli(p1[i,s,1:nObserved[i,s]]);
      y2[i,s,1:nObserved[i,s]] ~ bernoulli(p2[i,s,1:nObserved[i,s]]);
      y3[i,s,1:nObserved[i,s]] ~ bernoulli(p3[i,s,1:nObserved[i,s]]);
    }
  }
}

generated quantities {
  int y1_pred[N, S, trMax];
  int y2_pred[N, S, trMax];
  int y3_pred[N, S, trMax];

  for (i in 1:N) {
    for (s in 1:S) {
      y1_pred[i,s, 1:nObserved[i,s]] = bernoulli_rng(p1[i,s, 1:nObserved[i,s]]);
      y2_pred[i,s, 1:nObserved[i,s]] = bernoulli_rng(p2[i,s, 1:nObserved[i,s]]);
      y3_pred[i,s, 1:nObserved[i,s]] = bernoulli_rng(p3[i,s, 1:nObserved[i,s]]);
    }
  }
}
