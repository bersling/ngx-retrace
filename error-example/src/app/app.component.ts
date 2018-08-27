import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'error-example';
  constructor() {
    // try {
    //   throw new Error('hi i am error');
    // } catch (err) {
    //   console.log(err);
    //   console.log({
    //     err: JSON.stringify(err.stack)
    //   });
    // }
    this.bla();
  }

  bla() {
    const x = null;
    console.log(x.bla);
  }
}
