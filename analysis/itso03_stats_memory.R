
# packages_ = c('ggplot2', 'Rmisc', 'lme4', 'emmeans',
#               'stats', 'ggdist', 'dplyr', 'psyphy',
#               'car', 'patchwork', 'BayesFactor', 'lmerTest', 'psycho')

#install.packages(packages_)

library(patchwork)
library(ggplot2)
library(Rmisc)
library(psyphy)
library(lme4)
library(ggdist)
library(nlme)
library(car) 
library(dplyr)
#library(emmeans)
#library(rstatix)
library(BayesFactor)
#library(lme4)
library(lmerTest)
#install.packages('brms')
#library('brms')
library(psycho)
library(here)


######### data ################
###############################
datdir = file.path(.Platform$file.sep, 'Users','petzka', 'Documents',
                   'projects', 'Bham', 'itso')
setwd(datdir)
here::i_am('.hidden_root')

########### load main data 

datmainfile = 'itso01_dat.txt' # output from itso01
cols = c('id', 'age', 'gender', 'cond', 'interval', 'duration',
         'hits1', 'miss1', 'fa1', 'corr_rej1', 
         'hits2', 'miss2', 'fa2', 'corr_rej2', 
         'assoc_corr1', 'assoc_corr2', 
         'itemconf1', 'itemconf2', 'assocconf1', 'assocconf2',
         'pvt_rt1', 'pvt_rt2', 'pvt_lap1', 'pvt_lap2')
dat = read.table(here::here(file.path('data', 'prep'), datmainfile), col.names = cols)

# define factors
dat$gender = factor(dat$gender, labels = c('male', 'female', 'non-binary'))
dat$cond = factor(dat$cond, labels = c('sleep12', 'wake12', 'sleep24', 'wake24')) 
dat$interval = factor(dat$interval, labels = c('sleep', 'wake'))
dat$duration = factor(dat$duration, labels = c('12h', '24h'))

########### load other data files
#- nap duration
napdatfile = 'itso_q_nap.txt'
datq = read.table(here::here(file.path('data', 'prep'), napdatfile), 
                  header = TRUE, col.names = 'napdur')
dat$napdur = datq$napdur
#- sleep duration
sleepdatfile = 'itso_q_sleepdur.txt'
datq = read.table(here::here(file.path('data', 'prep'), sleepdatfile), 
                  header = TRUE, col.names = 'sleepdur')
dat$sleepdur = datq$sleepdur

#- model results 
dprimefile = 'dprime_hierarchical_group_priors_ch4_3k.csv'
b1file = 'b1_hierarchical_group_priors_ch4_3k.csv'
b2file = 'b2_hierarchical_group_priors_ch4_3k.csv'
b3file = 'b3_hierarchical_group_priors_ch4_3k.csv'

dat_d = read.csv(here::here(file.path('data', 'prep'), dprimefile), header = TRUE, sep = ",")
dat_bias1 = read.csv(here::here(file.path('data', 'prep'), b1file), header = TRUE, sep = ",")
dat_bias2 = read.csv(here::here(file.path('data', 'prep'), b2file), header = TRUE, sep = ",")
dat_bias3 = read.csv(here::here(file.path('data', 'prep'), b3file), header = TRUE, sep = ",")

######### excluding participants.... ######
###########################################

# (1) .... based on pre-registered exclusion criterion (assoc memory performance < 25%)
dat$assoc_acc1 = dat$assoc_corr1/dat$hits1

assoc_excl_crit = dat$assoc_acc1 < 0.25 | is.nan(dat$assoc_acc1)
sum(assoc_excl_crit) # number of excluded participants
dat = dat[assoc_excl_crit == FALSE,] 

## include model data here (assoc memory performance already excluded before)
# get session 1
dat$assocd1_mod = dat_d$mean[1:dim(dat)[1]]
dat$bias11 = dat_bias1$mean[1:dim(dat)[1]]
dat$bias21 = dat_bias2$mean[1:dim(dat)[1]]
dat$bias31 = dat_bias3$mean[1:dim(dat)[1]]

