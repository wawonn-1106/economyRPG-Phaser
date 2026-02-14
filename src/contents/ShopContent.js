export default class ShopContent{
    constructor(uiScene,menuManager){
        this.uiScene=uiScene;
        this.menuManager=menuManager;
    }
    createView(){//shelfData
        const emptyData={
            id:'shelf_1',
            item:null
        };
        
        const occupiedData={
            id:'shelf_2',
            item:{
                id:'break',
                price:150,
                quality:3,
            }
        };
        const shelfData=emptyData;

        const container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        container.add(bg);

        if(!shelfData.item){
            const title=this.uiScene.add.text(0,-150,'何を並べますか',{
                fontSize:'24px',
                color:'#000'
            }).setOrigin(0.5);
            container.add(title);
            //値段、品質入力↓


        }else{
            const title=this.uiScene.add.text(0,-150,'販売中の商品',{
                fontSize:'24px',
                color:'#000'
            }).setOrigin(0.5);

            const info=this.uiScene.add.text(0,0,
                `商品：${shelfData.item.id}\n価格：${shelfData.item.price}G\n品質：★${shelfData.item.quality}`,
                {fontsize:'20px',color:'#000'}
            ).setOrigin(0.5);

            container.add([title,info]);
        }

        const closeBtn=this.uiScene.add.text(280,-180,'×',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true}).setDepth(5001);

        closeBtn.on('pointerdown',()=>{
            console.log('閉じます');
            //this.menuManager.toggle('shop');
            this.uiScene.menuManager.closeMenu();
        });
        container.add(closeBtn);

        //container.setScrollFactor(0);

        return container;
    }
}