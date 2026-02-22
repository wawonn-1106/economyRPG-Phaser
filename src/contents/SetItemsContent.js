export default class SetItemsContent {
    constructor(uiScene){
        this.uiScene=uiScene;

        this.editingItem=null;
        this.selectedId=null;
        this.targetTrade=null;

        this.cols=5;
        this.totalGrid=20; // 20マス（5x4）に変更
        this.slotSize=88;  // 視認性とスペースのバランスをとったサイズ
        this.spacing=10;

        this.container=null;
        this.inventoryLayer=null;
        this.settingsLayer=null;
    }


    createView(targetTrade){
        this.targetTrade=targetTrade;
        this.container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.container.add(bg);

        this.inventoryLayer=this.uiScene.add.container(0,0);
        this.settingsLayer=this.uiScene.add.container(0,0);
        this.container.add([this.inventoryLayer,this.settingsLayer]);

        const closeBtn=this.uiScene.add.text(480,-280,'←',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true}).setDepth(5001);

        closeBtn.on('pointerdown',()=>{
            this.uiScene.menuManager.toggle('tradeBox');
        });

        this.container.add(closeBtn);

        this.refresh();

        return this.container;
    }


    refresh(){
        this.renderInventory(-220);
        this.renderSettingsPanel(250);
    }


    renderInventory(centerX){
        this.inventoryLayer.removeAll(true);

        const inventory=this.uiScene.registry.get('inventoryData')||[];
        const maxSlots=this.uiScene.registry.get('maxInventorySlots')||10;

        const startX=centerX-((this.cols-1)*(this.slotSize+this.spacing))/2;
        const startY=-210;

        for(let i=0;i<this.totalGrid;i++){
            const col=i%this.cols;
            const row=Math.floor(i/this.cols);

            const x=startX+col*(this.slotSize+this.spacing);
            const y=startY+row*(this.slotSize+this.spacing);

            const isLocked=i>=maxSlots;
            const item=inventory[i];

            const currentId=this.editingItem? this.editingItem.id:this.selectedId;
            const isSelected=item&& item.id&& currentId===item.id;

            const slotBg=this.uiScene.add.rectangle(x,y,this.slotSize,this.slotSize,
                isLocked? 0x000000:(isSelected? 0xffff00:0x000000),
                isLocked? 0.5:(isSelected? 0.4:0.15))
                .setStrokeStyle(isSelected? 3:1,0x000000,0.5);
            
            this.inventoryLayer.add(slotBg);

            if(isLocked){
                this.inventoryLayer.add(this.uiScene.add.text(x,y,'LOCKED',{fontSize:'12px',color:'#ff4444'}).setOrigin(0.5));
            }else if(item&& item.id&& item.count>0){
                const img=this.uiScene.add.image(x,y,item.id).setDisplaySize(65,65);
                const count=this.uiScene.add.text(x+40,y+40,item.count,{
                    fontSize:'17px',
                    color:'#fff',
                    stroke:'#000',
                    strokeThickness:2
                }).setOrigin(1,1);

                slotBg.setInteractive({useHandCursor:true}).on('pointerdown',()=>{
                    this.handleInventoryClick(item.id);
                });

                this.inventoryLayer.add([img,count]);
            }
        }

        this.renderTradeStatus(centerX,215);
    }


    renderTradeStatus(centerX,y){
        const maxTradeSlots=3;
        const currentItems=this.uiScene.registry.get('trade_items_data')||[];
        
        const label=this.uiScene.add.text(centerX,y-70,"--- 交易枠 ---",{
            fontSize:'18px',
            color:'#444',
            fontStyle:'bold'
        }).setOrigin(0.5);
        this.inventoryLayer.add(label);

        const frameWidth=115;
        const totalW=(maxTradeSlots*(frameWidth+15))-15;
        const startX=centerX-totalW/2+frameWidth/2;

        for(let i=0;i<maxTradeSlots;i++){
            const slotX=startX+i*(frameWidth+15);
            const tradeData=currentItems[i];

            const bg=this.uiScene.add.rectangle(slotX,y,frameWidth,95,0xffffff,0.6).setStrokeStyle(2,0x666666);
            this.inventoryLayer.add(bg);

            if(tradeData){
                const img=this.uiScene.add.image(slotX,y-12,tradeData.id).setDisplaySize(55,55);
                const total=tradeData.counts.reduce((a,b)=>a+b,0);
                const info=this.uiScene.add.text(slotX,y+28,`x${total} / ${tradeData.unitPrice}G`,{
                    fontSize:'13px',
                    color:'#000',
                    fontWeight:'bold'
                }).setOrigin(0.5);
                
                this.inventoryLayer.add([img,info]);

                bg.setInteractive({useHandCursor:true}).on('pointerdown',()=>{
                    this.cancelTradeItem(i);
                });
            }else{
                this.inventoryLayer.add(this.uiScene.add.text(slotX,y,"(空き)",{fontSize:'14px',color:'#999'}).setOrigin(0.5));
            }
        }
    }


    handleInventoryClick(newId){
        this.editingItem=null;
        this.selectedId=newId;
        this.refresh();
    }


    renderSettingsPanel(centerX){
        this.settingsLayer.removeAll(true);

        const panelBg=this.uiScene.add.rectangle(centerX,0,380,520,0xffffff,0.3).setStrokeStyle(2,0x000000);
        this.settingsLayer.add(panelBg);

        const inventory=this.uiScene.registry.get('inventoryData')||[];
        const itemData=inventory.find(i=>i.id===(this.selectedId||(this.editingItem? this.editingItem.id:null)));

        if(itemData){
            if(!this.editingItem|| this.editingItem.id!==itemData.id){
                this.editingItem={
                    id:itemData.id,
                    name:itemData.name,
                    counts:[0,0,0],
                    unitPrice:100,
                    marketPrice:100
                };
            }
            this.renderEditor(centerX,this.editingItem,itemData);
        }else{
            const msg=this.uiScene.add.text(centerX,0,'商品を選択してください',{
                fontSize:'18px',
                color:'#666',
                align:'center'
            }).setOrigin(0.5);
            this.settingsLayer.add(msg);
        }
    }


    renderEditor(centerX,item,originalData){
        const itemImg=this.uiScene.add.image(centerX,-180,item.id).setDisplaySize(110,110);
        const name=this.uiScene.add.text(centerX,-110,`【${item.name}】`,{
            fontSize:'24px',
            color:'#000',
            fontStyle:'bold'
        }).setOrigin(0.5);

        this.settingsLayer.add([itemImg,name]);

        item.counts.forEach((count,index)=>{
            const y=-40+(index*55);
            const label=this.uiScene.add.text(centerX-140,y,`品質★${index+1} (在庫:${originalData.qualityDetails[index]})`,{
                fontSize:'17px',
                color:'#333'
            }).setOrigin(0,0.5);
            
            const minus=this.uiScene.add.text(centerX+50,y,"-",{fontSize:'24px',color:'#e74c3c'}).setOrigin(0.5).setInteractive({useHandCursor:true});
            const num=this.uiScene.add.text(centerX+90,y,count,{fontSize:'22px',color:'#000',fontStyle:'bold'}).setOrigin(0.5);
            const plus=this.uiScene.add.text(centerX+130,y,"+",{fontSize:'24px',color:'#27ae60'}).setOrigin(0.5).setInteractive({useHandCursor:true});

            minus.on('pointerdown',()=> {
                if(item.counts[index]>0){
                    item.counts[index]--;
                    this.refresh();
                }
            });

            plus.on('pointerdown',()=> {
                if(item.counts[index]<originalData.qualityDetails[index]){
                    item.counts[index]++;
                    this.refresh();
                }
            });

            this.settingsLayer.add([label,minus,num,plus]);
        });

        const priceY=145;
        const totalCount=item.counts.reduce((a,b)=>a+b,0);
        
        const priceLabel=this.uiScene.add.text(centerX,priceY,`単価:${item.unitPrice}G`,{
            fontSize:'24px',
            color:'#b33939',
            fontStyle:'bold'
        }).setOrigin(0.5);

        const pLess=this.uiScene.add.text(centerX-110,priceY,"[-]",{fontSize:'22px',color:'#000'}).setInteractive({useHandCursor:true});
        const pMore=this.uiScene.add.text(centerX+110,priceY,"[+]",{fontSize:'22px',color:'#000'}).setInteractive({useHandCursor:true});

        pLess.on('pointerdown',()=> {
            item.unitPrice=Math.max(0,item.unitPrice-10);
            this.refresh();
        });

        pMore.on('pointerdown',()=> {
            item.unitPrice+=10;
            this.refresh();
        });

        const totalText=this.uiScene.add.text(centerX,priceY+45,`総額: ${item.unitPrice*totalCount}G (${totalCount}個)`,{
            fontSize:'18px',
            color:'#2c3e50',
            fontStyle:'bold'
        }).setOrigin(0.5);

        const actionBtn=this.uiScene.add.rectangle(centerX,240,240,50,0x2ecc71).setInteractive({useHandCursor:true});
        const actionText=this.uiScene.add.text(centerX,240,'交易に出す',{fontSize:'20px',color:'#fff'}).setOrigin(0.5);
        
        actionBtn.on('pointerdown',()=> {
            this.confirmTrade();
        });

        this.settingsLayer.add([priceLabel,pLess,pMore,totalText,actionBtn,actionText]);
    }


    confirmTrade(){
        const total=this.editingItem? this.editingItem.counts.reduce((a,b)=>a+b,0):0;
        if(total<=0) return;

        let currentItems=this.uiScene.registry.get('trade_items_data')||[];
        if(currentItems.length>=3) return;

        let inventory=this.uiScene.registry.get('inventoryData')||[];
        const itemIndex=inventory.findIndex(i=>i.id===this.editingItem.id);

        if(itemIndex!==-1){
            this.editingItem.counts.forEach((c,idx)=>{
                inventory[itemIndex].qualityDetails[idx]-=c;
            });
            inventory[itemIndex].count=inventory[itemIndex].qualityDetails.reduce((a,b)=>a+b,0);

            const tradeEntry={
                ...this.editingItem,
                timestamp:Date.now()
            };

            currentItems.push(tradeEntry);
            this.uiScene.registry.set('inventoryData',inventory);
            this.uiScene.registry.set('trade_items_data',currentItems);

            this.editingItem=null;
            this.selectedId=null;
            this.refresh();
        }
    }


    cancelTradeItem(index){
        let currentItems=this.uiScene.registry.get('trade_items_data')||[];
        const returnItem=currentItems[index];
        if(!returnItem) return;

        let inventory=this.uiScene.registry.get('inventoryData')||[];
        const itemIndex=inventory.findIndex(i=>i.id===returnItem.id);

        if(itemIndex!==-1){
            returnItem.counts.forEach((c,idx)=>{
                inventory[itemIndex].qualityDetails[idx]+=c;
            });
            inventory[itemIndex].count=inventory[itemIndex].qualityDetails.reduce((a,b)=>a+b,0);
            this.uiScene.registry.set('inventoryData',inventory);
        }

        currentItems.splice(index,1);
        this.uiScene.registry.set('trade_items_data',currentItems);
        this.refresh();
    }
}