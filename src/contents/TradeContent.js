export default class TradeContent{
    constructor(uiScene){
        this.uiScene=uiScene;

        this.selectedNPC=null;
        this.isSelectingNewNPC=false;
        this.hireIndex=0;
        
        this.traders=[
            {id:'npc1',name:'ヤーコン村',status:'idle',target:'',wage:500},
            {id:'npc2',name:'縄文',status:'idle',target:'木材',wage:500},
            {id:'npc3',name:'明治',status:'idle',target:'石材',wage:500},
            {id:'npc4',name:'令和',status:'idle',target:'ランダム',wage:500},
        ];

        this.tradeCandidates=[
            {id:'player',name:'ガンテツ',wage:600,description:'石材収集が得意なベテラン'},
            {id:'player',name:'カスミ',wage:500,description:'のんびり屋'},
            {id:'player',name:'グリーン',wage:800,description:'素早い動きが自慢の少年'},
            {id:'player',name:'タケシ',wage:450,description:'ガッツの溢れる働き者'},
        ];

        this.listWidth=420;
        this.listHeight=450;
        this.rowHeight=90;

        this.container=null;
        this.listLayer=null;
        this.detailLayer=null;

        this.listMask=null;
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

        maskShape.fillRect(camera.centerX-430,camera.centerY-220,this.listWidth,360);
        //this.listLayer.setMask(maskShape.createGeometryMask());
        this.listMask = maskShape.createGeometryMask();

        this.uiScene.input.on('wheel',(pointer,gameObjects,deltaX,deltaY)=>{

            this.listLayer.y-=deltaY*0.5;

            const limit=Math.min(0,-(this.traders.length*this.rowHeight-300));

            this.listLayer.y=Phaser.Math.Clamp(this.listLayer.y,limit,0);
        });

        this.refresh();

        return this.container;
    }
    refresh(){
        this.listLayer.removeAll(true);
        this.fixedLayer.removeAll(true);
        this.detailLayer.removeAll(true);
        this.listLayer.y=0;

        if(this.isSelectingNewNPC){
            this.listLayer.setMask(null);
            this.renderHireCarousel(0);
        }else{
            if(this.listMask){
                this.listLayer.setMask(this.listMask);
            }
            //this.listLayer.setMask(this.listMask.createGeometryMask());

            this.renderNPCList(-210);
            this.renderFixedFooter(-210);
            this.renderDetailPanel(250);
        }
    }
    renderNPCList(centerX){
        this.listLayer.removeAll(true);

        const startY=-180;

        this.traders.forEach((npc,index)=>{
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
                fontSize:'24px',
                color:'#000',
                backgroundColor:statusColors[npc.status],
                padding:{x:5,y:2}
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

        const footerY=220;

        const button=this.uiScene.add.rectangle(centerX,footerY,this.listWidth-20,70,0x2c3e50)
            .setInteractive({useHandCursor:true});

        const text=this.uiScene.add.text(centerX,footerY,'+ 新しい交易を始める',{
            fontSize:'22px',
            color:'#fff',
            fontStyle:'bold'
        }).setOrigin(0.5);

        button.on('pointerdown',()=>{
            this.isSelectingNewNPC=true;
            this.refresh();
        });

        this.fixedLayer.add([button,text]);
    }
    renderDetailPanel(centerX){
        this.detailLayer.removeAll(true);

        const panelBg=this.uiScene.add.rectangle(centerX,0,380,500,0xffffff,0.3)
            .setStrokeStyle(2,0x000000);
        this.detailLayer.add(panelBg);

        if(!this.selectedNPC){
            this.detailLayer.add(this.uiScene.add.text(centerX,0,'NPCを選択してください',{
                color:'#888'
            }));

            return;
        }

        const npc=this.selectedNPC;

        const npcName=this.uiScene.add.text(centerX,-180,`${npc.name}との交易`,{
            fontSize:'32px',
            color:'#000',
            fontStyle:'bold'
        }).setOrigin(0.5);

        const npcWage=this.uiScene.add.text(centerX-80,-130,`賃金：${npc.wage}`,{
            fontSize:'32px',
            color:'#000',
            fontStyle:'bold'
        })

        this.detailLayer.add([npcName,npcWage])

        //後で追加
        const upBtn=this.uiScene.add.text(centerX+30,-100,'＋',{
            fontSize:'30px',
            color:'#2ecc71'
        }).setInteractive({useHandCursor:true});

        upBtn.on('pointerdown',()=>{
            npc.wage+=50;

            this.refresh();
        });

        const downBtn=this.uiScene.add.text(centerX-80,-100,'－',{
            fontSize:'30px',
            color:'#e74c3c'
        }).setInteractive({useHandCursor:true});

        downBtn.on('pointerdown',()=>{
            npc.wage=Math.max(0,npc.wage-50);

            this.refresh();
        });

        const fireBtn=this.uiScene.add.rectangle(centerX,180,240,50,0x000000,0.1)
            .setStrokeStyle(2,0xe74c3c)
            .setInteractive({ useHandCursor:true});
            
        const fireText=this.uiScene.add.text(centerX,180,'このNPCを解雇する',{
            fontSize:'18px',
            color:'#e74c3c',
            fontStyle:'bold'
        }).setOrigin(0.5);

        fireBtn.on('pointerdown',()=>{
            this.traders=this.traders.filter(n=>n.id!==npc.id);

            this.selectedNPC=null;
            this.refresh();
        });

        this.detailLayer.add([upBtn,downBtn,fireBtn,fireText]);
    }
    renderHireCarousel(centerX){
        const total=this.tradeCandidates.length;

        const displayCandidates=[
            (this.hireIndex-1+total)%total,this.hireIndex,(this.hireIndex+1)%total
        ];

        displayCandidates.forEach((candidateIndex,i)=>{
            const person=this.tradeCandidates[candidateIndex];

            const diff=i-1;

            const x=centerX+(diff*260);
            const isCenter=(diff===0);

            const group=this.uiScene.add.container(x,-60);

            const img=this.uiScene.add.image(0,0,person.id).setDisplaySize(200,280);
            if(isCenter)img.setStrokeStyle&& img.setStrokeStyle(4,0x2ecc71);

            const name=this.uiScene.add.text(0,160,person.name,{
                fontSize:'32px',
                color:'#000',
                fontStyle:'bold'
            }).setOrigin(0.5);

            group.add([img,name]);

            group.setScale(isCenter? 1: 0.6).setAlpha(isCenter? 1: 0.4).setDepth(isCenter? 1:0.5);
            this.listLayer.add(group);
        });

        const leftArrow=this.uiScene.add.text(centerX-380,-60,'<',{
            fontSize:'80px',
            color:'#333'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        const rightArrow=this.uiScene.add.text(centerX+380,-60,'>',{
            fontSize:'80px',
            color:'#333'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        leftArrow.on('pointerdown',()=>{
            this.hireIndex=(this.hireIndex-1+total)%total;

            this.refresh();
        });

        rightArrow.on('pointerdown',()=>{
            this.hireIndex=(this.hireIndex+1)%total;

            this.refresh();
        });

        const current=this.tradeCandidates[this.hireIndex];
        const infoText=this.uiScene.add.text(centerX,140,`${current.description}\n要求賃金：${current.wage}`,{
            fontSize:'20px',
            color:'#333',
            align:'center'
        }).setOrigin(0.5);

        const hireBtn=this.uiScene.add.rectangle(centerX,240,220,60,0x2ecc71)
            .setInteractive({useHandCursor:true});

        const hireTxt=this.uiScene.add.text(centerX,240,'この人を雇う',{
            fontSize:'24px',
            color:'#fff',
            fontStyle:'bold'
        }).setOrigin(0.5);

        hireBtn.on('pointerdown',()=>{
            const newTrader={...current,id:`npc_${Date.now()}`,status:'idle',target:''};

            this.traders.push(newTrader);
            this.selectedNPC=newTrader;

            this.refresh();
        });

        const cancel=this.uiScene.add.text(centerX,280,'キャンセル',{
            fontSize:'18px',
            color:'e74c3c'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        cancel.on('pointerdown',()=>{
            this.isSelectingNewNPC=false;
            this.refresh();
        });

        this.listLayer.add([leftArrow,rightArrow]);
        this.detailLayer.add([infoText,hireBtn,hireTxt,cancel]);
    }

}