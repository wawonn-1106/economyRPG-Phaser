export default class ProfileContent{
    constructor(scene,x,y){
        this.scene=scene;

        /*this.container=this.scene.add.container(0,0);
        this.graphics=this.scene.add.graphics();
        this.container.add(this.graphics);

        this.statLabels=[];
        
        this.setVisible(false);*/
        this.chartTarget=null;
        //this.drawRadarChart();
    }
    /*updatePosition(){
        if(!this.container.visible || !this.chartTarget)return;

        //const target=document.getElementById('radar-chart-container');

        const rect=this.chartTarget.getBoundingClientRect();

        this.container.setPosition(
            rect.left+rect.width/2,
            rect.top+rect.height/2
        );
    }
    setVisible(visible){
        this.container.setVisible(visible);

        if(visible){
            this.drawRadarChart();
            this.updatePosition();
        }
    }*/
    createElement(){
        const container=document.createElement('div');
        container.classList.add('profile-container');


        const nameDisplay=document.createElement('span');
        nameDisplay.textContent=this.scene.player.name;

        //編集の時の入力欄
        const input=document.createElement('input');
        input.value=this.scene.player.name;
        input.classList.add('hidden');

        //保存ボタン
        const saveBtn=document.createElement('button');
        saveBtn.textContent='保存';
        saveBtn.classList.add('hidden');

        //編集開始ボタン
        const editBtn=document.createElement('button');
        editBtn.textContent='編集';

        //グラフの入れ物
        const chartContainer=document.createElement('div');
        chartContainer.classList.add('radar-chart-container');
        this.chartTarget = chartContainer;

        editBtn.onclick=()=>{
            nameDisplay.classList.add('hidden');
            editBtn.classList.add('hidden');
            saveBtn.classList.remove('hidden');
            input.classList.remove('hidden');
            input.focus();
        }

        saveBtn.onclick=()=>{
            const newName=input.value.trim();

            if(newName){
                this.scene.player.name=newName;
                nameDisplay.textContent=newName;

                this.drawRadarChart();
            }
            nameDisplay.classList.remove('hidden');
            editBtn.classList.remove('hidden');
            saveBtn.classList.add('hidden');
            input.classList.add('hidden');
        }

        container.appendChild(input);
        container.appendChild(saveBtn);
        container.appendChild(editBtn);
        container.appendChild(nameDisplay);
        container.appendChild(chartContainer);
        //if(input.value.trim()==='尾道') 満たしていたら５V

        return container;

    }
    drawRadarChart(){
        if(!this.chartTarget) return;

        this.chartTarget.innerHTML='';

        const canvas=document.createElement('canvas');
        const size=250;
        canvas.width=size;
        canvas.height=size;
        const ctx=canvas.getContext('2d');
        const center=size/2;

        const manager=this.scene.profileManager;
        const stats=this.scene.player.stats;
        const radius=80;

        const bgPoints=manager.getPoints(radius,null);
        const pPoints=manager.getPoints(radius,stats);

        const maxRadius = 80;

        ctx.translate(center,center);

        ctx.strokeStyle = '#eeeeee'; // 薄いグレー
        ctx.lineWidth = 1;

    
        [5, 10, 15, 20, 25].forEach(val => {
            // 各段階の半径を計算
            const r = (val / 25) * maxRadius;
            const points = manager.getPoints(r, null);

            ctx.beginPath();
            points.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.stroke();

            if (val === 25) {
                points.forEach(p => {
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.lineTo(p.x, p.y);
                    ctx.strokeStyle = '#dddddd';
                    ctx.stroke();
                });
            }
        });

        ctx.beginPath();
        bgPoints.forEach((p,i)=>i===0 ? ctx.moveTo(p.x,p.y):ctx.lineTo(p.x,p.y));
        ctx.closePath();
        ctx.strokeStyle='#ccc';
        ctx.stroke();

        ctx.beginPath();
        pPoints.forEach((p, i) => i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y));
        ctx.closePath();
        ctx.fillStyle = 'rgba(51, 255, 51, 0.5)';
        ctx.fill();
        ctx.strokeStyle = '#33ff33';
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        manager.statList.forEach((s, i) => {
            const p = bgPoints[i];
            ctx.fillText(s.label, p.x * 1.3, p.y * 1.3);
        });

        this.chartTarget.appendChild(canvas);




        /*this.graphics.clear();

        this.statLabels.forEach(label=>label.destroy());
        this.statLabels=[];

        const manager=this.scene.profileManager;
        const stats=this.scene.player.stats;
        const radius=100;

        const bgPoints=manager.getPoints(radius,null);
        const pPoints=manager.getPoints(radius,stats);

        this.graphics.lineStyle(1,0x000000,0.3).strokePoints(bgPoints,true);//黒
        this.graphics.fillStyle(0x33ff33,0.5).lineStyle(2,0x33ff33,1);//緑
        this.graphics.beginPath().moveTo(pPoints[0].x,pPoints[0].y);
        pPoints.forEach(p=>this.graphics.lineTo(p.x,p.y));
        this.graphics.closePath().fillPath().strokePath();

        manager.statList.forEach((s,i)=>{
            const p=bgPoints[i];

            const labelX=p.x*1.2;
            const labelY=p.y*1.2;

            const txt=this.scene.add.text(labelX,labelY,s.label,{
                fontSize:'14px',
                color:'black',
                align:'center'
            }).setOrigin(0.5);//どの個体値か

            this.container.add(txt);
            this.statLabels.push(txt);
        });*/

    }
}