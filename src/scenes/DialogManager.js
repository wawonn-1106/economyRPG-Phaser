export default class DialogManager {
    constructor() {
        this.currentSequence = [];
        this.currentIndex = 0;
        this.isTalking = false;
        this.playerName = "名無し";
        this.inputMode = false; 
        this.onChoice = null;

        this.elements={
            window:document.getElementById('dialog-window'),
            name:document.getElementById('dialog-name'),
            text:document.getElementById('dialog-text'),
            inputContainer:document.getElementById('dialog-input'),
            inputField:document.getElementById('player-name-input'),
            inputSubmit:document.getElementById('player-name-submit'),
            choiceContainer:document.getElementById('dialog-choices'),
        }
    }
//textContentはinnerTextの上位互換
    start(dialogArray,startId=null) {
        //null
        this.currentSequence = dialogArray;
        
        if(startId){
            const index=this.currentSequence.findIndex(l=>l.id===startId);
            this.currentIndex=(index !==-1) ? index :0;
        }else{
            this.currentIndex=0;
            //見つからなかった場合
        }

        this.isTalking = true;
        this.elements.window.classList.remove('hidden');//id class両方持つものからclassを取る
        this.showLine();
    }
    showLine() {
        if (this.inputMode) return;
        if (this.currentIndex >= this.currentSequence.length) {
            this.end();
            return;
        }

        const line=this.currentSequence[this.currentIndex];

        
        /*const nameEl = document.getElementById('dialog-name');
        const textEl = document.getElementById('dialog-text');

        nameEl.innerText = line.name;*/

        const displayText = (line.text || '')
            .replaceAll('[[NAME]]', this.playerName); //全てのdialogは一回ここを通る
          //.replaceAll([[]],this);

        this.elements.name.textContent=line.name;
        this.elements.text.textContent=displayText;

        switch (line.type) {
            case "text":
                this.inputMode = false;
                //this.currentIndex++;をやめた
                if(!line.next){
                    this.currentIndex++;
                }
                break;

            case "input":
                this.inputMode = true;
                this.handleInput();
                break;

            case "choice":
                this.inputMode = true;
                this.handleChoice(line.choices);
                break;
        }
    }
    handleInput(){
        this.elements.inputContainer.classList.remove('hidden');
        this.elements.inputField.focus();

        const submitHandler=()=>{
            const val=this.elements.inputField.value.trim();
            if(val!==""){
                this.playerName=val;
                this.elements.inputContainer.classList.add('hidden');
                this.elements.inputSubmit.removeEventListener('click',submitHandler);
                //使い捨てのaddEventだからremoveしておく。    
       
                this.inputMode=false;
                this.currentIndex++;
                this.showLine();
            }else{
                alert('名前を入力してください。');
                this.elements.inputField.focus();
            }    
        };
        this.elements.inputSubmit.addEventListener('click',submitHandler);
    }
    handleChoice(choices){
        this.elements.choiceContainer.classList.remove('hidden');
        
        choices.forEach(choice=>{
            const btn=document.createElement('button');
            btn.textContent=choice.text;//line.choice→choices→choice→choice.text実質line.choice.text
            btn.classList.add('choice-btn');

            btn.addEventListener('click',()=>{
                this.clearContent();
                this.inputMode=false;
                
                if(this.onChoice) this.onChoice(choice);

                if(choice.next){
                    this.jumpTo(choice.next);
                }else{
                    //どの選択をしても同じ反応
                    this.currentIndex++;
                    this.showLine();
                }
            });
            this.elements.choiceContainer.appendChild(btn); //createElementで作ったものをHTMLに張り付ける
        });
    }
    clearContent(){
        //明日する
        while(this.elements.choiceContainer.firstChild){
            this.elements.choiceContainer.removeChild(this.elements.choiceContainer.firstChild);
        }
        this.elements.choiceContainer.classList.add('hidden');
    }
    jumpTo(nextId){
        if(nextId==='end'){
            //dialog.jsonでendってやつを作って目印にするだけ。showLineとは違って自動でしてくれない
            this.end();
            return;
        }

        const targetIndex=this.currentSequence.findIndex(l=>l.id===nextId);//降順関係ない、使いまわしできる

        if(targetIndex!==-1){
            this.currentIndex=targetIndex;
        }else{
            this.currentIndex++;
            //一応なかったらその行飛ばす
        }
        this.showLine();
    }
    end() {
        this.isTalking = false;
        this.inputMode = false;
        this.elements.window.classList.add('hidden');
        this.elements.text.textContent= "";
    }
}