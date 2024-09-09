import { Component, OnDestroy, OnInit } from '@angular/core';
import { PlacesService } from '../places.service';
import { Place } from '../place.module';
import { MenuController, SegmentChangeEventDetail } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/auth/auth.service';

@Component({
  selector: 'app-discover',
  templateUrl: './discover.page.html',
  styleUrls: ['./discover.page.scss']
})
export class DiscoverPage implements OnInit, OnDestroy {
  loadedPlaces!: Place[];
  listedLoadedPlaces: Place[] = [];
  private placesSub!: Subscription;
  relevantPlaces!: Place[];
  selectedFilter: string = 'all'; // Initialize selectedFilter here
  isLoading = false;

  constructor(
    private placesService: PlacesService,
    private menuCtrl: MenuController,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.placesSub = this.placesService.places.subscribe(places => {
      this.loadedPlaces = places;
      this.relevantPlaces = this.loadedPlaces;
      this.listedLoadedPlaces = this.relevantPlaces.slice(1);
    });
  }

  ionViewWillEnter() {
    this.isLoading = true;
    this.placesService.fetchPlaces().subscribe(() => {
      this.isLoading = false;
    });
  }

  onOpenMenu() {
    this.menuCtrl.toggle();
  }

  onFilterUpdate(event: Event) {
    const customEvent = event as CustomEvent<SegmentChangeEventDetail>;
    this.selectedFilter = customEvent.detail.value || 'all'; // Update the selectedFilter
    if (this.selectedFilter === 'all') {
      this.relevantPlaces = [...this.loadedPlaces]; // Ensure a new array is created
    } else {
      this.relevantPlaces = this.loadedPlaces.filter(
        place => place.userId !== this.authService.userId
      );
    }
    // Adjust for virtual scroll, ensuring the array is never empty or undefined
    this.listedLoadedPlaces = this.relevantPlaces.length > 1 ? this.relevantPlaces.slice(1) : [];
  }
  
  ngOnDestroy() {
    if (this.placesSub) {
      this.placesSub.unsubscribe();
    }
  }
}

