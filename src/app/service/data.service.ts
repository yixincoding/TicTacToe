import { Injectable } from '@angular/core';

@Injectable()
export class DataService {
  _turn: number; // 0 or 1
  _activeTicTac: number; // from 0 to 8

  constructor() { }
  
  getTurn(){
    return this._turn;
  }

  setTurn(num: number){
    this._turn = num;
  }

  nextTurn(){
    this._turn = 3 - this._turn;
  }

  getLastTurn(){
    return 3 - this._turn;
  }

  getActiveTicTac(){
    return this._activeTicTac;
  }

  setActiveTicTac(num: number){
    this._activeTicTac = num;
  }

}
