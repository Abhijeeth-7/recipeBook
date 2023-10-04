import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Input,
  forwardRef,
} from '@angular/core';
import {
  AbstractControl,
  ControlValueAccessor,
  FormControl,
  NG_VALIDATORS,
  NG_VALUE_ACCESSOR,
  ValidationErrors,
  Validator,
} from '@angular/forms';
import {
  ref,
  uploadBytesResumable,
  Storage,
  getDownloadURL,
  deleteObject,
} from '@angular/fire/storage';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  // changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => FileUploadComponent),
    },
    {
      provide: NG_VALIDATORS,
      multi: true,
      useExisting: FileUploadComponent,
    },
  ],
})
export class FileUploadComponent implements ControlValueAccessor, Validator {
  @Input()
  requireFiletype: string | null = null;
  fileName: string | null = null;
  isDisabled: boolean = false;
  uploadPercentage: number = 0;
  isFileUploadSuccessfull = false;
  fileUploadError: string | null = null;
  fileUrl: string | null = null;

  onChange = (_: any) => {};
  onTouched = () => {};
  onValidatorChange = (): void => {};

  constructor(private storage: Storage, private cdr: ChangeDetectorRef) {}

  onFileSelected(event: any) {
    const selectedFile = event.target.files[0];
    if (selectedFile) {
      this.fileName = selectedFile.name;
      const filePath = `recipes/${crypto.randomUUID()}/${this.fileName}`;
      const storageRef = ref(this.storage, filePath);
      const uploadTask = uploadBytesResumable(storageRef, selectedFile);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          this.uploadPercentage = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          this.cdr.detectChanges();
        },
        (error) => (this.fileUploadError = error.message),
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            this.uploadPercentage = 0;
            this.isFileUploadSuccessfull = true;
            this.onValidatorChange();
            this.onChange(downloadURL);
            this.fileUrl = downloadURL;
            this.cdr.detectChanges();
          });
        }
      );
    }
  }

  onFileUploadCancelled() {
    if (this.isFileUploadSuccessfull) {
      const storageRef = ref(this.storage, this.fileUrl!);
      deleteObject(storageRef);
      alert();
    }
  }

  onClicked(fileUpload: HTMLInputElement) {
    this.onTouched();
    fileUpload.click();
  }

  writeValue(value: string): void {
    this.fileUrl = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  validate(control: AbstractControl): ValidationErrors | null {
    if (control.dirty) {
      if (this.isFileUploadSuccessfull) return null;

      let errors: ValidationErrors = {
        requiredFileType: this.requireFiletype,
      };

      if (this.fileUploadError) {
        errors['fileUploadError'] = this.fileUploadError;
      }
      return errors;
    }

    return null;
  }

  registerOnValidatorChange(fn: () => void) {
    this.onValidatorChange = fn;
  }
}