# get session 2
d2_tmp = dat_d$mean[dim(dat)[1] +1 :dim(dat_d)[1]]
b12_tmp = dat_bias1$mean[dim(dat)[1] +1 :dim(dat_bias1)[1]]
b22_tmp = dat_bias2$mean[dim(dat)[1] +1 :dim(dat_bias2)[1]]
b32_tmp = dat_bias3$mean[dim(dat)[1] +1 :dim(dat_bias3)[1]]

dat$assocd2_mod = d2_tmp[!is.na(d2_tmp)]
dat$bias12 = b12_tmp[!is.na(b12_tmp)]
dat$bias22 = b22_tmp[!is.na(b22_tmp)]
dat$bias32 = b32_tmp[!is.na(b32_tmp)]

# (2) .... based on nap during the day
dim(dat)[1] - sum(dat$napdur == 0) # number of excluded participants
dat = dat[dat$napdur == 0,]

# check distribution of (item memory performance = dprime)
dprime_out = dprime(dat$hits1, dat$fa1, dat$miss1, dat$corr_rej1, adjusted = TRUE)
dat$itemd1 = dprime_out$dprime
dprime_out = dprime(dat$hits2, dat$fa2, dat$miss2, dat$corr_rej2, adjusted = TRUE)
dat$itemd2 = dprime_out$dprime

# (3) .... based on item memory performance
# (deviation from pre-registration, see Table S1.1)
varOI = dat$itemd1
box_width = 0.2
ggplot(data=dat, aes(x = factor(0), y=varOI)) +
  geom_violin()+
  geom_jitter(width = 0.05)

excl_item = dat$itemd1 < mean(dat$itemd1) - 3*sd(dat$itemd1)
sum(excl_item)
dat = dat[!excl_item,]

######### descriptives ######
#############################

##### ------ for supplement (Table S.2)
# which stats (mean , 95%CIs)
f <- function(x) c(mean(x), qnorm(0.975)*sd(x)/sqrt(length(x)))

#### item memory
tapply(dat$hits1, dat$cond, f)
tapply(dat$miss1, dat$cond, f)
tapply(dat$fa1, dat$cond, f)
tapply(dat$corr_rej1, dat$cond, f)

tapply(dat$hits2, dat$cond, f)
tapply(dat$miss2, dat$cond, f)
tapply(dat$fa2, dat$cond, f)
tapply(dat$corr_rej2, dat$cond, f)

#### assoc memory
tapply(dat$assoc_corr1, dat$cond, f)
tapply(dat$assoc_corr2, dat$cond, f)

#### subjective sleep duration
f <- function(x) c(mean(x, na.rm = TRUE), qnorm(0.975)*sd(x, na.rm = TRUE)/sqrt(length(x)))
tapply(dat$sleepdur, dat$cond, f)


dat$assoc_acc2 = dat$assoc_corr2/dat$hits2

# correlation between pre-registered measure and dprime metric
a = cor.test(dat$assocd1, dat$assoc_acc1)
a = cor.test(dat$assocd1, dat$assocd1_mod)
a
ggplot(data = dat, aes(x = assocd1, y = assocd1_mod)) + 
  geom_point()

ggplot(data = dat, aes(x = assocd2, y = assocd2_mod)) + 
  geom_point()

##### ------ test for baseline differences between all 4 conditions
bl = lm(itemd1 ~ cond, data = dat)
anova(bl)

bl = lm(assocd1_mod ~ cond, data = dat)
anova(bl)


######### main model ######
###########################

# restructure data frame
vars = c("id", "cond", "interval", "duration", "itemd1", "itemd2",
         "assocd1_mod", "assocd2_mod")
