export default class InventoryContent {
    constructor(uiScene){
        this.uiScene=uiScene;
        this.worldScene=this.uiScene.scene.get('World');

        this.selectedItem=null;
        this.cols=5;            
        this.totalGridSlots=25; 
        this.slotSize=100;      
        this.spacing=10;        

    
        this.container=null;
        this.gridLayer=null;    
        this.detailLayer=null;
    }

    createView(){
        this.container=this.uiScene.add.container(0,0);

        
        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.container.add(bg);

        this.gridLayer=this.uiScene.add.container(0,0);
        this.detailLayer=this.uiScene.add.container(0,0);
        this.container.add([this.gridLayer,this.detailLayer]);

        const closeBtn=this.uiScene.add.text(510,-290,'×',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        closeBtn.on('pointerdown',()=>{
            this.uiScene.menuManager.closeMenu();
        });
        this.container.add(closeBtn);

        this.refresh();

        return this.container;
    }

    refresh(){
        this.renderInventoryGrid(-250);
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
            const item=inventory[i];
            
            
            const isSelected=this.selectedItem&& item&& this.selectedItem===item;

            
            const slotBg=this.uiScene.add.rectangle(x,y,this.slotSize,this.slotSize, 
                isLocked? 0x000000: (isSelected? 0xffff00: 0x000000), 
                isLocked? 0.5: (isSelected? 0.4: 0.15))
                .setStrokeStyle(isSelected? 3: 1,0x000000,0.5);
            
            this.gridLayer.add(slotBg);

            if(isLocked){
                
                const lockIcon=this.uiScene.add.text(x,y,'LOCKED',{ fontSize:'14px',color:'#ff4444'}).setOrigin(0.5);
                this.gridLayer.add(lockIcon);
            }else{
                slotBg.setInteractive({useHandCursor:true});

                if(item&& item.id&& item.count>0){
                    const img=this.uiScene.add.image(x,y,item.id).setDisplaySize(70,70);
                    const count=this.uiScene.add.text(x+40,y+40,item.count,{
                        fontSize:'18px',
                        stroke:'#000',
                        strokeThickness:3
                    }).setOrigin(1,1);
                    this.gridLayer.add([img,count]);

                
                    slotBg.on('pointerdown',()=>{
                        this.selectedItem=item;
                        this.refresh();
                    });
                }
            }
        }
    }

    renderDetailPanel(centerX){
        this.detailLayer.removeAll(true);

        const panelBg=this.uiScene.add.rectangle(centerX,0,420,540,0xffffff,0.2)
            .setStrokeStyle(2,0x000000,0.3);
        this.detailLayer.add(panelBg);

        if(!this.selectedItem){
            const msg=this.uiScene.add.text(centerX,0,'アイテムを選択してください',{
                fontSize:'20px',
                color:'#666'
            }).setOrigin(0.5);
            this.detailLayer.add(msg);
            return;
        }

        const item=this.selectedItem;

        const title=this.uiScene.add.text(centerX,-220,item.name|| item.id,{
            fontSize:'32px',
            color:'#000',
            fontWeight:'bold'
        }).setOrigin(0.5);

        const icon=this.uiScene.add.image(centerX,-100,item.id).setDisplaySize(140,140);

        const desc=this.uiScene.add.text(centerX-180,20,item.description|| "説明はありません。",{
            fontSize:'20px',
            color:'#333',
            wordWrap:{width:360},
            lineSpacing:8
        });

        let qualityInfo=`【所持品質の内訳\n`;
        if(item.qualityDetails){
            qualityInfo+=`★1:${item.qualityDetails[0]}個 ★2:${item.qualityDetails[1]}個 ★3:${item.qualityDetails[2]}個`;
        }else{
            qualityInfo+=`品質情報なし`;
        }

        const qualityText=this.uiScene.add.text(centerX-180,180,qualityInfo,{
            fontSize:'18px',
            color:'#000',
            backgroundColor:'#ffffff66',
            padding:{x:5,y:5}
        });

        this.detailLayer.add([title,icon,desc,qualityText]);
    }
}