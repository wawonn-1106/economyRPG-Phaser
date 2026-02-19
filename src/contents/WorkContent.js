export default class WorkContent{
    constructor(uiScene){
        this.uiScene=uiScene;

        this.selectedNPC=null;

        this.NPCs=[
            {id:'npc1',name:'平成',status:'idle',target:'',wage:500},
            {id:'npc2',name:'縄文',status:'idle',target:'木材',wage:500},
            {id:'npc3',name:'明治',status:'idle',target:'石材',wage:500},
            {id:'npc4',name:'令和',status:'idle',target:'ランダム',wage:500},
        ];

        this.listWidth=420;
        this.listHeight=450;
        this.rowHeight=90;

        this.container=null;
        this.listLayer=null;
        this.detailLayer=null;
    }
    createView(){
        this.container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.container.add(bg);

        this.listLayer=this.uiScene.add.container(0,0);
        this.fixedLayer=this.uiScene.add.container(0,0);
        this.detailLayer=this.uiScene.add.container(0,0);

        this.container.add([this.listLayer,this.fixedLayer,this.detailLayer]);
        //this.fixedLayer.setDepth(100);

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

        maskShape.fillRect(camera.centerX-470,camera.centerY-220,this.listWidth,360);
        this.listLayer.setMask(maskShape.createGeometryMask());

        this.uiScene.input.on('wheel',(pointer,gameObjects,deltaX,deltaY)=>{

            this.listLayer.y-=deltaY*0.5;

            const limit=Math.min(0,-(this.NPCs.length*this.rowHeight-300));

            this.listLayer.y=Phaser.Math.Clamp(this.listLayer.y,limit,0);
        });

        this.refresh();

        return this.container;
    }
    refresh(){
        this.renderNPCList(-250);
        this.renderFixedFooter(-250);

        this.renderDetailPanel(230);
    }
    renderNPCList(centerX){
        this.listLayer.removeAll(true);

        const startY=-180;

        this.NPCs.forEach((npc,index)=>{
            const y=startY+(index*this.rowHeight);

            const isSelected=this.selectedNPC&& this.selectedNPC.id===npc.id;
            const row=this.uiScene.add.container(centerX,y);

            const bg=this.uiScene.add.rectangle(0,0,this.listWidth-20,80,
                isSelected? 0x3498db: 0xffffff,
                isSelected? 0.2: 0.8
            ).setStrokeStyle(2,isSelected? 0x3498db:0xaaaaaa).setInteractive({useHandCursor:true});

            const statusColors={'idle':'#666','working':'#e67e22','finished':'2ecc71'};
            const statusTexts={'idle':'待機中','working':'仕事中...','finished':'完了！'};

            const nameText=this.uiScene.add.text(-180,-25,npc.name,{
                fontSize:'24px',
                color:'#000',
                fontStyle:'bold'
            });

            const statusInfo=this.uiScene.add.text(-180,5,statusTexts[npc.status],{
                fonstSize:'24px',
                color:'#000',
                backgrounColor:statusColors[npc.status],
                psdding:{x:5,y:2}
            });

            const wageInfo=this.uiScene.add.text(50,5,`賃金：${npc.wage}G`,{
                fontSize:'18px',
                color:'#444'
            });

            bg.on('pointerdown',()=>{
                this.selectedNPC=npc;

                this.refresh();
            });

            row.add([bg,nameText,statusInfo,wageInfo]);
            this.listLayer.add(row);
        });
    }
    renderFixedFooter(centerX){
        this.fixedLayer.removeAll(true);

        const footerY=210;

        const button=this.uiScene.add.rectangle(centerX,footerY,this.listWidth-20,70,0x2c3e50)
            .setInteractive({useHandCursor:true});

        const text=this.uiScene.add.text(centerX,footerY,'+ 新しいNPCを雇う',{
            fontSize:'22px',
            color:'#fff',
            fontStyle:'bold'
        }).setOrigin(0.5);

        button.on('pointerdown',()=>{
            //追加画面に行く
        });

        this.fixedLayer.add(button,text);
    }
    renderDetailPanel(centerX){
        this.detailLayer.removeAll(true);

        const panelBg=this.uiScene.add.rectangle(centerX,0,400,500,0xf9f9f9,0.9)
            .setStrokeStyle(2,0x333333);
        this.detailLayer.add(panelBg);

        if(!this.selectedNPC){
            this.detailLayer.add(this.uiScene.add.text(centerX,0,'NPCを選択してください',{
                color:'#888'
            }));

            return;
        }

        const npc=this.selectedNPC;

        const npcName=this.uiScene.add.text(centerX,-220,`${npc.name}の管理`,{
            fontSize:'32px',
            color:'#000',
            fontStyle:'bold'
        }).setOrigin(0.5);

        const npcWage=this.uiScene.add.text(centerX,-220,`$賃金：{npc.wage}`,{
            fontSize:'32px',
            color:'#000',
            fontStyle:'bold'
        })

        this.detailLayer.add([npcName,npcWage])

        //後で追加
        const upBtn=this.uiScene.add.text(centerX+100,-120,'＋',{
            fontSize:'30px',
            color:'#2ecc71'
        }).setInteractive({useHandCursor:true});

        upBtn.on('pointerdown',()=>{
            npc.wage+=50;

            this.refresh();
        });

        const downBtn=this.uiScene.add.text(centerX+150,-120,'－',{
            fontSize:'30px',
            color:'#e74c3c'
        }).setInteractive({useHandCursor:true});

        downBtn.on('pointerdown',()=>{
            npc.wage=Math.max(0,npc.wage-50);

            this.refresh();
        });

        this.detailLayer.add([upBtn,downBtn]);
    }

}