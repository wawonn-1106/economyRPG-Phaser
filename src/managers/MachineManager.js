export default class MachineManager{
    constructor(scene){
        this.scene=scene;

        this.recipes=this.scene.cache.json.get('recipesData').recipes;
    }
    canCraft(recipe,inventoryData){
        //const recipe=this.recipes.find(r=>r.id===recipeId);
        let missingCount=0;

        recipe.ingredients.forEach(ingredient=>{
            const heldItem=inventoryData.find(item=>item.id===ingredient.itemId);

            if(!heldItem|| heldItem.count<ingredient.count){
                missingCount++;
            }
        });

        return missingCount;//レシピの材料の種類から足りない個数を渡す。
        
    }
    calculateQuality(rank){//加工の成功率を計算、粗悪品、普通品、高品質の三段階
        //const baseRate=parseFloat(process.env.SUCCESS_BASE_RATE);
        const baseRate=parseFloat(12);

        let bonus=0;
        /*switch(rank){
            case '5':
                bonus=parseFloat(process.env.BONUS_RANK_5);
                break;
            case '4':
                bonus=parseFloat(process.env.BONUS_RANK_4);
                break;
            case '3':
                bonus=parseFloat(process.env.BONUS_RANK_3);
                break;
            case '2':
                bonus=parseFloat(process.env.BONUS_RANK_2);
                break;
            case '1':
                bonus=parseFloat(process.env.BONUS_RANK_1);
                break;
        }*///process.env使えなかったからいったんこれで↓。出力はできたからok。
        switch(rank){
            case '5':
                bonus=parseFloat(12);
                break;
            case '4':
                bonus=parseFloat(12);
                break;
            case '3':
                bonus=parseFloat(12);
                break;
            case '2':
                bonus=parseFloat(12);
                break;
            case '1':
                bonus=parseFloat(12);
                break;
        }

        const qualityCheck=Math.max(0,Math.min(1,baseRate+bonus));//最小０、最大１に調整;
        const dice=Math.random();

        if(dice<qualityCheck){//↑でサイコロふって、それより大きいかどうかで分ける
            return {id:'hight',name:'高品質'};
        }else if(dice<qualityCheck+(1-qualityCheck)/2){
            return {id:'normal',name:'普通'};
        }else{
            return {id:'bad',name:'粗悪品'};
        }
    }
    tryCraft(recipe,rank){//recpeで何を作ったか特定かな？
        const quality=this.calculateQuality(rank);

        return quality;
    }
}