import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

import { from, Observable } from 'rxjs';
import { map, tap, switchMap, mergeMap, take, catchError } from 'rxjs/operators';

import { Actions, Effect, ofType } from '@ngrx/effects';
import * as firebase from 'firebase';
import * as AuthActions from '../actions/auth.actions';

@Injectable()
export class AuthEffects {

  @Effect()
  authSignup = this.actions$.pipe(
    ofType(AuthActions.TRY_SIGNUP),
    map((action: AuthActions.TrySignup) => {
      return action.payload;
    })
    , switchMap((authData: { username: string, password: string }) => {
      return from(firebase.auth().createUserWithEmailAndPassword(authData.username, authData.password));
    })
    , switchMap(() => {
      return from(firebase.auth().currentUser.getIdToken());
    })
    , mergeMap((token: string) => {
      return [
        {
          type: AuthActions.SIGNUP
        },
        {
          type: AuthActions.SET_TOKEN,
          payload: token
        }
      ];
    })
  );

  @Effect()
  authSignin = this.actions$.pipe(
    ofType(AuthActions.TRY_SIGNIN),
    map((action: AuthActions.TrySignup) => {
        return action.payload;
      })
      , switchMap((authData: { username: string, password: string }) => {
        return from(firebase.auth().signInWithEmailAndPassword(authData.username, authData.password).catch((err) => {
          alert('Incorrect email or password');
          return Observable.throw(err)
      }));
      })
      , switchMap(() => {
        return from(firebase.auth().currentUser.getIdToken());
      })
      , mergeMap((token: string) => {
        this.router.navigate(['/']);
        return [
          {
            type: AuthActions.SIGNIN
          },
          {
            type: AuthActions.SET_TOKEN,
            payload: token
          }
        ];
    }), catchError((err, caught) => {
      console.log(err);
      return caught;
    })
  );

  @Effect({dispatch: false})
  authLogout = this.actions$.pipe(
    ofType(AuthActions.LOGOUT),
    tap(() => {
      this.router.navigate(['/']);
    })
  );

  constructor(private actions$: Actions, private router: Router) {
  }
}
