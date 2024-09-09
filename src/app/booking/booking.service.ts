import { Injectable } from '@angular/core';
import { Booking } from './booking.model';
import { BehaviorSubject, from, take, tap, catchError, map } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Injectable({
  providedIn: 'root'
})
export class BookingService {

  private _bookings = new BehaviorSubject<Booking[]>([]);

  constructor(private authService: AuthService, private firestore: AngularFirestore) { }

  get bookings() {
    return this._bookings.asObservable();
  }

  addBooking(
    placeId: string,
    placeTitle: string,
    placeImage: string,
    firstName: string,
    lastName: string,
    guestNumber: number,
    dateFrom: Date,
    dateTo: Date
  ) {
    console.log('Date From:', dateFrom);
    console.log('Date To:', dateTo);
  
    if (!dateFrom || !dateTo || !(dateFrom instanceof Date) || !(dateTo instanceof Date) || dateFrom >= dateTo) {
      throw new Error('Invalid dates provided.');
    }
  
    const newBooking = new Booking(
      Math.random().toString(),
      placeId,
      this.authService.userId,
      placeTitle,
      placeImage,
      firstName,
      lastName,
      guestNumber,
      dateFrom,
      dateTo
    );
  
    const bookingData = {
      id: newBooking.id,
      placeId: newBooking.placeId,
      userId: newBooking.userId,
      placeTitle: newBooking.placeTitle,
      placeImage: newBooking.placeImage,
      firstName: newBooking.firstName,
      lastName: newBooking.lastName,
      guestNumber: newBooking.guestNumber,
      dateFrom: newBooking.dateFrom.toISOString(),
      dateTo: newBooking.dateTo.toISOString()
    };
  
    console.log('Booking Data:', bookingData);
  
    return from(
      this.firestore.collection('bookings').add(bookingData)
    ).pipe(
      take(1),
      tap(() => {
        this._bookings.next(this._bookings.getValue().concat(newBooking));
      }),
      catchError(error => {
        console.error('Error adding booking:', error);
        throw error;
      })
    );
  }
  
  fetchBookings() {
    return this.firestore.collection<Booking>('bookings').valueChanges({ idField: 'id' }).pipe(
      map(bookingsData => {
        return bookingsData.map(data => {
          return new Booking(
            data.id,
            data.placeId,
            data.userId,
            data.placeTitle,
            data.placeImage,
            data.firstName,
            data.lastName,
            data.guestNumber,
            new Date(data.dateFrom),
            new Date(data.dateTo)
          );
        });
      }),
      tap(bookings => {
        this._bookings.next(bookings);
      }),
      catchError(error => {
        console.error('Error fetching bookings:', error);
        throw error;
      })
    );
  }
  
  cancelBooking(bookingId: string) {
    return from(
      this.firestore.collection('bookings').doc(bookingId).delete()  // Add deletion from Firestore
    ).pipe(
      take(1),
      tap(() => {
        this.bookings.pipe(
          take(1),
          tap(bookings => {
            this._bookings.next(bookings.filter(b => b.id !== bookingId));
          })
        ).subscribe();
      }),
      catchError(error => {
        console.error('Error canceling booking:', error);
        throw error;
      })
    );
  }
}
