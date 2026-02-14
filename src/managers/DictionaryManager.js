export default class DictionaryManager{
    constructor(scene){//BaseScene
        this.scene=scene;
    }
    /*getTerms(){
        const data=this.scene.cache.json.get('termsData');

        return data ? data.terms : [];
    }*///→DictionaryContentでやるように変更
    getTermByWord(wordName){//クリックした単語と同じのを探す
        const terms=this.getTerms();

        return terms.find(term=>term.word===wordName);
    }
    async unlock(termId){
        let unlocked=this.scene.registry.get('unlockedIds')||[];

        if(!unlocked.includes(termId)){
            unlocked.push(termId);

            this.scene.registry.set('unlockedIds',unlocked);
            console.log('新用語解法！:'+termId);

            await this.scene.saveGameData();
        }
    }
}