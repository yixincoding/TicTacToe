import { Component, OnInit, Input, Output, EventEmitter, Inject } from '@angular/core';
import { Place, PlaceGroup } from '../model/place';
import { DataService } from '../service/data.service';

@Component({
  selector: 'app-detail',
  templateUrl: './detail.component.html',
  styleUrls: ['./detail.component.css']
})
export class DetailComponent implements OnInit {

  @Input() 
  tictac: PlaceGroup;

  @Input()
  fontSize: number;

  @Input()
  tictacIndex: number;

  @Output('update')
  change: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private dataService: DataService 
  ) { 
  }

  iconArr: string [] = [
    "crop_square",
    "lens",
    "star"
  ];

  onClick(item: Place, index: number){
    if (this.dataService.getActiveTicTac() == -2){
      this.dataService.setActiveTicTac(this.tictacIndex);
    } else if (this.tictac.isTaken == 0 && item.index == 0 && (this.dataService.getActiveTicTac() == this.tictacIndex || this.dataService.getActiveTicTac() == -1 )){
      this.tictac.placeArray[index].index = this.dataService.getTurn();
      this.tictac.placeArray[index].icon = this.iconArr[this.dataService.getTurn()];

      this.checkTaken(index);

      this.dataService.nextTurn();
      this.change.emit({
        index: index,
        isTaken: this.tictac.isTaken
      });
    }
  }

  checkTaken(index: number){
    let _turn: number = this.dataService.getTurn();
    let x: number = Math.floor(index/3);
    let y: number = index % 3;
    if (this.tictac.placeArray[x*3 + (y+1)%3].index == _turn && this.tictac.placeArray[x*3 + (y+2)%3].index == _turn){
      this.tictac.isTaken = _turn; // row
    } else if (this.tictac.placeArray[y + (x+1)%3 * 3].index == _turn && this.tictac.placeArray[y + (x+2)%3 * 3].index == _turn){
      this.tictac.isTaken = _turn; // column
    } else if (x == y && (this.tictac.placeArray[(x+1)%3*3 + (y+1)%3].index == _turn && this.tictac.placeArray[(x+2)%3*3 + (y+2)%3].index == _turn)){
      this.tictac.isTaken = _turn; // left dig
    } else if ( x+y == 2 && (this.tictac.placeArray[(x+2)%3*3 + (y+1)%3].index == _turn && this.tictac.placeArray[(x+1)%3*3 + (y+2)%3].index == _turn)){
      this.tictac.isTaken = _turn;
    } else {
      for (let i = 0; i < 9; i++){
        if (this.tictac.placeArray[i].index == 0) return;
      }
      this.tictac.isTaken = 3; // no one takes.
    }
  }

  ngOnInit() {
  }

}
