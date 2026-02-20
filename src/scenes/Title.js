import API from '../utils/API.js'; 

export default class Title extends Phaser.Scene{
    constructor(){
        super({key:'Title'});
        this.SERVER_URL='http://127.0.0.1:3000';
    }
    create(){
        if (this.scene.isActive('UIScene')) {
            this.scene.stop('UIScene');
        }/*Sceneでlaunch('UIScene')で起動したものをstop('UIScene')
        しないと、前起動したものが残り、タイトルに戻ってまたスタートする時に、UISceneが起動してあるのに
        起動してしまってエラーになる*/

        this.add.image(640,360,'title');

        const continueBtn=this.add.image(640,300,'continue-btn').setInteractive({useHandCursor:true});

        const savedPos=this.registry.get('playerPosition');
        const hasSaveData=savedPos!==null;

        if(!hasSaveData){
            continueBtn.setAlpha(0.5);
            continueBtn.disableInteractive();
        }

        continueBtn.on('pointerdown',async()=>{
            startBtn.disableInteractive();
            continueBtn.disableInteractive();

            try{
                //const response=await fetch(`${this.SERVER_URL}/load`);
                const data=await API.loadGameData();

                this.registry.set('money',data.money||0);
                this.registry.set('unlockedIds',data.unlockedIds||[]);
                this.registry.set('unlockedRecipes',data.unlockedRecipes||[]);
                this.registry.set('inventoryData',data.inventory||[]);
                this.registry.set('maxInventorySlots',data.maxInventorySlots||10);
                this.registry.set('shelvesData',data.shelves||[]);
                this.registry.set('placedItems',data.placedItems||[]);
                this.registry.set('playerPosition',data.playerPosition||null);
                this.registry.set('npcPositions',data.npcPositions||[]);
                this.registry.set('salesHistory',data.salesHistory||[]);
                this.registry.set('gameTime',data.gameTime||null);
                this.registry.set('maxCustomers',data.maxCustomers||6);

                await this.fetchWeather();

                const playerPos=data.playerPosition;

                if(playerPos&& playerPos.scene){
                    this.cameras.main.fadeOut(1000,0,0,0);

                    this.cameras.main.once('camerafadeoutcomplete',()=>{
                        this.scene.start(playerPos.scene);//座標はBaseSceneで
                    });
                }else{
                    console.error('セーブデータが不完全です');
                }
            }catch(error){
                console.error('ロード失敗',error);
            }
        });

        const startBtn=this.add.image(640,550,'start-btn').setInteractive({useHandCursor:true});

        startBtn.on('pointerdown',async()=>{
            startBtn.disableInteractive();
            //continueBtn.disableInteractive();

            await this.resetGameRegistry();

            this.cameras.main.fadeOut(1000,0,0,0);

            this.cameras.main.once('camerafadeoutcomplete',()=>{

                this.scene.start('World');
            });
        });
    }
    async resetGameRegistry(){
        const defaultPlayerData=this.cache.json.get('playerData');
        const defaultNPCData=this.cache.json.get('NPCData');
        const defaultInventoryData=this.cache.json.get('inventoryData');

        //console.log("JSONロード結果:", defaultInventoryData);

        this.registry.set('money',0);
        this.registry.set('unlockedIds',[]);
        this.registry.set('inventoryData',defaultInventoryData?.items||[]);
        this.registry.set('maxInventorySlots',10);
        this.registry.set('shelvesData',[]);
        this.registry.set('placedItems',[]);
        this.registry.set('playerPosition',defaultPlayerData.playerPosition);
        this.registry.set('npcPositions',defaultNPCData.initialNPCs||[]);
        this.registry.set('salesHistory',[]);
        this.registry.set('gameTime',null);
        this.registry.set('maxCustomers',6);


        await this.fetchWeather();


    }
    async fetchWeather(){//Rain,Snowを取得。
        try{
            //const response=await fetch(`${this.SERVER_URL}/weather`);
            const data=await API.fetchWeather();
            this.registry.set('weather',data.main);
    
            //this.currentWeather=data.main;
            console.log('現在の尾道の天気：',data.main);
    
        }catch(error){
            console.error('天気データの取得に失敗しました：',error);
            this.registry.set('weather','Clear');//失敗したら晴れ
        }
    }
}