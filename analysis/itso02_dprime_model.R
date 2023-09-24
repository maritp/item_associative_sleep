
extract_sub_and_session <- function(df) {
  # Apply the function and create new columns
  df <- df %>%
    mutate(numbers = lapply(variable, extract_numbers)) %>%
    mutate(sub = sapply(numbers, `[`, 1),
           session = sapply(numbers, `[`, 2)) %>%
    select(-numbers)
  return(df)
  
}
extract_numbers <- function(input_string) {
  #numbers <- as.numeric(gsub("[^0-9]", " ", input_string))
  matches <- regmatches(input_string, gregexpr("\\d+", input_string))
  # Convert extracted numbers to numeric
  numbers <- as.numeric(unlist(matches))
  return(numbers)
}


library(rstan)
library(posterior)
library(dplyr)
library(ggplot2)


# which data are used
here::i_am('.hidden_root')
dataname = 'assoc_dat.txt'
#datname2 = 'itso01_dat.txt'

# load associative memory data
cols = c('id', 'cond', 'ses', 'trl', 'x1', 'x2', 'x3', 'x4',
         'y1', 'y2', 'y3', 'y4', 'y') # y = choice, x = real
dat = read.table(here::here('data', dataname), col.names = cols)

# maximum number of trials/session
nsub = tail(dat$id, n = 1)
nObserved <- matrix(NA, nsub, 2) 
for (isub in unique(dat$id)) {
  for (ises in c(1,2)) {
    tmp_ = dat$trl[dat$id == isub & dat$ses == ises]
    nObserved[isub, ises] = tail(tmp_,n = 1)
  }
}


# get x1, x2, x3, y1, y2, y3
maxTr = max(nObserved)
nses = 2

cond_ <- array(0, dim = nsub)

x1 <- array(0, dim = c(nsub, nses, maxTr))
x2 <- array(0, dim = c(nsub, nses, maxTr))
x3 <- array(0, dim = c(nsub, nses, maxTr))

y1 <- array(0, dim = c(nsub, nses, maxTr))
y2 <- array(0, dim = c(nsub, nses, maxTr))
y3 <- array(0, dim = c(nsub, nses, maxTr))

#gid <- c()

for (isub in unique(dat$id)){
  
  # getting condition (1 = 12hsleep, 2 = 12hwake, 3 = 24h sleep-wake, 4 = 24 h wake-sleep)
  cond_[isub] = dat$cond[dat$id == isub & dat$trl == 1 & dat$ses == 1]
  
  for (ises in c(1,2)){
    subdat = dat[dat$id == isub & dat$ses == ises,]
    x1[isub, ises, 1:nObserved[isub, ises]] = subdat$x1
    x2[isub, ises, 1:nObserved[isub, ises]] = subdat$x2
    x3[isub, ises, 1:nObserved[isub, ises]] = subdat$x3
    
    y1[isub, ises, 1:nObserved[isub, ises]] = subdat$y1  
    y2[isub, ises, 1:nObserved[isub, ises]] = subdat$y2  
    y3[isub, ises, 1:nObserved[isub, ises]] = subdat$y3
    
  }
}

# Data for Stan
N = length(unique(dat$id))
stan.data <- list(N=N, gr=cond_,nGroup=4, S=2, x1=x1, x2=x2, x3=x3, y1=y1, y2=y2, y3=y3, nObserved=nObserved, trMax=50 )

flag <- "hierarchical_group_priors"

# Compile and run the Stan model
fitit <- 1
if (fitit==1) {
  fit <- stan(file = here::here('models', 'itso_model_2_hierarchical_group_priors_w_covariance.stan'), data = stan.data, chains = 1, iter = 50, warmup = 20)
  fit@stanmodel@dso <- new("cxxdso")
  saveRDS(fit, here::here('data', paste0('model_fit_', flag, '.rds')))
  #saveRDS(stanfit1, file = here::here("..", "output", "pl3_stuff", "stan_model_fits",paste0(modelFile, "_", flag ,".rds")))
  
} else {
  # fit with 16 chains, 300 warmup 300 samples each
  #fit <- readRDS(here::here('data', 'model_fit_16ch_300.rds'))
  fit <- readRDS(here::here('data', paste0('model_fit_', flag, '.rds')))
  #fit <- readRDS(here::here('data', 'model_fit.rds'))
  # Print the summary
  #print(fit)
  
  
}


sfit <- posterior::as_draws_df(fit)
sum <- posterior::summarise_draws(sfit)


#fltdfit <- sfit[(grepl( "alpha", names(samfit2)) & !grepl( "alphaH",names(samfit2)))]
df <- sum[grepl( "d", sum$variable) & !grepl( "pred",sum$variable) & !grepl( "dH",sum$variable) & !grepl( "dH_sigma",sum$variable),]


df = extract_sub_and_session(df)
df$sess_str <- as.factor(paste0("s",df$session))
write.csv(df, here::here('data', paste0('dprime_', flag,'.csv')))

df <- sum[grepl( "b1", sum$variable) & !grepl( "pred",sum$variable) & !grepl( "b1H",sum$variable) & !grepl( "b1H_sigma",sum$variable),]
df = extract_sub_and_session(df)
df$sess_str <- as.factor(paste0("s",df$session))
write.csv(df, here::here('data', paste0('b1_', flag,'.csv')))

df <- sum[grepl( "b2", sum$variable) & !grepl( "pred",sum$variable) & !grepl( "b2H",sum$variable) & !grepl( "b2H_sigma",sum$variable),]
df = extract_sub_and_session(df)
df$sess_str <- as.factor(paste0("s",df$session))
write.csv(df, here::here('data', paste0('b2_', flag,'.csv')))

df <- sum[grepl( "b3", sum$variable) & !grepl( "pred",sum$variable) & !grepl( "b3H",sum$variable) & !grepl( "b3H_sigma",sum$variable),]
df = extract_sub_and_session(df)
df$sess_str <- as.factor(paste0("s",df$session))
write.csv(df, here::here('data', paste0('b3_', flag,'.csv')))

