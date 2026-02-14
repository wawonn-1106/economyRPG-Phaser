export default class DialogManager {
    constructor(scene) {
        this.scene=scene;
        this.uiScene=null;

        this.currentSequence = [];
        this.currentIndex = 0;
        this.isTalking = false;
        this.playerName = "名無し";
        this.inputMode = false; 
        this.onChoice = null;
    }
    setUIScene(uiScene){
        this.uiScene=uiScene;
    }
    start(dataKey,startId=null,speakerName=null) {
        //null
        //dataKeyはch1Dataだけ読み込むならいらない 、が隠しイベントを追加する予定もあるから、置いておく。

        const data=this.scene.cache.json.get(dataKey);
        this.currentSequence = data;
        this.activeSpeakerName=speakerName;
        
        if(startId){
            const index=this.currentSequence.findIndex(l=>l.id===startId);
            this.currentIndex=(index !==-1) ? index :0;
        }else{
            this.currentIndex=0;
            //見つからなかった場合
        }

        this.isTalking = true;

        this.uiScene.showDialogWindow();
        this.showLine();
    }
    showLine() {
        if (this.inputMode) return;
        if (this.currentIndex >= this.currentSequence.length) {
            this.end();
            return;
        }

        const line=this.currentSequence[this.currentIndex];

        if(line.unlock){
            this.scene.dictionaryManager.unlock(line.unlock);
        }

        const displayText = (line.text || '')
            .replaceAll('[[NAME]]', this.playerName); //全てのdialogは一回ここを通る
          //.replaceAll([[]],this);
        const nameText=this.activeSpeakerName||line.name||"???";

        this.uiScene.updateDialogContent(nameText,displayText,line.portrait);

        this.updateTextDisplay(displayText);

        switch (line.type) {
            case "text":
                this.inputMode = false;
                if(!line.next){
                    this.currentIndex++;
                }
                break;

            case "input":
                this.inputMode = true;
                this.uiScene.showInputField((name)=>{
                    this.handleInputResult(name);
                });
                break;

            case "choice":
                this.inputMode = true;
                this.uiScene.showChoices(line.choices,(choice)=>{
                    this.handleChoiceResult(choice);
                });
                break;
        }
    }
    handleInputResult(name){   
                if(name&&name.trim()!==''){
                    this.playerName=name;
                }else{
                    alert('名前を入力してください');
                }

                this.inputMode=false;
                this.currentIndex++;
                this.showLine();
    }
    handleChoiceResult(choice){
                this.inputMode=false;
                
                if(this.onChoice) this.onChoice(choice);

                if(choice.next){
                    this.jumpTo(choice.next);
                }else{
                    //どの選択をしても同じ反応
                    this.currentIndex++;
                    this.showLine();
                }
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
    updateTextDisplay(displayTerm){

        const textContent=this.uiScene.dialogContentText;

        if(!textContent)return;

        textContent.off('areaclick');

        textContent.setText(displayTerm);

        textContent.on('areaclick',(areaKey)=>{
            const world=this.scene;
            const termData = world.dictionaryManager.getTermByWord(areaKey);

            if(termData){
                this.uiScene.dictionaryContent.createQuickView(termData);
            }
        });
    }
    end() {
        this.isTalking = false;
        this.inputMode = false;
        this.uiScene.dictionaryContent.hide();
        this.uiScene.hideDialogWindow();
    }
}