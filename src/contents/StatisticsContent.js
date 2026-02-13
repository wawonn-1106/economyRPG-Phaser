export default class RankingContent{
    constructor(uiScene){
        this.uiScene=uiScene;

        this.currentTab='sales';
        this.tabButtons=[];
        this.axisLabels=[];

        this.statsData={
            sales:{
                label:'売上推移',
                unit:'G',
                history:[1200,2100,2000,2400,1000,1500,2300]
            },
            reviews:{
                label:'口コミ評価推移',
                unit:'★',
                history:[3,2.4,4,3.6,4,2,3.7]
            }
        }
    }
    createView(){
        this.mainContainer=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.mainContainer.add(bg);
        
        const title=this.uiScene.add.text(0,-260,'統計レポート',{
            fontSize:'32px',
            color:'#000000',
            fontStyle:'bold',
            padding: {top:10}
        }).setOrigin(0.5);

        this.mainContainer.add(title);

        this.chartGraphics=this.uiScene.add.graphics();
        this.mainContainer.add(this.chartGraphics);

        const tabs=[
            {id:'sales',label:'売上推移'},
            {id:'reviews',label:'口コミ評価推移'},
        ];

        tabs.forEach((tabInfo,index)=>{
            const x=-150+(index*300);
            const isSelected=this.currentTab===tabInfo.id;

            const tabText=this.uiScene.add.text(x,-200,tabInfo.label,{
                fontSize:'24px',
                color:isSelected? '#000000': '#666666',
                fontStyle:'bold'
            }).setOrigin(0.5).setInteractive({useHandCursor:true});

            const line=this.uiScene.add.rectangle(x,-180,100,4,0x0000ff).setVisible(isSelected);

            this.tabButtons.push({id:tabInfo.id,text:tabText,line:line});

            tabText.on('pointerdown',()=>{
                this.currentTab=tabInfo.id;

                //this.refreshRanking(scrollContainer);

                this.tabButtons.forEach(btn=>{
                    const active=(btn.id===this.currentTab);

                    btn.text.setColor(active? '#0000ff':'#666666');
                    btn.line.setVisible(active);

                    this.drawChart();
                });                
            });
            this.mainContainer.add([tabText,line]);

            
        });
        
        this.drawChart();

        return this.mainContainer;;
    }
    drawChart(){
        this.chartGraphics.clear();

        if(this.axisLabels)this.axisLabels.forEach(l=>l.destroy());
        this.axisLabels=[];

        const data=this.statsData[this.currentTab];
        const history=data.history;
        
        const max=Math.max(...history);
        const min=Math.min(...history);
        const avg=history.reduce((a,b)=>a+b)/history.length;

        const range=max-min||1;
        const displayMax=max+range*0.2;
        const displayMin=Math.max(0,min-range*0.2);
        const displayRange=displayMax-displayMin;

        const chartWidth=800;
        const chartHeight=300;
        
        const startX=-chartWidth/2;
        const startY=150;

        this.chartGraphics.lineStyle(2,0x888888,1);
        this.chartGraphics.strokeRect(startX,startY-chartHeight,chartWidth,chartHeight);

        const avgY=startY-(avg-displayMin)/displayRange*chartHeight;

        this.chartGraphics.lineStyle(2,0xff0000,0.4);
        this.drawDashedLine(startX,avgY,startX+chartWidth,avgY,10);

        const avgLabel=this.uiScene.add.text(startX+chartWidth-5,avgY-10,`平均:${avg.toFixed(1)}`,{
            fontSize:'14px',
            color:'#ff0000'
        }).setOrigin(1,0.5);
        this.mainContainer.add(avgLabel);
        this.axisLabels.push(avgLabel);

        const stepX=chartWidth/(history.length-1);

        //this.chartGraphics.lineStyle(3,0x0000ff,1);

        history.forEach((val,index)=>{
            const px=startX+(index*stepX);
            const py=startY-((val-displayMin)/displayRange*chartHeight);

            this.chartGraphics.lineStyle(3,0x0000ff,1);

            if(index>0){
                const prevX=startX+((index-1)*stepX);
                const prevY=startY-((history[index-1]-displayMin)/displayRange*chartHeight);

                this.chartGraphics.lineBetween(prevX,prevY,px,py);
            }

            this.chartGraphics.fillStyle(0x0000ff,1);
            this.chartGraphics.fillCircle(px,py,6);

            const dataLabel=this.uiScene.add.text(px,startY+20,`${index+1}日`,{
                fontSize:'14px',
                color:'#000000'
            }).setOrigin(0.5);

            const valLabel=this.uiScene.add.text(px,py-20,`${val}${data.unit}`,{
                fontSize:'16px',
                color:'#000000',
                fontStyle:'bold'
            }).setOrigin(0.5);

            this.mainContainer.add([dataLabel,valLabel]);
            this.axisLabels.push(dataLabel,valLabel);
        });
    }
    drawDashedLine(x1,y1,x2,y2,dashLength){
        const length=Phaser.Math.Distance.Between(x1,y1,x2,y2);

        const steps=length/dashLength;

        for(let i=0;i<steps;i++){
            if(i%2===0){
                const t1=i/steps;
                const t2=(i+1)/steps;

                this.chartGraphics.lineBetween(
                    Phaser.Math.Interpolation.Linear([x1,x2],t1),
                    Phaser.Math.Interpolation.Linear([y1,y2],t1),
                    Phaser.Math.Interpolation.Linear([x1,x2],t2),
                    Phaser.Math.Interpolation.Linear([y1,y2],t2),
                );
            }
        }

    
    }

}