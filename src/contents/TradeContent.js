export default class TradeContent{
    constructor(uiScene){
        this.uiScene=uiScene;
    }
    createView(){
        const container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        container.add(bg);

        const title=this.uiScene.add.text(0,-250,'交易',{
            fontSize:'32px',
            color:'#000'
        });
        container.add(title);

        

        const closeBtn=this.uiScene.add.text(480,-280,'×',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        /*const backBtn=this.uiScene.add.text(440,-285,'←',{//なんかデフォルトが低い
            fontSize:'55px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});*/

        closeBtn.on('pointerdown',()=>this.uiScene.menuManager.closeMenu());
        //backBtn.on('pointerdown',()=>this.uiScene.menuManager.toggle('menu'));

        container.add(closeBtn);

        return container;
    }
}