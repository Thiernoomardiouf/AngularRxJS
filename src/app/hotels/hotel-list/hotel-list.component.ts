import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of, Subject, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { IHotel } from '../shared/models/hotel';
import { HotelListService } from '../shared/services/hotel-list.service';

@Component({
  selector: 'app-hotel-list',
  templateUrl: './hotel-list.component.html',
  styleUrls: ['./hotel-list.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HotelListComponent implements OnInit {

  public hotels: IHotel[] = [];
  public hotels$: Observable<IHotel[]> = of([]);

  public showBadge: boolean = true;
  public filteredHotels: IHotel[];
  public filteredHotels$ : Observable<IHotel[]> = of([]);
  public filterSubject: Subject<string> = new BehaviorSubject<string>('');
  public receivedRating: string;
  _hotelFilter = 'mot';

  public errorMsg: string;
  public errMsgSubject: Subject<string> = new Subject<string>();
  public errMsg$ = this.errMsgSubject.asObservable();


  // Methode longue
  // private _hotelListService;
  // constructor(hotelListService: HotelListService) {
  //   this._hotelListService = hotelListService;
  // }

  // racourci typescript
  constructor(private hotelListService: HotelListService, private http: HttpClient){}

  ngOnInit() {

    const hotelTest$ = of(1,2,3).pipe(
      map(val => this.http.get<IHotel[]>(`api/hotels/${val}`)),
    );
    hotelTest$.subscribe((elem)=>{
      elem.subscribe((hotel)=>{
        console.log(hotel);
      })
    })

    this.hotels$ = this.hotelListService.hotelsWithAdd$.pipe(
      catchError((err) => {
       // this.errorMsg = err;
       this.errMsgSubject.next(err);
        //return throwError(err);
        return EMPTY;
      })
    );
    this.filteredHotels$ = this.createFilterHotels(this.filterSubject, this.hotels$);
    this.hotelFilter = '';
  }

  public filterChange(value: string):void{
    console.log("value", value)
    this.filterSubject.next(value);
  }

  public toggleIsNewBadge(): void {
    this.showBadge = !this.showBadge;
  }

  get hotelFilter(): string {
    return this._hotelFilter;
  }

  set hotelFilter(filter: string) {
    this._hotelFilter = filter;
  }

  public createFilterHotels(filter$: Observable<string>, hotels$: Observable<IHotel[]>): Observable<IHotel[]> {
    return combineLatest(hotels$, filter$, (hotels: IHotel[], filter: string) => {
      if(filter === '') return hotels;

      return hotels.filter(
        (hotel: IHotel) => hotel.hotelName.toLocaleLowerCase().indexOf(filter) !== -1
      );
    });
  }

  public receiveRatingClick(message: string): void {
    this.receivedRating = message;
    console.log(message);
  }


  private filterHotels(criteria: string, hotels: IHotel[]): IHotel[] {
    criteria = criteria.toLocaleLowerCase();

    const res = hotels.filter(
      (hotel: IHotel) => hotel.hotelName.toLocaleLowerCase().indexOf(criteria) !== -1
    );

    return res;

  }

}
