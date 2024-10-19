import {HeartsRobotKmp} from "./hearts_robot_kmp.js";
import {HU} from "./hearts_utils.js";
import {my_robot} from "./my_robot.js";
export class HeartsView {

    #model
    #controller

    constructor(model, controller) {
        this.#model = model;
        this.#controller = controller;
    }

    render(render_div) {
        // Render your UI.
        const sound = new Audio("mixkit-classic-click-1117.wav");
        let board = document.createElement('div');
        board.style.width = "1000px";
        board.style.height = "800px";
        board.style.border = "solid";
        board.style.borderColor = "#00ebfe";
        board.style.backgroundColor = "#f9e473";
        let scoreboard = document.createElement('div');
        board.append(scoreboard);
        render_div.append(board);
        board.append(document.createElement('br'));
        render_div.append(document.createElement('br'));
        let sources = document.createElement('p');
        sources.append("Cards open source from: https://code.google.com/archive/p/vector-playing-cards/ \n");
        sources.append("Sound from: https://mixkit.co/free-sound-effects/click/ ")
        render_div.append(sources);


        let inpu = document.createElement('input');
        inpu.setAttribute("type", "text");
        inpu.setAttribute("value", "enter name");
        let poopoo;
        inpu.addEventListener('change', () => {
            poopoo = inpu.value;
            inpu.remove();
            let nameblock = document.createElement('p');
            nameblock.append("player name: " + poopoo);
            board.prepend(nameblock);

            let west_robot = new my_robot(this.#model, this.#controller, 'west');
            let north_robot = new HeartsRobotKmp(this.#model, this.#controller, 'north');
            let east_robot = new HeartsRobotKmp(this.#model, this.#controller, 'east');
            this.#controller.startGame('Alice', 'Bob', poopoo, 'Mike');
        }
        );
        board.append(inpu);

        let gameint = document.createElement("div");
        let textbox = document.createElement("p");
        let cardsplayed = document.createElement("div");
        board.append(gameint);
        let textbox2 = document.createElement("p");
        gameint.append(textbox);
        gameint.append(document.createElement("br"));
        gameint.append(textbox2);
        gameint.append(document.createElement("br"));
        let textbox3 = document.createElement("p");
        gameint.append(textbox3);
        gameint.append(document.createElement("br"));
        let cardsinhand = document.createElement("div");
        gameint.append(cardsplayed);
        let bigbr = document.createElement("br");
        gameint.append(bigbr);
        cardsplayed.style.height = '120px';
        gameint.append(cardsinhand);

        this.#model.addEventListener('stateupdate', () => {
            if (this.#model.getState() == 'passing') {
                textbox.textContent = ( "Passing: " + this.#model.getPassing() + "\n");
                if (this.#model.getPassing() != 'none') {
                    createhand(this.#model, this.#controller);
                }
            } else if (this.#model.getState() == 'playing') {       
                textbox2.textContent = "Passes complete, game starting.";
            } else if (this.#model.getState() == 'complete') {
                cardsinhand.remove();
                let winner = null;
                let winning_score = 200;
                HU.positions.forEach(p => {
                    if (this.#model.getScore(p) < winning_score) {
                        winning_score = this.#model.getScore(p);
                        winner = p;
                    }
                }); 
                textbox2.textContent = "Match over,"+ this.#model.getPlayerName(winner)+ " wins!";
            }
        })

        this.#model.addEventListener('trickstart', () => {
            textbox.textContent = "Trick started";
            cardsplayed.prepend("Cards played:");
            cardsplayed.append(document.createElement("br"));
            if (this.#model.getCurrentTrick().nextToPlay() == 'south') {
                textbox.textContent = "";
                textbox2.textContent = "2: Your're first! ";
                createhand(this.#model, this.#controller); 
            }
        });


        this.#model.addEventListener('trickplay', (e) => {
            textbox.append(this.#model.getPlayerName(e.detail.position) + " played the " + e.detail.card.toString() + "\n");
            textbox.append(document.createElement('br'));            
            
            let holder = document.createElement("div");
            holder.style.float = 'left';
            holder.style.width = '75px';
            holder.style.height = '100px';
            let res = document.createElement("img");
            res.src = getsrc(e.detail.card);
            res.alt = "2 of clubs";
            res.style.height = '100px';
            res.style.width = '75px';
            holder.append(res);
            cardsplayed.append(holder);

            if (this.#model.getCurrentTrick().nextToPlay() == 'south') {
                if (this.#model.getState() == 'playing'){
                    if(this.#model.getCurrentTrick().nextToPlay()!= this.#model.getCurrentTrick().getLead()){
                        let rat = this.#model.getCurrentTrick().getLeadSuit();
                        textbox2.textContent = ("2: trick played: " + rat);
                    }
                }else{
                    textbox2.textContent = ("2: trick played: ");
                }
                createhand(this.#model, this.#controller); 
            }
        });
        this.#model.addEventListener('trickend', (e)=>{
            textbox.innerHTML = '';
            cardsplayed.innerHTML = '';
        }
        );
        this.#model.addEventListener('trickcollected', (e) => {
            textbox.textContent = (" Trick won by " + this.#model.getPlayerName(e.detail.position) + "\n");
        });

