export default class ShopContent{
    constructor(uiScene,menuManager){
        this.uiScene=uiScene;
        this.menuManager=menuManager;

        this.shelfData={id:'shelf_1',item:null};
        this.editingItem=null;

        this.cols=5;
        this.slotSize=85;
        this.slotRectSize=75;

        this.container=null;
        this.inventoryLayer=null;
        this.settingsLayer=null;


    }
    createView(){//shelfData
        /*const emptyData={
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
        
        const shelfData=emptyData;*/

        this.container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.container.add(bg);

        this.inventoryLayer=this.uiScene.add.container(0,0);
        this.settingsLayer=this.uiScene.add.container(0,0);
        this.container.add([this.inventoryLayer,this.settingsLayer]);

        const closeBtn=this.uiScene.add.text(460,-260,'×',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true}).setDepth(5001);

        closeBtn.on('pointerdown',()=>{
            console.log('閉じます');
            //this.menuManager.toggle('shop');
            this.uiScene.menuManager.closeMenu();
        });
        this.container.add(closeBtn);

        this.refresh();

        return this.container;
    }
    refresh(){
        this.renderInventory(-220);
        this.renderSettingsPanel(220);
    }
    renderInventory(centerX){
        this.inventoryLayer.removeAll(true);

        const inventory=this.uiScene.registry.get('inventoryData')||[];
        const maxSlots=this.uiScene.registry.get('maxInventorySlots')||10;;

        const totalRows=Math.ceil(maxSlots/this.cols);
        const startY=-((totalRows-1)*this.slotSize)/2;
        const startX=centerX-((this.cols-1)*this.slotSize)/2;

        for(let i=0;i<maxSlots;i++){
            const col=i%this.cols;
            const row=Math.floor(i/this.cols);
            const x=startX+(col*this.slotSize);
            const y=startY+(row*this.slotSize);

            const isEditing=this.editingItem&& this.editingItem.index===i;
            
            const slotColor=isEditing? 0xffff00: 0x000000;
            const slotAlpha=isEditing? 0.3:0.08;

            const slotBg=this.uiScene.add.rectangle(x,y,this.slotRectSize,this.slotRectSize,slotColor,slotAlpha)
                .setStrokeStyle(isEditing?3:1,isEditing ?0xffaa00: 0x000000,0.2)
                .setInteractive({useHandcursor:true});
            
            this.inventoryLayer.add(slotBg);

            const item=inventory[i];
            if(item&& item.id&& item.count>0){
                const img=this.uiScene.add.image(x,y,item.id).setDisplaySize(55,55);

                const count=this.uiScene.add.text(x+30,y+30,item.count,{
                    fontSize:'14px',
                    color:'#000',
                    stroke:'#fff',
                    strokeThickness:2
                }).setOrigin(1,1);

                this.inventoryLayer.add([img,count]);
            }

            slotBg.on('pointerdown',()=>this.selectItemToEdit(i));
        }
        
    }
    renderSettingsPanel(centerX){
            this.settingsLayer.removeAll(true);

            const panelBg=this.uiScene.add.rectangle(centerX,0,380,500,0xffffff,0.3)
                .setStrokeStyle(2,0x000000);
            this.settingsLayer.add(panelBg);

            const displayItem=this.shelfData.item||this.editingItem;

            if(!displayItem){
                const guideText=this.uiScene.add.text(centerX,0,'商品を選択してください',{
                    fontSize:'18px',
                    color:'#666'
                }).setOrigin(0.5);

                this.settingsLayer.add(guideText);
                return;
            }
            const itemImg=this.uiScene.add.image(centerX,-120,displayItem.id).setDisplaySize(110,110);
            const name=this.uiScene.add.text(centerX,-35,`【${displayItem.id}】`,{
                fontSize:'24px',
                color:'#000'
            }).setOrigin(0.5);

            const qualityY=25;
            const qualityLabel=this.uiScene.add.text(centerX,qualityY,`品質:★${displayItem.quality}`,{
                fontSize:'20px',
                color:'#d35400'
            }).setOrigin(0.5);

            const qualityLess=this.uiScene.add.text(centerX-70,qualityY,'◀',{
                fontSize:'20px',
                color:'#000'
            }).setInteractive({useHandCursor:true});

            const qualityMore=this.uiScene.add.text(centerX-70,qualityY,'▶',{
                fontSize:'20px',
                color:'#000'
            }).setInteractive({useHandCursor:true});

            qualityLess.on('pointerdown',()=>{
                if(displayItem.quality>1){
                    displayItem.quality--;

                    this.refresh();
                }
            });

            qualityMore.on('pointerdown',()=>{
                if(displayItem.quality<5){
                    displayItem.quality++;

                    this.refresh();
                }
            });

            const priceY=85;
            const priceLabel=this.uiScene.add.text(centerX,priceY,`${displayItem.price}G`,{
                fontSize:'26px',
                color:'#b33939',
                fontWeight:'bold'
            }).setOrigin(0.5);

            const priceLess=this.uiScene.add.text(centerX-90,priceY,"[-]",{
                fontSize:'20px', 
                color: '#000' 
            }).setInteractive({useHandCursor:true});

            const priceMore=this.uiScene.add.text(centerX+90,priceY,"[+]",{
                fontSize:'20px',
                color:'#000'
            }).setInteractive({useHandCursor:true});

            priceLess.on('pointerdown',()=>{
                displayItem.price=Math.max(0,displayItem.price-10);

                this.refresh();
            });

            priceMore.on('pointerdown',()=>{
                displayItem.price+=10;

                this.refresh();
            });

            const btnY=190;
            const isSet=!!this.shelfData.item;

            const btnColor=isSet? 0xcc8e35: 0x2ecc71;
            const btnLabel=isSet? '陳列を戻す':'陳列を確定';

            const actionBtn=this.uiScene.add.rectangle(centerX,btnY,200,45,btnColor)
                .setInteractive({ useHandCursor:true});
            const actionText=this.uiScene.add.text(centerX,btnY,btnLabel,{
                fontSize:'18px',
                color:'#fff'
            }).setOrigin(0.5);

            actionBtn.on('pointerdown',()=>{
                isSet? this.cancelShelf(): this.confirmPlace();
            });

            this.settingsLayer.add([itemImg,name,qualityLabel,qualityLess,qualityMore,
                priceLabel,priceLess,priceMore,actionBtn,actionText
            ]);

        }
        selectItemToEdit(index){
            const inventory=this.uiScene.registry.get('inventoryData');
            const item=inventory[index];

            if(!item|| !item.id|| item.count<=0)return;

            this.shelfData.item=null;

            this.editingItem={
                index,
                id:item.id,
                quality:item.quality,
                price:100
            };

            this.refresh();
        }
        confirmPlace(){
            if(!this.editingItem)return;

            const inventory=this.uiScene.registry.get('inventoryData');
            const inventoryItem=inventory[this.editingItem.index];

            inventoryItem.count--;

            if(inventoryItem.count<=0){
                inventory[this.editingItem.index]={id:null,count:0};
            }

            this.shelfData.item={...this.editingItem};
            this.editingItem=null;

            this.uiScene.registry.set('inventoryData',inventory);

            this.refresh();
        }
        cancelShelf(){
            const inventory=this.uiScene.registry.get('inventoryData');
            const returnItem=this.shelfData.item;

            let slot=inventory.find(i=>i.id===returnItem.id&& i.quality===returnItem.quality);
            if(slot){
                slot.count++;
            }else{
                let emptyIndex=inventory.findIndex(i=>!i.id||i.count===0);

                if(emptyIndex!==-1)inventory[emptyIndex]={id:returnItem.id,count:1};
            }

            this.shelfData.item=null;

            this.uiScene.registry.set('inventoryData',inventory);
            this.refresh();
        }
}