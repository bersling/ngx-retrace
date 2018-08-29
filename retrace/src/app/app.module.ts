import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import {HttpClientModule} from '@angular/common/http';

import { AppComponent } from './app.component';
import {FormsModule} from '@angular/forms';
import { RetraceService } from './retrace.service';

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [
    RetraceService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
