import MenuManager from "../managers/MenuManager.js";

export default class UIScene extends Phaser.Scene{
    constructor(){
        super({key:'UIScene'});
        this.portrait=null;
        this.dialogNameText=null;
        this.dialogContentText=null;
        this.dialogGroup=null;
        this.dialogChoices=[];
    }
    create(){
        const worldScene=this.scene.get('World');

        this.menuManager=new MenuManager(this,worldScene);
        worldScene.menuManager=this.menuManager;

        if(worldScene){
            worldScene.dialogManager.setUIScene(this);
        }

        this.keys=this.input.keyboard.addKeys('M,I,P,A,R,S,D');

        this.createDialogUI();
    }
    createDialogUI(){
        const gameWidth=this.scale.width;
        const gameHeight=this.scale.height;

        this.dialogGroup=this.add.container(0,0).setDepth(4000).setVisible(false);

        const winBg=this.add.image(gameWidth/2,gameHeight-140,'dialog-bg');

        this.portrait=this.add.image(gameWidth/2-280,gameHeight-150,'portrait-container').setOrigin(0.5,1);

        this.dialogNameText=this.add.text(gameWidth/2-120,gameHeight-200,'',{
            fontSize:'22px',
            color:'#ffff00',
            fontStyle:'bold',
            fontFamily:'sans-serif'
        });

        this.dialogContentText=this.add.text(gameWidth/2-120,gameHeight-165,'',{
            fontSize:'24px',
            color:'#ffffff',
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
    showInputField(){
        //また今度にしよ
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