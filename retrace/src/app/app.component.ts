import { Component } from '@angular/core';
import { RetraceService } from './retrace.service';


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  txt = `Error: i am error\n    at e.doError2 (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:125997)\n    at Object.handleEvent (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:276172)\n    at Object.handleEvent (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:97196)\n    at Object.handleEvent (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:118943)\n    at Br (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:70109)\n    at http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:75323\n    at HTMLButtonElement.<anonymous> (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:161189)\n    at e.invokeTask (http://dev5.demo.taskbase.com/polyfills.a9c1408b8b24d052720b.js:1:7960)\n    at Object.onInvokeTask (http://dev5.demo.taskbase.com/main.f74ac97134538c395883.js:1:31320)\n    at e.invokeTask (http://dev5.demo.taskbase.com/polyfills.a9c1408b8b24d052720b.js:1:7881)`;
  result;
  loading = false;

  constructor(
    private retraceService: RetraceService
  ) {}

  doRetrace() {
    this.loading = true;
    this.retraceService.retrace(this.txt).subscribe((resp: any) => {
      this.result = resp.stacktrace;
      this.loading = false;
    }, errorResp => {
      alert('error! see console.');
      console.error(errorResp);
      this.loading = false;
    });
  }

}
