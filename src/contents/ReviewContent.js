export default class ReviewContent{
    constructor(uiScene){
        this.uiScene=uiScene;

        this.reviews=[
            {day:1,rating:5,comment:'パンがおいしかった！',profit:500},
            {day:2,rating:2,comment:'少し値段が高い',profit:1200},
            {day:3,rating:4,comment:'珍しいキノコがあった',profit:-300},
            {day:1,rating:5,comment:'パンがおいしかった！',profit:500},
            {day:2,rating:2,comment:'少し値段が高い',profit:1200},
            {day:3,rating:4,comment:'珍しいキノコがあった',profit:-300},
            {day:1,rating:5,comment:'パンがおいしかった！',profit:500},
            {day:2,rating:2,comment:'少し値段が高い',profit:1200},
            {day:3,rating:4,comment:'珍しいキノコがあった',profit:-300},
            {day:1,rating:5,comment:'パンがおいしかった！',profit:500},
            {day:2,rating:2,comment:'少し値段が高い',profit:1200},
            {day:3,rating:4,comment:'珍しいキノコがあった',profit:-300},
            {day:1,rating:5,comment:'パンがおいしかった！',profit:500},
            {day:2,rating:2,comment:'少し値段が高い',profit:1200},
            {day:3,rating:4,comment:'珍しいキノコがあった',profit:-300},
        ];
    }
    createView(){
        const container=this.uiScene.add.container(0,0);

        const bg=this.uiScene.add.image(0,0,'menu-bg').setDisplaySize(1000,600);//review-bg
        container.add(bg);

        const title=this.uiScene.add.text(0,-250,'口コミ',{
            fontSize:'32px',
            color:'#000000',
            fontStyle:'bold'
        }).setOrigin(0.5);

        //const headerY=-180;
        const headers=this.uiScene.add.text(0,-180,'日付　｜　評価　｜',{
            fontSize:'20px',
            color:'#000000',
            //backgroundColor:'#eeeeee'
        }).setOrigin(0.5);
        //container.add(headers);

        container.add([bg,title,headers]);

        const viewWidth=900;
        const viewHeight=350;
        //const viewX=-viewWidth/2;
        const viewY=-150;

        const scrollContainer=this.uiScene.add.container(0,0);
        container.add(scrollContainer);

        this.reviews.forEach((data,index)=>{
            const y=viewY+50+(index*80);
            const row=this.createReviewRow(0,y,data,index);

            scrollContainer.add(row);
        });

        const shape=this.uiScene.make.graphics();
        shape.fillStyle(0xffffff);

        shape.fillRect(
            (this.uiScene.scale.width/2)-(viewWidth/2),
            (this.uiScene.scale.height/2)+viewY,
            viewWidth,
            viewHeight
        );

        const mask=shape.createGeometryMask();
        scrollContainer.setMask(mask);

        const contentHeight=this.reviews.length*80;
        const minScroll=contentHeight>viewHeight? -(contentHeight-viewHeight): 0;
        const maxScroll=0;

        const onWheel=(pointer,gameObjects,deltaX,deltaY)=>{
            if(!container.visible)return;

            scrollContainer.y-=deltaY;

            scrollContainer.y=Phaser.Math.Clamp(scrollContainer.y,minScroll,maxScroll);
        }

            this.uiScene.input.on('wheel',onWheel);

            container.on('destroy',()=>{
                this.uiScene.input.off('wheel',onWheel);

                shape.destroy();
            });

        return container;
    }
    createReviewRow(x,y,data){
        const rowGroup=this.uiScene.add.container(x,y);

        const dayText=this.uiScene.add.text(-400,0,`Day ${data.day}`,{
            fontSize:'20px',
            color:'#555555',
        }).setOrigin(0,0.5);

        const stars='★'.repeat(data.rating)+'☆'.repeat(5-data.rating);
        const ratingText=this.uiScene.add.text(-320,0,stars,{
            fontSize:'18px',
            color:'#000000'
        }).setOrigin(0,0.5);

        const commentText=this.uiScene.add.text(-180,0,data.comment,{
            fontSize:'20px',
            color:'#000000',
            wordWrap:{width:350}
        }).setOrigin(0,0.5);

        rowGroup.add([dayText,ratingText,commentText]);

        return rowGroup;
    }
}