dat_mod = dat[vars]
dat_mod = reshape(data = dat_mod, idvar = "id",
                  varying = c("itemd1", "itemd2",
                              "assocd1_mod", "assocd2_mod"),
                  v.name = c("d1", "d2"),
                  times = c("item", "assoc"),
                  direction = "long")
names(dat_mod)[5] = "type" 
dat_mod$type = factor(dat_mod$type, labels = c('Associative memory', 'Item memory'))

# consolidation measure: ret2 - ret1
dat_mod$d = dat_mod$d2 - dat_mod$d1

mod2 = lm(d ~ interval*duration*type, dat_mod)
anova(mod2) 

# bayes
mod1_bf_interaction <- lmBF(d ~ interval:duration:type, data = dat_mod)
1/mod1_bf_interaction

# post hoc
t.test(dat_mod$d[dat_mod$cond == 'wake12'], 
       dat_mod$d[dat_mod$cond == 'wake24'])


######### item memory #########
###############################
dat$itemd = dat$itemd2 - dat$itemd1

# run
mod2 = lm(itemd ~ interval*duration, dat)
anova(mod2)


#### associative memory #######
###############################

dat$assocd_mod = dat$assocd2_mod - dat$assocd1_mod

# run
mod3 = lm(assocd_mod ~ interval*duration, dat)
anova(mod3)





######### plot ################
###############################

### ----- settings plotting
delay1_col = 'dodgerblue4' #colour for sleep cond
delay2_col = 'grey60' #colour for sleep cond

dat_sum = summarySE(data = dat_mod, 
                    measurevar = 'd', 
                    groupvars = c('interval', 'duration', 'type'))

a <- ggplot(data = dat_mod, mapping = aes(x = duration, y = d, fill = interval)) +
  facet_wrap(~type) +
  geom_flat_violin(aes(fill= interval),
                   position = position_nudge(x = .23, y = 0), 
                   adjust = 1, trim = TRUE, alpha = .5, colour = 'grey30', size = 1.6) +
  geom_errorbar(data = dat_sum, aes(x = duration, y = d, ymin = d - ci,
                                        ymax = d + ci, color = interval),
                position=position_dodge(.2), width = 0, size = 2) + 
  geom_point(data = dat_sum, aes(x = duration, y = d, color = interval), 
             position=position_dodge(.2), size = 4.5) +
  geom_point(data = dat_mod, aes(x = duration, y = d, color = interval), 
             position=position_jitterdodge(jitter.width = 0.08, dodge.width = .5), 
             size = 2.8, alpha = .2) +
  scale_colour_manual(values = c(delay1_col, delay2_col)) +
  scale_fill_manual(values = c(delay1_col, delay2_col)) +
  theme_classic()+
  expand_limits(x= c(length(levels(dat_mod$duration)), 
                     length(levels(dat_mod$duration))+0.7))+
  ylab("d' (ret2 - ret1)") +
  theme(text = element_text(size = 25),
        legend.position = "none",
        axis.title.x = element_blank(),
        axis.title.y = element_blank())

### plot memory type togehter
dat_sum = summarySE(data = dat_mod, 
                    measurevar = 'd', 
                    groupvars = c('interval', 'duration'))

b <- ggplot(data = dat_mod, mapping = aes(x = duration, y = d, fill = interval)) +
  geom_flat_violin(aes(fill= interval),
                   position = position_nudge(x = .23, y = 0), 
                   adjust = 1, trim = TRUE, alpha = .5, colour = 'grey30', size = 1.6) +
  geom_errorbar(data = dat_sum, aes(x = duration, y = d, ymin = d - ci,
                                    ymax = d + ci, color = interval),
                position=position_dodge(.18), width = 0, size = 2) + 
  geom_point(data = dat_sum, aes(x = duration, y = d, color = interval), 
             position=position_dodge(.18), size = 4.5) +
  geom_point(data = dat_mod, aes(x = duration, y = d, color = interval), 
             position=position_jitterdodge(jitter.width = 0.08, dodge.width = .5), 
             size = 2.8, alpha = .2) +
  scale_colour_manual(values = c(delay1_col, delay2_col)) +
  scale_fill_manual(values = c(delay1_col, delay2_col)) +
  theme_classic()+
  expand_limits(x= c(length(levels(dat_mod$duration)), 
                     length(levels(dat_mod$duration))+0.7))+
  ylab("d' retention") +
  theme(text = element_text(size = 25),
        legend.position = "bottom",
        legend.justification = "right",
        legend.title = element_blank(),
        axis.title.x = element_blank())


