/*
Creaftable 
Lee Brunjes 2018



*/

var craftable = function(){
var cf = this;
cf.players = [];
cf.active_player = 0;

cf.bag = [];
cf.settings ={
	max_letters:7,
	board_size : 17,
	jackpot:50
};
cf.board = [];
cf.history =[];
cf.scoring =[];
cf.sound = {
	yeah: new Audio('yeah-bbc.mp3'),
	shred: new Audio('shred-bbc.mp3'),
	error: new Audio('boo-bbc.mp3'),
	end: new Audio('bbc-end.mp3'),
	craft: new Audio('buzz-bbc.mp3')
}

cf.letters={
	A:{"freq":9, "value": 3, "strokes":{'/':1,'\\':1,'-':1}},
	B:{"freq":3, "value": 3, "strokes":{'|':1,")":2}},
	C:{"freq":2, "value": 1, "strokes":{"(":1}},
	D:{"freq":4, "value": 2, "strokes":{"|":1,")":1}},
	E:{"freq":12,"value": 4, "strokes":{"|":1,"-":3}},
	F:{"freq":2, "value": 3, "strokes":{"|":1, "-":2}},
	G:{"freq":3, "value": 3, "strokes":{"(":1,"-":1,"|":1}},
	H:{"freq":2, "value": 3, "strokes":{"|":2,"-":1}},
	I:{"freq":9, "value": 1, "strokes":{"|":1}},
	J:{"freq":1, "value": 3, "strokes":{")":1,"-":1,"|":1}},
	K:{"freq":1, "value": 3, "strokes":{"|":1,"\\":1,"/":1}},
	L:{"freq":3, "value": 2, "strokes":{"|":1,"-":1}},
	M:{"freq":2, "value": 4, "strokes":{"|":2,"\\":1,"/":1,}},
	N:{"freq":6, "value": 3, "strokes":{"|":2,"\\":1}},
	O:{"freq":7, "value": 2, "strokes":{"(":1,")":1}},
	P:{"freq":2, "value": 2, "strokes":{"|":1,")":1}},
	Q:{"freq":1, "value": 3, "strokes":{"(":1,")":1,"\\":1}},
	R:{"freq":6, "value": 3, "strokes":{"|":1,")":1,"\\":1}},
	S:{"freq":4, "value": 2, "strokes":{"(":1,")":1}},
	T:{"freq":6, "value": 2, "strokes":{"-":1,"|":1}},
	U:{"freq":4, "value": 4, "strokes":{"|":2,"(":1,")":1}},
	V:{"freq":2, "value": 2, "strokes":{"\\":1,"/":1}},
	W:{"freq":2, "value": 4, "strokes":{"\\":2,"/":2}},
	X:{"freq":1, "value": 4, "strokes":{"/":2,"\\":2}},
	Y:{"freq":2, "value": 3, "strokes":{"\\":1,"|":1,"/":1}},
	Z:{"freq":1, "value": 3, "strokes":{"-":2,"/":1}}
};
;
	cf.init=function(){

		cf.players.push(new cf_player("Lee"));
		cf.players.push(new cf_player("Danielle"));

		//init empty board
		for(var i = 0 ; i <cf.settings.board_size;i++){
			var row = [];
			for(var j = 0 ; j <cf.settings.board_size;j++){
				row.push("");
			}
			cf.board.push(row);
		}
		cf.populateBag();
		cf.drawBoard();
		

		cf.players[0].letters = cf.bag.splice(0, cf.settings.max_letters);
		cf.players[1].letters = cf.bag.splice(0, cf.settings.max_letters);

		cf.pushHistoryState();

		cf.active_player  = Math.floor(Math.random()*2);
		cf.drawCarrel();



	};


	/** shuffle the bag of letters based on frequency*/
	cf.populateBag=function(){
		var bag = [];
		for(var l in cf.letters){
			for(var i =0; i < cf.letters[l].freq;i++){
				bag.push(l);
			}
		}

		//shuffle the tiles and 
		cf.bag = cf.shuffle(bag);
	}
	/** reutns and object to do game updates with in play*/
	cf.getPlayResult=function(){
		var result = {
			canPlayWord : true,
			wordsToScore: [],//[startidx,word];
			playedletters :[],
			board:cf.board//
		
		};
		var wordsfound = {};


		var seek_word_root =function(idx, axis, board){
			var _idx = [idx[0],idx[1]];
			_idx[axis]--;
			if(_idx[axis] < 0 || board[_idx[0]][_idx[1]] == ""){
				return idx;
			}

			return seek_word_root(_idx, axis, board);
		};


		var read_word = function(idx, axis, board){
			word = "";
			var _idx = [idx[0],idx[1]];
			while(_idx[axis]< board.length && board[_idx[0]][_idx[1]] != ""){
				word+= board[_idx[0]][_idx[1]]
				_idx[axis]++;
			}
			return word;
		};

		var board = JSON.parse(JSON.stringify(cf.board));

		var lettersplayed = document.querySelectorAll("#board td div");

		//if we dont ahve letters we are donezo.
		result.canPlayWord = result.canPlayWord && lettersplayed.length > 0
		
		
		var new_letters = []
		//get played letters
		for(var i = 0 ;i < lettersplayed.length; i++ ){
			var idx = lettersplayed[i].parentElement.id.substring(2).split("-");
			board[idx[0]][idx[1]] = lettersplayed[i].innerText;
			
			idx[0] = parseInt(idx[0]);
			idx[1] = parseInt(idx[1]);
		
			new_letters.push(idx);
			//save teh letter to the played queue
			result.playedletters.push(lettersplayed[i].innerText);
		}

		
		//do we have the lttes to play?
		var havetheletters= true;
		var tmp = JSON.parse(JSON.stringify(cf.players[cf.active_player].letters));
		for(var i in result.playedletters){
			var idx= tmp.indexOf(result.playedletters[i]);
			if(idx>=0){
				tmp.splice(idx,1);

			}
			else{
				havetheletters =false;
				break;
			}
		}
		result.canPlayWord = result.canPlayWord && havetheletters;


		//is teh play all in one axis? and unitterupted
		var is_horz = true;
		var is_vert = true;
		for(var i = 1; i < new_letters.length ;i++){
			if(new_letters[i][0] != new_letters[0][0]){
				is_vert = false;
			}
			if(new_letters[i][1]!=new_letters[0][1]){
				is_horz = false;
			}
		}
		result.canPlayWord = result.canPlayWord && (is_vert ||is_horz);

				
		var foundwords = false;
		//for each letter track up and left until you reach spoace thenread in til you read a space, track the words in an array
		for(var i = 0; i < new_letters.length;i++){
			//find the word roots for both axes
			for(var j = 0 ; j <2;j++){
				var idx = seek_word_root(new_letters[i],j, board);
				
				if(!wordsfound[idx.join("-")+"."+j]){
					var word = read_word(idx, j, board);
					
					if(word.length>1  && words.indexOf(word.toLowerCase())>=0){
						wordsfound[idx.join("-")+"."+j] = word;
						foundwords =true;
					}
				}
			}
			//the first letter found must have a word attached that contains all letters
			if(i == 0 ){
				var found =false;
				for(var j in wordsfound){
					var all = true;
					var word = wordsfound[j];
					for(var k in result.playedletters){
						var _word = word.replace(result.playedletters[k],"");
						all = all && _word!=word;
						word = _word;
					}
					found = found || all;
				}
				if(!found){
					result.canPlayWord =false;
				}
			}
		}
		result.canPlayWord = result.canPlayWord && foundwords;

		//all letters must be in one word.

		

		
		//copy words to score 
		
		if(result.canPlayWord){
			for(var i in wordsfound){
				result.wordsToScore.push(wordsfound[i])
			
			}	
			result.board = board;
		}

		return result;
	}
	
	/** plays a word for scoring*/
	cf.playWord=function(){
		var r = cf.getPlayResult();

		
		//can the player play a word?
		if(r.canPlayWord){
			
			
			for(var j in r.wordsToScore){
				var score =0;
				for(var i = 0 ; i <r.wordsToScore[j].length;i++){
					score+=cf.scoreChar(r.wordsToScore[j][i]);
				}
				if(cf.players[cf.active_player].letters.length ==0 &&
					cf.players[cf.active_player].strokes.length ==0 ){
					score+=cf.settings.jackpot;
				}

				//set score
				cf.players[cf.active_player].score += score;


				//save to scoring table
				cf.scoring.push({player:cf.players[cf.active_player].name, word:r.wordsToScore[j], score:score});
			
			}
			
			//set the board
			cf.board = r.board;

			//remove old letters
			for(var i = 0; i < r.playedletters.length ;i++){
				cf.players[cf.active_player].letters.splice(cf.players[cf.active_player].letters.indexOf(r.playedletters[i]), 1);
			}

			//next letters
			var more_letters =  r.playedletters.length;
			//prevent users from getting 50k letters and also preven them from converting eltters into strokes to refill
			if(more_letters + cf.players[cf.active_player].letters.length >= cf.settings.max_letters){
				more_letters = cf.settings.max_letters - cf.players[cf.active_player].letters.length;
			}

			//is it game over?
			if(cf.bag.length==0 && cf.players[cf.active_player].letters.length ==0 ){
				cf.gameOver();

			}
			else{
				if(more_letters > 0 ){
					cf.players[cf.active_player].letters = 
						cf.players[cf.active_player].letters.concat(
						cf.bag.splice(0, more_letters));
				}
				//remove all strokes?
				//TODO


				
				//next players turn
				cf.active_player = (cf.active_player+ 1) % cf.players.length;
			}
			cf.pushHistoryState();

			cf.sound.yeah.pause();
			cf.sound.yeah.currentTime = 0;
			cf.sound.yeah.play();
		}
		else{
			//TODO 
			cf.sound.error.pause();
			cf.sound.error.currentTime = 0;
			cf.sound.error.play();
		}

		//redraw
		cf.drawBoard();
		cf.drawCarrel();
	};

	/** adds a snap shot of the game to the histroy state*/
	cf.pushHistoryState = function(){
		game.history.push({
			board: JSON.stringify(cf.board),
			players : JSON.stringify(cf.players),
			scoring: JSON.stringify(cf.scoring)
		});
	};



	/** draws the board as it has been played*/
	cf.drawBoard=function(){
		var table = document.createElement("table");
		for(var r =0; r < cf.board.length ; r++){
			var row = document.createElement("tr");
			for(var i =0; i < cf.board[r].length ; i++){
				var cell = document.createElement("td");
				cell.setAttribute("id","cf"+r+"-"+i);
				if(r == Math.floor(cf.board.length/2)&& i == Math.floor(cf.board.length/2)){
					cell.classList.add("center");
				}

				if(cf.board[r][i]!=""){
					cell.classList.add("letter");
					
				}
				else{
					cell.setAttribute("ondrop", "game.dropLetterBoard(event)");
					cell.setAttribute("ondragover", "game.dragOverLetterBoard(event)");
				}
				cell.innerText = cf.board[r][i];
				row.appendChild(cell);
			}
			table.appendChild(row);
		}
		var tgt = document.getElementById("board");
		cf.clearEl(tgt);
		tgt.appendChild(table);

		//draw scores
		table = document.createElement("table");
		for(var i  in cf.players){
			var row = document.createElement("tr");
			var cell = document.createElement("td");
			cell.innerText = cf.players[i].name;
			row.appendChild(cell);
			cell = document.createElement("td");
			cell.innerText = cf.players[i].score;
			row.appendChild(cell);
			table.appendChild(row);
		}
		var p = document.createElement("p");
		p.innerText = cf.bag.length + " letters left";
		
		tgt = document.getElementById("scores")
		cf.clearEl(tgt);

		tgt.appendChild(table);
		tgt.appendChild(p);

		//letter details
		table = document.createElement("table");
		var row = document.createElement("tr");
		var cell = document.createElement("th");
		cell.innerText = ""
		row.appendChild(cell);
		cell = document.createElement("th");
		cell.innerText = "Value"
		row.appendChild(cell);
		cell = document.createElement("th");
		cell.innerText = "#"
		row.appendChild(cell);
		cell = document.createElement("th");
		cell.innerText = "strokes"
		row.appendChild(cell);

		table.appendChild(row);

		for(var i  in cf.letters){
			 row = document.createElement("tr");
			cell = document.createElement("td");
			cell.innerText = i;
			row.appendChild(cell);
			cell = document.createElement("td");
			cell.innerText = cf.letters[i].value;
			row.appendChild(cell);
			cell = document.createElement("td");
			cell.innerText = cf.letters[i].freq;
			row.appendChild(cell);
			cell = document.createElement("td");
			cell.innerText="";
			for(var j  in cf.letters[i].strokes){
				cell.innerText +=  j +"x"+cf.letters[i].strokes[j] +" ";
			}
			

			row.appendChild(cell);
			table.appendChild(row);
		}
		tgt = document.getElementById("letters")
		cf.clearEl(tgt);
		
		tgt.appendChild(table);
		
		//show last plays
		table = document.createElement("table");
		for(var i  in cf.scoring){
			var row = document.createElement("tr");
			var cell = document.createElement("td");
			cell.innerText = cf.scoring[i].player;
			row.appendChild(cell);
			cell = document.createElement("td");
			cell.innerText = cf.scoring[i].word;
			row.appendChild(cell);
			cell = document.createElement("td");
			cell.innerText = cf.scoring[i].score +" points";
			row.appendChild(cell);
			table.prepend(row);
		}
		tgt = document.getElementById("history")
		cf.clearEl(tgt);
		tgt.appendChild(table);
	};

	/** remove all chil elements from element */
	cf.clearEl=function(el){
		while(el.children.length>0){
			el.removeChild(el.children[0]);
		}
	};

	/** draws the players posessions to the dom*/
	cf.drawCarrel=function(){
		

		document.getElementById("player_name").innerText = cf.players[cf.active_player].name+
			(cf.players[cf.active_player].name.toLowerCase().lastIndexOf("s") > cf.players[cf.active_player].name.length-2?"' Turn":"'s Turn");

		//draw letters in rack
		var letters = document.getElementById("rack");
		var used_letters =  document.querySelectorAll("#board td div");

		var omit_us =[];
		for(var i = 0 ;i < used_letters.length; i++ ){
			omit_us.push(used_letters[i].innerText);
		}


		cf.clearEl(letters);
		for(var i = 0 ; i < cf.players[cf.active_player].letters.length;i++){

			if(omit_us.indexOf(cf.players[cf.active_player].letters[i])<0){
				var div = document.createElement("div");
				div.innerText = cf.players[cf.active_player].letters[i];
				div.classList.add("player_letter");

				div.setAttribute("draggable", "true");
				div.setAttribute("ondragstart", "game.dragLetter(event);");
				div.setAttribute("id", "letter_"+i+"-"+cf.players[cf.active_player].letters[i]);
				div.setAttribute("ondragend", "game.dragLetterEnd(event);");

				
				letters.appendChild(div);
			}
			else{
				omit_us.splice(omit_us.indexOf(cf.players[cf.active_player].letters[i]),1)
			}
		}

		//draw strokes avaialbe
		
		table = document.createElement("table");
		var row1 = document.createElement("tr");
		var row2 = document.createElement("tr");
		
		for(var i  in  cf.players[cf.active_player].strokes){
			var cell = document.createElement("th");
			cell.innerText = i ;
			row1.appendChild(cell);
			cell = document.createElement("td");
			cell.innerText = cf.players[cf.active_player].strokes[i] ;
			row2.appendChild(cell);

		
		}
		table.appendChild(row1);
		table.appendChild(row2)
		var strokes = document.getElementById("strokes");
		cf.clearEl(strokes);
		strokes.appendChild(table)

		//draw leters that can be made
		var characters = document.getElementById("characters");
		cf.clearEl(characters);
		for(var i  in cf.letters){
			
			var okay = true;
			for(var j in cf.letters[i].strokes)
			{
				okay = okay && cf.players[cf.active_player].strokes[j] >= cf.letters[i].strokes[j];
			}
			if(okay){
				var button = document.createElement("button");
				button.innerText =i;
				button.setAttribute("onclick", "game.craftChar('"+i+"')");
				characters.appendChild(button);
			}
			else{
				var button = document.createElement("div");
				button.innerText =i;
				button.classList.add("disabled")
				characters.appendChild(button);
			}

		}
	}
	/** characters are worth exactly howmany strokes they are*/
	cf.scoreChar=function(letter){
		return cf.letters[letter].value;
		
	}

	/* makes a character from strokes*/
	cf.craftChar = function(letter){
		var p = cf.players[cf.active_player];

		var okay = true;
		for(var i in cf.letters[letter].strokes){
			okay =  okay && p.strokes[i] >= cf.letters[letter].strokes[i];
		}
		
		//do our swaparoo;		
		if(okay){
			cf.sound.craft.pause();
			cf.sound.craft.currentTime =0;
			cf.sound.craft.play();
			for(var i in cf.letters[letter].strokes){
				p.strokes[i] -= cf.letters[letter].strokes[i];
			}
			cf.players[cf.active_player].letters.push(letter);

			cf.drawCarrel();
		}
	}

	/** turns a character into strokes*/
	cf.destroyChar = function(letter, idx){
		if(cf.players[cf.active_player].letters[idx]==letter){
			cf.sound.shred.pause();
			cf.sound.shred.currentTime =0;
			cf.sound.shred.play();
			for(var i in  cf.letters[letter].strokes){
				cf.players[cf.active_player].strokes[i]+= cf.letters[letter].strokes[i];
			}
			cf.players[cf.active_player].letters.splice(idx,1);
		}
		//redraw
		cf.drawCarrel();
	};
	/** turns a character into strokes*/
	cf.dropLetterShred = function(evt){
		evt.preventDefault();
		var data = evt.dataTransfer.getData("text");
		var dash = data.indexOf("-");
		var score = data.replace("letter_","");
		cf.destroyChar(data.substring(dash+1), score.substring(0, score.indexOf("-")));
		

		var el = document.getElementById(data);
		evt.target.appendChild(el);
		el.parentElement.removeChild(el)

		
	};
	cf.dragOverShred = function(evt){
		evt.preventDefault();
	}
	

	
	/** randomly shuffle an array*/
	cf.shuffle = function(array){
		for(var i = array.length-1; i > 0; i--){
			var j = Math.floor(Math.random() * i + 1);
			var tmp = array[i];
			array[i] = array[j];
			array[j] = tmp;
		}
		return array;
	}

	/** callled when the crag event starts for ltters*/
	cf.dragLetter=function(evt){
		evt.dataTransfer.setData('text/plain', evt.target.id);
		evt.dataTransfer.dropEffect = "move";
	}
	/** callled when the crag event starts for ltters*/
	cf.dragLetterEnd=function(evt){
		//evt.dataTransfer.setData('text/plain');
	}
	//** handles the drop of a letter onto a blank space on the Rack.
	cf.dropLetterRack = function(evt){
		evt.preventDefault();
 
		var data = evt.dataTransfer.getData("text");
		evt.target.appendChild(document.getElementById(event.dataTransfer.getData("text/plain")));
		cf.sound.shred.pause();
		cf.sound.shred.currentTime =0;
		cf.sound.shred.play();
	}
	//** handles the drop of a letter onto a blank space on the board.
	cf.dropLetterBoard = function(evt){
		evt.preventDefault();
 
		var data = evt.dataTransfer.getData("text");
		evt.target.appendChild(document.getElementById(event.dataTransfer.getData("text/plain")));

		//remove from players letters
		cf.sound.shred.pause();
		cf.sound.shred.currentTime =0;
		cf.sound.shred.play();
	};
	cf.dragOverLetterBoard = function(evt){
		evt.preventDefault();
	}
	

	/** Resets the board to the beginning of the turn.*/
	cf.resetBoard = function(){
		//TODO
	};

	cf.closeIntro= function(){
		cf.players[0].name = document.getElementById("player1").value;
		cf.players[1].name = document.getElementById("player2").value;
		document.getElementById("rules").setAttribute("style", "display:none");
		cf.drawBoard();
		cf.drawCarrel();
	}

	cf.gameOver=function(){
		var el = document.getElementById("content");
		cf.clearEl(el);


		var highest = 0;
		var name = "?";

		var table = document.createElement("table");
		for(var i  in cf.players){
			var row = document.createElement("tr");
			var cell = document.createElement("td");
			cell.innerText = cf.players[i].name;
			row.appendChild(cell);
			cell = document.createElement("td");
			cell.innerText = cf.players[i].score;
			row.appendChild(cell);
			table.appendChild(row);
			if(cf.players[i].score >highest){
				highest = cf.players[i].score
				name = cf.players[i].name;
			}
		}

		var h=  document.createElement("h1");
		h.innerText = name+" Wins!";

		var p =  document.createElement("p");
		p.innerText = "with "+ highest + " points.";

		el.appendChild(h);
		el.appendChild(p);
		el.appendChild(table);

		table = document.createElement("table");
		for(var i  in cf.scoring){
			var row = document.createElement("tr");
			var cell = document.createElement("td");
			cell.innerText = cf.scoring[i].player;
			row.appendChild(cell);
			cell = document.createElement("td");
			cell.innerText = cf.scoring[i].word;
			row.appendChild(cell);
			cell = document.createElement("td");
			cell.innerText = cf.scoring[i].score +" points";
			row.appendChild(cell);
			table.prepend(row);
		}

		el.appendChild(table);

		document.getElementById("rules").setAttribute("style", "");

		cf.sound.end.pause();
		cf.sound.end.currentTime =0;
		cf.sound.end.play();

	}

};

var cf_player = function(name){
	var player = this;
	
	player.name = name;
	player.score = 0;
	player.active = false;
	player.letters = [];
	player.strokes = {
		"|":0,
		"-":0,
		"\\":0,
		"/":0,
		"(":0,
		")":0
	};


}
