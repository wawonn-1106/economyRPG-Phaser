export default class RemoveItemsContent {
    constructor(uiScene){
        this.uiScene=uiScene;
        this.selectedItem=null;

        this.cols=5;
        this.totalGridSlots=20;
        this.slotSize=90;
        this.spacing=10;

        this.orderCols=3;
        this.orderTotalSlots=6;

        this.container=null;
        this.gridLayer=null;
        this.orderLayer=null;
        this.eventsInitialized=false;
    }


    createView(){
        if(!this.uiScene.registry.get('orderData')){
            const Orders=[
                {id:'stone',name:'石ころ',count:10},
                {id:'wood',name:'木材',count:2}
            ];
            this.uiScene.registry.set('orderData',Orders);
        }

        this.selectedItem=null;
        this.container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.container.add(bg);

        this.gridLayer=this.uiScene.add.container(0,0);
        this.orderLayer=this.uiScene.add.container(0,0);
        this.container.add([this.gridLayer,this.orderLayer]);

        const backBtn=this.uiScene.add.text(480,-285,'←',{
            fontSize:'55px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        backBtn.on('pointerdown',()=>this.uiScene.menuManager.toggle('tradeBox'));
        this.container.add(backBtn);

        if(!this.eventsInitialized){
            this.setupDragEvents();
            this.eventsInitialized=true;
        }

        this.refresh();
        return this.container;
    }


    setupDragEvents(){
        this.uiScene.input.on('dragstart',(pointer,gameObject)=>{
            this.gridLayer.bringToTop(gameObject);
            gameObject.setAlpha(0.7);
        });

        this.uiScene.input.on('drag',(pointer,gameObject,dragX,dragY)=>{
            gameObject.x=dragX;
            gameObject.y=dragY;
        });

        this.uiScene.input.on('dragend',(pointer,gameObject)=>{
            gameObject.setAlpha(1);

            const inventory=this.uiScene.registry.get('inventoryData')||[];
            const maxSlots=this.uiScene.registry.get('maxInventorySlots')||10;
            const centerX=-220;

            const startX=centerX-((this.cols-1)*(this.slotSize+this.spacing))/2;
            const startY=-((Math.floor(this.totalGridSlots/this.cols)-1)*(this.slotSize+this.spacing))/2;

            const cam=this.uiScene.cameras.main;
            const localX=pointer.x-(cam.width/2)-centerX;
            const localY=pointer.y-(cam.height/2);

            const col=Math.round((localX+((this.cols-1)*(this.slotSize+this.spacing))/2)/(this.slotSize+this.spacing));
            const row=Math.round((localY-startY)/(this.slotSize+this.spacing));
            const toIndex=col+(row*this.cols);

            if(toIndex>=0&&toIndex<maxSlots&&col>=0&&col<this.cols){
                const fromIndex=gameObject.slotIndex;
                if(fromIndex!==undefined&&fromIndex!==toIndex){
                    const temp=inventory[fromIndex];
                    inventory[fromIndex]=inventory[toIndex];
                    inventory[toIndex]=temp;
                    this.uiScene.registry.set('inventoryData',inventory);
                }
            }
            this.refresh();
        });
    }


    refresh(){
        this.renderInventoryGrid(-220);
        this.renderOrderGrid(250);
    }


    renderInventoryGrid(centerX){
        this.gridLayer.removeAll(true);
        const inventory=this.uiScene.registry.get('inventoryData')||[];
        const maxSlots=this.uiScene.registry.get('maxInventorySlots')||10;

        const startX=centerX-((this.cols-1)*(this.slotSize+this.spacing))/2;
        const startY=-((Math.floor(this.totalGridSlots/this.cols)-1)*(this.slotSize+this.spacing))/2;

        for(let i=0;i<this.totalGridSlots;i++){
            const col=i%this.cols;
            const row=Math.floor(i/this.cols);
            const x=startX+col*(this.slotSize+this.spacing);
            const y=startY+row*(this.slotSize+this.spacing);

            const isLocked=i>=maxSlots;
            const slotBg=this.uiScene.add.rectangle(x,y,this.slotSize,this.slotSize,
                isLocked?0x000000:0x000000,
                isLocked?0.5:0.15)
                .setStrokeStyle(1,0x000000,0.5);
            this.gridLayer.add(slotBg);

            if(isLocked){
                this.gridLayer.add(this.uiScene.add.text(x,y,'LOCKED',{fontSize:'14px',color:'#ff4444'}).setOrigin(0.5));
            }

            const item=inventory[i];
            if(!isLocked&&item&&item.id&&item.count>0){
                const itemGroup=this.uiScene.add.container(x,y);
                const img=this.uiScene.add.image(0,0,item.id).setDisplaySize(70,70);
                const countText=this.uiScene.add.text(40,40,item.count,{fontSize:'18px',stroke:'#000',strokeThickness:3}).setOrigin(1,1);
                
                itemGroup.add([img,countText]);
                itemGroup.slotIndex=i;
                itemGroup.setSize(this.slotSize,this.slotSize).setInteractive({useHandCursor:true});
                this.uiScene.input.setDraggable(itemGroup);
                
                this.gridLayer.add(itemGroup);
            }
        }
    }


    renderOrderGrid(centerX){
        this.orderLayer.removeAll(true);
        const orderData=this.uiScene.registry.get('orderData')||[];

        const panelBg=this.uiScene.add.rectangle(centerX,0,380,500,0xffffff,0.3).setStrokeStyle(2,0x000000);
        this.orderLayer.add(panelBg);

        const title=this.uiScene.add.text(centerX,-220,'注文の受け取り',{fontSize:'32px',color:'#000',fontWeight:'bold'}).setOrigin(0.5);
        this.orderLayer.add(title);

        const takeAllBtn=this.uiScene.add.rectangle(centerX,180,200,50,0x2ecc71).setInteractive({useHandCursor:true});
        const takeAllTxt=this.uiScene.add.text(centerX,180,'すべて受け取る',{fontSize:'20px',color:'#fff',fontWeight:'bold'}).setOrigin(0.5);
        
        takeAllBtn.on('pointerdown',()=>this.handleTakeAll());
        this.orderLayer.add([takeAllBtn,takeAllTxt]);

        const startX=centerX-((this.orderCols-1)*(this.slotSize+this.spacing))/2;
        const startY=-50;

        for(let i=0;i<this.orderTotalSlots;i++){
            const col=i%this.orderCols;
            const x=startX+col*(this.slotSize+this.spacing);
            const y=startY+Math.floor(i/this.orderCols)*(this.slotSize+this.spacing);

            const slotBg=this.uiScene.add.rectangle(x,y,this.slotSize,this.slotSize,0x000000,0.15).setStrokeStyle(1,0x000000,0.5);
            this.orderLayer.add(slotBg);

            const item=orderData[i];
            if(item){
                const img=this.uiScene.add.image(x,y,item.id).setDisplaySize(70,70).setInteractive({useHandCursor:true});
                const countText=this.uiScene.add.text(x+40,y+40,item.count,{fontSize:'18px',stroke:'#000',strokeThickness:3}).setOrigin(1,1);

                img.on('pointerdown',()=>this.receiveItem(i));
                this.orderLayer.add([img,countText]);
            }
        }
    }


    receiveItem(orderIndex,targetInv=null,targetOrders=null){
        const inventory=targetInv||this.uiScene.registry.get('inventoryData')||[];
        const orderData=targetOrders||this.uiScene.registry.get('orderData')||[];
        const maxSlots=this.uiScene.registry.get('maxInventorySlots')||10;
        
        const item=orderData[orderIndex];
        if(!item){return false;}

        
        let existingIndex=-1;
        for(let i=0;i<maxSlots;i++){
            if(inventory[i]&&inventory[i].id===item.id){
                existingIndex=i;
                break;
            }
        }

        if(existingIndex!==-1){
            
            inventory[existingIndex].count+=item.count;
            orderData[orderIndex]=null;
        }else{
        
            let emptySlotIndex=-1;
            for(let i=0;i<maxSlots;i++){
                if(!inventory[i]||!inventory[i].id||inventory[i].count<=0){
                    emptySlotIndex=i;
                    break;
                }
            }

            if(emptySlotIndex!==-1){
                inventory[emptySlotIndex]={...item};
                orderData[orderIndex]=null;
            }else{
                return false;
            }
        }

        if(!targetInv){
            this.uiScene.registry.set('inventoryData',inventory);
            this.uiScene.registry.set('orderData',orderData);
            this.refresh();
        }
        return true;
    }


    handleTakeAll(){
        let inventory=[...(this.uiScene.registry.get('inventoryData')||[])];
        let orderData=[...(this.uiScene.registry.get('orderData')||[])];
        let changed=false;

        for(let i=0;i<orderData.length;i++){
            if(orderData[i]){
                const success=this.receiveItem(i,inventory,orderData);
                if(success){changed=true;}
            }
        }

        if(changed){
            this.uiScene.registry.set('inventoryData',inventory);
            this.uiScene.registry.set('orderData',orderData);
            this.refresh();
        }
    }
}