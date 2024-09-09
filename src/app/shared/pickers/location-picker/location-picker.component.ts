import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { MapModalComponent } from '../../map-modal/map-modal.component';
import { environment } from 'src/environments/environment';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';

interface PlaceLocation {
  lat: number;
  lng: number;
  address: string | null;
  staticMapImageUrl: string | null;
}

@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.component.html',
  styleUrls: ['./location-picker.component.scss'],
})
export class LocationPickerComponent implements OnInit {

  @Output() locationPick = new EventEmitter<PlaceLocation>();

  selectedLocationImage!: string;
  isLoading = false;

  constructor(
    private modalCtrl: ModalController,
    private firestore: Firestore
  ) { }

  ngOnInit() {}

  onPickLocation() {
    this.modalCtrl.create({ component: MapModalComponent }).then(modalEl => {
      modalEl.onDidDismiss().then(modalData => {
        if (!modalData.data) {
          return;
        }
        const pickedLocation: PlaceLocation = {
          lat: modalData.data.lat,
          lng: modalData.data.lng,
          address: null,
          staticMapImageUrl: null
        };
        this.isLoading = true;

        this.getAddressFromFirestore(pickedLocation.lat, pickedLocation.lng)
          .then(address => {
            pickedLocation.address = address;
            const mapImageUrl = this.getMapImage(pickedLocation.lat, pickedLocation.lng, 14);
            pickedLocation.staticMapImageUrl = mapImageUrl;
            this.selectedLocationImage = mapImageUrl;
            this.isLoading = false;
            this.locationPick.emit(pickedLocation);
          })
          .catch(() => {
            this.isLoading = false;
          });
      });
      modalEl.present();
    });
  }

  private async getAddressFromFirestore(lat: number, lng: number): Promise<string | null> {
    const addressDocRef = doc(this.firestore, `locations/${lat}_${lng}`);
    try {
      const docSnapshot = await getDoc(addressDocRef);
      if (docSnapshot.exists()) {
        const data = docSnapshot.data();
        return data ? (data['address'] as string | null) : null; // Access property with bracket notation
      } else {
        return null;
      }
    } catch (error) {
      console.error('Error fetching address from Firestore:', error);
      return null;
    }
  }

  private getMapImage(lat: number, lng: number, zoom: number): string {
    return `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=${zoom}&size=500x300&maptype=roadmap
    &markers=color:red%7Clabel:Place%7C${lat},${lng}
    &key=${environment.googleMapsAPIKey}`; // Make sure this key name matches your environment.ts
  }
}
