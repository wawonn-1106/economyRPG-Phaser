export default class API{
    static SERVER_URL='http://127.0.0.1:3000';

    static async _send(endpoint,payload){
        const response=await fetch(`${this.SERVER_URL}${endpoint}`,{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(payload)
        });

        if(!response.ok)throw new Error(`エラー：${response.status}`);
        return await response.json();
    }

    static async _fetch(endpoint){
        const response=await fetch(`${this.SERVER_URL}${endpoint}`);
        if(!response.ok)throw new Error(`エラー：${response.status}`);
        return await response.json();
    }

    static async saveGameData(payload){
        return await this._send('/save',payload);
    }

    static async recordSale(payload){
        return await this._send('/save',payload);
    }

    static async fetchWeather(){
        return await this._fetch('/weather');
    }

    static async loadGameData(){
        return await this._fetch('/load');
    }
}