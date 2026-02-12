export default class SaveContent{
    constructor(uiScene){
        this.uiScene=uiScene;
    }
    createView(){
        const container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        container.add(bg);

        const message=this.uiScene.add.text(0,-50,'今日の出来事を日記に書きますか？',{
            fontSize:'28px',
            color:'#000',
            fontFamily:'serif'
        }).setOrigin(0.5).setDepth(4000);

        this.saveBtn=this.uiScene.add.image(0,100,'save-btn').setInteractive({useHandCursor:true});

        container.add([message,this.saveBtn]);

        this.saveBtn.on('pointerdown',async()=>{
            //ワンクッション、はいorいいえを選ばせて、Mongoに送る
            this.saveBtn.disableInteractive();
            message.setText('記録中...');

            const activeScene=this.uiScene.scene.manager.getScenes(true).find(s=>s.scene.key!=='UIScene');

            if(activeScene&& activeScene.saveGameData){
                try{
                    await activeScene.saveGameData();
                }catch(error){
                    console.error('セーブ失敗',error);
                }
            }
        });

        return container;
    }
}