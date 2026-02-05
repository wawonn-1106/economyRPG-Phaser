export default class DictionaryManager{
    constructor(scene){
        this.scene=scene;
    }
    getTerms(){
        const data=this.scene.cache.json.get('termsData');

        return data ? data.terms : [];
    }
    getTermByWord(wordName){//クリックした単語と同じのを探す
        const terms=this.getTerms();

        return terms.find(term=>term.word===wordName);
    }
}