        this.#model.addEventListener('scoreupdate', (e) => {
            if (e.detail.moonshooter != null) {
                //alert(this.#model.getPlayerName(e.detail.moonshooter) + " shot the moon!");
                board.append(this.#model.getPlayerName(e.detail.moonshooter) + " shot the moon!");
            }
            let elast  = scoreboard.lastElementChild;
            if (elast != null){
                scoreboard.removeChild(elast);

            }
            elast = document.createElement('p');
            elast.style.border = "solid";
            elast.style.borderColor = "black";
            elast.style.width = "500px";
            elast.append(`Score update: 
                ${this.#model.getPlayerName('north')}: ${e.detail.entry.north}
                ${this.#model.getPlayerName('east')} : ${e.detail.entry.east}
                ${this.#model.getPlayerName('south')}: ${e.detail.entry.south}
                ${this.#model.getPlayerName('west')} : ${e.detail.entry.west}\n`);
            elast.append(document.createElement("br"));
            elast.append(`Current totals: 
                ${this.#model.getPlayerName('north')}: ${this.#model.getScore('north')}
                ${this.#model.getPlayerName('east')} : ${this.#model.getScore('east')}
                ${this.#model.getPlayerName('south')}: ${this.#model.getScore('south')}
                ${this.#model.getPlayerName('west')} : ${this.#model.getScore('west')}\n`);
            scoreboard.append(elast);
        });


        function createhand(model, controller){
            let listcards = model.getHand("south").getCards();
            let res = document.createElement('div');
            res.style.display = 'table';
            let elast = cardsinhand.lastElementChild;
            if (elast!= null){
                cardsinhand.removeChild(elast);
            }
            let clickedcards = [];
            for (let i in listcards){
                let cardy = listcards[i];
                res.append(createimg(cardy, model, controller, clickedcards));
            }
            cardsinhand.append(res);
        };

        function createimg(cardy, model, controller, clickedcards){
            // Cards were open source and anonymous: https://code.google.com/archive/p/vector-playing-cards/
            let holder = document.createElement("div");
            holder.style.float = 'left';
            holder.style.width = '75px';
            holder.style.height = '100px';
            let res = document.createElement("img");
            res.src = getsrc(cardy);
            res.alt = cardy.toString();
            res.style.height = '100px';
            res.style.width = '75px';
            if (model.getState() == "playing"){
                if(controller.isPlayable('south', cardy)){
                    holder.style.border = 'solid';
                    holder.style.borderColor = "#feb900";
                    holder.style.borderWidth = '4px';
                }
            }   
            holder.append(res);
            res.addEventListener("click", () =>{
                //sound is also free: https://mixkit.co/free-sound-effects/click/
                if (model.getState() == 'passing'){
                    if (clickedcards.indexOf(cardy) == -1 && clickedcards.length <= 2){
                        sound.play();
                        clickedcards.push(cardy);
                        holder.style.border = 'solid';
                        holder.style.borderColor = "#feb900";
                        holder.style.borderWidth = '4px';
                    }
                    if (clickedcards.length == 3){
                        controller.passCards('south', clickedcards);
                    }
                }
                else if (model.getState() == 'playing'){
                    if (controller.isPlayable("south", cardy)){
                        sound.play();
                        controller.playCard('south', cardy);
                    }
                }
            });

            return holder;
        };  

        function getsrc(cardy){
            let suit = cardy.getSuit();
            let rank = cardy.getRank();
            if (rank>10){
                if (rank == 11){
                    rank = 'jack';
                }
                if (rank == 12){
                    rank = 'queen';
                }
                if(rank == 13){
                    rank = 'king';
                }
                if(rank == 14){
                    rank = 'ace';
                }
            }
        
            let res = "cards/"+rank+"_of_"+suit+".png";
            //  cards/2_of_clubs.png
            return res;
        }

        function cardclicked(cardy){
            clickedcards = [];
            if (this.#model.getState() == 'passing'){
                clickedcards.append(cardy);
                if (clickedcards.length() == 3){
                    this.#controller.passCards('south', clickedcards);
                }
            }
            else if (this.#model.getState() == 'playing'){
                this.#controller.playCard('south',cardy);
            }
        }
        
            
    }
    

    
}