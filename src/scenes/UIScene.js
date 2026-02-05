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
        this.hotbar=[];
        this.hotbarSlots=[];
        this.hotbarIcons=[];
        this.hotbarTexts=[];

        this.selector=null;
        this.selectedSlotIndex=0;

        this.maxHp=10;

        this.gameTime={
            day:1,
            hour:6,
            minute:0,
            elapsed:0
        };
        this.timeBg=null;
        this.dayText=null;
        this.clockText=null;
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
        this.createHotbar();

        this.createDialogUI();

        this.createClock();

        if(worldScene.inventoryData){
            this.updateHotbar(worldScene.inventoryData);
        }

        this.input.on('wheel',(pointer,gameObjects,deltaX,deltaY,deltaZ)=>{
            if(deltaY>0){
                this.selectedSlotIndex=(this.selectedSlotIndex+1)%9;
            }else{
                this.selectedSlotIndex=(this.selectedSlotIndex-1+9)%9;
            }
            this.updateSelectorPosition();
        });
    }
    createHealthBar(){
        const startX=30;
        const y=50;
        for(let i=0;i<this.maxHp;i++){

            const heart=this.add.image(startX+(i*35),y,'heart').setScale(0.08);
            this.hpHearts.push(heart);

            this.tweens.add({
                targets:heart,
                scale:0.1,
                duration:600,
                yoyo:true,
                repeat:-1,
                ease:'Sine.easeInOut',
                //delay:i*100 波打ちのような感じ
            });//これいらんな
        }

    }//↓明日書き直す
    createHotbar(){
        const gameWidth=this.scale.width;
        const gameHeight=this.scale.height;

        const y=gameHeight-50;

        this.hotbar=this.add.image(gameWidth/2,y,'hotbar');//'hotbar
        /*const slotCount=9;
        const slotSize=60;*/
        
        const spacing=33;
        const startX=(gameWidth/2)-(spacing*4);
        
        for(let i=0;i<9;i++){

            //const slot=this.add.rectangle(startX+(i*slotSize),y,50,50,0).setStrokeStyle(2,0xffffff);
            this.hotbarSlots.push({
                x:startX+(i*spacing),
                y:y
            });

            this.hotbarIcons.push(null);
            this.hotbarTexts.push(null);
        }
        this.selector=this.add.image(this.hotbarSlots[0].x,y,'slot-selected').setDepth(10);
        //選ばれてるときわかりやすく
    }
    updateHotbar(inventoryData){
        inventoryData.forEach((item,index)=>{
            if(index>=9)return;

            const slotPos=this.hotbarSlots[index];

            if(this.hotbarIcons[index])this.hotbarIcons[index].destroy();
            if(this.hotbarTexts[index])this.hotbarTexts[index].destroy();

            if(item && item.count>0){

                this.hotbarIcons[index]=this.add.image(slotPos.x,slotPos.y,item.id);

                this.hotbarTexts[index]=this.add.text(slotPos.x+10,slotPos.y+10,item.count,{
                    fontSize:'24px',
                    color:'#ffffff'
                }).setOrigin(0.5);//12pxくらい
            }
        })
    }
    updateSelectorPosition(){
        const targetPos=this.hotbarSlots[this.selectedSlotIndex];
        this.selector.setPosition(targetPos.x,targetPos.y);
    }
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

        const winBg=this.add.image(gameWidth/2,gameHeight-140,'dialog-bg').setScale(3,1.5);

        this.portrait=this.add.image(gameWidth/2-280,gameHeight-50,'portrait-container')
            //.setScale(3,1.5)
            .setOrigin(0.5,1);

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
        this.clearInputFields();
    }
    updateDialogContent(name,text,portraitKey=null){
        this.dialogNameText.setText(name);
        this.dialogContentText.setText(text);
        if(portraitKey){//立ち絵。ない時用の立ち絵も用意する予定
            this.portrait.setTexture(portraitKey).setScale(0.3).setVisible(true);//いったん全部player.png
        }else{
            this.portrait.setVisible(false);
        }
    }
    showInputField(callback){
        //また今度にしよ
        this.clearInputFields();

        const gameWidth=this.scale.width;
        const gameHeight=this.scale.height;

        const inputBg=this.add.image(gameWidth/2,gameHeight/2+250,'input-bg').setDepth(5000);

        let currentText='';
        const inputTextDisplay=this.add.text(gameWidth/2,gameHeight/2-20,'',{
            fontSize:'32px',
            color:'#000000'
        }).setOrigin(0.5).setDepth(5001);

        const submitBtn=this.add.image(gameWidth/2,gameWidth/2+60,'submit-btn')
            .setInteractive({useHandCursor:true})
            .setOrigin(0.5)
            .setDepth(5001);
        
        /*const submitText=this.add.text(gameWidth/2,gameHeight/2+60,'決定',{
            fontSize:'20px'
        }).setOrigin(0.5).setDepth(5002);*/

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

        const gameWidth=this.scale.width;
        const gameHeight=this.scale.height;

        const startY=gameHeight-100;
        const choiceSpacing=160;

        const totalWidth=(choices.length-1)*choiceSpacing;
        const startX=(gameWidth/2)-(totalWidth/2);

        choices.forEach((choice,index)=>{
            const x=startX+(index*choiceSpacing);
            const y=startY;

            const btn=this.add.image(x,y,'choice-btn')
                .setScale(1.5)
                .setDepth(4001)
                .setInteractive({useHandCursor: true});

            const text=this.add.text(x,y,choice.text,{fontSize:'20px'})
                .setDepth(4002)
                .setOrigin(0.5);

            btn.on('pointerdown',()=>{
                this.clearChoices();
                callback(choice)
            });//選択の後の処理に飛ばす

            this.dialogChoices.push(btn,text);
        });
    }
    clearChoices(){
        this.dialogChoices.forEach(choice=>choice.destroy());
        this.dialogChoices=[];
    }
    createClock(){
        const gameWidth=this.scale.width;
        const x=gameWidth-120;
        const y=80;

        this.timeBg=this.add.image(x,y,'time-bg').setScale(3);

        this.dayText=this.add.text(x,y-20,`Day${this.gameTime.day}`,{
            fontSize:'18px',
            color:'#ffffff',
            stroke:'#000000',
            strokeThickness:2,
            fontStyle:'bold'
        }).setOrigin(0.5);

        this.clockText=this.add.text(x,y+10,'06:00 AM',{
            fontSize:'22px',
            color:'#ffffff',
            stroke:'#000000',
            strokeThickness:3,
            fontFamily:'sans-serif'
        }).setOrigin(0.5);
    }
    advanceTime(){
        this.gameTime.minute+=10;

        if(this.gameTime.minute>=60){
            this.gameTime.minute=0;
            this.gameTime.hour++;
        }

        if(this.gameTime.hour>=24){
            this.gameTime.hour=0;
            this.gameTime.day++;
            this.dayText.setText(`Day${this.gameTime.day}`);
        }

        this.updateClock();
    }
    updateClock(){
        const h=this.gameTime.hour;
        const displayHour=h%12 ||12;
        const hour=displayHour.toString().padStart(2,'0');
        const minute=this.gameTime.minute.toString().padStart(2,'0');
        const ampm=h>=12 ? 'PM': 'AM';

        this.clockText.setText(`${hour}:${minute}:${ampm}`);

    }
    update(time,delta){
        const world=this.scene.get('World');

        const isStopped=world.dialogManager.isTalking || this.menuManager.isOpenMenu;
        //会話、メニュー開いてる間は時間を止める
        if(!isStopped){
            this.gameTime.elapsed+=delta;

            if(this.gameTime.elapsed>=7000){//毎秒1000進む、7000で繰り上げ
                this.gameTime.elapsed=0;
                this.advanceTime();
            }
        }
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