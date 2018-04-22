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
	board_size : 15
};
cf.board = [];
cf.history =[];
cf.scoring =[];

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
	
	/** plays a word for scoring*/
	cf.playWord=function(){

		var word="";
		var indexes =[];

		var canPlayWord = true;
		
		
		//get all teh letters dropped onto the board
		var lettersplayed = document.querySelectorAll("#board td div");

		//dont allow plays that dont include letters
		if(lettersplayed.length == 0){
			canPlayWord =false;
		}
		
		for(var i = 0 ;i < lettersplayed.length; i++ ){
			word+= lettersplayed[i].innerText;
			var idx = lettersplayed[i].parentElement.id.substring(2).split("-");
			//gotta make sure these are ints
			idx[0] = parseInt(idx[0]);
			idx[1] =parseInt(idx[1]);
			indexes.push(idx);

			
		}

		//determine if the user has played a word on a single axis
		//alnog the way check to see if we happen ontoa  gap
		var ishoriz = true; 
		var isvert= true;
		var hasgaps = false;
		for(var i =0; i <  indexes.length; i++){
			isvert = isvert && indexes[i][0] == indexes[0][0];
			ishoriz = ishoriz && indexes[i][1] == indexes[0][1];


			hasgaps = hasgaps || ( i >0 &&cf.mDist(indexes[i], indexes[i-1])> 1);
		}
		//only allow words that are entirely in the same axis.
		canPlayWord = canPlayWord && ( ishoriz|| isvert);

		//do we ahve the letters
		for(var i = 0; i < word.length;i++){
			if(cf.players[cf.active_player].letters.indexOf(word[i])<0){
				//prevent play;
				canPlayWord= false;
				break;
			}
		}


		//is teh space on the board in conatact with other letters or the starting space?
		var incontact = false;
		var outhers
		if(cf.history.length <=1){
			//fspecial case for the intial play
			for(var i = 0 ; i <indexes.length;i++){
				if(indexes[i][0] == Math.floor(cf.board.length/2) 
					&& indexes[i][1] == Math.floor(cf.board.length/2)){
					incontact =true;
					break;
				}
			}
		}
		else{
			//DO ANY OF THE EIGHT SURROUNGIN SQUARES HAVE A LETTER IN THEM
			for(var i = 0 ; i <indexes.length;i++){
				var surrounds =[];
				//generate a list of surrounding nodes to check. this sucks and is verbose but it aids debuggging and im trying to do this while a toddler runs around
				if(indexes[i][0]>0){
					if(indexes[i][1]>0){
					surrounds.push([indexes[i][0] -1, indexes[i][1]])
					
					}
					if(indexes[i][1]<cf.board.length-1){
						surrounds.push([indexes[i][0], indexes[i][1]+1])
					}
				}
				if(indexes[i][0]<cf.board.length-1){
					if(indexes[i][1]>0){
					surrounds.push([indexes[i][0] +1, indexes[i][1]])
					surrounds.push([indexes[i][0], indexes[i][1]-1])
					
					}
					
				}
				for( var j in surrounds){
					console.log(surrounds[j]);
					if(cf.board[surrounds[j][0]][surrounds[j][1]] != ""){
						incontact =true;
						
						
							//should we add this letter?
							
							if((ishoriz && indexes[0][1] == surrounds[j][1]) 
								||(isvert && indexes[0][0] == surrounds[j][0])){
								// word.splice(i,1,cf.board[surrounds[j][0]][surrounds[j][1]]);
								// console.log
								//Start new owrds,
							}
							
						
					}
				}
			}
		}
		canPlayWord = canPlayWord && incontact;

		//does it make a word?
		
		//TODO
		
		//can the player play a word?
		if(canPlayWord){
			var score =0;
			
			for(var i = 0 ; i <indexes.length;i++){
				//set board values
				console.log(indexes[i][0],indexes[i][1], word[i])
				cf.board[indexes[i][0]][indexes[i][1]] = word[i];
				//scoring
				score+=cf.scoreChar(word[i]);

			}
			
			//set score
			cf.players[cf.active_player].score += score;

			//remove old letters
			for(var i = 0; i < word.length ;i++){
				cf.players[cf.active_player].letters.splice(cf.players[cf.active_player].letters.indexOf(word[i]), 1);
			}

			//next letters
			var more_letters =  word.length;
			//prevent users from getting 50k letters and also preven them from converting eltters into stroeks to refill
			if(more_letters + cf.players[cf.active_player].letters.length >= cf.settings.max_letters){
				more_letters = cf.settings.max_letters - cf.players[cf.active_player].letters.length;
			}
			if(more_letters > 0 ){
				cf.players[cf.active_player].letters = 
					cf.players[cf.active_player].letters.concat(
					cf.bag.splice(0, more_letters));
			}
			//remove all strokes?
			//TODO

			//save to scoring table
			cf.scoring.push({player:cf.players[cf.active_player].name, word:word, score:score});
			
			//next players turn
			cf.active_player = (cf.active_player+ 1) % cf.players.length;

			cf.pushHistoryState();
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
	}



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
		tgt = document.getElementById("scores")
		cf.clearEl(tgt);
		tgt.appendChild(table);

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
			table.appendChild(row);
		}
		tgt = document.getElementById("letters")
		cf.clearEl(tgt);
		tgt.innerText = cf.bag.length + " letters left";
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
	}

	/** remove all chil elements from element */
	cf.clearEl=function(el){
		while(el.children.length>0){
			el.removeChild(el.children[0]);
		}
	}

	cf.mDist=function(point1, point2){
		return Math.abs(point1[0] - point2[0])+Math.abs(point1[1] - point2[1]);
	}
	/** draws the players posessions to the dom*/
	cf.drawCarrel=function(player_id){
		if(!player_id){
			player_id = cf.active_player;
		}

		document.getElementById("player_name").innerText = cf.players[cf.active_player].name+
			(cf.players[cf.active_player].name.toLowerCase().lastIndexOf("s") > cf.players[cf.active_player].name.length-2?"' Turn":"'s Turn");

		//draw letters in rack
		var letters = document.getElementById("rack");
		cf.clearEl(letters);
		for(var i = 0 ; i < cf.players[player_id].letters.length;i++){

			var div = document.createElement("div");
			div.innerText = cf.players[player_id].letters[i];
			div.classList.add("player_letter");

			div.setAttribute("draggable", "true");
			div.setAttribute("ondragstart", "game.dragLetter(event);");
			div.setAttribute("id", "letter_"+i+"-"+cf.players[player_id].letters[i]);
			div.setAttribute("ondragend", "game.dragLetterEnd(event);");

	
			
			
			var button = document.createElement("button");
			button.classList.add("hovermenu");
			button.innerText = "x";
			button.setAttribute("onclick", "game.destroyChar('"+cf.players[player_id].letters[i]+"', "+i+");");
		
			div.appendChild(button);
			
			letters.appendChild(div);
		}

		//draw strokes avaialbe
		
		table = document.createElement("table");
		var row1 = document.createElement("tr");
		var row2 = document.createElement("tr");
		
		for(var i  in  cf.players[player_id].strokes){
			var cell = document.createElement("th");
			cell.innerText = i ;
			row1.appendChild(cell);
			cell = document.createElement("td");
			cell.innerText = cf.players[player_id].strokes[i] ;
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
				okay = okay && cf.players[player_id].strokes[j] >= cf.letters[i].strokes[j];
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
			console.log("rm", letter)
			for(var i in  cf.letters[letter].strokes){
				cf.players[cf.active_player].strokes[i]+= cf.letters[letter].strokes[i];
			}
			cf.players[cf.active_player].letters.splice(idx,1);
		}
		//redraw
		cf.drawCarrel();
	};

	
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
		console.log(evt);
		evt.dataTransfer.setData('text/plain', evt.target.id);
		evt.dataTransfer.dropEffect = "move";
	}
	/** callled when the crag event starts for ltters*/
	cf.dragLetterEnd=function(evt){
		//evt.dataTransfer.setData('text/plain');
	}
	//** handles the drop of a letter onto a blank space on the Rack.
	cf.dropLetterRack = function(evt){
		console.log(evt);
		evt.preventDefault();
 
		var data = evt.dataTransfer.getData("text");
		evt.target.appendChild(document.getElementById(event.dataTransfer.getData("text/plain")));

	}
	//** handles the drop of a letter onto a blank space on the board.
	cf.dropLetterBoard = function(evt){
		console.log(evt);
		evt.preventDefault();
 
		var data = evt.dataTransfer.getData("text");
		evt.target.appendChild(document.getElementById(event.dataTransfer.getData("text/plain")));

		//remove from players letters

	};
	cf.dragOverLetterBoard = function(evt){
		evt.preventDefault();
	}
	

	/** Resets the board to the beginning of the turn.*/
	cf.resetBoard = function(){
		//TODO
	};


	/** ajax wrapper **/
	this.ajax = function(url, load) {
		var xhr = new XMLHttpRequest();
		xhr.open("GET", url,true);
		xhr.onload=(e)=>{
			if (xhr.readyState === 4) {
				if (xhr.status === 200) {
					load(xhr.responseText);
				}
				else{
					console.log(xhr.responseCode, xhr.responseText);
				}
			}
		}
		xhr.send(null);
	};

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
