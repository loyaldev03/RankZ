﻿(function () {
    'use strict';

    angular
        .module('app')
        .controller('answerDetail', answerDetail);

    answerDetail.$inject = ['flag', '$stateParams', '$state', 'answer', 'dialog', '$rootScope','$window', 'useractivity','htmlops',

        'votes', 'matchrec', 'edit', 'editvote', 'catans', 'datetime','commentops', 'userdata','useraccnt',
        '$location', 'vrows', 'vrowvotes','imagelist','instagram', '$scope','$cookies', '$q', 'fbusers', 'InstagramService', 'mailing']; //AM:added user service

    function answerDetail(flag, $stateParams, $state, answer, dialog, $rootScope, $window, useractivity,htmlops,
        votes, matchrec, edit, editvote, catans, datetime, commentops, userdata,useraccnt,
        $location, vrows, vrowvotes, imagelist, instagram, $scope, $cookies, $q, fbusers, InstagramService, mailing) { //AM:added user service
        /* jshint validthis:true */
        var vm = this;
        vm.title = 'answerDetail';
        //if ($location.absUrl().indexOf('code=')>-1)$window.location.search = '';

        var voteRecordExists = false;
        var dV = 0;
        var upVi = 0;  //upVotes initial value
        var downVi = 0; //downVotes initial value
        var answers = [];
        var recordsUpdated = false;
        vm.numEdits = 0;
        
        // Members
        vm.relativetable = [];
        vm.catans = [];
        vm.sm = $rootScope.sm;
        vm.votemode = false;
        vm.dispRanks = 3;
               
        // Methods
        vm.UpVote = UpVote;
        vm.DownVote = DownVote;
        vm.refresh = refresh;
        vm.goBack = goBack;
        vm.goPrev = goPrev;
        vm.goNext = goNext;
        vm.deleteAnswer = deleteAnswer;
        vm.flagAnswer = flagAnswer;
        vm.deleteButton = 'none';
        vm.showUrl = showUrl;
        vm.closeRank = closeRank;
        vm.closeAnswerDetail = closeAnswerDetail;
        vm.rankSel = rankSel;
        vm.bizRegDialog = bizRegDialog;
        vm.openSpecials = openSpecials;
        vm.editVRows = editVRows;
        vm.getImages = getImages;
        vm.showsimage = showsimage;
        vm.gotoRank = gotoRank;
        vm.vrowVoteUp = vrowVoteUp;
        vm.vrowVoteDown = vrowVoteDown;
        vm.loadComments = loadComments;
        vm.postComment = postComment;
        vm.selectPhoto = selectPhoto;
        vm.cmFlag = cmFlag;
        vm.deleteThisCatans = deleteThisCatans;
        vm.addRankforAnswer = addRankforAnswer;
        vm.votemodeON = votemodeON;
        vm.votemodeOFF = votemodeOFF;
        vm.user = $rootScope.user;
        vm.endorseDialog = endorseDialog;
        vm.selectInstagramImages = selectInstagramImages;
        vm.showRanks = showRanks;
        vm.hideCustomRanks = hideCustomRanks;
        vm.hideGetPremium = hideGetPremium;
        vm.gotoMyBusiness = gotoMyBusiness;

        //Admin Function adding catans on spot
        vm.addCatans = addCatans;
        vm.addctsactive = false;
        vm.addcts = addcts;

       //Comments related variables
        var cObj = {};
        cObj.commLoaded = false;
        cObj.initials = '';
        cObj.bc = '';
        cObj.fc = '';
        cObj.comments = [];
        cObj.newComment = '';
        vm.cm = cObj;
        vm.commentAllowed = true;
  
        //TODO: Would like to add this abstract template, but dont know how                           
        $rootScope.$on('$stateChangeStart',
            function (ev, to, toParams, from, fromParams) {
                if (from.name == 'answerDetail' && to.name != 'answerDetail') {
                    if (!recordsUpdated && $rootScope.isLoggedIn) updateRecords();
                }
            });

        var refreshImagesListener = $rootScope.$on('refreshImages', function () {
            if ($state.current.name == 'answerDetail') getImages();
        });
        var fileUploadedListener = $rootScope.$on('fileUploaded', function () {
            if ($state.current.name == 'answerDetail') getImages();
        });

        var answerDataLoadedListener = $rootScope.$on('answerDataLoaded', function () {
            vm.dataReady = true;
            activate();
        });

        $scope.$on('$destroy',refreshImagesListener);
        $scope.$on('$destroy',fileUploadedListener);
        $scope.$on('$destroy',answerDataLoadedListener);
    
        if ($rootScope.answerDetailLoaded) { vm.dataReady = true; activate(); }
        else vm.dataReady = false;

        //Flags to hide advertisement blocks
        vm.hideCustomRanksMsg = $rootScope.hideCustomRankMsg == undefined ? false:$rootScope.hideCustomRankMsg; 
        vm.hideGetPremiumMsg = $rootScope.hideGetPremiumMsg == undefined ? false:$rootScope.hideGetPremiumMsg;

        //activate();
        window.prerenderReady = false;

        function activate() {

            //Init variables
            //vm.ranking = $rootScope.title;
            answers = $rootScope.canswers;
            vm.fields = $rootScope.fields;
            vm.isAdmin = $rootScope.isAdmin;
            $rootScope.isLoggedIn = $rootScope.isLoggedIn ? $rootScope.isLoggedIn : false;
            vm.isLoggedIn = $rootScope.isLoggedIn;

            //vm.userIsOwner = $rootScope.userIsOwner;
            if ($stateParams.index) {
                var isnum = /^\d+$/.test($stateParams.index);
                if(isnum){
                    var i = $rootScope.answers.map(function (x) { return x.id; }).indexOf(+$stateParams.index);
                    vm.answer = $rootScope.answers[i];
                } else {
                    var i = $rootScope.answers.map(function (x) { return x.slug; }).indexOf($stateParams.index);
                    vm.answer = $rootScope.answers[i];
                }
            }

            // ----- SEO tags ----
            $scope.$parent.$parent.$parent.seo = { 
                pageTitle : vm.answer.name, 
                metaDescription: vm.answer.addinfo 
            };

            $rootScope.canswer = vm.answer;
            vm.type = vm.answer.type;
            //vm.isShortPhrase = vm.type == 'Short-Phrase';
            
            //if there is no category, look for it in cookies
            if ($rootScope.cCategory == undefined) {
                var ccategoryid = $cookies.get('ccategory');
                if ($rootScope.DEBUG_MODE) console.log("@answerDetail - ccategory ", ccategoryid);
                var idx = $rootScope.content.map(function (x) { return x.id; }).indexOf(ccategoryid);
                if (idx > -1) $rootScope.cCategory = $rootScope.content[idx];
            }

            if ($rootScope.inFavMode) vm.ranking = $rootScope.myfavs.title;
            else if ($rootScope.cCategory) vm.ranking = $rootScope.cCategory.title;
            else vm.ranking = '';

            //if answers not loaded (state went straight to asnwerDetail, answers is just current answer)
            if (answers == undefined) answers = [vm.answer];

            vm.idx = answers.map(function (x) { return x.id; }).indexOf(vm.answer.id) + 1;
            if ($rootScope.cCategory == undefined) vm.idx = 0;

            //Temp for Instagram Demo
            if (vm.answer.id == 2225) vm.igdemo = true;
            else vm.igdemo = false;

            getFields();

            //Set Image Mode -- Map or Photo
            vm.modeIsImage = $rootScope.modeIsImage == undefined ? true : $rootScope.modeIsImage;
            if (vm.answer.location == undefined) vm.modeIsImage = true;

            if ($rootScope.previousState != 'answerDetail') $window.scrollTo(0, 0);

            vm.showImageGallery = false;
            $rootScope.$emit('showLogo');

            getHeader();
            //        getCatAnsId(vm.answer.id);
            getEdits(vm.answer.id);
            deleteButtonAccess();
            vm.access = false; //use this variable to access editspecials
            if ($rootScope.isLoggedIn) {
                if ($rootScope.user.id == vm.answer.owner) {
                    vm.userIsOwner = true;
                    if (vm.answer.isactive) vm.access = true;
                }
                else vm.userIsOwner = false;
            }
            else vm.userIsOwner = false;

            $rootScope.userIsOwner = vm.userIsOwner;

            //if (vm.type == 'Establishment') getHours();
            if (vm.type != 'Establishment' && vm.type != 'Event' && false) makeRelativeTable(vm.answer.id);
            if (vm.type == 'Establishment') getSpecials(vm.answer.id);
            if (vm.type == 'Establishment' || vm.type == 'PersonCust') getVRows(vm.answer.id);
            getAnswerRanks();                        

            //if user votes are available - do my thing at getAnswerVotes
            //else fetch user votes
            if ($rootScope.cvotes) getAnswerVotes();
            else {
                $rootScope.cvotes = [];
                $rootScope.ceditvotes = [];
            }

            //Check if answer is event
            if (vm.type == 'Event') {
                var eventObj = JSON.parse(vm.answer.eventstr);
                //Object.assign(vm.answer, eventObj);
                mergeObject(vm.answer, eventObj);
                vm.ehtml = htmlops.eventHtml(vm.answer, vm.sm);
                vm.estyle = 'background-color:' + vm.answer.bc + ';color:' + vm.answer.fc + ';' + 'white-space:pre;';
            }

            //custom ranks 
            if (vm.answer.hasranks) {
                var n = 0;
                vm.myranks = JSON.parse(vm.answer.ranks);
                if (vm.myranks != undefined && vm.myranks.length > 0){
                    for (var i=0; i<vm.myranks.length; i++){
                        n = $rootScope.content.map(function(x) {return x.id; }).indexOf(vm.myranks[i].id);
                        vm.myranks[i].title = $rootScope.content[n].title.replace(' @ '+vm.answer.name,'');
                        vm.myranks[i].image = $rootScope.content[n].image1url;
                        if (vm.myranks[i].image == undefined || vm.myranks[i].image == '')
                        vm.myranks[i].image = $rootScope.EMPTY_IMAGE;
                    }
                }
                $rootScope.rankOwner = {};
                $rootScope.rankOwner.name = vm.answer.name;
                $rootScope.rankOwner.id = vm.answer.id;
            }
            //Demo custom ranks
            else if (vm.userIsOwner){
                vm.myranks = [];
                //Demo custom rank 1
                var demorank = {};
                demorank.id = 11091;
                demorank.bc = '#027fa8';
                demorank.fc = 'white';
                vm.myranks.push(demorank);
                //Demo custom rank 2
                demorank={};
                demorank.id = 11092;
                demorank.bc = '#027fa8';
                demorank.fc = 'white';
                vm.myranks.push(demorank);
                //Demo custom rank 3
                demorank={};
                demorank.id = 11093;
                demorank.bc = '#027fa8';
                demorank.fc = 'white';
                vm.myranks.push(demorank);

                for (var i=0; i<vm.myranks.length; i++){
                    n = $rootScope.content.map(function(x) {return x.id; }).indexOf(vm.myranks[i].id);
                    vm.myranks[i].title = $rootScope.content[n].title.replace(' @ Demo','');
                    vm.myranks[i].image = $rootScope.content[n].image1url;
                    if (vm.myranks[i].image == undefined || vm.myranks[i].image == '')
                    vm.myranks[i].image = $rootScope.EMPTY_IMAGE;
                }
                $rootScope.rankOwner = {};
                $rootScope.rankOwner.name = vm.answer.name;
                $rootScope.rankOwner.slug = vm.answer.slug;
            }
            
            //Determine number of user comments
            if (vm.answer.numcom == undefined) vm.numcom = 0;
            else vm.numcom = vm.answer.numcom;

            //Determine if necessary to show navigation buttons
            if (vm.ranking) vm.showNextnPrev = true;
            else vm.showNextnPrev = false;

            //Update number of views
            var nViews = vm.answer.views + 1;
            answer.updateAnswer(vm.answer.id, ['views'], [nViews]);

            votemodeOFF();

            if ($rootScope.DEBUG_MODE) console.log("Answer details loaded");

            window.prerenderReady = true;
        }

        function getFields() {

            if ($rootScope.fields) return;
            else {
                var fidx = 0;
                switch (vm.answer.type) {
                    case "Place": { fidx = 0; break; }
                    case "Person": { fidx = 1; break; }
                    case "Event": { fidx = 2; break; }
                    case "Organization": { fidx = 3; break; }
                    case "Short-Phrase": { fidx = 4; break; }
                    case "Activity": { fidx = 5; break; }
                    case "Establishment": { fidx = 6; break; }
                    case "Thing": { fidx = 7; break; }
                    case "PersonCust": { fidx = 8; break; }
                }

                var fields = $rootScope.typeSchema[fidx].fields;
                $rootScope.fields = fields;
            }

        }

        function getHeader() {
            //vm.public = $rootScope.canswers.public;
            if (vm.answer.owner == undefined || vm.answer.owner == null || vm.answer.owner == 0) {
                vm.answer.hasOwner = false;
            }
            else vm.answer.hasOwner = true;

            vm.bindtxt = '';
            if (vm.type == 'Establishment') vm.bindtxt = 'I represent this business';
            if (vm.type == 'PersonCust') vm.bindtxt = 'I am this person';
            if (vm.type == 'Event') vm.bindtxt = 'I organize this event';

        }

        //AM: Create the relative table of this answer with respect to the other ones.
        function makeRelativeTable(id) {
            //rank.computeRanking(answers,mrecs);
            var PctF = 0;
            var PctC = 0;
            var vsName = "";
            vm.relativetable = [];
            var R = $rootScope.R;
            var GP = $rootScope.GP;
            var answersR = $rootScope.answersR;
            var x = A.indexOf(+id);
            var W = 0;
            var mainField = $rootScope.fields[0].name;
            var isC = false; //main field is country

            for (var n = 0; n < answersR.length; n++) {
                if (A[n] != id) {
                    //W = (GP[x][n] + R[x][n]) / 2;
                    W = R[x][n];

                    switch (mainField) {
                        case "name": { vsName = answersR[n].name; break; }
                        case "nickname": { vsName = answersR[n].nickname; break; }
                        case "country": { vsName = answersR[n].country; isC = true; break; }
                        case "club": { vsName = answersR[n].club; break; }
                    }

                    if (GP[x][n]) {
                        PctF = Math.round((W / GP[x][n]) * 100);
                        PctC = 100 - PctF;
                    }
                    else {
                        PctF = 0;
                        PctC = 0;
                    }
                    vm.relativetable.push({
                        id: answersR[n].id,
                        Rank: answersR[n].Rank,
                        PctF: PctF,
                        vsName: vsName,
                        PctC: PctC,
                        GP: GP[x][n],
                        isC: isC
                    })
                }
            }
        }
        
        //AM: Refresh display when new answer is selected from relative table
        function refresh(x) {
            //$window.scrollTo(0,0);
            updateRecords();
            recordsUpdated = false;
            voteRecordExists = false;


            vm.answer = answers[A.indexOf(+x)];
            $rootScope.canswer = vm.answer;
            getEdits(vm.answer.id);
            upVi = vm.catans.upV;
            downVi = vm.catans.downV;
            getHeader();
            getAnswerRanks();
            getAnswerVotes();
            makeRelativeTable(x);
            getSpecials(vm.answer.id);
            getVRows(vm.answer.id);
        }
        
        //Update Records
        function updateRecords() {
            
            //update vote record if necessary
            if ($rootScope.DEBUG_MODE) console.log("UpdateRecords @answerDetail");
            
            //TODO Need to pass table id
            for (var i = 0; i < vm.answerRanks.length; i++) {

                var voteRecordExists = vm.answerRanks[i].voteRecordExists;
                var userHasRank = false;
                var useractivityrec = {};
                var idx = $rootScope.thisuseractivity.map(function (x) { return x.category; }).indexOf(vm.answerRanks[i].id);
                if (idx >= 0) {
                    userHasRank = true;
                    useractivityrec = $rootScope.thisuseractivity[idx];
                }
                else userHasRank = false;  
                //if vote is changed to non-zero
                if (voteRecordExists && vm.answerRanks[i].uservote.vote != vm.answerRanks[i].dV && vm.answerRanks[i].dV != 0) {
                    //update vote
                    if ($rootScope.DEBUG_MODE) console.log("UR-1");
                    votes.patchRec(vm.answerRanks[i].uservote.id, vm.answerRanks[i].dV);
                }
                //if vote is changed to zero
                if (voteRecordExists && vm.answerRanks[i].uservote.vote != vm.answerRanks[i].dV && vm.answerRanks[i].dV == 0) {
                    //Delete vote
                    if ($rootScope.DEBUG_MODE) console.log("UR-2");
                    votes.deleteRec(vm.answerRanks[i].uservote.id);
                    //Decrease vote counter from user activity. If counter is 1, also delete user activiy record (since there is no more votes
                    //from this user)
                    if (useractivityrec.votes < 2) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-3");
                        useractivity.deleteRec(useractivityrec.id);
                    }
                    else {
                        if ($rootScope.DEBUG_MODE) console.log("UR-4");
                        useractivity.patchRec(useractivityrec.id, useractivityrec.votes - 1);
                        //$rootScope.userActRec.votes--;
                    }
                }
                if (!voteRecordExists && vm.answerRanks[i].dV != 0) {
                    //Post a new vote and create useractivity record
                    if ($rootScope.DEBUG_MODE) console.log("UR-5");
                    votes.postRec(vm.answerRanks[i].catans, vm.answer.id, vm.answerRanks[i].id, vm.answerRanks[i].dV);
                    if (userHasRank) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-6");
                        useractivity.patchRec(useractivityrec.id, useractivityrec.votes + 1);
                        //$rootScope.userActRec.votes++;
                    }
                    else {
                        if ($rootScope.DEBUG_MODE) console.log("UR-7");
                        useractivity.postRec(vm.answerRanks[i].id);
                        //$rootScope.thisuseractivity.push();
                    }
                }
            
                //update answer record (vote count) if necessary
                //TODO Need to pass table id
                if ((vm.answerRanks[i].upV != vm.answerRanks[i].upVi) || (vm.answerRanks[i].downV != vm.answerRanks[i].downVi)) {
                    if ($rootScope.DEBUG_MODE) console.log("UR-8");
                    catans.updateRec(vm.answerRanks[i].catans, ["upV", "downV"], [vm.answerRanks[i].upV, vm.answerRanks[i].downV]);
                }
            }

            if (vm.type == 'Establishment' || vm.type == 'PersonCust') {
                for (var i = 0; i < vm.vrows.length; i++) {
                    var voteRecExists = vm.vrows[i].voteExists;
                    if (voteRecExists && vm.vrows[i].dVi != vm.vrows[i].dV) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-9");
                        $rootScope.cvrowvotes[vm.vrows[i].vidx].val = vm.vrows[i].dV;
                        vrowvotes.patchRec(vm.vrows[i].voteid, vm.vrows[i].dV);
                    }
                    if (!voteRecExists && vm.vrows[i].dV != 0) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-10");
                        vrowvotes.postRec(vm.vrows[i].id, vm.vrows[i].dV);
                    }

                    if ((vm.vrows[i].upV != vm.vrows[i].upVi) || (vm.vrows[i].downV != vm.vrows[i].downVi)) {
                        if ($rootScope.DEBUG_MODE) console.log("UR-11");
                        vrows.updateRec(vm.vrows[i].id, ["upV", "downV"], [vm.vrows[i].upV, vm.vrows[i].downV]);
                    }
                }
            }
            recordsUpdated = true;
        }
        
        //AM:Refresh Thumb Up and Thumb down Vote Displays
        
        function getAnswerVotes() {
            //look for user vote for this catans
            for (var i = 0; i < vm.answerRanks.length; i++) {
                vm.answerRanks[i].voteRecordExists = false;

                for (var j = 0; j < $rootScope.cvotes.length; j++) {
                    if ($rootScope.cvotes[j].catans == vm.answerRanks[i].catans) {
                        vm.answerRanks[i].uservote = $rootScope.cvotes[j];
                        vm.answerRanks[i].uservote.ansvidx = i;
                        //ansvidx = i;
                        vm.answerRanks[i].voteRecordExists = true;
                        break;
                    }

                }
                if (vm.answerRanks[i].voteRecordExists) {
                    vm.answerRanks[i].dV = vm.answerRanks[i].uservote.vote;
                    //catansid = uservote.catans;
                }
                else {
                    vm.answerRanks[i].dV = 0;
                    //catansid = x;
                }
                displayVote(vm.answerRanks[i]);
            }

        }

        function getVRowVotes() {
            if ($rootScope.isLoggedIn) {
                for (var i = 0; i < $rootScope.cansvrows.length; i++) {
                    //check votes for display
                    for (var j = 0; j < $rootScope.cvrowvotes.length; j++) {

                        if ($rootScope.cvrowvotes[j].vrow == $rootScope.cansvrows[i].id) {
                            $rootScope.cansvrows[i].voteExists = true;
                            $rootScope.cansvrows[i].dVi = $rootScope.cvrowvotes[j].val;
                            $rootScope.cansvrows[i].dV = $rootScope.cvrowvotes[j].val;
                            $rootScope.cansvrows[i].voteid = $rootScope.cvrowvotes[j].id;
                            $rootScope.cansvrows[i].vidx = j;
                            setVRowVoteImage($rootScope.cansvrows[i], $rootScope.cvrowvotes[j].val);
                        }
                    }
                }
            }
            displayVRows();
        }

        function setVRowVoteImage(obj, val) {
            if (val == 1) {

                obj.upImage = 'thumbs_up_blue_table.png';
                obj.downImage = 'thumbs_down_gray_table.png';
            }
            if (val == 0) {
                obj.dVi = 0;
                obj.dV = 0;
                obj.upImage = 'thumbs_up_gray_table.png';
                obj.downImage = 'thumbs_down_gray_table.png';
            }
            if (val == -1) {
                obj.dVi = -1;
                obj.dV = -1;
                obj.upImage = 'thumbs_up_gray_table.png';
                obj.downImage = 'thumbs_down_blue_table.png';
            }
        }
        //See if there are edits for this answer
        function getEdits(id) {
            vm.numEdits = 0;
            for (var i = 0; i < $rootScope.edits.length; i++) {
                if ($rootScope.edits[i].answer == id) {
                    vm.numEdits++;
                }
            }
        }

        function displayVote(x) {

            if (x.dV == 1) {
                x.thumbUp = "thumbs_up_blue_table.png";//"thumbs_up_blue.png";//
                x.thumbDn = "thumbs_down_gray_table.png";//"thumbs_down_gray.png";
            }

            if (x.dV == 0) {
                x.thumbUp = "thumbs_up_gray_table.png";//"thumbs_up_gray.png";
                x.thumbDn = "thumbs_down_gray_table.png";//"thumbs_down_gray.png";
            }
            if (x.dV == -1) {
                x.thumbUp = "thumbs_up_gray_table.png";//"thumbs_up_gray.png";
                x.thumbDn = "thumbs_down_blue_table.png";//"thumbs_down_blue.png";
            }
        }
        
        //AM:UpVote
        function UpVote(x) {

            if ($rootScope.isLoggedIn) {

                switch (x.dV) {
                    case -1: { x.dV = 1; x.upV++; x.downV--; break; }
                    case 0: { x.dV = 1; x.upV++; break; }
                    case 1: { x.dV = 0; x.upV--; break; }
                }

                displayVote(x);
                if ($rootScope.DEBUG_MODE) console.log("UpVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }

        }
        
        //AM:DownVote
        function DownVote(x) {

            if ($rootScope.isLoggedIn) {
                switch (x.dV) {
                    case -1: { x.dV = 0; x.downV--; break; }
                    case 0: { x.dV = -1; x.downV++; break; }
                    case 1: { x.dV = -1; x.upV--; x.downV++; break; }
                }

                displayVote(x);
                if ($rootScope.DEBUG_MODE) console.log("DownVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }

        }

        function goBack() {

            if ($rootScope.DEBUG_MODE) console.log("goBack");       
            
            //update Up and Down votes, and counter
            //if (!recordsUpdated && $rootScope.isLoggedIn) updateRecords();
            
            if ($rootScope.previousState == 'match') {
                $state.go('match');
            }
            else if ($rootScope.inFavMode) {
                $state.go('myfavs');
            }
            else {
                //var nViews = vm.answer.views + 1;
                //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
                if ($rootScope.cCategory) $state.go('rankSummary', { index: $rootScope.cCategory.id });
                else $state.go('cwrapper');
            }
        }

        function rankSel(x) {
            //console.log(x);
            $rootScope.title = x.title;
            $state.go('rankSummary', { index: x.id });
        }

        function deleteAnswer() {

            console.log("Delete Answer");

            dialog.deleteType(function () {
                //delete catans for this answer
                matchrec.deleteRecordsbyCatans($rootScope.cCategory.id, vm.answer.id);
                catans.deleteRec(vm.answer.id, $rootScope.cCategory.id).then(function () {
                    $state.go("answerDetail", { index: vm.answer.id }, { reload: true });
                });

            }, function () {
                //delete answer 
                answer.deleteAnswer(vm.answer.id);
                //delete match records of that answer
                matchrec.deleteRecordsbyAnswer(vm.answer.id);
                //delete vote records from that answer
                //votes.deleteVotesbyCatans(vm.answer.id);
                //delete edits for this answer
                edit.deleteEditbyAnswer(vm.answer.id);
                //delete edit votes for this answer
                editvote.deleteEditVotesbyAnswer(vm.answer.id);
                //delete catans for this answer
                catans.deleteAnswer(vm.answer.id);
                //delete vrows for this answer
                vrows.deleteVrowByAnswer(vm.answer.id);
                $state.go("rankSummary", { index: $rootScope.cCategory.id });
            });

        }

        function deleteThisCatans(r) {

            var thisAnswer = vm.answer.name;
            var idx = $rootScope.content.map(function (x) { return x.id; }).indexOf(r.id);
            var thisCategory = $rootScope.content[idx].title;
            dialog.deleteThisCatans(thisAnswer, thisCategory, function () {
                //delete catans for this answer
                matchrec.deleteRecordsbyCatans(r.id, vm.answer.id);
                catans.deleteRec(vm.answer.id, r.id).then(function () {
                    $state.go("answerDetail", { index: vm.answer.id }, { reload: true });
                });
            });
        }



        function flagAnswer(x) {
            if ($rootScope.isLoggedIn) {
                if ($rootScope.DEBUG_MODE) console.log("Answer Flagged");
                flag.flagAnswer('answer', vm.answer.id, x);
                dialog.getDialog('answerFlagged');
                return;
            }
            else dialog.loginFacebook(); 
            //dialog.getDialog('notLoggedIn');
        }

        function cmFlag(x) {
            if ($rootScope.isLoggedIn) {
                if ($rootScope.DEBUG_MODE) console.log("Answer Comment Flagged");
                flag.flagAnswer('comment-answer', vm.answer.id, x);
                dialog.getDialog('commentFlagged');
                return;
            }
            else dialog.loginFacebook(); 
            //dialog.getDialog('notLoggedIn'); 
        }

        function getAnswerRanks() {

            vm.answerRanks = [];
            for (var i = 0; i < $rootScope.catansrecs.length; i++) {
                //if ($rootScope.catansrecs[i].answer == vm.answer.id && $rootScope.catansrecs[i].category != $rootScope.cCategory.id) {
                if ($rootScope.catansrecs[i].answer == vm.answer.id) {
                    for (var j = 0; j < $rootScope.content.length; j++) {
                        if ($rootScope.content[j].id == $rootScope.catansrecs[i].category) {
                            //to each rank object attach catans data
                            var rankObj = $rootScope.content[j];
                            rankObj.upV = $rootScope.catansrecs[i].upV;
                            rankObj.downV = $rootScope.catansrecs[i].downV;
                            rankObj.catans = $rootScope.catansrecs[i].id;
                            rankObj.rank = $rootScope.catansrecs[i].rank;
                            rankObj.uservote = {};
                            rankObj.upVi = $rootScope.catansrecs[i].upV;
                            rankObj.downVi = $rootScope.catansrecs[i].downV;

                            if (rankObj.rank == 1) rankObj.icon = "/assets/images/gold.png";
                            else if (rankObj.rank == 2) rankObj.icon = "/assets/images/silver.png";
                            else if (rankObj.rank == 3) rankObj.icon = "/assets/images/bronze.png";
                            else if (rankObj.rank > 3 && rankObj.rank < 11) rankObj.icon = "/assets/images/top10.png";
                            else if (rankObj.rank >= 11 && rankObj.rank < 21) rankObj.icon = "/assets/images/top20.png";
                            else if (rankObj.rank >= 21 && rankObj.rank < 51) rankObj.icon = "/assets/images/top50.png";
                            else if (rankObj.rank >= 51 && rankObj.rank < 101) rankObj.icon = "/assets/images/top100.png";
                            else rankObj.icon = "/assets/images/blank.png";
   
                            //TODO insert rank position out of total list, will be in catans
                            vm.answerRanks.push(rankObj);
                        }
                    }
                }
            }
            //vm.otherRanksExist = vm.otherRanks.length > 0 ? true : false;
            vm.otherRanksExist = true;
        }

        function getSpecials(x) {
            var answerid = 0;
            if (!vm.answer.ispremium && vm.userIsOwner) answerid = 1;
            else answerid = x;
            vm.specialsList = [];
            for (var i = 0; i < $rootScope.specials.length; i++) {
                if ($rootScope.specials[i].answer == answerid) {
                    //format date, load name and html msg
                    datetime.formatdatetime($rootScope.specials[i]);
                    $rootScope.specials[i].name = vm.answer.name;

                    var htmlmsg = htmlops.specialHtml($rootScope.specials[i], vm.sm);
                    $rootScope.specials[i].html = htmlmsg;
                    //Separate style (not working with ng-bind-html)
                    var spStyle = 'background-color:' + $rootScope.specials[i].bc + ';color:' + $rootScope.specials[i].fc + ';' +
                        'white-space:pre;';
                    $rootScope.specials[i].style = spStyle;
                    if ($rootScope.specials[i].image != undefined &&
                        $rootScope.specials[i].image != $rootScope.EMPTY_IMAGE) {
                        $rootScope.specials[i].hasimage = true;
                    }
                    else $rootScope.specials[i].hasimage = false;
                    vm.specialsList.push($rootScope.specials[i]);
                }
            }
        }

        function showsimage(x) {
            if (!x.showimage) {
                x.showimage = true;
            }
            else x.showimage = false;
        }

        function getVRows(answerid) {
            $rootScope.cansvrows = [];
            //Load vrows for this answer           
            for (var i = 0; i < $rootScope.cvrows.length; i++) {
                if ($rootScope.cvrows[i].answer == answerid) {
                    var obj = $rootScope.cvrows[i];
                    obj.idx = i; //Store object but store index in main local copy
                    obj.voteExists = false;
                    obj.dV = 0;
                    obj.upVi = $rootScope.cvrows[i].upV;
                    obj.downVi = $rootScope.cvrows[i].downV;
                    obj.upImage = 'thumbs_up_gray_table.png';
                    obj.downImage = 'thumbs_down_gray_table.png';
                    $rootScope.cansvrows.push(obj);
                }
            }
            getVRowVotes();

        }

        function displayVRows() {

            vm.vrows = [];
            function compare(a, b) {
                return a.gnum - b.gnum;
            }
            if ($rootScope.cansvrows.length > 0) {
                vm.vrows = $rootScope.cansvrows.sort(compare);
                vm.vrows[0].shdr = true;
                for (var i = 1; i < vm.vrows.length; i++) {
                    if (vm.vrows[i].gnum == vm.vrows[i - 1].gnum) vm.vrows[i].shdr = false;
                    else vm.vrows[i].shdr = true;
                }
                vm.vrows[vm.vrows.length - 1].saddr = true;
                for (var i = 0; i < vm.vrows.length - 1; i++) {
                    if (vm.vrows[i].gnum != vm.vrows[i + 1].gnum) vm.vrows[i].saddr = true;
                    else vm.vrows[i].saddr = false;
                }

                vm.vrowgroups = [];
                var vrowgroup = [];
                var tgroup = vm.vrows[0].gnum;
                for (var i = 0; i < vm.vrows.length; i++) {

                    if (tgroup != vm.vrows[i].gnum) {
                        //console.log("vrowgroup --- ", vrowgroup);
                        vm.vrowgroups.push(vrowgroup);
                        vrowgroup = [];
                        vrowgroup.push(vm.vrows[i]);
                        tgroup = vm.vrows[i].gnum;

                    }
                    else {
                        vrowgroup.push(vm.vrows[i]);
                    }
                    //for last element
                    if (i == vm.vrows.length - 1) {
                        vm.vrowgroups.push(vrowgroup);
                    }
                }

            }
        }

        function deleteButtonAccess() {
            if ($rootScope.isAdmin) vm.deleteButton = 'inline';
            else vm.deleteButton = 'none';
        }

        function showUrl() {
            dialog.url(vm.answer.imageurl);
        }

        function closeRank() {
            $state.go('cwrapper');            
        }

        function closeAnswerDetail(){
            goBack();
        }

        function bizRegDialog() {
            dialog.bizRegistration(bizRegistration);
        }

        function bizRegistration() {
            if ($rootScope.isLoggedIn) {
                dialog.bindAccount($rootScope.user.name, vm.answer.name, bindAccount);
            }
            else {
                dialog.getDialog('notLoggedInBiz');
            }
            //$state.go('register');
        }

        function bindAccount() {
            if ($rootScope.DEBUG_MODE) console.log("Bind business to user account");
            answer.updateAnswer(vm.answer.id, ['owner'], [$rootScope.user.id]).then(reloadAnswer);
            var item = {};
            item = vm.answer;
            item.username = $rootScope.user.first_name + ' ' + $rootScope.user.last_name;  
            item.email = $rootScope.user.email;
            useraccnt.adduseraccnt(item).then(function (useracc) {
                //Check if user account has email - if not set warning in navbar
                mailing.newBizCreated({account: useracc, answer: item}).then(function(data){
                    // console.log()
                })
                var hasEmail = false;
                for (var i = 0; i < $rootScope.useraccnts.length; i++) {
                    if ($rootScope.useraccnts[i].email != '') hasEmail = true;
                }
                if (!hasEmail) $rootScope.$emit('showWarning');
            });
        }

        function reloadAnswer() {
            $state.go("answerDetail", { index: vm.answer.id }, { reload: true });
        }

        function openSpecials() {
            $state.go('specials');
        }

        function editVRows() {
            $state.go('editvrows');
        }

        function addRankforAnswer() {
            $state.go('answerRanksManager');
        }

        function getImages() {
            if (vm.igdemo) instagram.getImages().then(showImages);
            else {
                $rootScope.blobs = [];
                var urls = vm.answer.ig_image_urls.split(';');

                for (var i = 0; i < urls.length; i++) {
                    if(urls[i] != ''){
                        var myObj = {};
                        myObj.url = urls[i];
                        myObj.type = 'Instagram';
                        $rootScope.blobs.push(myObj);
                    }
                }
                imagelist.getImageList().then(showImages);
            }

            vm.showImageGallery = true;

        }
        function showImages() {
            if (vm.igdemo) vm.images = $rootScope.igimages;
            else vm.images = $rootScope.blobs;
            //console.log("@showImages - ", vm.images);
        }
        /*
        function showMap(){
          google.maps.event.addDomListener(window, "load", initMap);

        }
        var map = {};
        function initMap(){
            var latlng = new google.maps.LatLng(-34.397, 150.644);
            var myOptions = {
                zoom: 8,
                center: latlng,
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };
            map = new google.maps.Map(document.getElementById("map-canvas"),myOptions);
        }*/

        function gotoRank(x) {
            //var nViews = vm.answer.views + 1;
            //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            $state.go('rankSummary', { index: x.id });
        }

        function goPrev() {
            var L = answers.length;
            var i = answers.map(function (x) { return x.id; }).indexOf(vm.answer.id);
            var ni = i - 1; //next index
            if (ni < 0) ni = L - 1; //if less than zero wrap to last
            //var nViews = vm.answer.views + 1;
            //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            if ($rootScope.isLoggedIn) updateRecords();
            $state.go('answerDetail', { index: answers[ni].id });
        }

        function goNext() {
            var L = answers.length;
            var i = answers.map(function (x) { return x.id; }).indexOf(vm.answer.id);
            var ni = i + 1; //next index
            if (ni > L - 1) ni = 0; //if less than zero wrap to last
            //var nViews = vm.answer.views + 1;
            //answer.updateAnswer(vm.answer.id, ['views'], [nViews]);
            if ($rootScope.isLoggedIn) updateRecords();
            $state.go('answerDetail', { index: answers[ni].id });
        }

        function vrowVoteUp(x) {

            if ($rootScope.isLoggedIn) {

                switch (x.dV) {
                    case -1: { x.dV = 1; x.upV++; x.downV--; break; }
                    case 0: { x.dV = 1; x.upV++; break; }
                    case 1: { x.dV = 0; x.upV--; break; }
                }

                displayVRowVote(x);
                if ($rootScope.DEBUG_MODE) console.log("VRow UpVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }
            //console.log("vm.answerRanks ---", vm.answerRanks);
        }        
        //AM:DownVote
        function vrowVoteDown(x) {

            if ($rootScope.isLoggedIn) {
                switch (x.dV) {
                    case -1: { x.dV = 0; x.downV--; break; }
                    case 0: { x.dV = -1; x.downV++; break; }
                    case 1: { x.dV = -1; x.upV--; x.downV++; break; }
                }

                displayVRowVote(x);
                if ($rootScope.DEBUG_MODE) console.log("DownVote");
            }
            else {
                dialog.loginFacebook();
                //dialog.getDialog('notLoggedIn');
                return;
            }
            //console.log("vm.answerRanks ---", vm.answerRanks);
        }

        function displayVRowVote(x) {

            if (x.dV == 1) {
                x.upImage = "thumbs_up_blue_table.png";
                x.downImage = "thumbs_down_gray_table.png";
            }

            if (x.dV == 0) {
                x.upImage = "thumbs_up_gray_table.png";
                x.downImage = "thumbs_down_gray_table.png";
            }
            if (x.dV == -1) {
                x.upImage = "thumbs_up_gray_table.png";
                x.downImage = "thumbs_down_blue_table.png";
            }
        }

        function loadComments() {
            commentops.loadComments('answer', cObj)
            .then(function(){

                $q.all(cObj.comments.map(function(comment){ return fbusers.getFBUserById(comment.user); }))
                .then(function (fbUsers){
                    for (var i = 0; i < cObj.comments.length; i++) {
                        cObj.comments[i].picture = fbUsers[i] ? fbUsers[i].picture.data.url : null;
                    }
                });
                
            })
        }
        
        function postComment() {
            commentops.postComment('answer', cObj);
        }

        function mergeObject(x, y) {
            x.bc = y.bc;
            x.fc = y.fc;
            x.freq = y.freq;
            x.edate = y.edate;
            x.sdate = y.sdate;
            x.etime = y.etime;
            x.etime2 = y.etime2;
            x.stime = y.stime;
            x.stime2 = y.stime2;
            x.mon = y.mon;
            x.tue = y.tue;
            x.wed = y.wed;
            x.thu = y.thu;
            x.fri = y.fri;
            x.sat = y.sat;
            x.sun = y.sun;
        }

        function selectPhoto(x) {
            dialog.seePhotos(vm.images, x, vm.answer, vm.userIsOwner);
        }

        function addcts(x) {
            var title = '';
            var category = 0;
            var isDup = false;

            title = vm.addctsval;
            isDup = vm.catisdup == undefined ? false : vm.catisdup;

            for (var i = 0; i < $rootScope.content.length; i++) {
                if ($rootScope.content[i].title == title) {
                    category = $rootScope.content[i].id;
                    break;
                }
            }
            //console.log("postRec catans -",myAnswer.id,category,isDup);
            catans.postRec2(vm.answer.id, category, isDup);

            vm.addctsactive = false;

            setTimeout(function () {
                $state.go("answerDetail", { index: vm.answer.id }, { reload: true });
            }, 1000);
        }

        function addCatans(x) {
            vm.addctsopts = [];
            var opt = '';
            for (var i = 0; i < $rootScope.ctsOptions.length; i++) {
                if ($rootScope.ctsOptions[i].indexOf('@neighborhood') > -1) {
                    opt = $rootScope.ctsOptions[i].replace('@neighborhood', vm.answer.cityarea);
                    vm.addctsopts.push(opt);
                }
                else vm.addctsopts.push($rootScope.ctsOptions[i]);
            }
            vm.addctsactive = true;
        }

        function votemodeON(){
            vm.votemode = true;
            vm.voteonstyle = "background-color:#3277b3;color:#e6e6e6";
            vm.voteoffstyle = "background-color:#e6e6e6;color:black";
            if ($rootScope.endorseDialogShown == undefined) endorseDialog();
            
        }
        function votemodeOFF(){
            vm.votemode = false;
            vm.voteoffstyle = "background-color:#3277b3;color:#e6e6e6";
            vm.voteonstyle = "background-color:#e6e6e6;color:black";
        }


        function endorseDialog(){
            dialog.endorse(vm.type);
            $rootScope.endorseDialogShown = true;
        }



            function selectInstagramImages(){
            if(InstagramService.access_token() == null) {
                InstagramService.login();
            }
            else {
                InstagramService.getMyRecentImages()
                .then(function(response){
                    dialog.chooseImgFromIgDlg(response.data.data, vm.answer, vm.userIsOwner);
                })
                .catch(function(err){
                    console.log(err);
                });
            }
            $rootScope.$on("instagramLoggedIn", function (evt, args) {
                InstagramService.getMyRecentImages()
                .then(function(response){
                    console.log(response);
                    dialog.chooseImgFromIgDlg(response.data.data, vm.answer, vm.userIsOwner);
                }).catch(function(err){
                    console.log(err);
                });
            });
        }

        function showRanks(){
            if (vm.dispRanks <= 3) vm.dispRanks = vm.answerRanks.length;
            else vm.dispRanks = 3; 
        }

        function hideCustomRanks(){
            vm.hideCustomRanksMsg = true;
            $rootScope.hideCustomRankMsg = true;
        }
        function hideGetPremium(){
            vm.hideGetPremiumMsg = true;
            $rootScope.hideGetPremiumMsg = true;
        }

        function gotoMyBusiness(){
            $state.go('mybusiness');
        }
    }
})();
