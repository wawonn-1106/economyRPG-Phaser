//import InventoryManager from "../managers/InventoryManager.js";

export default class InventoryContent{
    constructor(uiScene){
        this.uiScene=uiScene;

        this.worldScene=this.uiScene.scene.get('World');
    }
    createView(){
        const container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);//menu-bg→inventory-bg
        container.add(bg);

        //const container=document.createElement('div');
        //container.classList.add('inventory-container');

        //const items=this.worldScene.inventoryData || [];  //World.jsのアイテムなかったら空
        const items=this.uiScene.registry.get('inventoryData');

        /*if(items.length===0){
            const emptyMsg=this.uiScene.add.text(0,0,'持ち物はありません',{
                fontSize:'28px',
                color:'#000000'
            });
            //emptyMsg.textContent='持ち物はありません';
            container.add(emptyMsg);
            return container;
        }*/

        const startX=-410;
        const backPackStartY=-125;
        const hotbarStartY=175;
        const slotSize=102;

        /*const tooltip=this.uiScene.add.text(0,-240,'',{
            fontSize:'20px',
            color:'#000000',
            backgroundColor:'#ffffff',
            padding:{x:12,y:10},
            lineSpacing:8
        }).setOrigin(0.5,0.5).setDepth(2000).setVisible(false);
        
        //container.add(tooltip);
        tooltip.setDepth(10000);
        /*const colWidth=260;
        const rowHeight=120;
        const maxCols=3;
        /*const ul=document.createElement('ul');
        ul.classList.add('item-grid');*/

        items.forEach((item,index)=>{
            const isHotbar=index<9;

            let x,y;
            /*const col=isHotbar? index:(index-9)%9;
            const row=isHotbar?0:Math.floor((index%9)/9);*/
            
            if(isHotbar){
                x=startX+(index*slotSize);
                y=hotbarStartY;
            }else{
                const bpIndex=index-9;
                const col=bpIndex%9;
                const row=Math.floor(bpIndex/9);

                x=startX+(col*slotSize);
                y=backPackStartY+(row*slotSize);
            }
            const itemContainer = this.uiScene.add.container(x, y);
            container.add(itemContainer);


            const hitArea=this.uiScene.add.rectangle(x,y,90,90,0x000000,0)
                .setInteractive({useHandCursor:true,draggable:true});

            container.add(hitArea);

            /*const x=startX+(col*slotSize);
            const y=isHotbar? hotbarStartY:backPackStartY+(row*slotSize);

            const slotBg=this.uiScene.add.image(x,y,'slot-bg')
                .setDisplaySize(90,90)
                .setInteractive({useHandCursor:true,draggable:true});

            container.add(slotBg);*/

            //const itemContainer=this.uiScene.add.container(x,y);

            if(item&& item.count>0){
                const icon=this.uiScene.add.image(0,0,item.id).setDisplaySize(70,70);
                const countText=this.uiScene.add.text(35,35,item.count,{
                    fontSize:'18px',
                    stroke:'#000',
                    strokeThickness:3
                }).setOrigin(1,1);

                itemContainer.add([icon,countText]);
            }

            /*hitArea.on('pointerover',(pointer)=>{
                if(!item || !item.id || this.uiScene.draggedItem || item.count <= 0) return;
                //if(this.uiScene.draggedItem ||item.count<=0)return;

                let text=`【${item.name}】`;

                if(item.qualityDetails){
                    text+=`★１:${item.qualityDetails[0]} ★２:${item.qualityDetails[1]} ★３:${item.qualityDetails[2]}`;
                }

                tooltip.setText(text).setVisible(true).setPosition(pointer.x,pointer.y);
            });

            hitArea.on('pointermove',(pointer)=>{
                tooltip.setPosition(pointer.x,pointer.y);
            });

            hitArea.on('pointerout',()=>{
                tooltip.setVisible(false);
            });*/

            //let pressStartTime=0;
            let isDragging=false;

            /*hitArea.on('pointerdown',(pointer)=>{
                isDragging=false;
                //this.showItemDescription(item,pointer.x,pointer.y);
                //console.log('クリックされました');
                //if(!item.active)return;
                //this.showItemDescription(item,pointer.x,pointer.y);

                //pressStartTime=pointer.time;
            });

            /*hitArea.on('pointerup',(pointer)=>{
                const duration=pointer.time-pressStartTime;
                
                const distance=Phaser.Math.Distance.Between(
                    pointer.downX,pointer.downY,
                    pointer.upX,pointer.upY
                );

                if(this.uiScene.draggedItem){
                    this.uiScene.dropItem(index);
                    //this.worldScene.menuManager.switchTab('inventory');
                }else if(duration<200&& distance<10){
                    this.showItemDescription(item,pointer.x,pointer.y);
                }
            });*/
            hitArea.on('pointerdown',(pointer)=>{
                isDragging=false;

                this.clickTimer=this.uiScene.time.delayedCall(200,()=>{
                    if(!isDragging&& item&& item.id){
                        this.showItemDescription(item,pointer.x,pointer.y);
                    }
                });
            });

            hitArea.on('dragstart',()=>{
                isDragging=true;
                //if(!item|| item.count<=0)return;

                //itemContainer.setVisible(false);
                if(this.clickTimer)this.clickTimer.remove();
                if(this.descPanel) this.descPanel.destroy();

                this.uiScene.handleInteraction(index);
                //tooltip.setVisible(false);
            });

        });
        //container.appendChild(ul);

        return container;
    }
    showItemDescription(item,x,y){
        //if (!item ||item.count<=0|| this.uiScene.draggedItem) return;

        console.log(item);

        if(this.descPanel)this.descPanel.destroy();

        let panelX=x+175;
        let panelY=y;

        if(panelX+175>this.uiScene.scale.width){
            panelX=x-175;
        }
        if(panelY+225>this.uiScene.scale.height){
            panelY=this.uiScene.scale.height-225;
        }

        this.descPanel=this.uiScene.add.container(panelX,panelY);

        const panelBg=this.uiScene.add.image(0,0,'menu-bg')//descPanel-bg
            .setDisplaySize(350,450)
            .setInteractive();

        const titleText=this.uiScene.add.text(0,-180,item.name,{
            fontSize:'28px',
            color:'#000000',
            stroke:'#000',
            strokeThickness:4
        }).setOrigin(0.5);

        const descText=this.uiScene.add.text(-140,-130,item.description,{
            fontSize:'18px',
            color:'#ffffff',
            lineSpacing:5,
            wordWrap:{width:280}
        });

        let qualityInfo=`【品質内訳】`;

        if(item.qualityDetails){
            qualityInfo+=`★１:${item.qualityDetails[0]}個 ★２:${item.qualityDetails[1]}個 ★３:${item.qualityDetails[2]}個`;
        }

        const qualityText=this.uiScene.add.text(-140,50,qualityInfo,{
            fontSize:'18px',
            color:'#000000',
            lineSpacing:8
        });

        const closeBtn=this.uiScene.add.image(0,180,'close-btn')//何て名前だっけ、後で統一
            .setDisplaySize(120,50)
            .setInteractive({useHandCursor:true});
        
        const closeText=this.uiScene.add.text(0,180,'閉じる',{
            fontSize:'16px',
            color:'#000000',
        }).setOrigin(0.5);

        closeBtn.on('pointerdown',()=>{
            this.descPanel.destroy();
            this.descPanel=null;
        });

        this.descPanel.add([panelBg,titleText,descText,qualityText,closeBtn,closeText]);
        this.descPanel.setDepth(20000);
    }
}