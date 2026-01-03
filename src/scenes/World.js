import Player from './Player.js';
import DialogManager from './DialogManager.js';
import NPC from './NPC.js';
import House from './House.js';

export default class World extends Phaser.Scene{
    constructor(){
        super({key:'World'});

        this.player=null;
        this.elder=null;
        this.cursors=null;
        this.readyTalking=false;
        this.isWraping=false;
        this.money=0;
        this.moneyText=null;
        this.SERVER_URL='http://localhost:3000';
    }
    async syncMoneyWithServer(newMoney){
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
    }
    preload(){
        this.load.image('player','assets/images/player.png');
        this.load.tilemapTiledJSON('map','assets/tilemaps/tilemap-test.tmj');
        this.load.json('chapter1','assets/data/dialog1.json');
        this.load.image('tileset','assets/tilesets/pipo-map001.png');
    }
    async loadPlayerData() {
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
    }
    create(){
        this.loadPlayerData();
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

    //----------------------------------------------------------キー------------------------------------------------------------------------------
        this.cursors=this.input.keyboard.createCursorKeys();
    //----------------------------------------------------------プレイヤー------------------------------------------------------------------------------
        this.player=new Player(this,100,300,'player');
    //--------------------------------------------------------NPC-------------------------------------------------------------
        //this.elder=new NPC(this,800,300,'player');
        this.villagers=this.physics.add.group({
            defaultKey:'villager',
            setGravityY:0,
            collideWorldBounds:true
        });

        const villagerData=[
            {x:800,y:300,key:'player'},
            {x:200,y:400,key:'player'},
            {x:100,y:600,key:'player'},
        ];

        villagerData.forEach(data=>{
            const newVillager=new NPC(data.x,data.y,data.key);
        });
    //----------------------------------------------------------当たり判定-----------------------------------------------------------------------
        this.physics.add.collider(this.player,this.worldLayer);
        this.physics.add.collider(this.elder,this.worldLayer);
        this.physics.add.collider(this.player,this.elder);
    //-------------------------------------------------------------ログ--------------------------------------------------------------------------
        this.dialogManager=new DialogManager();

        const ch1Data=this.cache.json.get('chapter1');

        this.readyTalking=false;

        this.input.keyboard.on('keydown-SPACE',()=>{
            if(!this.dialogManager.isTalking && this.readyTalking){
                this.money+=100;
                if(this.moneyText) this.moneyText.setText(`所持金：${this.money}`);
                this.syncMoneyWithServer(this.money);
                this.dialogManager.start(ch1Data,'start');
                this.elder.showIcon(true);
            }else if(this.dialogManager.isTalking){
                const currentLine=this.dialogManager.currentSequence[this.dialogManager.currentIndex];

                if(currentLine && currentLine.next){
                    this.dialogManager.jumpTo(currentLine.next);
                }else{
                    this.dialogManager.end();
                }
            }
        });
        
        this.cameras.main.startFollow(this.player,true,0.1,0.1);
        this.cameras.main.setBounds(0,0,1600,1600);
    }
    update(time,delta){
        this.player.update();
        this.elder.update(time, delta);
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


        const distance=Phaser.Math.Distance.Between(
            this.player.x,this.player.y,
            this.elder.x,this.elder.y
        );
        if(distance<100 && !this.dialogManager.isTalking){
            this.readyTalking=true;
            this.elder.showIcon(true);
        }else{
            this.readyTalking=false;
            this.elder.showIcon(false);
        }
    }
}