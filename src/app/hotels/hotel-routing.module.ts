import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { HotelDetailsGuard } from './shared/guards/hotel-details.guard';
import { HotelDetailsComponent } from './hotel-details/hotel-details.component';
import { HotelListComponent } from './hotel-list/hotel-list.component';
import { HotelEditComponent } from './hotel-edit/hotel-edit.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: 'hotels/:id',
        component: HotelDetailsComponent,
        canActivate: [HotelDetailsGuard]
      },
      {
        path: 'hotels',
        component: HotelListComponent
      },
      {
        path: 'hotels/:id/edit',
        component: HotelEditComponent
      }
    ]),
  ],
  exports: [RouterModule]
})
export class HotelRoutingModule { }