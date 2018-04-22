/*
Creaftable 
Lee Brunjes 2018



*/

var craftable = function(){
var cf = this;
cf.players = [];
cf.active_player = 0;
cf.tiles = [];
cf.bag = [];
cf.settings ={
	max_letters:7
};
cf.board = 
[
	["","","","","","","","",""],
	["","","","","","","","",""],
	["","","","","","","","",""],
	["","","","","","","","",""],
	["","","","","","","","",""],
	["","","","","","","","",""],
	["","","","","","","","",""],
	["","","","","","","","",""],
	["","","","","","","","",""]
];

cf.letters_to_shapes={
	A:{'/':1,'\\':1,'-':1},
	B:{'|':1,")":2},
	C:{"(":1},
	D:{"|":1,")":1},
	E:{"|":1,"-":3},
	F:{"|":1, "-":2},
	G:{"(":1,"-":1,"|":1},
	H:{"|":2,"-":1},
	I:{"|":1},
	J:{")":1,"-":1,"|":1},
	K:{"|":1,"\\":1,"/":1},
	L:{"|":1,"-":1},
	M:{"|":1,"\\":1,"/":1,"|":1},
	N:{"|":12,"\\":1},
	O:{"(":1,")":1},
	P:{"|":1,")":1},
	Q:{"(":1,")":1,"\\":1},
	R:{"|":1,")":1,"\\":1},
	S:{"(":1,")":1},
	T:{"-":1,"|":1},
	U:{"|":2,"(":1,")":1},
	V:{"\\":1,"/":1},
	W:{"\\":2,"/":2},
	X:{"/":2,"\\":2},
	Y:{"\\":1,"|":1,"/":1},
	Z:{"-":2,"/":1}
};
cf.letter_frequency = {
	A:7,
	B:3,
	C:2,
	D:2,
	E:5,
	F:4,
	G:5,
	H:2,
	I:6,
	J:2,
	K:4,
	L:3,
	M:2,
	N:4,
	O:6,
	P:4,
	Q:1,
	R:4,
	S:4,
	T:4,
	U:5,
	V:1,
	W:4,
	X:2,
	Y:4,
	Z:1
};
	cf.init=function(){

		cf.players.push(new cf_player("Lee"));
		cf.players.push(new cf_player("Danielle"));

		cf.drawBoard();
		cf.populateBag();

		cf.players[0].letters = cf.bag.splice(0, cf.settings.max_letters);
		cf.players[1].letters = cf.bag.splice(0, cf.settings.max_letters);

		cf.active_player  = Math.floor(Math.random()*2);
		cf.drawCarrel();

	};

	/** shuffle the bag of letters based on frequency*/
	cf.populateBag=function(){
		var bag = [];
		for(var l in cf.letter_frequency){
			for(var i =0; i < cf.letter_frequency[l];i++){
				bag.push(l);
			}
		}

		//shuffle the tiles and 
		cf.bag = cf.shuffle(bag);
	}
	
	/** plays a word for scoring*/
	cf.playWord=function(word, player_idx, x,y, is_vertical){
		//can the player play a word?
		if(canPlayWord){
			//set board values

			//scoring

			// next letters

			//remove all strokes?

			//next players turn
		}


	};

	/** returns a bool if the player can play the word mentioned in teh palce mentioned.*/
	cf.canPlayWord=function(word, player_idx, x,y, is_vertical){
		//do we ahve the letters
		for(var i = 0; i < word.length;i++){
			if(cf.players[player_idx].letters.indexOf(word[i])<0){
				//prevent play;
				return false;
			}
		}
		//is teh space avaialbe on the board?

		//does it make a word?

	}

	/** draws the board as it has been played*/
	cf.drawBoard=function(){
		var table = document.createElement("table");
		for(var r =0; r < cf.board.length ; r++){
			var row = document.createElement("tr");
			for(var i =0; i < cf.board[r].length ; i++){
				var cell = document.createElement("td");
				cell.setAttribute("id","cf"+r+"-"+i);
				if(cf.board[r][i]=""){
					cell.classList.add("letter");
					
				}
				else{
					cell.setAttribute("ondrop", "game.dropLetterBoard(evt)");
				}
				cell.innerText = cf.board[r][i];
				row.appendChild(cell);
			}
			table.appendChild(row);
		}
		var tgt = document.getElementById("board");
		cf.clearEl(tgt);
		tgt.appendChild(table);
	}

	/** remove all chil elements from element */
	cf.clearEl=function(el){
		while(el.children.length>0){
			el.removeChild(el.children[0]);
		}
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

	
			
			
			var button = document.createElement("button");
			button.classList.add("hovermenu");
			button.innerText = "x";
			button.setAttribute("onclick", "game.destroyChar('"+cf.players[player_id].letters[i]+"', "+i+");");
		
			div.appendChild(button);
			
			letters.appendChild(div);
		}

		//draw strokes avaialbe
		var strokes = document.getElementById("strokes");
		cf.clearEl(strokes);
		for(var i  in  cf.players[player_id].strokes){
			var div = document.createElement("div");
			div.innerText = i + ":"+cf.players[player_id].strokes[i];
			strokes.appendChild(div);
		}

		//draw leters that can be made
		var characters = document.getElementById("characters");
		cf.clearEl(characters);
		for(var i = 0 ; i < cf.letters_to_shapes.length; i++){
			var okay = true;
			for(var j in cf.letters_to_shapes[i])
			{
				console.log(j ,cf.players[player_id].strokes[j],cf.letters_to_shapes[i][j])
				okay = okay && cf.players[player_id].strokes[j] >= cf.letters_to_shapes[i][j];
			}
			if(okay){
				var button = document.createElement("button");
				button.innerText =i;
				button.setAttribute("onclick", "game.craftChar('"+i+"')");
				characters.appendChild(button);
			}

		}
	}

	/* makes a character from strokes*/
	cf.craftChar = function(letter){
		if(!player_id){
			player_id = cf.active_player;
		}

	}

	/** turns a character into strokes*/
	cf.destroyChar = function(letter, idx){
		if(cf.players[cf.active_player].letters[idx]==letter){
			console.log("rm", letter)
			for(var i in  cf.letters_to_shapes[letter]){
				cf.players[cf.active_player].strokes[i]+= cf.letters_to_shapes[letter][i];
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

	//** handles the drop of a letter onto a blank space on the board.
	cf.dropLetterBoard = function(evt){
		console.log(evt);
		evt.preventDefault();
 
	 var data = evt.dataTransfer.getData("text");
	 evt.target.appendChild(document.getElementById(data));
	};
	/** called when letters are dragged*/
	cf.dragLetter = function(evt){
		evt.dataTransfer.dropEffect = "move";
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
