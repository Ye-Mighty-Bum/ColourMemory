var gridHeight = 4,
    gridWidth = 4,
    matchAmt = 2, //num of cards to match each turn - don't need to be factor of gridHeight*gridWidth
    defaultDifficulty = 2, //normal
    gameDifficulty = [
        { name: 'Baby', h: 2, w: 2, m: 2 },
        { name: 'Easy', h: 3, w: 4, m: 2 },
        { name: 'Normal', h: 4, w: 4, m: 2 },
        { name: 'Hard', h: 4, w: 6, m: 3 },
        { name: 'Stressful', h: 6, w: 6, m: 3 },
        { name: 'Insane', h: 6, w: 8, m: 4 },
        { name: 'Impossible', h: 10, w: 10, m: 5 }
    ],
    flippedCards = [], //to keep track of values of flipped cards
    cardsMatch = false;

//var apiServer = 'http://localhost/api/';
//var apiServer = 'http://77.104.154.211/~kirasude/includes/api.php/'; /*special case when mod rewrite doesn't work*/
var apiServer = 'http://77.104.154.211/~kirasude/api/';
var currentScore = {
    value: 0,
    get: function() {
        return this.value;
    },
    add: function(num) {
        this.value += num; 
        this.update();
    },
    set: function(num){
        this.value = num;
        this.update();
    },
    update: function(){
        $('#info .currscore').html(this.value);
    }
};

var submitCursor = [
    [{ //name field
        w: 162,
        h: 30,
        t: 299,
        l: 317
    }],
    [{ //email field
        w: 162,
        h: 30,
        t: 326,
        l: 317
    }],
    [{ //submit button
        w: 96,
        h: 46,
        t: 358,
        l: 260
    },
    { //cancel button
        w: 96,
        h: 46,
        t: 358,
        l: 365
    }]
];

