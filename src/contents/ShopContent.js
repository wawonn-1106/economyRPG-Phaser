export default class ShopContent{
    constructor(uiScene,menuManager,shelfId){
        this.uiScene=uiScene;
        this.menuManager=menuManager;
        this.id=shelfId;

        this.shelfData={id:shelfId,item:null};
        this.editingItem=null;
        this.selectedId=null;
        this.targetShelf=null;

        this.cols=5;
        this.slotSize=85;
        this.slotRectSize=75;

        this.container=null;
        this.inventoryLayer=null;
        this.settingsLayer=null;


    }
    createView(targetShelf){//shelfData
        console.log("受け取った棚インスタンス:",targetShelf);
        this.targetShelf=targetShelf;
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
        console.log("refresh");
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
            const item=inventory[i];

            const x=startX+(i%this.cols*this.slotSize);
            const y=startY+(Math.floor(i/this.cols)*this.slotSize);
            
            const currentId=this.editingItem? this.editingItem.id:this.targetShelf;
            const isSelected=item&& item.id&& currentId===item.id;

            const slotBg=this.uiScene.add.rectangle(x,y,this.slotRectSize,this.slotRectSize,
                isSelected? 0xffff00: 0x000000,isSelected? 0.3:0.08)
                .setStrokeStyle(isSelected?3:1,0x000000,0.2)
                .setInteractive({useHandCursor:true});
            
            this.inventoryLayer.add(slotBg);

            
            if(item&& item.id&& item.count>0){
                const img=this.uiScene.add.image(x,y,item.id).setDisplaySize(55,55);

                const count=this.uiScene.add.text(x+30,y+30,item.count,{
                    fontSize:'14px',
                    color:'#000',
                    stroke:'#fff',
                    strokeThickness:2
                }).setOrigin(1,1);

                slotBg.on('pointerdown',()=>{
                    this.handleInventoryClick(item.id);
                });

                this.inventoryLayer.add([img,count]);
            }

            
        }
        
    }
    handleInventoryClick(newId){
        const currentShelfItem=this.targetShelf&& this.targetShelf.shelfData? this.targetShelf.shelfData.item: null; 

        const currentId=currentShelfItem? currentShelfItem.id: (this.editingItem? this.editingItem.id: this.selectedId);

        if(currentId===newId)return;

        if(currentShelfItem){
            const inventory=this.uiScene.registry.get('inventoryData')||[];

            const returnItem=currentShelfItem;
            const itemData=inventory.find(i=>i.id===returnItem.id);

            if(itemData){
                itemData.qualityDetails[returnItem.qualityIndex]++;
                itemData.count=itemData.qualityDetails.reduce((a,b)=>a+b,0);

                this.uiScene.registry.set('inventoryData',inventory);

            }
            this.targetShelf.shelfData.item=null;
            this.uiScene.registry.set(`shelf_save_${this.targetShelf.id}`,null);
        }
        this.editingItem=null;
        this.selectedId=newId;
        this.refresh();
    }
    renderSettingsPanel(centerX){
        console.log("現在のtargetShelf:",this.targetShelf);
        this.settingsLayer.removeAll(true);

        const panelBg=this.uiScene.add.rectangle(centerX,0,380,500,0xffffff,0.3)
            .setStrokeStyle(2,0x000000);
        this.settingsLayer.add(panelBg);

        const displayItem=this.editingItem|| (this.targetShelf&& this.targetShelf.shelfData? this.targetShelf.shelfData.item:null);

        console.log("displayItem:",displayItem);

        if(displayItem){
            this.renderEditor(centerX,displayItem);
            return;
        }

        if(this.selectedId){
            this.renderQualitySelector(centerX,this.selectedId);
            return;
        }

        const text=this.uiScene.add.text(centerX,0,'商品を選択してください',{
            fontSize:'18px',
            color:'#666'
        }).setOrigin(0.5);

        this.settingsLayer.add(text);
    }
    renderQualitySelector(centerX,id){
        const inventory=this.uiScene.registry.get('inventoryData')||[];
        //const inventory=rawData.items||[];

        const itemData=inventory.find(item=>item.id===id);

        if(!itemData)return;

        const text=this.uiScene.add.text(centerX,-200,`【${itemData.name}】\n品質の選択`,{
            fontSize:'20px',
            color:'#000',
            align:'center',
            fontWeight:'bold'
        }).setOrigin(0.5);

        this.settingsLayer.add(text);

        itemData.qualityDetails.forEach((count,index)=>{
            const realQuality=index+1;
            const y=-100+(index*75);
            const hasStock=count>0;

            const btn=this.uiScene.add.rectangle(centerX,y,300,60,hasStock? 0xffffff:0xcccccc)
                .setStrokeStyle(2,hasStock? 0x2ecc71: 0x999999).setOrigin(0.5);

            const text=this.uiScene.add.text(centerX,y,`${realQuality}(在庫:${count})`,{
                fontSize:'18px',
                color:hasStock? '#000':'#777'
            }).setOrigin(0.5);

            if(hasStock){
                btn.setInteractive({useHandCursor:true}).on('pointerdown',()=>{
                    //const realQuality=index+1;

                    this.editingItem={
                        id:itemData.id,
                        name:itemData.name,
                        realQuality:realQuality,
                        qualityIndex:index,
                        displayQuality:realQuality,//初期値
                        price:100,
                        marketPrice:100//later
                    };

                    this.selectedId=null;
                    this.refresh();

                });

            }
            this.settingsLayer.add([btn,text]);
        });
    }
    renderEditor(centerX,item){
        //this.settingsLayer.removeAll(true);
        const itemImg=this.uiScene.add.image(centerX,-120,item.id).setDisplaySize(110,110);
        const name=this.uiScene.add.text(centerX,-35,`【${item.id}】`,{
            fontSize:'24px',
            color:'#000'
        }).setOrigin(0.5);
        
        const marketPrice=item.marketPrice||100;
        const marketPriceText=`${marketPrice}G`;
        const marketLabel=this.uiScene.add.text(centerX,0,`適正価格:${marketPriceText}`,{
            fontSize:'16px',
            color:'#2980b9',
        }).setOrigin(0.5);

        const qualityY=25;
        const qualityLabel=this.uiScene.add.text(centerX,qualityY,`品質:★${item.displayQuality}`,{
            fontSize:'20px',
            color:'#d35400'
        }).setOrigin(0.5);

        const qualityLess=this.uiScene.add.text(centerX-70,qualityY,'◀',{
            fontSize:'20px',
            color:'#000'
        }).setInteractive({useHandCursor:true});

        const qualityMore=this.uiScene.add.text(centerX+70,qualityY,'▶',{
            fontSize:'20px',
            color:'#000'
        }).setInteractive({useHandCursor:true});

        qualityLess.on('pointerdown',()=>{
            if(item.displayQuality>1){
                item.displayQuality--;

                this.refresh();
            }
        });

        qualityMore.on('pointerdown',()=>{
            if(item.displayQuality<3){
                item.displayQuality++;

                this.refresh();
            }
        });

        const priceY=85;
        const priceLabel=this.uiScene.add.text(centerX,priceY,`${item.price}G`,{
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
            item.price=Math.max(0,item.price-10);

            this.refresh();
        });

        priceMore.on('pointerdown',()=>{
            item.price+=10;

            this.refresh();
        });

        const btnY=190;
        const isSet=this.targetShelf&& this.targetShelf.shelfData&& this.targetShelf.shelfData.item;

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
            priceLabel,priceLess,priceMore,actionBtn,actionText,marketLabel
        ]);    

    }
    confirmPlace(){
        if(!this.editingItem)return;

        const inventory=this.uiScene.registry.get('inventoryData')||[];
        //const inventory=rawData.items||[];

        const itemData=inventory.find(i=>i.id===this.editingItem.id);

            //itemData.count--;

        if(itemData&& itemData.qualityDetails[this.editingItem.qualityIndex]>0){
            itemData.qualityDetails[this.editingItem.qualityIndex]--;

            itemData.count=itemData.qualityDetails.reduce((a,b)=>a+b,0);

            //this.shelfData.item={...this.editingItem};
            this.targetShelf.shelfData.item={
                id:this.editingItem.id,
                qualityIndex:this.editingItem.qualityIndex,
                realQuality:this.editingItem.realQuality,
                displayQuality:this.editingItem.displayQuality,
                price:this.editingItem.price,
                marketPrice:this.editingItem.marketPrice,
                timestamp:Date.now()
            };

            this.editingItem=null;
            this.selectedId=null;

            this.uiScene.registry.set('inventoryData',inventory);
            this.uiScene.registry.set(`shelf_save_${this.targetShelf.id}`,this.targetShelf.shelfData.item);

            console.log("陳列完了:",this.targetShelf.shelfData.item);

            this.refresh();
        }

            
    }
    cancelShelf(){
        if(!this.targetShelf||!this.targetShelf.shelfData.item)return;

        const inventory=this.uiScene.registry.get('inventoryData')||[];
        //const inventory=rawData.items||[];

        const returnItem=this.targetShelf.shelfData.item;

        let itemData=inventory.find(i=>i.id===returnItem.id/*&& i.quality===returnItem.quality*/);
        if(itemData){
            itemData.qualityDetails[returnItem.qualityIndex]++;
            itemData.count=itemData.qualityDetails.reduce((a,b)=>a+b,0);

            this.uiScene.registry.set('inventoryData',inventory);

        }

        this.targetShelf.shelfData.item=null;

        this.uiScene.registry.set(`shelf_save_${this.targetShelf.id}`,null);
        this.selectedId=null;
        this.editingItem=null;

        this.refresh();
    }
}