export default class DonationContent {
    constructor(uiScene){
        this.uiScene=uiScene;

        this.container=null;
        this.infoLayer=null;
        this.timer=null;
    }


    createView(){
        this.container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.container.add(bg);

        this.infoLayer=this.uiScene.add.container(0,0);
        this.container.add(this.infoLayer);

        const closeBtn=this.uiScene.add.text(480,-280,'×',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        closeBtn.on('pointerdown',()=>{
            this.uiScene.menuManager.closeMenu();
        });

        this.container.add(closeBtn);

        this.refresh();

        this.timer=this.uiScene.time.addEvent({
            delay:1000,
            callback:()=>this.refresh(),
            loop:true
        });

        return this.container;
    }


    refresh(){
        this.infoLayer.removeAll(true);

        const targetAmount=50000;
        const donationData=this.uiScene.registry.get('bridgeDonation')||0;
        const gameTime=this.uiScene.registry.get('gameTime')||{day:1,hour:0};

        if(donationData && donationData.processedCount<14){
            let isUpdated=false;

            if(gameTime.hour>=12 && gameTime.hour<24 && !donationData.isNoonProcessed){
                this.applyScheduledDonation(donationData);
                donationData.isNoonProcessed=true;
                isUpdated=true;
            }

            if(gameTime.hour>=0 && gameTime.hour<12 && donationData.lastUpdateDay!==gameTime.day){
                this.applyScheduledDonation(donationData);
                donationData.lastUpdateDay=gameTime.day;
                donationData.isNoonProcessed=false;
                isUpdated=true;
            }

            if(isUpdated){
                this.uiScene.registry.set('bridgeDonation',donationData);
            }
        }

        const totalCurrent=donationData?.playerContributed+donationData.othersContributed;
        const progress=Math.min(1,totalCurrent/targetAmount);

        const title=this.uiScene.add.text(0,-200,'橋の再建基金受付',{
            fontSize:'32px',
            color:'#000',
            fontStyle:'bold'
        }).setOrigin(0.5);

        // 進行度バー
        const barBg=this.uiScene.add.rectangle(0,-110,600,50,0x000000,0.2);
        const bar=this.uiScene.add.rectangle(-300,-110,600*progress,50,0x2ecc71).setOrigin(0,0.5);
        const barText=this.uiScene.add.text(0,-110,`${Math.floor(progress*100)}% (${totalCurrent} / ${targetAmount} G)`,{
            fontSize:'22px',
            color:'#fff',
            stroke:'#000',
            strokeThickness:2
        }).setOrigin(0.5);

        // あなたの寄付額だけを表示
        const playerInfo=this.uiScene.add.text(0,0,`あなたの寄付合計: ${donationData.playerContributed} G`,{
            fontSize:'26px',
            color:'#2c3e50',
            fontStyle:'bold',
            backgroundColor:'#ffffff66',
            padding:{x:10,y:5}
        }).setOrigin(0.5);

        this.infoLayer.add([title,barBg,bar,barText,playerInfo]);

        this.renderDonationButtons(donationData);
    }


    applyScheduledDonation(data){
        const idx=data.processedCount;
        if(data.donationSchedules && data.donationSchedules[idx]!==undefined){
            data.othersContributed+=data.donationSchedules[idx];
            data.processedCount++;
        }
    }


    renderDonationButtons(data){
        const amounts=[100,1000,5000];
        const money=this.uiScene.registry.get('money')||0;

        amounts.forEach((amt,i)=>{
            const x=(i-1)*200;
            const y=140;

            const btn=this.uiScene.add.rectangle(x,y,160,60,money>=amt? 0xe67e22:0x95a5a6).setInteractive({useHandCursor:money>=amt});
            const txt=this.uiScene.add.text(x,y,`${amt}G 寄付`,{fontSize:'20px',color:'#fff'}).setOrigin(0.5);

            btn.on('pointerdown',()=>{
                if(money>=amt){
                    this.donate(amt,data);
                }
            });

            this.infoLayer.add([btn,txt]);
        });

        const goldText=this.uiScene.add.text(0,230,`所持金: ${money} G`,{
            fontSize:'24px',
            color:'#b33939',
            fontStyle:'bold'
        }).setOrigin(0.5);
        
        this.infoLayer.add(goldText);
    }


    donate(amount,data){
        let money=this.uiScene.registry.get('money');
        money-=amount;
        data.playerContributed+=amount;

        this.uiScene.registry.set('money',money);
        this.uiScene.registry.set('bridge_donation_data',data);

        this.refresh();
    }


    destroy(){
        if(this.timer){
            this.timer.remove();
        }
    }
}