var cursor = {
    x: 0,
    y: 0,
    xlimit: 3, //game grid x
    ylimit: 3, //game grid y
    submitylimit: 2, //*hardcode* 0: name, 1: email, 2: submit <- > cancel
    focus: 'game', //interaction areas - game, restart, submit, newgame
    pixelW: 0,
    pixelH: 0,
    cssTop: 0,
    cssLeft: 0,
    moveX: 0, //amount to move between cards
    moveY: 0,
    init: function(newfocus, gridx, gridy) {
        this.setfocus(newfocus);
        this.setlimits(gridx, gridy);

        var firstCard = $('#board .card:eq(0)');
        var rightCard = $('#board .card:eq(1)');
        var belowCard = $('#board .card:eq('+(gridx+1)+')');

        this.pixelW = firstCard.outerWidth() + 10;
        this.pixelH = firstCard.outerHeight() + 10;
        this.cssTop = firstCard.position().top;
        this.cssLeft = firstCard.position().left;
        
        this.moveX = rightCard.position().left - this.cssLeft;
        this.moveY = -(this.cssTop - belowCard.position().top);

        this.updatePosition(this.cssTop, this.cssLeft);
        this.updateSize(this.pixelW, this.pixelH);
    },
    updateSubmitCursor: function() {
        this.updatePosition(submitCursor[this.y][this.x].t, submitCursor[this.y][this.x].l);
        this.updateSize(submitCursor[this.y][this.x].w, submitCursor[this.y][this.x].h);    
    },
    updatePosition(t, l){
        this.cssTop = t;
        this.cssLeft = l;
        $('#cursor').css('top', t+'px').css('left', l+'px');
    },
    updateSize(w, h){
        this.pixelW = w;
        this.pixelH = h;
        $('#cursor').css('width', w+'px').css('height', h+'px');
    },
    setfocus: function (newfocus) {
        this.x = 0;
        this.y = 0;
        this.focus = newfocus;
    
        if (newfocus == 'submit')
        {
            this.updateSubmitCursor();
        }
    },
    getfocus: function () {
        return this.focus;
    },
    getpos: function() {
        return [this.x, this.y];
    },
    setx: function(newx) {
        this.x = newx;
    },
    sety: function(newy) {
        this.y = newy;
    },
    setlimits: function(gridx, gridy) {
      this.xlimit = gridx - 1;  
      this.ylimit = gridy - 1;  
    },
    up: function(){ //game, submit
        if (this.focus == 'game') {
            if (this.y > 0) {
                this.y = this.y - 1;
                this.updatePosition(this.cssTop - this.moveY, this.cssLeft);
            }
                
        }
        else if (this.focus == 'submit') {
            if (this.y == this.submitylimit) { //move up from the buttons
                this.x = 0;
            }
            
            if (this.y > 0) {
                this.y = this.y - 1;
            }

            $('#gameui .completed .popup input:eq('+this.y+')').focus();

            this.updateSubmitCursor();
        }
        
        console.log(this.getfocus() + ' - ' + this.getpos());
    },
    down: function() { //game, submit
        if (this.focus == 'game') {
            if (this.y < this.ylimit) {
                this.y = this.y + 1;
                this.updatePosition(this.cssTop + this.moveY, this.cssLeft);
            }
        }
        else if (this.focus == 'submit') {
            if (this.y < this.submitylimit) {
                this.y = this.y + 1;
                $('#gameui .completed .popup input:eq('+this.y+')').focus();
            }
            
            if (this.y == this.submitylimit) {
                $('#gameui .completed .popup input:eq(1)').blur(); //blur the email field
            }

            this.updateSubmitCursor();
        }
    
        console.log(this.getfocus() + ' - ' + this.getpos());
    },
    left: function() { //game, restart, submit(the 2 buttons)
        if (this.focus == 'game') {
            if (this.x > 0) {
                this.x = this.x - 1;
                this.updatePosition(this.cssTop, this.cssLeft - this.moveX);
            }
                
        }
        else if (this.focus == 'restart') {
            this.focus = 'game';
            this.x = this.xlimit;
            this.y = this.ylimit;
        
            //calculate position of the last card
            var lastIndex = ((this.xlimit + 1)*(this.ylimit + 1)) - 1;
            var lastCard = $('#board .card:eq('+lastIndex+')');

            var lastTop = lastCard.position().top;
            var lastLeft = lastCard.position().left;
            var lastW = lastCard.outerWidth() + 10;
            var lastH = lastCard.outerHeight() + 10;
            
            this.updatePosition(lastTop, lastLeft);
            this.updateSize(lastW, lastH);
        }
        else if (this.focus == 'submit') { //cancel button to submit button
            if ((this.x == 1)&&(this.y == this.submitylimit))
                this.x = 0;
        
            this.updateSubmitCursor();
        }
    
        console.log(this.getfocus() + ' - ' + this.getpos());
    },
    right: function() { //game, submit(the 2 buttons)
        if (this.focus == 'game') {
            if (this.x < this.xlimit) {
                this.x = this.x + 1;
                this.updatePosition(this.cssTop, this.cssLeft + this.moveX);
            }
                
            else if (this.x == this.xlimit) //go to Restart
            {
                this.focus = 'restart';

                //HARDCODE - not ideal but it works...
                this.updatePosition(513, 517);
                this.updateSize(186, 46);
            }
        }
        else if (this.focus == 'submit') { //submit button to cancel button
            if ((this.x == 0)&&(this.y == this.submitylimit))
                this.x = 1;
        
            this.updateSubmitCursor();
        }
    
        console.log(this.getfocus() + ' - ' + this.getpos());
    },
    enter: function() { //game, restart, submit, newgame
        if (this.focus == 'game') {
            var cardIndex = (this.y * (this.xlimit + 1)) + this.x;
            $('#board .card:eq('+cardIndex+')').trigger('click');
        }
        else if (this.focus == 'restart') {
            $('.right .restart button').trigger('click');
        }
        else if (this.focus == 'submit') {
            if (this.y == this.submitylimit) { //submit or cancel
                if (this.x == 0)
                    $('#gameui .completed .popup .submit').trigger('click');
                else if (this.x == 1)
                    $('#gameui .completed .popup .cancel').trigger('click');
            }
        }
        else if (this.focus == 'newgame') {
            $('#board .newgame button').trigger('click');
        }
    }
};

var refreshRankings = function() {
    //clear old scores
    $('#info .rank tbody').html('');
    
    //get scores
    $.post(apiServer+"getrank", {
        currpg: 1,
        perpg: 1000
    })
    .done(function(data) {
        var data = JSON.parse(data);

        for (var i=0;i<data.length;i++)
        {
          $('#info .rank tbody').append('<tr class="row'+i%2+'"><td>'+data[i].rank+'</td><td>'+data[i].name+'</td><td>'+data[i].score+'</td></tr>')  
        }
    })
    .fail(function() {
        console.log('get ERROR')
    })
}

