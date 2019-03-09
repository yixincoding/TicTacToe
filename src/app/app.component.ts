import { Component, Inject } from '@angular/core';
import { Place, PlaceGroup } from './model/place';
import { DataService } from './service/data.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import { DialogComponent } from './dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  iconArr: string[] = [
    "crop_square",
    "lens",
    "star"
  ];
  mode: number; // 0: one player, 1: two player, 2: online
  winner: number;
  array: PlaceGroup[] = [];
  constructor(
    private dataService: DataService,
    public dialog: MatDialog
  ) {
    this.mode = 0;
    for (let i = 0; i < 9; i++) {
      let tempArray: any[] = [];
      for (let j = 0; j < 9; j++) {
        tempArray.push({
          icon: this.iconArr[0],
          index: 0
        });
      }
      this.array[i] = {
        placeArray: tempArray,
        isTaken: 0
      }
      this.winner = 0;
    }
    this.dataService.setTurn(1);
    this.dataService.setActiveTicTac(-1);
  }

  openDialog(): void {
    let _rule: string[] = [
      "棋盘上总共有9个小井字棋盘，这9个构成了一个大井字棋盘。两人对弈，在小井字棋盘有三个子连成一行、一列或者对角线，即占领该井字棋盘；占领的小井字棋盘若能在大井字棋盘上连成一行、一列或者对角线，即可获得最终的胜利。",
      "每一步落子在小棋盘上的位置，限定了对手的下一步的选择，例如你的棋子落在小棋盘的第一排第三个，则对手下一回合只能在第一排第三个小棋盘上落子；如果该小棋盘已经被占领，则此回合可以在任意位置落子。",
      "先跟愚蠢的机器人玩一局感受一下吧！"
    ];
    let dialogRef = this.dialog.open(DialogComponent, {
      width: '800px',
      data: { rule: _rule }
    });
  }

  async newMove(index: number, event: any) {
    if (event.isTaken != 0) {
      this.array[index].isTaken = event.isTaken;
    }
    this.checkWinner(index);
    if (this.array[event.index].isTaken == 0) {
      this.dataService.setActiveTicTac(event.index);
    } else {
      this.dataService.setActiveTicTac(-2);
    }

    //Stupid AI
    if (this.mode == 0) {
      while (this.dataService.getActiveTicTac() == -2) {
        let x: number = this.getRandomInt(0, 8);
        if (this.array[x].isTaken == 0) {
          this.dataService.setActiveTicTac(x);
        }
      }

      let x: number = this.dataService.getActiveTicTac();
      let y: number = 0;
      for (y = 0; y < 9; y++) {
        if (this.array[x].placeArray[y].index == 0) {
          if (this.checkAITaken(y, false)) {
            await this.sleep(1500);
            this.array[x].placeArray[y].index = this.dataService.getTurn();
            this.array[x].placeArray[y].icon = this.iconArr[this.dataService.getTurn()];
            await this.sleep(1500);
            this.checkAITaken(y, true);
            this.dataService.nextTurn();
            this.checkWinner(this.dataService.getActiveTicTac());
            if (this.array[y].isTaken == 0) {
              this.dataService.setActiveTicTac(y);
            } else {
              this.dataService.setActiveTicTac(-2);
            }
            break;
          }
        }
      }

      if (y == 9) { //cannot taken
        while (1) {
          let y: number = this.getRandomInt(0, 8);
          if (this.array[x].placeArray[y].index == 0) {
            await this.sleep(1500);
            this.array[x].placeArray[y].index = this.dataService.getTurn();
            this.array[x].placeArray[y].icon = this.iconArr[this.dataService.getTurn()];
            this.dataService.nextTurn();
            if (this.array[y].isTaken == 0) {
              this.dataService.setActiveTicTac(y);
            } else {
              this.dataService.setActiveTicTac(-2);
            }
            break;
          }
        }
      }
    }
  }

  checkAITaken(index: number, put: boolean): boolean {
    let _turn: number = this.dataService.getTurn();
    let x: number = Math.floor(index / 3);
    let y: number = index % 3;
    let _tictac: number = this.dataService.getActiveTicTac();
    if (this.array[_tictac].placeArray[x * 3 + (y + 1) % 3].index == _turn && this.array[_tictac].placeArray[x * 3 + (y + 2) % 3].index == _turn) {
      this.array[_tictac].isTaken = put ? _turn : 0; // row
      return true;
    } else if (this.array[_tictac].placeArray[y + (x + 1) % 3 * 3].index == _turn && this.array[_tictac].placeArray[y + (x + 2) % 3 * 3].index == _turn) {
      this.array[_tictac].isTaken = put ? _turn : 0; // column
      return true;
    } else if (x == y && (this.array[_tictac].placeArray[(x + 1) % 3 * 3 + (y + 1) % 3].index == _turn && this.array[_tictac].placeArray[(x + 2) % 3 * 3 + (y + 2) % 3].index == _turn)) {
      this.array[_tictac].isTaken = put ? _turn : 0; // left dig
      return true;
    } else if (x + y == 2 && (this.array[_tictac].placeArray[(x + 2) % 3 * 3 + (y + 1) % 3].index == _turn && this.array[_tictac].placeArray[(x + 1) % 3 * 3 + (y + 2) % 3].index == _turn)) {
      this.array[_tictac].isTaken = put ? _turn : 0;
      return true;
    } else {
      for (let i = 0; i < 9; i++) {
        if (this.array[_tictac].placeArray[i].index == 0) return false;
      }
      this.array[_tictac].isTaken = 3; // no one takes.
      return false;
    }
  }

  checkWinner(index: number) {
    let _turn: number = this.dataService.getLastTurn();
    if (this.array[index].isTaken != _turn) return;

    let x: number = Math.floor(index / 3);
    let y: number = index % 3;
    if (this.array[x * 3 + (y + 1) % 3].isTaken == _turn && this.array[x * 3 + (y + 2) % 3].isTaken == _turn) {
      this.winner = _turn; // row
    } else if (this.array[y + (x + 1) % 3 * 3].isTaken == _turn && this.array[y + (x + 2) % 3 * 3].isTaken == _turn) {
      this.winner = _turn; // column
    } else if (x == y && (this.array[(x + 1) % 3 * 3 + (y + 1) % 3].isTaken == _turn && this.array[(x + 2) % 3 * 3 + (y + 2) % 3].isTaken == _turn)) {
      this.winner = _turn; // left dig
    } else if (x + y == 2 && (this.array[(x + 2) % 3 * 3 + (y + 1) % 3].isTaken == _turn && this.array[(x + 1) % 3 * 3 + (y + 2) % 3].isTaken == _turn)) {
      this.winner = _turn;
    } else {
      for (let i = 0; i < 9; i++) {
        if (this.array[i].isTaken == 0) return;
      }
      this.winner = 3; // no one takes.
    }
  }

  getRandomInt(min: number, max: number) { // [min, max]
    return Math.floor(Math.random() * (max - min) + min);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  title = 'app';
}