c = b + a & scale_y_continuous(limits = c(-2.5, 0.7)) 

c + 
  plot_layout(widths = c(1, 1.7)) + # controlling the relative space of b & a
  plot_annotation(tag_levels = "A") 



## save
ggsave('fig2.png',
       plot = last_plot(),
       height = 6,
       width = 14,
       device = "png",
       path = file.path(.Platform$file.sep, 'Users','petzka',
                        'Documents', 'projects', 'Bham', 'itso', 'figures'),
       dpi = 400
)





### This script creates an R function to generate raincloud plots, then simulates
### data for plots. If using for your own data, you only need lines 1-80.
### It relies largely on code previously written by David Robinson
### (https://gist.github.com/dgrtwo/eb7750e74997891d7c20)
### and the package ggplot2 by Hadley Wickham

# Check if required packages are installed ----
packages <- c("cowplot", "readr", "ggplot2", "dplyr", "lavaan", "smooth", "Hmisc")
if (length(setdiff(packages, rownames(installed.packages()))) > 0) {
  install.packages(setdiff(packages, rownames(installed.packages())))
}

# Load packages ----
library(ggplot2)

# Defining the geom_flat_violin function ----
# Note: the below code modifies the
# existing github page by removing a parenthesis in line 50

"%||%" <- function(a, b) {
  if (!is.null(a)) a else b
}

geom_flat_violin <- function(mapping = NULL, data = NULL, stat = "ydensity",
                             position = "dodge", trim = TRUE, scale = "area",
                             show.legend = NA, inherit.aes = TRUE, ...) {
  layer(
    data = data,
    mapping = mapping,
    stat = stat,
    geom = GeomFlatViolin,
    position = position,
    show.legend = show.legend,
    inherit.aes = inherit.aes,
    params = list(
      trim = trim,
      scale = scale,
      ...
    )
  )
}

#' @rdname ggplot2-ggproto
#' @format NULL
#' @usage NULL
#' @export
GeomFlatViolin <-
  ggproto("GeomFlatViolin", Geom,
          setup_data = function(data, params) {
            data$width <- data$width %||%
              params$width %||% (resolution(data$x, FALSE) * 0.9)
            
            # ymin, ymax, xmin, and xmax define the bounding rectangle for each group
            data %>%
              group_by(group) %>%
              mutate(
                ymin = min(y),
                ymax = max(y),
                xmin = x,
                xmax = x + width / 2
              )
          },
          
          draw_group = function(data, panel_scales, coord) {
            # Find the points for the line to go all the way around
            data <- transform(data,
                              xminv = x,
                              xmaxv = x + violinwidth * (xmax - x)
            )
            
            # Make sure it's sorted properly to draw the outline
            newdata <- rbind(
              plyr::arrange(transform(data, x = xminv), y),
              plyr::arrange(transform(data, x = xmaxv), -y)
            )
            
            # Close the polygon: set first and last point the same
            # Needed for coord_polar and such
            newdata <- rbind(newdata, newdata[1, ])
            
            ggplot2:::ggname("geom_flat_violin", GeomPolygon$draw_panel(newdata, panel_scales, coord))
          },
          
          draw_key = draw_key_polygon,
          
          default_aes = aes(
            weight = 1, colour = "grey20", fill = "white", size = 0.5,
            alpha = NA, linetype = "solid"
          ),
          
          required_aes = c("x", "y")
  )
