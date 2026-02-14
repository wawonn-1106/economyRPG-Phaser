require('dotenv').config();
const express=require('express');
const mongoose=require('mongoose');
const cors=require('cors');
const app=express();

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDBに接続成功！'))
  .catch(error => console.error('MongoDB接続エラー詳細:', error));

const SalesHistoryScheme=new mongoose.Schema({
    timestamp:{type:Date,default:Date.now},
    itemId:String,
    quality:Number,
    setQuality:Number,
    sellPrice:Number,
    fairPrice:Number,
    profit:Number,
    npcId:String
});

const NPCSchema=new mongoose.Schema({
    npcId:String,
    scene:String,
    x:Number,
    y:Number,
    name:String,
    type:String,
    startId:String
});

const PlayerSchema=new mongoose.Schema({
    money:{type:Number,default:0},
    inventory:Array,
    placedItems:Array,
    unlockedIds:{type:[String],default:[]},
    playerPosition:{
        x:Number,
        y:Number,
        scene:String
    },
    npcPositions:[NPCSchema],
    salesHistory:[SalesHistoryScheme]
});

const Player=mongoose.model('Player',PlayerSchema);

app.post('/save',async(req,res)=>{
    console.log('--- Save Request Received ---');
    console.log('Body Keys:', Object.keys(req.body)); 
    console.log('Raw Body:', JSON.stringify(req.body, null, 2));
    try{
        console.log('受信したデータ：',req.body);

        const updateFields={};

        if(req.body.money!==undefined)updateFields.money=req.body.money;
        if(req.body.unlockedIds!==undefined)updateFields.unlockedIds=req.body.unlockedIds;
        if(req.body.inventory!==undefined)updateFields.inventory=req.body.inventory;
        if(req.body.placedItems!==undefined)updateFields.placedItems=req.body.placedItems;
        if(req.body.playerPosition!==undefined)updateFields.playerPosition=req.body.playerPosition;
        if(req.body.npcPositions!==undefined)updateFields.npcPositions=req.body.npcPositions;

        const updateData={
            $set:updateFields
        };

        if(req.body.newSale){
            updateData.$push={salesHistory:req.body.newSale};
        }

        const player=await Player.findOneAndUpdate(
            {_id: "698d4a83b16e85a9124a347f"},
            updateData,{
            upsert:true,
            new:true
        });

        res.json({message:'保存成功',data:player});

        //await Player.findOneAndUpdate({},{money:req.body.money},{upsert:true});
    }catch(error){
        console.error(error);

        res.status(500).json({error:'保存失敗'});
    }
});

app.get('/load',async(req,res)=>{
    try{
        const player=await Player.findOne({});
        res.json(player || {
            money:0,
            unlockedIds:[],
            inventory:[],
            placedItems:[],
            playerPosition:null,
            npcPositions:[],
            salesHistory:[],
        });
    }catch(error){
        res.status(500).send('読み込み失敗');
    }
});
//---------------------------天気--------------------------------------------------------------
app.get('/weather',async(req,res)=>{//Rain,Snowを取得。
    try{
        const API_KEY=process.env.WEATHER_API_KEY;
        const lat=34.40;
        const lon=133.20;
        const URL=`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`;
        
        const response=await fetch(URL);
        const data=await response.json();
    
        res.json({main:data.weather[0].main});
    
    }catch(error){
        res.status(500).json({main:'Clear'});
    }
});
app.listen(3000,()=>console.log('Server is running'));