export default class Inventory{
    constructor(){
        this.isOpenInv=false;

        this.inventoryEl=document.getElementById('inventory');
        this.itemListEl=document.getElementById('inventory-item');
    }
    openInventory(items){
        items.forEach((item)=>{
            this.listEl.innerHTML='';

            const li=document.createElement('li');
            li.setAttribute('data-id',item.id);

            const stars='★'.repeat(item.realQuality)+'☆'.repeat(3-item.realQuality);
            li.textContent=`${item.name}[品質:stars]×${item.count}`;
            //品質は星で表す

            li.onclick=(e)=>{
                const id=e.currentTarget.getAttribute('data-id');
                //クリックしたアイテムの特定
                const clickedItem=item.find(i=>i.id===id);
            }
            this.listEl.appendChild(li);
        });
    }
    closeInventory(){
        this.isOpenInv=false;
        this.inventoryEl.classList.add('hidden');
    }
}