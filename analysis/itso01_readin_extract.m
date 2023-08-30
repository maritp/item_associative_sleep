%
%ITSO01. readin raw data & extract all variables
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

clear 
clc

%% define directories & name of output (this should/could be edit)
gitdir = fullfile(filesep, 'Users', 'petzka', ...
'Documents', 'GitHub', 'item_associative_sleep'); % where scripts live
basedir = fullfile(filesep, 'Users', 'petzka', ...
    'Documents', 'projects', 'Bham', 'itso', 'data'); % where data live

savename = 'itso01_dat';

%% 
addpath(genpath(gitdir))
datdir = fullfile(basedir, 'raw');
savedir = fullfile(basedir, 'prep');

s_folder = {'session01' 'session02'}; % name of session folders in raw data
nsub = dir(fullfile(datdir, s_folder{1}, 'cond*'));

label_conf = {'ballroom', 'sauna',...
    'lighthouse', 'wheat_field'}; % label for confusion matrix

%% data structure of mat file
dat_out.desc.mem_criterion = zeros(numel(nsub),1);
dat_out.desc.mem_criterion_ses2 = zeros(numel(nsub),1);
dat_out.desc.mem_criterion_dprime = zeros(numel(nsub),1);
s_names = {'ret1' 'ret2'}; % name of 2 sessions in data structure

%% predefine matrix for assoc model
sub_id = []; 
cond_ = [];
ses_id = [];
trl_no = []; %trial number

isub_count = 1;

X1 = [];
X2 = [];
X3 = [];
X4 = [];

Y = [];
Y1 = [];
Y2 = [];
Y3 = [];
Y4 = [];
%%

for isub = 1:numel(nsub)
    
    assoc_tmp = [];
    
    for ises = 1:numel(s_folder)
        
        dat_in = readtable(fullfile(datdir, ...
            s_folder{ises}, nsub(isub).name));
        
        %% subj id cond age etc to put into table later
        if ises == 1
            dat_out.desc.id(isub,1) = dat_in.id(1);
            dat_out.desc.cond_(isub,1) = dat_in.c(1); % 1=12hsleep|2=12hwake|3=24hsleep|4=24hwake
            dat_out.desc.runid(isub,1) = dat_in.run_id(1);
            if ~iscell(dat_in.age(1))
                dat_out.desc.age(isub,1) = dat_in.age(1);
            else
                dat_out.desc.age(isub,1) = 999;
            end
            dat_out.desc.gender(isub,1) = dat_in.gender(1);
            dat_out.desc.language(isub,1) = dat_in.language(1);
            dat_out.desc.hand(isub,1) = dat_in.hand(1);
        end
        
        %% define tasksOI
        if ises == 1
            enc_idx = find(ismember(dat_in.task, 'enc'));
            enc_ob = string(dat_in.obj_(enc_idx));
            enc_sc = string(dat_in.sc_(enc_idx));
        end
        ret_idx = find(ismember(dat_in.task, 'ret'));
        
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        %% ------------ item memory ----------------
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        
        %% get indices
        % get idx of old vs new items based on encoding
        ret_ob = string(dat_in.obj_(ret_idx));
        ret_idx_old = ismember(ret_ob, enc_ob);
        
        % responses
        ret_resp = dat_in.response(ret_idx);
        ret_resp = cellfun(@str2num, ret_resp);
        
        % response of old vs. new items
        ret_resp_old = ret_resp(ret_idx_old);
        ret_resp_new = ret_resp(~ret_idx_old);
        
        %% get hits, misses etc
        n.hits = sum(ret_resp_old>50);
        n.miss = sum(ret_resp_old<50);
        n.corr_rej = sum(ret_resp_new<50);
        n.fa = sum(ret_resp_new>50);
        
        dat_out.(s_names{ises}).item.n_hits(isub,1) = n.hits;
        dat_out.(s_names{ises}).item.n_miss(isub,1) = n.miss;
        dat_out.(s_names{ises}).item.n_corr_rej(isub,1) = n.corr_rej;
        dat_out.(s_names{ises}).item.n_fa(isub,1) = n.fa;
        dat_out.(s_names{ises}).item.hit_rate(isub,1) = n.hits/(n.hits+n.miss);
        dat_out.(s_names{ises}).item.fa_rate(isub,1) = n.fa/(n.fa+n.corr_rej);
        
        %% dprime and c (no model fitting, direct calculation)
        
        % Hautus correction. +0.5 = correction to calucalte dprime
        n.hits = n.hits + 0.5;
        n.miss = n.miss + 0.5;
        n.corr_rej = n.corr_rej + 0.5;
        n.fa = n.fa+0.5;
        
        % d prime & criterion
        [dat_out.(s_names{ises}).item.dprime(isub,1),...
            dat_out.(s_names{ises}).item.c(isub,1)] = dprime_simple(...
            n.hits/(n.hits+n.miss),...
            n.fa/(n.corr_rej+n.fa));
        
        %% get confidence rating 
        ret_resp_old(ret_resp_old<50) = NaN;
        conf_item(isub, ises) = nanmean(ret_resp_old);
        
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        %% ------------ associative memory ----------------
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        
        % response
        ret_slider = dat_in.response_slider(ret_idx+1);
        ret_resp2slider = dat_in.response_value(ret_idx+1);
        ret_resp2slider = cellfun(@str2num, ret_resp2slider);
       
        % get correct associative memory performance
        idx_retinenc = find(ismember(enc_ob, ret_ob));
        obOI = enc_ob(idx_retinenc); % old objects tested during ret
        scOI = enc_sc(idx_retinenc); % get corresponding scenes of objects
        
        assoc_corr = zeros(50,1); % how many of old items have correct assoc
        assoc_resp = nan(50,1);
        assoc_rt = zeros(50,1);
        class_label = zeros(50,1);
        class_predict = zeros(50,1);
        
        count = 1;
        conf_mat_tmp = zeros(numel(label_conf),numel(label_conf));
        
        for i = 1:numel(ret_ob)
            
            idx_ = find(ismember(obOI, ret_ob(i))); % find idx of old items in enc vector
            
            if isempty(idx_) % skip new objects
                continue
            end
            
            if ret_resp(i) < 50 % skip item misses as no assoc response was given
                count = count+1;
                continue
            end
            
            % get correct scene (from encoding) & selected scene
            sc_corr = scOI(idx_);
            sc_sel = ret_slider(i);

            % get correct association (0 = item misses)
            if strcmpi(sc_corr{1}(1:end-4), sc_sel) 
                assoc_corr(count) = 1;
            else
                assoc_corr(count) = -1;
            end
            
            % get confidence
            assoc_resp(count) = ret_resp2slider(i);
           
            % build confusion matrix
             class_label_tmp = find(ismember(label_conf, sc_corr{1}(1:end-4)));
             class_predict_tmp = find(ismember(label_conf, sc_sel{1}));
