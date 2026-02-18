import MachineManager from "../managers/MachineManager.js";

export default class MachineContent{
    constructor(uiScene){
        this.uiScene=uiScene;
        this.worldScene=this.uiScene.scene.get('World');
        this.machineManager=new MachineManager(this.uiScene);

        this.selectedRecipe=null;
        this.currentCategory='food';

        this.listWidth=400;
        this.listHeight=450;
        this.rowHeight=70;

        this.container=null;
        this.categoryLayer=null;
        this.listLayer=null;
        this.detailLayer=null;
    }

    createView(){
        this.container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.container.add(bg);

        this.categoryLayer=this.uiScene.add.container(0,0);
        this.listLayer=this.uiScene.add.container(0,0);
        this.detailLayer=this.uiScene.add.container(0,0);
        this.container.add([this.categoryLayer,this.listLayer,this.detailLayer]);

        const closeBtn=this.uiScene.add.text(480,-280,'×',{
            fontSize:'60px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        closeBtn.on('pointerdown',()=>this.uiScene.menuManager.closeMenu());

        /*const backBtn=this.uiScene.add.text(440,-285,'←',{
            fontSize:'55px',
            color:'#000'
        }).setOrigin(0.5).setInteractive({useHandCursor:true});

        backBtn.on('pointerdown',()=>this.uiScene.menuManager.toggle('menu'));*/

        this.container.add(closeBtn);

        const maskShape=this.uiScene.make.graphics();
        maskShape.fillStyle(0xffffff);
        const cam=this.uiScene.cameras.main;
        maskShape.fillRect(cam.centerX-460,cam.centerY-220,this.listWidth,this.listHeight);
        this.listLayer.setMask(maskShape.createGeometryMask());

        this.refresh();

        this.uiScene.input.on('wheel',(pointer,gameObjects,deltaX,deltaY)=>{
            this.listLayer.y-=deltaY*0.5;
            this.listLayer.y=Phaser.Math.Clamp(this.listLayer.y,-300,0);
        });

        return this.container;
    }

    refresh(){
        this.renderCategoryButtons(-200);
        this.renderRecipeList(-200);
        this.renderDetailPanel(250);
    }

    renderCategoryButtons(centerX){
        this.categoryLayer.removeAll(true);

        const categories=[
            {id:'food',name:'食品'},
            {id:'furniture',name:'家具'},
            {id:'tool',name:'道具'}
        ];

        categories.forEach((cat,i)=>{
            const x=(centerX-150)+(i*105);
            const y=-260;
            const isActive=this.currentCategory===cat.id;

            const btn=this.uiScene.add.text(x,y,cat.name,{
                fontSize:'20px',
                color:'#fff',
                backgroundColor:isActive?'#333':'#999',
                padding:{x:10,y:5}
            }).setInteractive({useHandCursor:true});

            btn.on('pointerdown',()=>{
                this.currentCategory=cat.id;
                this.selectedRecipe=null;
                this.listLayer.y=0;
                this.refresh();
            });
            this.categoryLayer.add(btn);
        });
    }

    renderRecipeList(centerX){
        this.listLayer.removeAll(true);
        const invData=this.worldScene.inventoryData;
        const filtered=this.machineManager.recipes.filter(r=>r.category===this.currentCategory);

        const startY=-220;

        filtered.forEach((recipe,index)=>{
            const missingCount=this.machineManager.canCraft(recipe,invData);
            if(missingCount>=2)return;

            const y=startY+(index*this.rowHeight);
            const row=this.uiScene.add.container(0,0);

            const isSelected=this.selectedRecipe&&this.selectedRecipe.id===recipe.id;
            
            const bg=this.uiScene.add.rectangle(centerX,y+30,this.listWidth-20,60,
                isSelected?0xffff00:0x000000,
                isSelected?0.3:0.1
            ).setInteractive({useHandCursor:true});

            const icon=this.uiScene.add.image(centerX-160,y+30,recipe.id).setDisplaySize(50,50);

            const nameText=this.uiScene.add.text(centerX-120,y+15,recipe.name,{
                fontSize:'22px',
                color:'#000',
                fontWeight:isSelected?'bold':'normal'
            });

            if(missingCount===1)row.setAlpha(0.5);

            bg.on('pointerdown',()=>{
                this.selectedRecipe=recipe;
                this.refresh();
            });

            row.add([bg,icon,nameText]);
            this.listLayer.add(row);
        });
    }

    renderDetailPanel(centerX){
        this.detailLayer.removeAll(true);

        const panelBg=this.uiScene.add.rectangle(centerX,0,380,500,0xffffff,0.3).setStrokeStyle(2,0x000000);
        this.detailLayer.add(panelBg);

        if(!this.selectedRecipe){
            this.detailLayer.add(this.uiScene.add.text(centerX,0,'レシピを選択してください',{
                fontSize:'20px',
                color:'#000'
            }).setOrigin(0.5));
            return;
        }

        const recipe=this.selectedRecipe;
        
        const title=this.uiScene.add.text(centerX,-220,recipe.name,{
            fontSize:'32px',
            color:'#000',
            fontWeight:'bold'
        }).setOrigin(0.5);

        const icon=this.uiScene.add.image(centerX,-100,recipe.id).setDisplaySize(140,140);

        recipe.ingredients.forEach((ing,i)=>{
            const ingY=20+(i*35);
            const ingText=this.uiScene.add.text(centerX-170,ingY,`・${ing.name} x ${ing.amount}`,{
                fontSize:'20px',
                color:'#333'
            });
            this.detailLayer.add(ingText);
        });

        const craftBtn=this.uiScene.add.container(centerX,200);
        const btnBg=this.uiScene.add.rectangle(0,0,250,60,0x2ecc71)
            .setInteractive({useHandCursor:true});

        const btnText=this.uiScene.add.text(0,0,'加工を開始',{
            fontSize:'26px',
            color:'#fff'
        }).setOrigin(0.5);
        
        craftBtn.add([btnBg,btnText]);
        btnBg.on('pointerdown',()=>{

            const playerData=this.uiScene.cache.json.get('playerData');

            this.machineManager.tryCraft(recipe,playerData.statsList.processing);
            this.refresh();
        });

        this.detailLayer.add([title,icon,craftBtn]);
    }
}