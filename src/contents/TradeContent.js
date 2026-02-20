export default class TradeContent{
    constructor(uiScene){
        this.uiScene=uiScene;

        this.tradeScene=null;
        this.npcMarkers=[];
        this.container=null;
        this.mapArea=null;

        //console.log("渡された tradeScene:",tradeScene);
    }
    createView(){
        this.container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.container.add(bg);

        const mapW=800;
        const mapH=450;

        const border=this.uiScene.add.graphics();
        border.lineStyle(-mapW/2,-mapH/2,mapW,mapH);

        this.container.add(border);

        this.mapArea=this.uiScene.add.container(0,0);
        this.container.add(this.mapArea);

        const closeBtn=this.uiScene.add.text(480,-280,'×',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        closeBtn.on('pointerdown',()=>this.uiScene.menuManager.closeMenu());

        this.container.add(closeBtn);

        // Tradeシーンを取得
        this.tradeScene = this.uiScene.scene.get('Trade');

        if(this.tradeScene&& this.tradeScene.activeTraders){
            
            const worldWidth=this.tradeScene.map.widthInPixels;
            const worldHeight=this.tradeScene.map.heightInPixels;
            const menuWidth=1000;
            const menuHeight=600;

            this.tradeScene.activeTraders.forEach(npc =>{

                const ratioX=npc.x/worldWidth;
                const ratioY=npc.y/worldHeight;
            
                /*const initialX=(ratioX*menuWidth)-(menuWidth/2);
                const initialY=(ratioY*menuHeight)-(menuHeight/2);*/
                const targetX=(ratioX*mapW)-(mapW/2);
                const targetY=(ratioY*mapH)-(mapH/2);

                //const markerContainer=this.uiScene.add.container(initialX,initialY);
                const marker = this.uiScene.add.container(targetX,targetY);
                
                const circleBg=this.uiScene.add.circle(0,0,30,0xffffff)
                    .setStrokeStyle(2,0x000000)
                    .setInteractive({useHandCursor:true});

                const face=this.uiScene.add.image(0,0,'player')
                    .setDisplaySize(45,45).setDepth(14000);

                const maskShape=this.uiScene.add.graphics();
                maskShape.fillCircle(0,0,27);

                const mask=maskShape.createGeometryMask();
                //const mShape=this.uiScene.add.graphics().fillCircle(0,0,20).setVisible(false);
                face.setMask(mask);

                circleBg.on('pointerdown',()=>{
                    console.log(npc.npcId+'がクリックされた');
                });

                //markerContainer.add([circleBg,face]);
                marker.add([circleBg,face]);
                //maskShape.setVisible(false);
                this.mapArea.add(marker);
                
                this.container.add(this.mapArea);

                this.npcMarkers.push({marker,reference:npc,maskShape:maskShape});

            });
        }

        return this.container;
    }
    update(){
        if(!this.tradeScene||!this.npcMarkers.length)return;

        const worldWidth=this.tradeScene.map.widthInPixels;
        const worldHeight=this.tradeScene.map.heightInPixels;

        const mapW=800;
        const mapH=450;

        this.npcMarkers.forEach(obj=>{
            const ratioX=obj.reference.x/worldWidth;
            const ratioY=obj.reference.y/worldHeight;

            const targetX=(ratioX*mapW)-(mapW/2);
            const targetY=(ratioY*mapH)-(mapH/2);

            obj.marker.setPosition(targetX,targetY);

            if(obj.maskShape){
                const matrix=obj.marker.getWorldTransformMatrix();

                obj.maskShape.setPosition(matrix.targetX,matrix.targetY);
            }
        });
    }
}