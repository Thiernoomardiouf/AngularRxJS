import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';

import { Observable, throwError, of, combineLatest, Subject, merge } from 'rxjs';
import { catchError, map, scan, shareReplay, tap } from 'rxjs/operators';

import { IHotel } from '../models/hotel';
import { categoty } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class HotelListService {

  private readonly HOTEL_API_URL = 'api/hotels'

  public hotelWithCategories$ = combineLatest([
    this.getHotels(),
    this.getCategories()
  ]).pipe(
    map(([hotels, categories]) => {
      return hotels.map(hotel => ({
        ...hotel,
        price: hotel.price * 1.5,
        category: categories.find(c => c.id === hotel.categoryId)?.nom
      }) as IHotel)
    }
  ),
  );

  private hotelInsertedSubject = new Subject<IHotel>();
  public hotelInserted$ = this.hotelInsertedSubject.asObservable();

  public hotelsWithAdd$ = merge(
    this.hotelWithCategories$,
    this.hotelInserted$
  ).pipe(
    scan((acc : IHotel[], value: IHotel)=>{
      const index = acc.findIndex(h => h.id === value.id);
      if(index !== -1){
        acc[index] = value;
        return acc;
      }
      return [...acc, value]
    }),
    shareReplay(1)
  )


  constructor(private http: HttpClient) { }

  public addUpdateHotel(hotel: IHotel) {
   // hotel = this.transformHotel(hotel);
    this.hotelInsertedSubject.next(hotel);
  }

  public getHotels(): Observable<IHotel[]> {
    return this.http.get<IHotel[]>(this.HOTEL_API_URL).pipe(
      tap(hotels => console.log('hotels', hotels)),
      catchError(this.handleHttpError)
    );
  }

  public getHotelById(id: number): Observable<IHotel> {
    if (id === 0) {
      return of(this.getDefaultHotel());
    }

    return this.http.get<IHotel>(`${this.HOTEL_API_URL}/${id}`).pipe(
      catchError(this.handleHttpError)
    );
  }

  public createHotel(hotel: IHotel): Observable<IHotel> {
    hotel = this.transformHotel(hotel);
    return this.http.post<IHotel>(this.HOTEL_API_URL, hotel).pipe(
      catchError(this.handleHttpError)
    )
  }

  public updateHotel(hotel: IHotel): Observable<IHotel> {
    const url = `${this.HOTEL_API_URL}/${hotel.id}`;

    return this.http.put<IHotel>(url, hotel).pipe(
      catchError(this.handleHttpError)
    );
  }

  public deleteHotel(id: number): Observable<{}> {
    const url = `${this.HOTEL_API_URL}/${id}`;

    return this.http.delete<IHotel>(url).pipe(
      catchError(this.handleHttpError)
    );
  }

  private transformHotel(hotel: IHotel): IHotel {
    return {
        ...hotel,
        imageUrl: 'assets/img/window.jpg',
        id: null
      };
  }

  private getDefaultHotel(): IHotel {
    return {
      id: 0,
      hotelName: null,
      description: null,
      price: null,
      rating: null,
      imageUrl: null
    };
  }

  public getCategories(): Observable<categoty[]> {
    return of([
      { id: 0,
        nom: 'Motel',
      },
      {
        id: 1,
        nom: 'Auberge',
      }
    ])
  }


  private handleHttpError(err: HttpErrorResponse) {
    let error: string;
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', err.error.message);
      error = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong.
      console.error(
        `Backend returned code ${err.status}, ` +
        `body was: ${err.error}`
      );
      error = `Backend returned code ${err.status}, body was: ${err.error}`;
    }
    // Return an observable with a user-facing error message.
    return throwError(
      'Something bad happened; please try again later.'
      + '\n'
      + error
    );
  }
}
