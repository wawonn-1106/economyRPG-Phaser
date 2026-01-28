import Player from '../entities/Player.js';
import DialogManager from '../managers/DialogManager.js';
import NPC from '../entities/NPC.js';
//import House from './House.js';
//import InventoryManager from '../managers/InventoryManager.js';
import MenuManager from '../managers/MenuManager.js';
import InventoryManager from '../managers/InventoryManager.js';
import ProfileManager from '../managers/ProfileManager.js';
import DictionaryManager from '../managers/DictionaryManager.js';
import ProfileContent from '../contents/ProfileContent.js';

export default class World extends Phaser.Scene{
    constructor(){
        super({key:'World'});

        this.player=null;
        this.cursors=null;
        this.readyTalking=false;
        this.isWraping=false;
        this.money=0;
        this.moneyText=null;
        this.villagers=null;
        this.nearstNPC=null;
        this.inventoryData=[];
        this.keys=null;
        this.currentWeather='Clear';
        this.weatherEffect=null;

        this.SERVER_URL='http://localhost:3000';

        
        this.dictionaryManager=new DictionaryManager(this);
        this.profileManager=new ProfileManager(this); 
        this.dialogManager=new DialogManager(this);
        //this.profileContent=new ProfileContent(this,400,300);
    }
    /*async syncMoneyWithServer(newMoney){
        try{
            const response=await fetch(`${this.SERVER_URL}/save`,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({money:newMoney})
            });
            const result=await response.json();
            console.log('DB保存完了、今の所持金：',newMoney);
        }catch(error){
            console.error('通信エラー：',error);
        }
    }*/
    preload(){
        this.load.image('player','assets/images/player.png');
        //this.load.image('tileset-test1','assets/tilesets/Beginning Fields.png')
        //this.load.tilemapTiledJSON('map','assets/tilemaps/tilemap-test1.tmj');
        this.load.tilemapTiledJSON('map','assets/tilemaps/tilemap-test.tmj');
        this.load.image('rain','assets/images/player.png');
        this.load.image('snow','assets/images/player.png');

        this.load.json('chapter1','assets/data/dialog1.json');
        this.load.json('termsData','assets/data/dictionary.json');

        this.load.image('tileset','assets/tilesets/pipo-map001.png');

        this.load.image('review','assets/images/review.png');
        this.load.image('settings','assets/images/settings.png');
        this.load.image('ranking','assets/images/ranking.png');
        this.load.image('profile','assets/images/profile.png');
        this.load.image('returnTitle','assets/images/returnTitle.png');
        this.load.image('inventory','assets/images/inventory.png');
        this.load.image('dictionary','assets/images/dictionary.png');
        this.load.image('guide','assets/images/guide.png');
        this.load.spritesheet('player-walk-down','assets/images/Walk Down.png',
            {frameWidth:13,frameHeight:17,margin:4,spacing:30}
        );
        this.load.spritesheet('player-walk-up','assets/images/Walk Up.png',
            {frameWidth:13,frameHeight:17,margin:4,spacing:30}
        );
        this.load.spritesheet('player-walk-right','assets/images/Walk Right.png',
            {frameWidth:13,frameHeight:17,margin:4,spacing:30}
        );
        this.load.spritesheet('player-walk-left','assets/images/Walk Left.png',
            {frameWidth:13,frameHeight:17,margin:4,spacing:30}
        );
    }
    /*async loadPlayerData() {
        try {
            const response = await fetch(`${this.SERVER_URL}/load`);
            const data = await response.json();
            
            this.money = data.money || 0;
            
            if (this.moneyText) {
                this.moneyText.setText(`所持金：${this.money}`);
            }
            console.log('クラウドから復旧完了！:', this.money);
        } catch (error) {
            console.log('読み込み失敗、0円から開始します', error);
        }
    }*/
    async fetchWeather(){//Rain,Snowを取得。
        const API_KEY=process.env.WEATHER_API_KEY;
        const lat=34.40;
        const lon=133.20;
        const URL=`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;

        try{
            const response=await fetch(URL);
            if(!response.ok) throw new Error('天気データの取得に失敗しました');

            const data=await response.json();

            this.currentWeather=data.weather[0].main;
            console.log('現在の尾道の天気：',this.currentWeather);

        }catch(error){
            console.error('天気データの取得に失敗しました：',error);
            this.currentWeather='Clear';//失敗したら晴れ
        }//明日ぐらいにやる
    }
    createRain(){
        this.weatherEffect=this.add.particles(0,0,'rain',{//画像のダウンロード必要、snowも
            x:{min:0,max:1280},
            y:-10,
            lifespan:2000,
            speedY:{min:400,max:600},
            quality:5,
            scrollFactor:0
        });
    }
    createSnow(){
        this.weatherEffect=this.add.particles(0,0,'snow',{
            x:{min:0,max:1280},
            y:-10,
            lifespan:8000,
            speedX:{min:50,max:100},
            speedY:{min:-20,max:20},
            quality:2,
            scrollFactor:0
        });
    }
    createClouds(){
        const overlay=this.add.rectangle(0,0,1280,720,0x333344,0.4);//画面全体を曇らせる

        overlay.setOrigin(0,0);
        overlay.setScrollFactor(0);
        overlay.setDepth(2000);
    }
    create(){
        //this.loadPlayerData();
        //await this.fetchWeather();
        /*async create(){}  await this.fetchWeather();を追加する*/
    //-------------------------------------------------------マップ---------------------------------------------------------------------------------
    
    
    
        const map = this.make.tilemap({ key: 'map' });
    
        const tileset = map.addTilesetImage('pipo-map001','tileset');
        
        this.backgroundLayer = map.createLayer('ground', tileset, 0, 0);

        this.worldLayer = map.createLayer('object', tileset, 0, 0);
        this.worldLayer.setCollisionByProperty({ collides: true });
        this.physics.world.setBounds(0,0,1600,1600);

        this.moneyText=this.add.text(100,100,`所持金：${this.money}`,{
            fontSize:'36px',fill:'black'
        }).setOrigin(0,0).setScrollFactor(0);
    //----------------------------------------------------------天気------------------------------------------------------------------------------
        if(this.currentWeather==='Rain'){
            this.createRain();
        }else if(this.currentWeather==='Snow'){
            this.createSnow();
        }else if(this.currentWeather==='Clouds'){
            this.createClouds();
        }//どちらでもないなら晴れ

    //----------------------------------------------------------操作説明ボタン------------------------------------------------------------------------------

        const guideButton=this.add.image(1230,670,'guide')
                .setOrigin(0.5)
                .setScale(0.7)
                .setInteractive({unHandCursor:true})
                .setScrollFactor(0)
                .setDepth(3000);
        
        guideButton.on('pointerover',()=>guideButton.setScale(0.8));
        guideButton.on('pointerout',()=>guideButton.setScale(0.7));

        guideButton.on('pointerdown',()=>{
            this.menuManager.toggle('guide');
        });

    //----------------------------------------------------------キー------------------------------------------------------------------------------
        this.cursors=this.input.keyboard.createCursorKeys();
        this.keys=this.input.keyboard.addKeys('M,I,P,A,R,S,D');
    //----------------------------------------------------------プレイヤー------------------------------------------------------------------------------
        this.player=new Player(this,100,300,'player-walk-down',0);

        this.menuManager=new MenuManager(this);//Worldのscene持ってればこれにもアクセスできる

        this.player.name='テスト';
        this.profileManager.initTutorialProfile(this.player.name);

        //this.profileContent.drawRadarChart();
        

        //this.testProfile = new ProfileContent(this, 400, 300);
    
    //----------------------------------------------------------アニメーション------------------------------------------------------------------------------
        this.anims.create({
            key:'walking-down',
            frames:this.anims.generateFrameNumbers('player-walk-down',{start:0,end:12}),
            frameRate:12,
            repeat:-1
        });
        this.anims.create({
            key:'walking-up',
            frames:this.anims.generateFrameNumbers('player-walk-up',{start:0,end:11}),
            frameRate:12,
            repeat:-1
        });
        this.anims.create({
            key:'walking-right',
            frames:this.anims.generateFrameNumbers('player-walk-right',{start:0,end:11}),
            frameRate:12,
            repeat:-1
        });
        this.anims.create({
            key:'walking-left',
            frames:this.anims.generateFrameNumbers('player-walk-left',{start:0,end:11}),
            frameRate:12,
            repeat:-1
        });
        this.anims.create({
            key:'idle',
            frames:[{key:'player-walk-down',frame:0}],
            frameRate:20,
            //repeat:0の省略(-1は無限、0は１回)
        });

    //--------------------------------------------------------NPC-------------------------------------------------------------
        //this.elder=new NPC(this,800,300,'player');
        this.villagers=this.physics.add.group();

        const villagerData=[
            {x:800,y:300,key:'player',startId:'greet',name:'マイク'},
            {x:200,y:400,key:'player',startId:'start',name:'ジェシカ'},
            {x:100,y:600,key:'player',startId:'daily',name:'サンドラ'},
        ];

        villagerData.forEach(data=>{
            //第五引数のdataはNPC.jsでconfigとして受け取る。必要に応じてconfig.startIdで取得できる。第六まで増やす必要もない。
            const newVillager=new NPC(this,data.x,data.y,data.key,data);//this忘れ、どこに書けばいいかわからなかったことによるエラー。
            this.villagers.add(newVillager);
        });
    //----------------------------------------------------------当たり判定-----------------------------------------------------------------------
        this.physics.add.collider(this.player,this.worldLayer);
        this.physics.add.collider(this.villagers,this.worldLayer);
        this.physics.add.collider(this.player,this.villagers);
    //-------------------------------------------------------------ログ--------------------------------------------------------------------------  

        this.readyTalking=false;

        this.input.keyboard.on('keydown-SPACE',()=>{
            if(!this.dialogManager.isTalking && this.readyTalking){
                
                this.money+=100;
                if(this.moneyText) this.moneyText.setText(`所持金：${this.money}`);
                this.syncMoneyWithServer(this.money);


                this.dialogManager.start('chapter1',this.nearstNPC.startId,this.nearstNPC.npcName);//npcNameoyaga???
                //この第一引数のchapter1(独占市場)は変える予定あり、chapter2(寡占市場),chapter3(完全競争市場)
                this.nearstNPC.showIcon(true);
            }else if(this.dialogManager.isTalking){
                const currentLine=this.dialogManager.currentSequence[this.dialogManager.currentIndex];

                if(currentLine && currentLine.next){
                    this.dialogManager.jumpTo(currentLine.next);
                }else{
                    this.dialogManager.end();
                }
            }
        });
    //-------------------------------------------------------------インベントリ--------------------------------------------------------------------------
        this.inventoryManager=new InventoryManager(this);

        this.inventoryData=[
            //最終的にはjsonで管理するが、とりあえずインベントリを表示させるためここで
            {id:'wheat',name:'小麦',realQuality:1,count:5},
            {id:'stone',name:'石',realQuality:1,count:3},
            {id:'apple',name:'りんご',realQuality:1,count:12},
            {id:'egg',name:'卵',realQuality:2,count:5},
            {id:'banana',name:'バナナ',realQuality:3,count:5},
            {id:'pumpkin',name:'かぼちゃ',realQuality:2,count:1},
        ];

        /*this.input.keyboard.on('keydown-I',()=>{
            //会話とは違ってIで開け閉め
            if(this.dialogManager.isTalking) return;

            if(!this.inventoryManager.isOpenInv){
                this.inventoryManager.openInventory(this.inventoryData);
            }else{
                this.inventoryManager.closeInventory();
            }
        });*/






    //-------------------------------------------------------------カメラ--------------------------------------------------------------------------
       
        this.cameras.main.startFollow(this.player,true,0.1,0.1);
        this.cameras.main.setBounds(0,0,1600,1600);
    }
    update(time,delta){
        this.player.update();

        //this.menuManager.update();
        
        let minDistance=100;
        let closestNPC=null;

        this.villagers.getChildren().forEach(v=>{
            v.update(time,delta);
            v.showIcon(false);

            const dist=Phaser.Math.Distance.Between(this.player.x,this.player.y,v.x,v.y);
            if(dist<minDistance){
                minDistance=dist;
                closestNPC=v;
            }
        });
        /*const tile = this.worldLayer.getTileAtWorldXY(this.player.x, this.player.y);
        if(tile){
            console.log('player tile index:', tile.index);
        }
        if(tile && tile.index === 99){
            this.cameras.main.fadeOut(500, 0, 0, 0);

            this.cameras.main.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
                this.scene.start('House');
            });
        }*/

        if(closestNPC && !this.dialogManager.isTalking){
            this.readyTalking=true;
            this.nearstNPC=closestNPC;
            this.nearstNPC.showIcon(true);
        }else{
            this.readyTalking=false;
            this.nearstNPC=null;
        }
        //メニューを開くキーのショートカット
        //this.menuManager=new MenuManager();←重くなる原因constructorでやろう
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