var makeGameCards = function(h, w, m) {

    //Take note! matchAmt may not be a factor of height*width

    var remain = (h*w)%m;
    var cardsToGenerate = (h*w) - remain;

    var total = 0;
    for(var i=0; i<h; i++){ //row
        $('#ref .cardrow').clone().appendTo('#board');

        for(var j=0; j<w; j++){ //cards
            $('#ref .card').clone().appendTo('#board .cardrow:eq('+i+')');
            total++;

            if (total >= cardsToGenerate)
                return cardsToGenerate;
        }
    }

    return cardsToGenerate;
}

var makeRandomColours = function(limit, matchAmt) {
    //colours must not be too similar to each other or players will get frustrated
    //make them permutations of 0, 3, 6, 9, C, F?
    
    var htmlcol = '0369CF';
    var colours = [];
    var colourcount = 0;

    //while loop start
    while (colourcount < limit)
    {
        var combo = '';
        for(var i=0; i<3; i++)
        {
            var cpos = Math.floor(Math.random() * htmlcol.length);
            combo += htmlcol[cpos];
        }

        if (colours.indexOf(combo) == -1){ //not in array
            colours.push(combo);
            colourcount++;
        }
    }

    //colour generation complete
    //now we assign the colours
    var assignedcol = [];
    var assignednum = [];
    
    for(var j=0; j<limit; j++)
    {
        //determine which cards' index we will assign each colour to
        var insertedcount = 0;

        while (insertedcount < matchAmt )
        {
            var apos = Math.floor(Math.random() * (limit*matchAmt));
            if (typeof(assignedcol[apos]) == 'undefined') //nothing in the slot
            {
                assignedcol[apos] = colours[j];
                assignednum[apos] = j;
                insertedcount++;
            }            
        }
    }

    $('#board .card .front').each(function(i, elem){
        $(elem).css('background-color', '#'+assignedcol[i]);
        $(elem).find('.txt').html(assignednum[i]);
    });
    
    return {
        cols: assignedcol,
        nums: assignednum
    }
}

var initPlayLogic = function(cardVals, matchAmt, totalCards) {
    $('#board .card:not(.hidden)').each(function(i,card){
        $(card).unbind('click').on('click', function(){

            if (!$(card).hasClass('hidden'))
            {
                //Take note! Each card takes 600ms to flip over
                if ($('#board .card.flipped:not(.hidden)').length < matchAmt)
                {
                    $(this).addClass('flipped');
                    flippedCards.push(cardVals.nums[i]);

                    if ($('#board .card.flipped:not(.hidden)').length >= matchAmt)
                    {
                        //work out whether the flipped cards match or not
                        for(var j=1; j<flippedCards.length; j++)
                        {
                            if (flippedCards[j] != flippedCards[0])
                            {
                                cardsMatch = false;
                                break;
                            }
                            else
                                cardsMatch = true;
                        }

                        if (cardsMatch == true)
                        {
                            currentScore.add(1);
                            
                            setTimeout(function (){
                                $('#board .card.flipped').addClass('hidden');
                                flippedCards = [];
                                cardsMatch = false;

                                if ($('#board .card.hidden').length == totalCards)
                                {
                                    gameCompleted(currentScore.get());
                                }
                            }, 300);
                        }
                        else //no match
                        {
                            currentScore.add(-1);
                            
                            //unflip cards
                            setTimeout(function (){
                                $('#board .card').removeClass('flipped');                    
                                flippedCards = [];
                                cardsMatch = false;
                            }, 600);
                        }
                    }
                }
            }//end if (!$(card).hasClass('hidden'))
        })//end onclick
    });
}

var initKeyboardControls = function() {
    //keys allowed are up(38), down(40), left(37), right(39) enter(13), F1(112), tab(9)
    $(document).unbind('keydown').keydown(function(e){
        switch(e.which){
            case 38: cursor.up(); break;
            case 40: cursor.down(); break;
            case 37: cursor.left(); break;
            case 39: cursor.right(); break;
            case 13: cursor.enter(); break;
            case 112: { //colourblind mode
                $('#cbcheck').trigger('click');
            }
            case 9: e.preventDefault(); break;
            break;
        }
    })
}

