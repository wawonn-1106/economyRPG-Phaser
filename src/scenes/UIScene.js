import MenuManager from "../managers/MenuManager.js";
import DictionaryContent from "../contents/DictionaryContent.js";
import MachineContent from "../contents/MachineContent.js";
//import DictionaryManager from "../managers/DictionaryManager.js";

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

        /*this.draggedItem=null;
        this.dragStartIndex=null;
        this.dragIcon=null;
        this.dragCountText=null;
        this.processingItem=false;*/
        this.heldItem=null;
        this.cursorIcon=null;
        this.cursorCountText=null;

        this.gameTime={
            day:1,
            hour:6,
            minute:0,
            elapsed:0
        };
        this.timeBg=null;
        this.dayText=null;
        this.clockText=null;

        //this.dictionaryContent = new DictionaryContent(this);
    }
    create(){
        const worldScene=this.scene.get('World');

        this.dictionaryContent = new DictionaryContent(this);
        this.menuManager=new MenuManager(this,worldScene);
        this.machineContent = new MachineContent(this);
        worldScene.menuManager=this.menuManager;

        if(worldScene){
            worldScene.dialogManager?.setUIScene(this);
        }

        this.keys=this.input.keyboard.addKeys('M,I,P,A,R,S,D');

        this.createHealthBar();
        this.createHotbar();

        this.createDialogUI();

        this.createClock();

        this.isDecorationMode=false;

        this.decorationBtn=this.add.image(50,50,'decoration-btn')
            .setInteractive({useHandCursor:true})
            .setScale(0.8)
            .setScrollFactor(0)
            .setDepth(3000);
        
        this.decorationBtn.on('pointerdown',()=>{
            this.toggleDecorationMode();
            console.log('切り替わります');
        });

        this.decorationBtn.on('pointerover',()=>this.decorationBtn.setScale(0.9));
        this.decorationBtn.on('pointerout',()=>this.decorationBtn.setScale(0.8));

        this.cursorIcon=this.add.image(0,0,'').setVisible(false).setDepth(10000);
        this.cursorCountText=this.add.text(0,0,'',{
            fontSize:'18px',
            stroke:'#000',
            strokeThickness:3
        }).setVisible(false).setDepth(10001);

        this.input.on('pointerup',(pointer)=>{
            if(this.heldItem){

                if(this.heldItem&& !this.isPointerOver(pointer)){
                    this.dropItemToWorld();
                }
                //this.dragIcon.setPosition(pointer.x,pointer.y);
                //this.dragCountText.setPosition(pointer.x+20,pointer.y+20);
            }
        });

        if(worldScene.inventoryData){
            this.updateHotbar(worldScene.inventoryData);
        }

        this.input.on('wheel',(pointer,gameObjects,deltaX,deltaY,deltaZ)=>{

            const activeScene=this.scene.manager.getScenes(true).find(s=>s.scene.key!=='UIScene');
            //UIScene以外の一番上のSceneどのシーンにプレイヤーがいるかの取得。

            if (activeScene.dialogManager?.isTalking || activeScene.dialogManager?.inputMode) return;

            if(deltaY>0){
                this.selectedSlotIndex=(this.selectedSlotIndex+1)%9;
            }else{
                this.selectedSlotIndex=(this.selectedSlotIndex-1+9)%9;
            }
            this.updateSelectorPosition();

            const inventory=this.registry.get('inventoryData');
            const currentItem=inventory[this.selectedSlotIndex];

            if(currentItem&& currentItem.count>0){
                activeScene.player.updateHeldItem(currentItem.id);
            }else{
                activeScene.player.updateHeldItem(null);
            }
        });

        //his.input.setTopOnly(true);
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
        //if(!this.isDecorationMode)return;

        const gameWidth=this.scale.width;
        const gameHeight=this.scale.height;

        const y=gameHeight-50;

        this.hotbar=this.add.image(gameWidth/2,y,'hotbar')
            .setScale(1.8,0.3)
            .setVisible(this.isDecorationMode);//'hotbar
        /*const slotCount=9;
        const slotSize=60;*/
        
        const spacing=33;
        const startX=(gameWidth/2)-(spacing*4);

        this.hotbarSlots=[];
        
        for(let i=0;i<9;i++){

            //const slot=this.add.rectangle(startX+(i*slotSize),y,50,50,0).setStrokeStyle(2,0xffffff);
            this.hotbarSlots.push({
                x:startX+(i*spacing),
                y:y
            });//もうちょい大きくてもいい

            this.hotbarIcons.push(null);
            this.hotbarTexts.push(null);
        }
        this.selector=this.add.image(this.hotbarSlots[0].x,y,'hotbar')
            .setScale(0.2)
            .setDepth(10)
            .setVisible(this.isDecorationMode);
        //選ばれてるときわかりやすく
    }
    updateHotbar(inventoryData){
        //if(!this.isDecorationMode)return;

        inventoryData.forEach((item,index)=>{
            if(index>=9)return;

            const slotPos=this.hotbarSlots[index];

            if(this.hotbarIcons[index])this.hotbarIcons[index].destroy();
            if(this.hotbarTexts[index])this.hotbarTexts[index].destroy();

            if(item && item.count>0){

                this.hotbarIcons[index]=this.add.image(slotPos.x,slotPos.y,item.id)
                    .setDisplaySize(30,30)
                    .setVisible(this.isDecorationMode);//元の画像の大きさが違っても無理やり統一

                this.hotbarTexts[index]=this.add.text(slotPos.x+10,slotPos.y+10,item.count,{
                    fontSize:'24px',
                    color:'#ffffff'
                }).setOrigin(0.5).setVisible(this.isDecorationMode);//12pxくらい
            }
        })
    }
    updateSelectorPosition(){
        const targetPos=this.hotbarSlots[this.selectedSlotIndex];
        this.selector.setPosition(targetPos.x,targetPos.y);
    }
    /*startDragItem(index){
        if(this.processingItem)return;

        if (this.draggedItem) {
            this.dropItem(index);
            return;
        }
        this.processingItem=true;

        const inventory=this.registry.get('inventoryData');

        if(inventory &&inventory[index] && inventory[index].id!==null){
            this.dragStartIndex=index;

            //this.draggedItem={...inventory[index]};
            this.draggedItem=JSON.parse(JSON.stringify(inventory[index]));

            //inventory[index]=null;
            inventory[index] = { id: null, count: 0 };
            this.registry.set('inventoryData',inventory);

            this.dragIcon.setTexture(this.heldItem.id).setVisible(true);
            this.dragCountText.setText(this.heldItem.count).setVisible(true);

            this.updateHotbar(inventory);

            this.time.delayedCall(50,()=>{this.processingItem=false;});
        }
    }*/
    handleInteraction(targetIndex){
        //if(!this.draggedItem)return;

        const inventory=this.registry.get('inventoryData');
        const clickedItem=inventory[targetIndex];
        const maxStack=64;

        if(!this.heldItem && clickedItem&&clickedItem.id!==null){
            this.heldItem=JSON.parse(JSON.stringify(clickedItem));
            inventory[targetIndex]={id:null,count:0};
            //inventory[this.dragStartIndex]=targetItem;
            //inventory[targetIndex]=this.draggedItem;
            
        }else if(this.heldItem){
            if(clickedItem&& clickedItem.id===this.heldItem.id){
                //const maxStack=64;

                const spaceLeft=maxStack-clickedItem.count;
                const amountAdd=Math.min(spaceLeft,this.heldItem.count);

                clickedItem.count+=amountAdd;
                this.heldItem.count-=amountAdd;

                if(this.heldItem.count<=0) this.heldItem=null;
            }else{
                const tempItem=JSON.parse(JSON.stringify(clickedItem))||{id:null,count:0};
                inventory[targetIndex]=JSON.parse(JSON.stringify(this.heldItem));

                this.heldItem=tempItem===null? null:tempItem;
            }
            

            /*if(amountAdd>0){
                targetItem.count+=amountAdd;

                this.draggedItem.count-=amountAdd;
            }*/
            
            /*if(this.draggedItem.count<=0){
                this.draggedItem=null;
                this.dragStartIndex = null;

                this.dragIcon.setVisible(false);
                this.dragCountText.setVisible(false);
            }else{
                //inventory[this.dragStartIndex]=null;
                this.dragCountText.setText(this.draggedItem.count);
            }*/

        }
            //const tempItem=JSON.parse(JSON.stringify(targetItem))||{id:null,count:0};

            /*//inventory[this.dragStartIndex]=targetItem;
            inventory[targetIndex]=JSON.parse(JSON.stringify(this.draggedItem));

            if(tempItem && tempItem.id!==null){
                this.draggedItem=tempItem;

                this.dragIcon.setTexture(this.draggedItem.id).setVisible(true);
                this.dragCountText.setText(this.draggedItem.count).setVisible(true);

                this,this.dragStartIndex=targetIndex;
            }else{
                this.draggedItem=null;
                this.dragStartIndex = null;

                this.dragIcon.setVisible(false);
                this.dragCountText.setVisible(false);
            }*/
        this.registry.set('inventoryData',inventory);

        /*this.draggedItem=null;
        this.dragStartIndex=null;

        this.dragIcon.setVisible(false);
        this.dragCountText.setVisible(false);*/

        this.updateHotbar(inventory);
        this.updateCursorVisual();

        if(this.menuManager&& this.menuManager.isOpenMenu){
            this.menuManager.switchTab('inventory');
        }
    }
    dropItemToWorld(){
        if(!this.heldItem)return;

        const worldScene=this.scene.get('World');

        worldScene.spawnItemNearPlayer(this.heldItem);

        this.heldItem=null;
        this.updateCursorVisual();
    }
    isPointerOver(pointer){
        if(!this.menuManager.isOpenMenu)return false;

        const hW=500;
        const hH=300;
        const centerX=this.scale.width/2;
        const centerY=this.scale.height/2;

        return(pointer.x>=centerX-hW&& pointer.x<=centerX+hW 
            && pointer.y>=centerY-hH&& pointer.y<=centerY+hH);
    }
    updateCursorVisual(){
        if(this.heldItem&& this.heldItem.id){
            this.cursorIcon.setTexture(this.heldItem.id).setVisible(true);
            this.cursorCountText.setText(this.heldItem.count).setVisible(true);
        }else{
            this.cursorIcon.setVisible(false);
            this.cursorCountText.setVisible(false);
        }
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

        this.dialogContentText=this.add.rexBBCodeText(gameWidth/2-120,gameHeight-165,'',{
            fontSize:'24px',
            color:'#000000',
            wordWrap:{width:500},
            lineSpacing:10,
            padding: { top: 10 },//他の会話のやつもこれ入れる
            //interactive:true,
            /*tags:{
                area:{
                    mode:'click'
                }
            },
            area:true*/
        }).setDepth(4005).setVisible(false);

        this.dialogContentText.setInteractive();//あああああああああああ

        this.dialogGroup.add([winBg,this.portrait,this.dialogNameText,this.dialogContentText]);
        this.dialogGroup.removeInteractive();
    }
    showDialogWindow(){
        this.dialogGroup.setVisible(true);
        this.dialogContentText.setVisible(true);
    }
    hideDialogWindow(){
        this.dialogGroup.setVisible(false);
        this.dialogContentText.setVisible(false);

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

        const inputBg=this.add.image(gameWidth/2,gameHeight/2+250,'menu-bg').setDepth(5000);
        //input-bg↑

        /*const dom=this.add.dom(gameWidth/2,gameHeight/2+250).createFromCache('input').setDepth(10000);
        dom.node.classList.remove('hidden');*/
        const dom=this.add.dom(gameWidth/2,gameHeight/2+250).createFromHTML(
            `<input type="text" id="input-field">`
        ).setDepth(10000);
        //dom.classList.remove('hidden');

        const inputField=dom.getChildByID('input-field');//IdではなくID

        const submitBtn=this.add.image(gameWidth/2,gameHeight/2+300,'player')
            .setScale(0.1)//↑submit-btn、playerで代用
            .setInteractive({useHandCursor:true})
            //.setOrigin(0.5)
            .setDepth(10000000);
    
        /*let currentText='';
        const inputTextDisplay=this.add.text(gameWidth/2,gameHeight/2-20,'',{
            fontSize:'32px',
            color:'#000000'
        }).setOrigin(0.5).setDepth(5001);*/
                
        /*const submitText=this.add.text(gameWidth/2,gameHeight/2+60,'決定',{
            fontSize:'20px'
        }).setOrigin(0.5).setDepth(5002);*/

        /*const keyHandler=(event)=>{
            if(event.key==='Enter'){
                confirmInput();
            }else if(event.key==='Backspace'){
                currentText=currentText.slice(0,-1);
            }else if(event.key.length===1){
                currentText+=event.key;
            }
            //inputTextDisplay.setText(currentText+'|');
        };

        this.input.keyboard.on('keydown',keyHandler);*/

        const confirmInput=()=>{
            //if(currentText.trim()==='')return;
            const val=inputField.value.trim();

            if(val!==''){
                this.clearInputFields();
                callback(val);
            }
            //this.input.keyboard.off('keydown',keyHandler);
        };

        dom.addListener('keydown');
        dom.on('keydown',(event)=>{
            if(event.key==='Enter'){
                confirmInput();
            }
        })

        submitBtn.on('pointerdown',confirmInput);

        this.inputFields.push(inputBg,dom,submitBtn);//,submitText除外

        setTimeout(()=>inputField.focus(),100);//自動フォーカス
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
    createGuideBtn(){
        const guideButton=this.add.image(1230,670,'guide')//UISceneに移行する

                .setOrigin(0.5)
                .setScale(0.7)
                .setInteractive({useHandCursor:true})
                .setScrollFactor(0)
                .setDepth(3000);
        
        if(this.dialogManager && !this.dialogManager.isTalking){
            guideButton.on('pointerover',()=>guideButton.setScale(0.8));
            guideButton.on('pointerout',()=>guideButton.setScale(0.7));
        }//会話中は大きくならないようにしたい、なんかできないから。後で修正。
        
        guideButton.on('pointerdown',()=>{

            if(this.dialogManager && !this.dialogManager.isTalking){
                this.menuManager?.toggle('guide');
            }
        });
    }
    toggleDecorationMode(){
        this.isDecorationMode=!this.isDecorationMode;

        this.hotbar?.setVisible(this.isDecorationMode);
        this.selector?.setVisible(this.isDecorationMode);

        this.hotbarIcons.forEach(icon=>icon?.setVisible(this.isDecorationMode));
        this.hotbarTexts.forEach(text=>text?.setVisible(this.isDecorationMode));

        //const worldScene=this.scene.get('World');
        const activeScene=this.scene.manager.getScenes(true).find(s=>s.scene.key!=='UIScene');
        if(activeScene){
            activeScene.setDecorationMode(this.isDecorationMode);
        }
    }
    startFishing(callback){
        const gameWidth=this.scale.width;
        const gameHeight=this.scale.height;

        this.fishingGroup=this.add.container(gameWidth/2,gameHeight/2).setDepth(5000);

        const bar=this.add.image(0,0,'fishing-bar');//釣りのゲームの棒

        const zone=this.add.image(0,Phaser.Math.Between(-80,80),'fishing-target');

        const cursor=this.add.image(0,120,'fishing-cursor').setDepth(5000);

        this.fishingGroup.add([bar,zone,cursor]);

        const tween=this.tweens.add({
            targets:cursor,
            y:-120,
            duration:800,
            yoyo:true,
            loop:-1,
            ease:'Linear'
        });

        const catchHandler=(event)=>{
            if(event.code==='Space'){
                this.input.keyboard.off('keydown',catchHandler);
                tween.stop();

                const diff=Math.abs(cursor.y-zone.y);//絶対値
                const isSuccess=diff<30;//30の差があっても成功

                this.time.delayedCall(500,()=>{
                    this.fishingGroup.destroy();

                    callback(isSuccess);
                });
            }
        };

        this.input.keyboard.on('keydown',catchHandler);
    }
    update(time,delta){
        const world=this.scene.get('World');

        const isStopped=world.dialogManager?.isTalking || this.menuManager.isOpenMenu;
        //会話、メニュー開いてる間は時間を止める
        if(!isStopped){
            this.gameTime.elapsed+=delta;

            if(this.gameTime.elapsed>=7000){//毎秒1000進む、7000で繰り上げ
                this.gameTime.elapsed=0;
                this.advanceTime();
            }
        }

        if(this.heldItem){
            const pointer=this.input.activePointer;

            this.cursorIcon.setPosition(pointer.x,pointer.y);
            this.cursorCountText.setPosition(pointer.x+20,pointer.y+20);
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