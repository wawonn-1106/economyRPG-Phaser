export default class Title extends Phaser.Scene{
    constructor(){
        super({key:'Title'});
        this.SERVER_URL='http://localhost:3000';
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
                const response=await fetch(`${this.SERVER_URL}/load`);
                const data=await response.json();

                this.registry.set('money',data.money||0);
                this.registry.set('inventoryData',data.inventory||[]);
                this.registry.set('placedItems',data.placedItems||[]);
                this.registry.set('playerPosition',data.playerPosition||null);
                this.registry.set('npcPositions',data.npcPositions||[]);
                this.registry.set('salesHistory',data.salesHistory||[]);

                const playerPos=data.playerPosition;

                if(playerPos&& playerPos.scene){
                    this.cameras.main.fadeOut(1000,0,0,0);

                    this.cameras.main.once('camerafadeoutcomplete',()=>{
                        this.scene.start(playerPos.scene);//座標はBaseSceneで
                    });
                }else{
                    console.error('セーブデータが不完全です',error);
                }
            }catch(error){
                console.error('ロード失敗',error);
            }
        });

        const startBtn=this.add.image(640,550,'start-btn').setInteractive({useHandCursor:true});

        startBtn.on('pointerdown',()=>{
            startBtn.disableInteractive();
            //continueBtn.disableInteractive();

            this.resetGameRegistry();

            this.cameras.main.fadeOut(1000,0,0,0);

            this.cameras.main.once('camerafadeoutcomplete',()=>{

                this.scene.start('World');
            });
        });
    }
    resetGameRegistry(){
        const defaultPlayerData=this.cache.json.get('playerData');
        const defaultNPCData=this.cache.json.get('NPCData');

        this.registry.set('money',0);
        this.registry.set('inventoryData',defaultPlayerData?.item||[]);
        this.registry.set('placedItems',[]);
        this.registry.set('playerPosition',defaultPlayerData.playerPosition);
        this.registry.set('npcPositions',defaultNPCData.initialNPCs||[]);
        this.registry.set('salesHistory',[]);


    }
}