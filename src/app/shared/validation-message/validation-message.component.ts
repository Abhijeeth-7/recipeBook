import { Component, Input } from '@angular/core';
import { AbstractControl, FormControl } from '@angular/forms';

@Component({
  selector: 'validation-message',
  templateUrl: './validation-message.component.html',
  styleUrls: ['./validation-message.component.scss'],
})
export class ValidationMessageComponent {
  @Input() control!: AbstractControl;
  @Input() validationMessages!: any;
  @Input() isFormSubmitted: boolean = false;

  constructor() {}

  get validationMessage(): Array<string> | null {
    if (this.control.errors && (this.control.touched || this.control.dirty)) {
      return Object.keys(this.control.errors).map(
        (type) => this.validationMessages[type]
      );
    }
    if (this.isFormSubmitted && this.control.invalid) {
      return [this.validationMessages['required']];
    }
    return null;
  }
}
