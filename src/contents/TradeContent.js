export default class TradeContent{
    constructor(uiScene){
        this.uiScene=uiScene;

        this.tradeScene=null;
        this.npcMarkers=[];

        //console.log("渡された tradeScene:",tradeScene);
    }
    createView(){
        this.container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);
        this.container.add(bg);

        // Tradeシーンを取得
        this.tradeScene = this.uiScene.scene.get('Trade');

        if(this.tradeScene&& this.tradeScene.activeTraders){
            
            const worldWidth=this.tradeScene.map.widthInPixels;
            const worldHeight=this.tradeScene.map.heightInPixels;
            const menuWidth=1000;
            const menuHeight=600;

            this.tradeScene.activeTraders.forEach(npc => {
            
                const initialX=(npc.x/worldWidth)*menuWidth-(menuWidth/2);
                const initialY=(npc.y/worldHeight)*menuHeight-(menuHeight/2);

                const marker=this.uiScene.add.circle(initialX,initialY,20,0xff0000);
                marker.setStrokeStyle(1,0xffffff);
                marker.setDepth(100);

                this.container.add(marker);
                this.npcMarkers.push({marker:marker,reference:npc});
            });
        }

        return this.container;
    }
    update(){
        if(!this.tradeScene||!this.npcMarkers.length)return;

        const worldWidth=this.tradeScene.map.widthInPixels;
        const worldHeight=this.tradeScene.map.heightInPixels;

        const menuWidth=1000;
        const menuHeight=600;

        this.npcMarkers.forEach(obj=>{
            const targetX=(obj.reference.x/worldWidth)*menuWidth-(menuWidth/2);
            const targetY=(obj.reference.y/worldHeight)*menuHeight-(menuHeight/2);

            obj.marker.x=targetX;
            obj.marker.y=targetY;
        });
    }
}