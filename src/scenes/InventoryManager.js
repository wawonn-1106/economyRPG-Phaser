export default class Inventory{
    constructor(){
        this.isOpenInv=false;

        this.inventoryEl=document.getElementById('inventory');
        this.itemListEl=document.getElementById('inventory-item');
    }
    openInventory(items){
        items.forEach((item)=>{
            const li=document.createElement('li');
            
            
        });
    }
    closeInventory(){
        this.isOpenInv=false;
        this.inventoryEl.classList.add('hidden');
    }
}