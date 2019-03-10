export class Place {
    icon: string;
    index: number;
}

export class PlaceGroup {
    placeArray: Place[];
    isTaken: number; // 1: lens, 3: star
    constructor() {
        this.placeArray = [];
        this.isTaken = -1;
    }
}
