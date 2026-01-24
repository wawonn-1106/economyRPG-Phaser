//import ProfileContent from "../contents/ProfileContent";
export default class ProfileManager{
    constructor(scene){
        this.scene=scene;

        this.statList=[
            {id:'mining',label:'採掘'},
            {id:'fishing',label:'釣り'},
            {id:'farming',label:'農業'},
            {id:'processing',label:'加工'},
            {id:'logging',label:'木こり'},
        ];//↑jsonに書く予定

        //this.profileManager=new ProfileManager(scene); MenuManagerで渡してるからいらんね
    }
    editProfile(){

    }
    saveProfile(){

    }
    getPoints(radius,stats=null){//profileContentで呼ばれる
        //五角形のグラフで個体値を表す
        return this.statList.map((s,i)=>{
            const angle=(Math.PI*2/5)*i-(Math.PI/2);
            //Math.PI*2/5＝360を５分割で72度、-(Math.PI/2)でちょうど時計の12時のとこから描き始める

            const val=stats ? stats[s.id] : 25;
            const r=(val/25)*radius;//中心からの距離を計算する(目盛り)

            return{x:r*Math.cos(angle),y:r*Math.sin(angle)};//cosはx,sinはy
        });
    }
    initTutorialProfile(name){//チュートリアル用の関数(個体値の抽選は最初だけ)
        const player=this.scene.player;
        player.name=name;

        player.stats={};//これをMongoDBに送る。

        //const skills=Object.keys(stats);//objectを配列にする

        if(name.includes('尾道')){
            this.statList.forEach(s=>{
                player.stats[s.id]=25;
            });
        }else{
            this.statList.forEach(s=>{
                player.stats[s.id]=(Math.floor(Math.random()*5)*5)+5;//Math.random()*5→切り捨て→*5→+5;
            });

            player.stats[Phaser.Utils.Array.GetRandom(this.statList).id]=25;//Phaser.Utils.Array.GetRandom配列からランダムに一つ選ぶ
        }
    }
}
/*今はWorldのデータをProfileContentでもらって編集の時はProfileManager通してるけど、
json管理の時はProfileManagerでデータをもらう感じにする*/