import { NgModule } from '@angular/core';
import { StreamsComponent } from '../components/streams/streams.component';
import { Routes, RouterModule } from '@angular/router';
import { AuthGuard } from '../services/auth.guard';
import { PeopleComponent } from '../components/people/people.component';

const routes: Routes = [
  {
     path: 'streams',
     component: StreamsComponent,
     canActivate: [AuthGuard]
  },
  {
    path: 'people',
    component: PeopleComponent,
    canActivate: [AuthGuard]
 }
];

@NgModule({

  imports: [
    RouterModule.forRoot(routes)
  ],
  exports: [RouterModule]
})
export class StreamsRoutingModule { }
