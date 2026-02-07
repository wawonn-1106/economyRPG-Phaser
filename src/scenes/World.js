import Player from '../entities/Player.js';
//import DialogManager from '../managers/DialogManager.js';
import NPC from '../entities/NPC.js';
//import House from './House.js';
import MenuManager from '../managers/MenuManager.js';
import InventoryManager from '../managers/InventoryManager.js';
import ProfileManager from '../managers/ProfileManager.js';
import DictionaryManager from '../managers/DictionaryManager.js';
import ProfileContent from '../contents/ProfileContent.js';
//import MachineManager from '../managers/MachineManager.js';
import BaseScene from './BaseScene.js';
//↑共通化してインスタンスを作る必要はなくなったけど、importはいる

export default class World extends BaseScene{
    constructor(){
        super({key:'World'});

        this.player=null;
        //this.cursors=null;
        //this.readyTalking=false;
        //this.isWraping=false;
        //this.money=0;
        //this.moneyText=null;
        this.villagers=null;
        //this.nearstNPC=null;
        this.inventoryData=[];
        //this.keys=null;
        this.currentWeather='Clear';
        this.weatherEffect=null;
        /*this.interactables=[];
        //this.nearstTarget=null;
        this.readyIcon=null;
        this.readyActionType=null;
        this.actionTarget=null;*/
        //this.fromDoor=null;
        //this.isWraping=false;

        //this.SERVER_URL='http://localhost:3000';

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
        //preloadSceneに引っ越し
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
    /*async fetchWeather(){//Rain,Snowを取得。
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
    }*/
    /*createRain(){
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
    }*/
    create(data){
        this.initManagers();
        this.initInput();

        this.interactables=[];
        /*this.dictionaryManager=new DictionaryManager(this);
        this.profileManager=new ProfileManager(this); 
        this.dialogManager=new DialogManager(this);
        this.machineManager=new MachineManager(this);/*jsonの準備ができてなかった。
        UIScene経由で、MachineManageにデータ渡してるけど、dialogDataと同じように
        json系のデータはWirldで全部橋渡ししたほうがスマートかもしれない*/

        //this.loadPlayerData();
        //await this.fetchWeather();
        /*async create(){}  await this.fetchWeather();を追加する*/
    //-------------------------------------------------------マップ---------------------------------------------------------------------------------
    
        const map=this.createMap('map','Serene_Village_48x48','tileset');
    
        this.scene.launch('UIScene');
    //----------------------------------------------------------天気------------------------------------------------------------------------------
        /*if(this.currentWeather==='Rain'){
            this.createRain();
        }else if(this.currentWeather==='Snow'){
            this.createSnow();
        }else if(this.currentWeather==='Clouds'){
            this.createClouds();
        }//どちらでもないなら晴れ*/

    //----------------------------------------------------------操作説明ボタン------------------------------------------------------------------------------
        this.uiScene = this.scene.get('UIScene');
        this.uiScene.createGuideBtn();

    //----------------------------------------------------------キー------------------------------------------------------------------------------
        //this.cursors=this.input.keyboard.createCursorKeys();
    //----------------------------------------------------------プレイヤー------------------------------------------------------------------------------
        this.player=new Player(this,500,500,'player');

        this.setPlayerSpawnPoint(data)

        this.setupSceneTransitions(map, this.player);


        //this.player.name='尾道太郎';
        const testData=this.cache.json.get('playerData');
        //最初の書き換えをjsonでやって、↑そのデータを受け取って個体値の決定。
        this.profileManager.initTutorialProfile(testData.name);

    
    //----------------------------------------------------------アニメーション------------------------------------------------------------------------------
        /*this.anims.create({
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
        });*/
        //これもBaseSceneでやる
    //--------------------------------------------------------NPC-------------------------------------------------------------
        //this.elder=new NPC(this,800,300,'player');
        this.villagers=this.physics.add.group();

        const villagerData=[
            {x:800,y:800,key:'player',startId:'greet',name:'マイク'},
            {x:1000,y:1000,key:'player',startId:'start',name:'ジェシカ'},
            {x:1200,y:1200,key:'player',startId:'daily',name:'サンドラ'},
        ];//これをjsonにしよう今日

        villagerData.forEach(data=>{
            //第五引数のdataはNPC.jsでconfigとして受け取る。必要に応じてconfig.startIdで取得できる。第六まで増やす必要もない。
            const newVillager=new NPC(this,data.x,data.y,data.key,data);//this忘れ、どこに書けばいいかわからなかったことによるエラー。
            this.villagers.add(newVillager);

            this.interactables.push({type:'npc',instance:newVillager});
        });
    //----------------------------------------------------------当たり判定----------------------------------------------------------------------
        this.setupCollisions(this.player);
        this.setupCollisions(this.villagers);

        this.physics.add.collider(this.player,this.villagers);
        this.physics.add.collider(this.villagers,this.villagers);

        
    //----------------------------------------------------------アクション系-----------------------------------------------------------------------
        
    //-------------------------------------------------------------インベントリ--------------------------------------------------------------------------
        this.inventoryManager=new InventoryManager(this);

        this.inventoryData=[
            //最終的にはjsonで管理するが、とりあえずインベントリを表示させるためここで
            {id:'apple',name:'りんご',realQuality:1,count:5},
            {id:'seed',name:'種',realQuality:1,count:13},
            {id:'axe',name:'斧',realQuality:1,count:1},
            {id:'pickaxe',name:'ツルハシ',realQuality:2,count:1},
            {id:'fishing-rod',name:'釣り竿',realQuality:3,count:1},
            {id:'pumpkin',name:'かぼちゃ',realQuality:2,count:1},
            {id:'egg',name:'卵',realQuality:2,count:5},
            {id:'banana',name:'バナナ',realQuality:3,count:5},
            {id:'pumpkin',name:'かぼちゃ',realQuality:2,count:1}
        ];//wheatとか全てのidの画像を用意する→
    //-------------------------------------------------------------カメラ--------------------------------------------------------------------------
       
        this.setupCamera(this.player);
    }
    update(time,delta){
        this.updateInteractables(this.player);

        this.player.update();
        this.villagers.getChildren().forEach(v=>v.update(time,delta));

    }    
}