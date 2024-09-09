import { AfterViewInit, Component, OnInit, ViewChild, ElementRef, Renderer2, Input, OnDestroy } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-map-modal',
  templateUrl: './map-modal.component.html',
  styleUrls: ['./map-modal.component.scss'],
})
export class MapModalComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('map', { static: false }) mapElementRef!: ElementRef;
  @Input() center = { lat: -34.397, lng: 150.644 };
  @Input() selectable = true;
  @Input() closeButtonText = 'Cancel';
  @Input() title = 'Pick Location';
  clickListener: any;
  googleMaps: any;

  constructor(private modalCtrl: ModalController, private renderer: Renderer2) { }

  ngOnInit() { }

  ngAfterViewInit() {
    this.getGoogleMaps()
      .then(googleMaps => {
        this.googleMaps = googleMaps;
        const mapEl = this.mapElementRef.nativeElement;

        // Initialize the Google Map
        const map = new googleMaps.Map(mapEl, {
          center: { lat: -34.397, lng: 150.644 }, // Default center position
          zoom: 16
        });

        // Make the map visible after it has fully loaded
        this.googleMaps.event.addListenerOnce(map, 'idle', () => {
          this.renderer.addClass(mapEl, 'visible');
        });

        // Listen for clicks on the map to get the selected coordinates
        if (this.selectable) {
          this.clickListener = map.addListener('click', (event: google.maps.MapMouseEvent) => {
            const selectedCoords = {
              lat: event.latLng?.lat() ?? 0, // Use optional chaining and nullish coalescing
              lng: event.latLng?.lng() ?? 0
            };
            // Dismiss the modal and return the selected coordinates
            this.modalCtrl.dismiss(selectedCoords);
          });
        } else {
          const marker = new googleMaps.Marker({
            position: this.center,
            map: map,
            title: 'Picked Location'
          });
          marker.setMap(map);
        }
      }).catch(err => {
        console.log('Google Maps SDK loading error:', err);
      });
  }

  onCancel() {
    this.modalCtrl.dismiss();
  }

  ngOnDestroy() {
    if (this.clickListener) {
      this.googleMaps.event.removeListener(this.clickListener);
    }
  }

  private getGoogleMaps(): Promise<any> {
    const win = window as any;
    const googleModule = win.google;
    if (googleModule && googleModule.maps) {
      return Promise.resolve(googleModule.maps);
    }
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src =
        'https://maps.googleapis.com/maps/api/js?key=' +
        environment.googleMapsAPIKey;
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = () => {
        const loadedGoogleModule = win.google;
        if (loadedGoogleModule && loadedGoogleModule.maps) {
          resolve(loadedGoogleModule.maps);
        } else {
          reject('Google maps SDK not available.');
        }
      };
    });
  }
}