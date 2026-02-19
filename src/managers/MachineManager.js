export default class MachineManager{
    constructor(scene){
        this.scene=scene;

        const recipesData=this.scene.cache.json.get('recipesData');
        this.recipes=recipesData? recipesData.recipes:[];

    }
    canCraft(recipe,inventoryData){
        //const recipe=this.recipes.find(r=>r.id===recipeId);
        this.unlocked=this.scene.registry.get('unlockedRecipes')||[];
        //this.inventoryData=this.scene.registry.get('inventoryData')||[];
        //this.allRecipes=this.scene.cache.json.get('recipesData').recipes;
        const isUnlocked=this.unlocked.includes(recipe.id);

        //if(!isUnlocked)return-1;

        let missingCount=0; 

        recipe.ingredients.forEach(ingredient=>{
            const heldItem=inventoryData.find(item=>item.id===ingredient.itemId);

            if(!heldItem|| heldItem.count<ingredient.count){
                missingCount++;
            }
        });

        return {missingCount,isUnlocked};//レシピの材料の種類から足りない個数を渡す。
        
    }
    tryCraft(recipe){//recpeで何を作ったか特定かな？
        //const quality=this.calculateQuality(rank);
        let invData=this.scene.registry.get('inventoryData')||[];

        recipe.ingredients.forEach(ingredient=>{
            const item=invData.find(i=>i.id===ingredient.itemId);

            if(item){
                item.count-=ingredient.count;
            }
        });

        invData=invData.filter(item=>item.count>0);

        const craftItem=invData.find(i=>i.id===recipe.id);

        if(craftItem){
            craftItem.count++;
        }else{
            invData.push({id:recipe.id,count:1});
        }

        this.scene.registry.set('inventoryData',invData);

        console.log(`${recipe.name}を作成しました`);

        this.unlock(recipe.id);

        return true;
    }
    async unlock(recipeName){
        let unlocked=this.scene.registry.get('unlockedRecipes')||[];

        if(!unlocked.includes(recipeName)){
            unlocked.push(recipeName);

            this.scene.registry.set('unlockedRecipes',unlocked);
            console.log('新レシピ解放！:'+recipeName);

            await this.scene.saveGameData();
        }
    }
}