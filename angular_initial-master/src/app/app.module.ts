import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {PersonaService} from './service/persona.service';
import {NotificationService} from './service/notification.server';

import { ChartsModule } from 'ng2-charts';
import { OAuthModule } from 'angular-oauth2-oidc';
//import {HttpClientModule} from '@angular/common/http'

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    ChartsModule,
    OAuthModule.forRoot({
      resourceServer: {
          allowedUrls: ['http://localhost:8585/persona'],
          sendAccessToken: true
      }
  })

  ],
  providers: [
    PersonaService,
    NotificationService
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