var addRestart = function(diff, defaultDiff, restartHolder) {

    $('#ref .newgame').clone().appendTo('#board');

    /*
    //add difficulty options
    $(restartHolder).find('select').html('');
    
    for(var i=0; i<diff.length; i++) {
        var sel = '';
        if (i == defaultDiff)
            sel = 'selected';
        
        $(restartHolder).find('select').append('<option '+sel+' value="'+i+'">'+diff[i].name+'</option>');
    }
    */

    //add logic for new game button
    $(restartHolder).find('button').unbind('click').on('click', function(){
        /*
        var diffIndex = $(this).parent().find('select option:selected').val();
        var selDiff = gameDifficulty[diffIndex];

        gridHeight = selDiff.h;
        gridWidth = selDiff.w;
        matchAmt = selDiff.m;
        defaultDifficulty = diffIndex;
        */

        startNewGame(gridHeight, gridWidth, matchAmt);
    });
}

var gameCompleted = function(score) {
    //clear board
    $('#board').html('');

    //show popup for user to enter Name and email
    $('#ref .completed').clone().appendTo('#gameui');

    var popup = $('#gameui .completed .popup');

    //focus on the first input field
    cursor.setfocus('submit');
    popup.find('input:eq(0)').focus();
    
    //Submit button - submit score to server
    popup.find('.submit').unbind('click').on('click', function(){
        //disable the fields and buttons
        popup.addClass('sending');
        popup.find('input').attr('disabled','');
        popup.find('button').attr('disabled','');
        
        $.post(apiServer+"addscore", {
            name: $('#compname').val(),
            email: $('#compemail').val(),
            score: score
        })
        .done(function(data) {
            var data = JSON.parse(data);

            if (typeof(data[0].rank) == 'undefined') //error or insert failure
            {
                popup.find('.msg').addClass('err').html(data[0].resp);

                //reenable the fields and buttons
                popup.removeClass('sending');
                popup.find('input').removeAttr('disabled');
                popup.find('button').removeAttr('disabled');
            }
            else //successful insertion
            {
                popup.addClass('insertok');
                popup.html(data[0].resp + '' + data[0].rank);
                $('#gameui .completed').css('z-index', '999'); //set it above the cursor

                cursor.setfocus('newgame');
                
                //HARDCODE
                cursor.updatePosition(265, 172);
                cursor.updateSize(166, 45);
                
                //Let user stare at rank for 1.5 second then fade out
                setTimeout(function (){
                    $('#gameui .completed').fadeOut(300, function(){
                        $('#gameui .completed').remove();
                    });
                }, 1500);
            
                refreshRankings();
            }
        })
        .fail(function() {
            popup.find('.msg').addClass('err').html(data[0].resp);
        })
    });

    //Cancel button - close the submission popup
    popup.find('.cancel').unbind('click').on('click', function(){
        $('#gameui .completed').fadeOut(300, function(){
            $('#gameui .completed').remove();

            cursor.setfocus('newgame');

            //HARDCODE
            cursor.updatePosition(265, 172);
            cursor.updateSize(166, 45);
        });
    });

    //add Start New Game button with difficulty options
    addRestart(gameDifficulty, defaultDifficulty, '#board .newgame');
}

var startNewGame = function(h, w, m) {
    //get current rankings
    refreshRankings();
    
    //clear existing cards
    $('#board').html('');
    
    //initialise score
    currentScore.set(0);
    
    //generate the cards
    var totalCards = makeGameCards(h, w, m);

    //init cursor
    cursor.init('game', w, h);
    console.log(cursor.getfocus() + ' - ' + cursor.getpos());
    
    //give them random colours + numbers
    var cardVals = makeRandomColours(totalCards/m, m);

    //add click events + game logic to the cards
    initPlayLogic(cardVals, m, totalCards);

    //init Keyboard controls
    initKeyboardControls();

    //check if colourblind mode is on
    if ($('#cbcheck')[0].checked)
        $('#board .card .front .txt').toggle();
}

function onLoadFunc() {

    //init Colourblind mode help feature
    $('#cbcheck').on('change', function(){
        $('#board .card .front .txt').toggle();
    })
    
    //init restart button
    $('.right .restart button').unbind('click').on('click', function(){
        startNewGame(gridHeight, gridWidth, matchAmt);
    })
    
    startNewGame(gridHeight, gridWidth, matchAmt);
}

////////////////////////////
//  EVENT LISTENERS   //
////////////////////////////

if(window.addEventListener)
{
	window.addEventListener('load', onLoadFunc, false);
}
else if(window.attachEvent)
{
	window.attachEvent('onload', onLoadFunc);
}