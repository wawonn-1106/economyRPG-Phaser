import MenuManager from "../managers/MenuManager.js";

export default class UIScene extends Phaser.Scene{
    constructor(){
        super({key:'UIScene'});
        this.portrait=null;
        this.dialogNameText=null;
        this.dialogContentText=null;
        this.dialogGroup=null;
        this.dialogChoices=[];
        this.inputFields=[];

        this.hpHearts=[];
        this.hotbarSlots=[];
        this.hotbarIcons=[];
        this.maxHp=10;
    }
    create(){
        const worldScene=this.scene.get('World');

        this.menuManager=new MenuManager(this,worldScene);
        worldScene.menuManager=this.menuManager;

        if(worldScene){
            worldScene.dialogManager.setUIScene(this);
        }

        this.keys=this.input.keyboard.addKeys('M,I,P,A,R,S,D');

        this.createHealthBar();
        //this.createHotbar();

        this.createDialogUI();

        if(worldScene.inventoryData){
            //this.updateHotbar(worldScene.inventoryData);
        }
    }
    createHealthBar(){
        const startX=30;
        const y=50;
        for(let i=0;i<this.maxHp;i++){

            const heart=this.add.image(startX+(i*35),y,'heart').setScale(0.08);
            this.hpHearts.push(heart);
        }
    }//↓明日書き直す
    /*createHotbar(){
        const gameWidth=this.scale.width;
        const gameHeight=this.scale.height;
        const slotCount=9;
        const slotSize=60;
        const startX=(gameWidth-(slotCount*slotSize))/2+(slotSize/2);
        const y=gameHeight-50;

        for(let i=0;i<slotCount;i++){

            const slot=this.add.rectangle(startX+(i*slotSize),y,50,50,0).setStrokeStyle(2,0xffffff);
            this.hotbarSlots.push(slot);

            this.hotbarIcons.push(null);
        }
    }*/
    /*updateHotbar(inventoryData){
        inventoryData.forEach((item,index)=>{
            if(index>=this.hotbarSlots.length)return;

            const slot=this.hotbarSlots[index];

            if(this,this.hotbarIcons[index])this.hotbarIcons[index].destroy();

            if(item){
                const icon=this.add.image(slot.x,slot.y,'heart').setScale(0.05);
                this.hotbarIcons[index]=icon;
            }
        })
    }*/
    updateHP(currentHP){
        this.hpHearts.forEach((heart,index)=>{
            if(index<currentHP){
                heart.setVisible(true).setAlpha(1);
            }else{
                heart.setAlpha(0.2);
            }
        });
    }
    createDialogUI(){
        const gameWidth=this.scale.width;
        const gameHeight=this.scale.height;

        this.dialogGroup=this.add.container(0,0).setDepth(4000).setVisible(false);

        const winBg=this.add.image(gameWidth/2,gameHeight-140,'dialog-bg');

        this.portrait=this.add.image(gameWidth/2-280,gameHeight-150,'portrait-container').setOrigin(0.5,1);

        this.dialogNameText=this.add.text(gameWidth/2-120,gameHeight-200,'',{
            fontSize:'22px',
            color:'#000000',
            fontStyle:'bold',
            fontFamily:'sans-serif'
        });

        this.dialogContentText=this.add.text(gameWidth/2-120,gameHeight-165,'',{
            fontSize:'24px',
            color:'#000000',
            wordWrap:{width:500},
            lineSpacing:10
        });

        this.dialogGroup.add([winBg,this.portrait,this.dialogNameText,this.dialogContentText]);
    }
    showDialogWindow(){
        this.dialogGroup.setVisible(true);
    }
    hideDialogWindow(){
        this.dialogGroup.setVisible(false);
        this.clearChoices();
    }
    updateDialogContent(name,text,portraitKey=null){
        this.dialogNameText.setText(name);
        this.dialogContentText.setText(text);
        if(portraitKey){//立ち絵。ない時用の立ち絵も用意する予定
            this.portrait.setTexture(portraitKey).setVisible(true);//いったん全部player.png
        }else{
            this.portrait.setVisible(false);
        }
    }
    showInputField(callback){
        //また今度にしよ
        this.clearInputFields();

        const gameWidth=this.scale.width;
        const gameHeight=this.scale.height;

        const inputBg=this.add.image(gameWidth/2,gameHeight/2,'input-bg').setDepth(5000);

        let currentText='';
        const inputTextDisplay=this.add.text(gameWidth/2,gameHeight/2-20,'',{
            fontSize:'32px',
            color:'#000000'
        }).setOrigin(0.5).setDepth(5001);

        const submitBtn=this.add.image(gameWidth/2,gameWidth/2+60,'submit-btn')
            .setInteractive({unHandCursor:true})
            .setDepth(5001);
        
        const submitText=this.add.text(gameWidth/2,gameHeight/2+60,'決定',{
            fontSize:'20px'
        }).setOrigin(0.5).setDepth(5002);

        const keyHandler=(event)=>{
            if(event.key==='Enter'){
                confirmInput();
            }else if(event.key==='Backspace'){
                currentText=currentText.slice(0,-1);
            }else if(event.key.length===1){
                currentText+=event.key;
            }
            //inputTextDisplay.setText(currentText+'|');
        };

        this.input.keyboard.on('keydown',keyHandler);

        const confirmInput=()=>{
            if(currentText.trim()==='')return;

            this.inputFields.keyboard.off('keydown',keyHandler);
            this.clearInputFields();
            callback(currentText);
        };

        submitBtn.on('pointerdown',confirmInput);

        this.inputFields.push(inputBg,inputTextDisplay,submitBtn,submitText);
    }
    clearInputFields(){
        this.inputFields.forEach(field=>field.destroy());
        this.inputFields=[];
    }
    showChoices(choices,callback){
        this.clearChoices();
        choices.forEach((choice,index)=>{
            const x=this.scale.width/2;
            const y=250+(index*70);

            const btn=this.add.image(x,y,'choice-btn').setInteractive({useHandCursor: true});
            const text=this.add.text(x,y,choice.text,{fontSize:'20px'}).setOrigin(0.5);

            btn.on('pointerdown',()=>callback(choice));//選択の後の処理に飛ばす

            this.dialogChoices.push(btn,text);
        });
    }
    clearChoices(){
        this.dialogChoices.forEach(choice=>choice.destroy());
        this.dialogChoices=[];
    }
    update(){
        //メニューを開くキーのショートカット
        if(Phaser.Input.Keyboard.JustDown(this.keys.M)){
            this.menuManager.toggle('menu');
        }
        if(Phaser.Input.Keyboard.JustDown(this.keys.I)){
            this.menuManager.toggle('inventory');
        }
        if(Phaser.Input.Keyboard.JustDown(this.keys.P)){
            this.menuManager.toggle('profile');
        }
        if(Phaser.Input.Keyboard.JustDown(this.keys.A)){
            this.menuManager.toggle('review');
        }
        if(Phaser.Input.Keyboard.JustDown(this.keys.R)){
            this.menuManager.toggle('ranking');
        }
        if(Phaser.Input.Keyboard.JustDown(this.keys.S)){
            this.menuManager.toggle('settings');
        }
        if(Phaser.Input.Keyboard.JustDown(this.keys.D)){
            this.menuManager.toggle('dictionary');
        }
    }
}