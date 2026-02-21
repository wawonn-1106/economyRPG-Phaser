export default class TradeContent {
    constructor(uiScene){
        this.uiScene=uiScene;
        this.npcMarkers=[];
        this.selectedNPC=null;
        this.selectedItem=null;
        this.isUIOpen=false;

        this.listWidth=420;
        this.listHeight=450;
        this.rowHeight=90;

        this.container=null;
        this.listLayer=null;
        this.fixedLayer=null;
        this.detailLayer=null;
        this.mapArea=null;

        this.listMask=null;

        this.mapW=850;
        this.mapH=480;
        this.padding=50;
    }


    createView(){
        this.container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.container.add(bg);

        this.mapArea=this.uiScene.add.container(0,0);
        this.listLayer=this.uiScene.add.container(0,0).setVisible(false);
        this.fixedLayer=this.uiScene.add.container(0,0).setVisible(false);
        this.detailLayer=this.uiScene.add.container(0,0).setVisible(false);

        this.container.add([this.mapArea,this.listLayer,this.fixedLayer,this.detailLayer]);

        const mapBorder=this.uiScene.add.graphics();
        mapBorder.lineStyle(4,0x000000,1);
        mapBorder.strokeRect(-this.mapW/2,-this.mapH/2,this.mapW,this.mapH);
        this.mapArea.add(mapBorder);

        const closeBtn=this.uiScene.add.text(480,-280,'×',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true}).setDepth(5001);

        closeBtn.on('pointerdown',()=>{
            this.uiScene.menuManager.toggle('desk');
        });

        this.container.add(closeBtn);

        const maskShape=this.uiScene.make.graphics();
        maskShape.fillStyle(0xffffff);
        const camera=this.uiScene.cameras.main;
        maskShape.fillRect(camera.centerX-430,camera.centerY-220,this.listWidth,360);
        this.listMask=maskShape.createGeometryMask();

        const dailyData=this.uiScene.registry.get('dailyTraders');
        const traders=dailyData? dailyData.traders:[];

        const padding=50;
        const rangeX=this.mapW-padding*2;
        const rangeY=this.mapH-padding*2;

        traders.forEach(data=>{
            const marker=this.uiScene.add.container(0,0);
            
            const randX=(Math.random()*rangeX)-(rangeX/2);
            const randY=(Math.random()*rangeY)-(rangeY/2);

            marker.setPosition(randX,randY);

            const circleBg=this.uiScene.add.circle(0,0,35,0xffffff).setStrokeStyle(3,0x000000).setInteractive({useHandCursor:true});
            const face=this.uiScene.add.image(0,0,data.npcId).setDisplaySize(50,50);

            circleBg.on('pointerdown',()=>{
                this.selectedNPC=data; 
                this.selectedItem=null;
                this.showTradeUI();
            });

            marker.add([circleBg,face]);
            this.mapArea.add(marker);

            this.npcMarkers.push({
                marker:marker,
                id:data.npcId 
            });
        });


        this.uiScene.input.on('wheel',(pointer,gameObjects,deltaX,deltaY)=>{
            if(!this.isUIOpen)return;

            this.listLayer.y-=deltaY*0.5;

            const itemsCount=this.selectedNPC?.items?.length || 10;
            const limit=Math.min(0,-(itemsCount*this.rowHeight-300));

            this.listLayer.y=Phaser.Math.Clamp(this.listLayer.y,limit,0);
        });

        return this.container;
    }


    showTradeUI(){
        this.isUIOpen=true;
        this.mapArea.setVisible(false);
        this.listLayer.setVisible(true);
        this.fixedLayer.setVisible(true);
        this.detailLayer.setVisible(true);
        this.listLayer.y=0;

        this.refresh();
    }


    refresh(){
        if(!this.isUIOpen)return;

        this.listLayer.removeAll(true);
        this.fixedLayer.removeAll(true);
        this.detailLayer.removeAll(true);

        this.listLayer.setMask(this.listMask);

        this.renderItemList(-210);
        this.renderFixedFooter(-210);
        this.renderDetailPanel(250);
    }


    renderItemList(centerX){
        const startY=-180;
        const items=this.selectedNPC?.items || [];

        items.forEach((item,index)=>{
            const y=startY+(index*this.rowHeight);
            const isSelected=this.selectedItem && this.selectedItem.id===item.id;
            const row=this.uiScene.add.container(centerX,y);

            const bg=this.uiScene.add.rectangle(0,0,this.listWidth-20,80,
                isSelected? 0x3498db: 0xffffff,
                isSelected? 0.2: 0.8
            ).setStrokeStyle(2,isSelected? 0x3498db:0xaaaaaa).setInteractive({useHandCursor:true});

            const itemImg=this.uiScene.add.image(-160,0,item.id).setDisplaySize(60,60);

            const nameText=this.uiScene.add.text(-120,-20,item.name,{
                fontSize:'22px',
                color:'#000',
                fontStyle:'bold'
            });

            const priceText=this.uiScene.add.text(-120,10,`価格：${item.price}G`,{
                fontSize:'18px',
                color:'#444'
            });

            bg.on('pointerdown',()=>{
                this.selectedItem=item;
                this.refresh();
            });

            row.add([bg,itemImg,nameText,priceText]);
            this.listLayer.add(row);
        });
    }


    renderFixedFooter(centerX){
        const footerY=220;

        const button=this.uiScene.add.rectangle(centerX,footerY,this.listWidth-20,70,0x95a5a6)
            .setInteractive({useHandCursor:true});

        const text=this.uiScene.add.text(centerX,footerY,'← 地図に戻る',{
            fontSize:'22px',
            color:'#fff',
            fontStyle:'bold'
        }).setOrigin(0.5);

        button.on('pointerdown',()=>{
            this.isUIOpen=false;
            this.mapArea.setVisible(true);
            this.listLayer.setVisible(false);
            this.fixedLayer.setVisible(false);
            this.detailLayer.setVisible(false);
        });

        this.fixedLayer.add([button,text]);
    }


    renderDetailPanel(centerX){
        const panelBg=this.uiScene.add.rectangle(centerX,0,380,500,0xffffff,0.3)
            .setStrokeStyle(2,0x000000);
        this.detailLayer.add(panelBg);

        const info=this.selectedNPC || {};

        const header=this.uiScene.add.text(centerX,-220,`${info.villageId}との取引`,{
            fontSize:'24px',
            color:'#2c3e50',
            fontStyle:'bold',
            backgroundColor:'#ecf0f1',
            padding:{x:10,y:5}
        }).setOrigin(0.5);

        this.detailLayer.add(header);

        if(!this.selectedItem){
            const msg=this.uiScene.add.text(centerX,0,'商品を選択してください',{
                fontSize:'18px',
                color:'#888'
            }).setOrigin(0.5);

            this.detailLayer.add(msg);
        }else{
            const npcTitle=this.uiScene.add.text(centerX,-150,`${info.name}との交渉`,{
                fontSize:'28px',
                color:'#000',
                fontStyle:'bold'
            }).setOrigin(0.5);

            const itemName=this.uiScene.add.text(centerX,-80,this.selectedItem.name,{
                fontSize:'32px',
                color:'#2980b9',
                fontStyle:'bold'
            }).setOrigin(0.5);

            const priceInfo=this.uiScene.add.text(centerX,-20,`支払額：${this.selectedItem.price}G`,{
                fontSize:'24px',
                color:'#000'
            }).setOrigin(0.5);

            const buyBtn=this.uiScene.add.rectangle(centerX,150,240,60,0x2ecc71)
                .setInteractive({useHandCursor:true});

            const buyTxt=this.uiScene.add.text(centerX,150,'取引を確定する',{
                fontSize:'22px',
                color:'#fff',
                fontStyle:'bold'
            }).setOrigin(0.5);

            buyBtn.on('pointerdown',()=>{
                console.log(`${this.selectedItem.name}の取引完了`);
            });

            this.detailLayer.add([npcTitle,itemName,priceInfo,buyBtn,buyTxt]);
        }
    }
    update(time, delta){
        if(!this.isUIOpen && this.npcMarkers){
            this.npcMarkers.forEach(item=>{
                this.updateMarkerLogic(item, delta);
            });
        }
    }
    updateMarkerLogic(item, delta){
        if(!item.moveTimer) item.moveTimer=0;
        if(!item.vx) item.vx=0;
        if(!item.vy) item.vy=0;

        item.moveTimer-=delta;

        if(item.moveTimer<=0){
            if(Math.random()<0.5){
                item.vx=0;
                item.vy=0;
                item.moveTimer=Phaser.Math.Between(1000,3000);
            }else{
                const dir=[[1,0],[-1,0],[0,1],[0,-1]];
                const selected=dir[Phaser.Math.Between(0,3)];

                item.vx=selected[0]*0.1; // 地図上の移動速度に調整
                item.vy=selected[1]*0.1;
                item.moveTimer=Phaser.Math.Between(500,1500);
            }
        }

        // 座標更新
        item.marker.x+=item.vx*delta;
        item.marker.y+=item.vy*delta;

        // 範囲外に出ないように制限
        const limitX=this.mapW/2-this.padding;
        const limitY=this.mapH/2-this.padding;

        item.marker.x=Phaser.Math.Clamp(item.marker.x,-limitX,limitX);
        item.marker.y=Phaser.Math.Clamp(item.marker.y,-limitY,limitY);
    }
}