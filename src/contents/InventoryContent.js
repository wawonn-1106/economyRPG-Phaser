export default class InventoryContent{
    constructor(uiScene){
        this.uiScene=uiScene;
        this.worldScene=this.uiScene.scene.get('World');
        this.selectedItem=null;

        this.cols=5;
        this.totalGridSlots=20;
        this.slotSize=90;
        this.spacing=10;

        this.container=null;
        this.gridLayer=null;
        this.detailLayer=null;
        this.eventsInitialized=false;
    }

    createView(){

        this.selectedItem=null;
        
        this.container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.container.add(bg);

        this.gridLayer=this.uiScene.add.container(0,0);
        this.detailLayer=this.uiScene.add.container(0,0);
        this.container.add([this.gridLayer,this.detailLayer]);

        const closeBtn=this.uiScene.add.text(480,-280,'×',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        const backBtn=this.uiScene.add.text(440,-285,'←',{//なんかデフォルトが低い
            fontSize:'55px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        closeBtn.on('pointerdown',()=>this.uiScene.menuManager.closeMenu());
        backBtn.on('pointerdown',()=>this.uiScene.menuManager.toggle('menu'));

        this.container.add([closeBtn,backBtn]);

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
        this.renderDetailPanel(250);
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
            const isSelected=this.selectedItem&&inventory[i]&&this.selectedItem===inventory[i];

            const slotBg=this.uiScene.add.rectangle(x,y,this.slotSize,this.slotSize,
                isLocked?0x000000:(isSelected?0xffff00:0x000000),
                isLocked?0.5:(isSelected?0.4:0.15))
                .setStrokeStyle(isSelected?3:1,0x000000,0.5);

            this.gridLayer.add(slotBg);

            if(isLocked){
                this.gridLayer.add(this.uiScene.add.text(x,y,'LOCKED',{
                    fontSize:'14px',
                    color:'#ff4444'
                }).setOrigin(0.5));
            }
        }

        
        for(let i=0;i<this.totalGridSlots;i++){

            const item=inventory[i];
        
            if(i<maxSlots&&item&&item.id&&item.count>0){

                const col=i%this.cols;
                const row=Math.floor(i/this.cols);

                const x=startX+col*(this.slotSize+this.spacing);
                const y=startY+row*(this.slotSize+this.spacing);

                const itemContainer=this.uiScene.add.container(x,y);
                const img=this.uiScene.add.image(0,0,item.id).setDisplaySize(70,70);
                const countText=this.uiScene.add.text(40,40,item.count,{
                    fontSize:'18px',
                    stroke:'#000',
                    strokeThickness:3
                }).setOrigin(1,1);
                
                itemContainer.add([img,countText]);
                itemContainer.slotIndex=i;

                
                itemContainer.setSize(this.slotSize,this.slotSize);
                itemContainer.setInteractive();

                this.uiScene.input.setDraggable(itemContainer);

                itemContainer.on('pointerdown',()=>{
                    this.selectedItem=item;
                    this.renderDetailPanel(250);
                });

                this.gridLayer.add(itemContainer);
            }
        }
    }

    renderDetailPanel(centerX){
        this.detailLayer.removeAll(true);

        const panelBg=this.uiScene.add.rectangle(centerX,0,380,500,0xffffff,0.3).setStrokeStyle(2,0x000000);
        this.detailLayer.add(panelBg);

        if(!this.selectedItem){
            this.detailLayer.add(this.uiScene.add.text(centerX,0,'アイテムを選択してください',{
                fontSize:'20px',
                color:'#000'
            }).setOrigin(0.5));

            return;
        }

        const item=this.selectedItem;
        const title=this.uiScene.add.text(centerX,-220,item.name||item.id,{
            fontSize:'32px',
            color:'#000',
            fontWeight:'bold'
        }).setOrigin(0.5);

        const icon=this.uiScene.add.image(centerX,-100,item.id).setDisplaySize(140,140);
        const desc=this.uiScene.add.text(centerX-170,20,item.description||"説明はありません。",{
            fontSize:'20px',
            color:'#333',
            wordWrap:{width:340},
            lineSpacing:8
        });

        let qualityInfo=`【所持品質の内訳】`;
        if(item.qualityDetails){
            qualityInfo+=`★1:${item.qualityDetails[0]}個 ★2:${item.qualityDetails[1]}個 ★3:${item.qualityDetails[2]}個`;
        }else{
            qualityInfo+=`品質情報なし`;
        }
        const qualityText=this.uiScene.add.text(centerX-170,180,qualityInfo,{
            fontSize:'18px',
            color:'#000',
            backgroundColor:'#ffffff66'
            ,padding:{x:5,y:5}
        });

        this.detailLayer.add([title,icon,desc,qualityText]);
    }
}