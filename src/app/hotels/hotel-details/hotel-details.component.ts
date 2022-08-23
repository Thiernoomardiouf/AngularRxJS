import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { IHotel } from '../shared/models/hotel';
import { HotelListService } from '../shared/services/hotel-list.service';

@Component({
  templateUrl: './hotel-details.component.html',
  styleUrls: ['./hotel-details.component.css']
})
export class HotelDetailsComponent implements OnInit {

 // public hotel: IHotel = <IHotel>{};
  public hotel$ : Observable<IHotel> = of(<IHotel>{});


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelListService: HotelListService
  ) { }

  ngOnInit(): void {
    const id = +this.route.snapshot.paramMap.get('id');

    this.hotel$ = this.hotelListService.getHotels()
    .pipe(
      map((hotels: IHotel[]) => hotels.find(hotel => hotel.id === id)),
      tap((hotel: IHotel) => console.log(hotel))
    );
  }

  public backToList(): void {
    this.router.navigate(['/hotels']);
  }

}