%             conf_mat_tmp(class_label_tmp, class_predict_tmp) = conf_mat_tmp(class_label_tmp, class_predict_tmp) + 1; 
            
            % save for modelling dprime + bias
            class_label(count) = class_label_tmp;
            class_predict(count) = class_predict_tmp;
            
            count = count+1;
            
        end
        
        %% re arrange class labels and predicted classes 
        class_label(class_label == 0) = [];
        class_predict(class_predict == 0) = [];
        
        dat_out.(s_names{ises}).assoc.ncorr(isub) = ...
            sum(class_label - class_predict == 0);
        
        % item memory correct but association incorrect
        dat_out.(s_names{ises}).assoc.incorr(isub) = ...
            sum(class_label - class_predict ~= 0);
        
        
        %% just save these data if associative performance threshold is reached
        assoc_tmp(ises) = sum(class_label - class_predict == 0)*(100/(n.hits - 0.5));
        
        if assoc_tmp(1) > 25 
        
            % put actual class in X1, X2, X3, X4 format
            X1_ = class_label == 1;
            X2_ = class_label == 2;
            X3_ = class_label == 3;
            X4_ = class_label == 4; % not needed for model (derived from X1 to X3)

            % which class was choosen
            Y_ = class_predict;
            Y1_ = class_predict == 1;
            Y2_ = class_predict == 2;
            Y3_ = class_predict == 3;
            Y4_ = class_predict == 4;

            %% save in a separate matrix
            % {'ballroom', 'sauna','lighthouse', 'wheat_field'} = 1,2,3,4
            X1 = [X1; X1_];
            X2 = [X2; X2_];
            X3 = [X3; X3_];
            X4 = [X4; X4_];

            Y = [Y; Y_];
            Y1 = [Y1; Y1_];
            Y2 = [Y2; Y2_];
            Y3 = [Y3; Y3_];
            Y4 = [Y4; Y4_];

            %% add subject ID and trl no
            sub_id_ = repmat(isub_count,[numel(X1_),1]);
            sub_id = [sub_id; sub_id_];
            
            cond_tmp = repmat(dat_out.desc.cond_(isub,1),[numel(X1_),1]);
            cond_ = [cond_; cond_tmp];

            ses_id_ = repmat(ises,[numel(X1_),1]);
            ses_id = [ses_id; ses_id_];

            trl_no_ = 1:numel(X1_);
            trl_no = [trl_no; trl_no_'];
            
            if ises == 2
                isub_count = isub_count +1;
            end
        
        end
        
        %% get confidence ratings 
        assoc_resp(assoc_corr~= 1) = NaN; % to get confidence rating just for hits
        
        conf_assoc(isub,ises) = nanmean(assoc_resp);
        
        %% check for associative performance criterion
        if ises == 2
            assoc_ncorr = ...
                sum(assoc_corr == 1);
            
            item_nhits = dat_out.(s_names{ises}).item.n_hits(isub,1);
            
            if (assoc_ncorr/item_nhits) < .25 || isnan(assoc_ncorr/item_nhits)
                dat_out.desc.mem_criterion_ses2(isub) = 1;
            end

        end
        
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        %% ------------ pvt ----------------
        %%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
        
        pvt_idx = find(ismember(dat_in.task, 'pvt'));
        
        rt_pvt_tmp = dat_in.rt(pvt_idx);
        rt_pvt = 0;
        
        lap_pvt = 0;
        icnt = 1;
        for i = 1:numel(rt_pvt_tmp)
            
            rt_ = str2double(rt_pvt_tmp{i});
            
            if isnan(rt_) || rt_ > 500
                lap_pvt = lap_pvt +1;
                continue
            end
            rt_pvt(icnt) = rt_;
            icnt = icnt +1;
            
        end
        
        dat_out.(s_names{ises}).pvt.rt_mean(isub) = nanmean(rt_pvt);
        dat_out.(s_names{ises}).pvt.lapses(isub) = lap_pvt;

    end
     
    
end


%% save data_out as matfile
if ~exist(savedir)
    mkdir(savedir)
end

save(fullfile(savedir, savename), 'dat_out')

%% save main data as txt file to load in R

female_idx = strcmpi(dat_out.desc.gender, 'female');
male_idx = strcmpi(dat_out.desc.gender, 'male');
non_idx = strcmpi(dat_out.desc.gender, 'non-binary');
gender_ = double(~male_idx); % 0 = male, 1 = female, 2 = non-binary
gender_(non_idx) = 2;

% define INTERVAL factor
interval_ = dat_out.desc.cond_;
interval_(dat_out.desc.cond_==1) = 1; %sleep
interval_(dat_out.desc.cond_==3) = 1; %sleep
interval_(dat_out.desc.cond_==2) = 2; %wake
interval_(dat_out.desc.cond_==4) = 2; %wake

% define DURATION factor
duration = dat_out.desc.cond_;
duration(dat_out.desc.cond_==1) = 1; %12 hours
duration(dat_out.desc.cond_==2) = 1; %12 hours
duration(dat_out.desc.cond_==3) = 2; %24 hours
duration(dat_out.desc.cond_==4) = 2; %24 hours

dat_mat(:,1) = 1:numel(nsub); % subj ID
dat_mat(:,2) = dat_out.desc.age; % age
dat_mat(:,3) = gender_; % gender
dat_mat(:,4) = dat_out.desc.cond_; %condition 
dat_mat(:,5) = interval_; %interval factor
dat_mat(:,6) = duration; %duration factor

%item memory
dat_mat(:,7) = dat_out.ret1.item.n_hits;
dat_mat(:,8) = dat_out.ret1.item.n_miss;
dat_mat(:,9) = dat_out.ret1.item.n_fa;
dat_mat(:,10) = dat_out.ret1.item.n_corr_rej;

dat_mat(:,11) = dat_out.ret2.item.n_hits;
dat_mat(:,12) = dat_out.ret2.item.n_miss;
dat_mat(:,13) = dat_out.ret2.item.n_fa;
dat_mat(:,14) = dat_out.ret2.item.n_corr_rej;

%associative memory
dat_mat(:,15) = dat_out.ret1.assoc.ncorr;
dat_mat(:,16) = dat_out.ret2.assoc.ncorr;

% confidence - item memory
dat_mat(:,17) = conf_item(:,1);
dat_mat(:,18) = conf_item(:,2);

% confidence - associative memory
dat_mat(:,19) = conf_assoc(:,1);
dat_mat(:,20) = conf_assoc(:,2);

% pvt
dat_mat(:,21) = dat_out.ret1.pvt.rt_mean;
dat_mat(:,22) = dat_out.ret2.pvt.rt_mean;
dat_mat(:,23) = dat_out.ret1.pvt.lapses;
dat_mat(:,24) = dat_out.ret2.pvt.lapses;


%% save
dlmwrite(fullfile(savedir, [savename '.txt']), dat_mat,'delimiter', '\t')

%% save associative data as txt file to load in R

dat_mat_assoc(:,1) = sub_id;
dat_mat_assoc(:,2) = cond_;
dat_mat_assoc(:,3) = ses_id;
dat_mat_assoc(:,4) = trl_no;
dat_mat_assoc(:,5) = X1;
dat_mat_assoc(:,6) = X2;
dat_mat_assoc(:,7) = X3;
dat_mat_assoc(:,8) = X4;
dat_mat_assoc(:,9) = Y1;
dat_mat_assoc(:,10) = Y2;
dat_mat_assoc(:,11) = Y3;
dat_mat_assoc(:,12) = Y4;
dat_mat_assoc(:,13) = Y;

%%
dlmwrite(fullfile(savedir, 'assoc_dat.txt'), dat_mat_assoc,'delimiter', '\t')

