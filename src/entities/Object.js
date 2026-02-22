/*import ShopContent from '../contents/ShopContent.js';

export default class Object{
    constructor(scene){
        this.scene=scene;
    }
    create(object){
        const {x,y,width,height,name,properties}=object;

        const centerX=x+width/2;
        const centerY=y+height/2;

        let interactable={
            type:name,
            x:centerX,
            y:centerY,
            data:object
        };

        switch(name){
            case 'displayShelf':
                const shelfId=properties?.find(p=>p.name==='shelfId')?.value;

                const ui=this.scene.scene.get('UIScene');

                const shelfLogic=new ShopContent(ui,this.scene.menuManager,shelfId);

                this.scene.allShelves.push(shelfLogic);
                interactable.shelfId=shelfId;

                break;
            case 'machine':

                break;
            case 'door':
            case 'exit':
                interactable.targetScene=properties?.find(p=>p.name==='target')?.value;
                interactable.spawnPoint=properties?.find(p=>p.name==='spawnPoint')?.value;
                break;
        }
        return interactable;
    }
}*/