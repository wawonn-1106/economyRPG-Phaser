export default class InventoryManager{
    constructor(scene){//なんのsceneかわからん
        this.scene=scene;
    }
    removeItem(itemId){
        this.scene.inventoryData=this.scene.inventoryData.filter(i=>i.id !==itemId);

        if(this.scene.menuManager){
            //WorldのやつだからmenuManagerにもアクセスできる
            this.scene.menuManager.switchTab('inventory');
        }
    }
}