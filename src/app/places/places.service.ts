import { Injectable } from '@angular/core';
import { BehaviorSubject, from, Observable, of } from 'rxjs';
import { map, switchMap, tap, take } from 'rxjs/operators';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/compat/firestore';
import { AuthService } from '../auth/auth.service';
import { Place } from './place.module';

interface PlaceData {
  availableFrom: string;
  availableTo: string;
  description: string;
  imageUrl: string;
  price: number;
  title: string;
  userId: string;
}

@Injectable({
  providedIn: 'root'
})
export class PlacesService {
  private placesCollection: AngularFirestoreCollection<PlaceData>;
  private _places = new BehaviorSubject<Place[]>([]);

  get places(): Observable<Place[]> {
    return this._places.asObservable();
  }

  constructor(private authService: AuthService, private firestore: AngularFirestore) {
    this.placesCollection = this.firestore.collection<PlaceData>('offered-places');
  }

  fetchPlaces(): Observable<Place[]> {
    return this.placesCollection
      .snapshotChanges()
      .pipe(
        map(docArray => {
          return docArray.map(doc => {
            const data = doc.payload.doc.data() as PlaceData;
            const id = doc.payload.doc.id;
            return new Place(
              id,
              data.title,
              data.description,
              data.imageUrl,
              data.price,
              new Date(data.availableFrom),
              new Date(data.availableTo),
              data.userId
            );
          });
        }),
        tap(places => this._places.next(places))
      );
  }

  getPlace(id: string): Observable<Place> {
    return this.firestore
      .doc<PlaceData>(`offered-places/${id}`)
      .valueChanges()
      .pipe(
        map(placeData => {
          if (placeData) {
            return new Place(
              id,
              placeData.title,
              placeData.description,
              placeData.imageUrl,
              placeData.price,
              new Date(placeData.availableFrom),
              new Date(placeData.availableTo),
              placeData.userId
            );
          }
          throw new Error('Place not found');
        })
      );
  }

  addPlace(
    title: string,
    description: string,
    price: number,
    dateFrom: Date,
    dateTo: Date
  ): Observable<void> {
    const newPlace = new Place(
      this.firestore.createId(),
      title,
      description,
      'https://lonelyplanetimages.imgix.net/mastheads/GettyImages-538096543_medium.jpg?sharp=10&vib=20&w=1200',
      price,
      dateFrom,
      dateTo,
      this.authService.userId
    );
  
    return from(
      this.placesCollection.doc(newPlace.id).set({
        title: newPlace.title,
        description: newPlace.description,
        imageUrl: newPlace.imageUrl,
        price: newPlace.price,
        availableFrom: newPlace.availableFrom.toISOString(),
        availableTo: newPlace.availableTo.toISOString(),
        userId: newPlace.userId
      })
    ).pipe(
      tap(() => {
        // Fetch current places to update _places
        this.fetchPlaces().subscribe();
      })
    );
  }  

  updatePlace(placeId: string, title: string, description: string): Observable<void> {
    let updatedPlaces: Place[];
    
    return this.places.pipe(
      take(1),
      switchMap(places => {
        if (!places || places.length <= 0) {
          return this.fetchPlaces();
        } else {
          return of(places);
        }
      }),
      switchMap(places => {
        const updatedPlaceIndex = places.findIndex(pl => pl.id === placeId);
        updatedPlaces = [...places];
        const oldPlace = updatedPlaces[updatedPlaceIndex];
        updatedPlaces[updatedPlaceIndex] = new Place(
          oldPlace.id,
          title,
          description,
          oldPlace.imageUrl,
          oldPlace.price,
          oldPlace.availableFrom,
          oldPlace.availableTo,
          oldPlace.userId
        );

        return from(
          this.placesCollection.doc(placeId).update({
            title: title,
            description: description
          })
        );
      }),
      tap(() => this._places.next(updatedPlaces))
    );
  }

  getOffers(): Observable<Place[]> {
    return this.places;
  }
  
  deleteOffer(placeId: string): Observable<void> {
    return from(
      this.placesCollection.doc(placeId).delete()
    ).pipe(
      tap(() => {
        // Fetch current places to update _places
        this.fetchPlaces().subscribe();
      })
    );
  }
}
