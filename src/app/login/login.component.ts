import { Component, OnInit } from '@angular/core';
import { EmailAuthProvider, GoogleAuthProvider } from '@angular/fire/auth';
import * as firebaseui from 'firebaseui';
import { AuthorizationService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  firebaseUI: firebaseui.auth.AuthUI | undefined;

  constructor(private authService: AuthorizationService) {}

  ngOnInit() {
    const uiConfig = {
      signInOptions: [
        EmailAuthProvider.PROVIDER_ID,
        GoogleAuthProvider.PROVIDER_ID,
      ],
      callbacks: {
        signInSuccessWithAuthResult: this.authService.onLoginSuccessful.bind(
          this.authService
        ),
      },
    };

    this.firebaseUI = new firebaseui.auth.AuthUI(this.authService.getAuth());

    this.firebaseUI.start('#firebaseui-auth-container', uiConfig);

    // this.firebaseUI.disableAutoSignIn();
  }

  loginAsGuest() {
    this.authService.onLoginAsGuest();
  }

  ngOnDestroy() {
    this.firebaseUI?.delete();
  }
}
