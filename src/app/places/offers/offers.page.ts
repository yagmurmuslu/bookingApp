import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { Place } from '../place.module';
import { PlacesService } from '../places.service';

@Component({
  selector: 'app-offers',
  templateUrl: './offers.page.html',
  styleUrls: ['./offers.page.scss']
})
export class OffersPage implements OnInit, OnDestroy {
  offers: Place[] = [];
  isLoading = false;
  private offersSub!: Subscription;

  constructor(
    private placesService: PlacesService,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.isLoading = true;
    this.offersSub = this.placesService.getOffers().subscribe(offers => {
      this.offers = offers;
      this.isLoading = false;
    });
  }

  onEdit(offerId: string, slidingItem: any) {
    slidingItem.close();
    this.router.navigate(['/places/tabs/offers/edit', offerId]);
  }

  onDelete(offerId: string, slidingItem: any) {
    slidingItem.close();

    this.alertCtrl.create({
      header: 'Are you sure?',
      message: 'Do you really want to delete this offer?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: () => {
            this.loadingCtrl.create({
              message: 'Deleting offer...'
            }).then(loadingEl => {
              loadingEl.present();
              this.placesService.deleteOffer(offerId).subscribe(() => {
                loadingEl.dismiss();
                this.offers = this.offers.filter(offer => offer.id !== offerId);
              });
            });
          }
        }
      ]
    }).then(alertEl => {
      alertEl.present();
    });
  }

  ngOnDestroy() {
    if (this.offersSub) {
      this.offersSub.unsubscribe();
    }
  }
}
