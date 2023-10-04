import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'recipe-confirm-dialog',
  template: `
    <div class="modal-header">
      <h5>{{ title }}</h5>
      <span class="bi bi-x-lg" (click)="closeModal()"></span>
    </div>
    <div class="modal-body">
      <p>{{ message }}</p>
      <input
        *ngIf="validateConfirmationText"
        type="text"
        [placeholder]="confirmationText"
        [(ngModel)]="userConfirmation"
      />
    </div>
    <div class="modal-footer">
      <div>
        <button class="btn btn-sm btn-secondary mr-20px" (click)="closeModal()">
          {{ discardButtonText }}
        </button>
        <button
          class="btn btn-sm"
          [ngClass]="confirmButtonClass"
          (click)="confirmDelete()"
        >
          {{ confirmButtonText }}
        </button>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  title: string = 'Confirm dialog Title';
  message = `confirmation message`;
  confirmButtonText = `Confirm`;
  confirmButtonClass = `btn-danger`;
  discardButtonText = `No, take me back`;
  confirmationText = '';
  userConfirmation = '';
  validateConfirmationText = false;
  onConfirm: Function = () => '';

  constructor(private bsModalRef: BsModalRef) {}

  confirmDelete() {
    if (
      this.validateConfirmationText &&
      this.userConfirmation === this.confirmationText
    ) {
      this.onConfirm(true);
      this.bsModalRef.hide();
    } else {
      this.onConfirm(true);
      this.bsModalRef.hide();
    }
  }

  closeModal() {
    this.bsModalRef.hide();
  }
}
