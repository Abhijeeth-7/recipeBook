import { Injectable } from '@angular/core';
import {
  CollectionReference,
  DocumentReference,
  Firestore,
  Query,
  Transaction,
  addDoc,
  collection,
  collectionData,
  collectionGroup,
  deleteDoc,
  doc,
  documentId,
  getCountFromServer,
  getDoc,
  getDocs,
  query,
  runTransaction,
  setDoc,
  updateDoc,
  where,
} from '@angular/fire/firestore';
import { DocumentData } from 'rxfire/firestore/interfaces';
import { Observable, first, from, map, mergeMap, switchMap, tap } from 'rxjs';
import { LoaderService } from './loading.service';
import { deleteObject, ref, Storage } from '@angular/fire/storage';
import { Bookmark } from '../models/bookmark.model';

interface PaginatedResult<T = any> {
  data: T[];
  lastDocRef: any;
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseAPiService {
  protected transactionResult: any;
  constructor(
    private firestoreDB: Firestore,
    private loaderService: LoaderService,
    private storage: Storage
  ) {}

  getDocIdByCollectionRef(path: string[]) {
    return doc(this.getCollectionRef(path)).id;
  }

  getParentDocumentIds(query: Query<DocumentData>) {
    return from(getDocs(query)).pipe(
      map((refs) => refs.docs.map((docRef) => docRef.ref.parent!.parent!.id))
    );
  }

  getCollectionGroupRef(path: string[]) {
    return collectionGroup(this.firestoreDB, path[0]);
  }

  getCollectionRef(path: string[]) {
    return collection(this.firestoreDB, path[0], ...path.slice(1));
  }

  getDocRef(path: string[]) {
    return doc(this.firestoreDB, path[0], ...path.slice(1));
  }

  getDocByRef<T = any>(path: string[]): Observable<T> {
    return from(getDoc(this.getDocRef(path))).pipe(
      map((doc) => Object.assign({ id: doc.id }, doc.data() as T))
    );
  }

  getDoc<T = any>(query: Query<DocumentData>): Observable<T> {
    return from(getDocs(query)).pipe(
      first(),
      map((refs) => {
        if (refs.empty) return {} as T;
        const doc = refs.docs[0];
        return Object.assign({ id: doc.id }, doc.data() as T);
      })
    );
  }

  getDocs<T = any>(query: Query<DocumentData>): Observable<T[]> {
    return from(getDocs(query)).pipe(
      first(),
      map((refs) => {
        if (refs.empty) return [] as T[];
        const docs = refs.docs.map(
          (doc) => Object.assign({ id: doc.id }, doc.data()) as T
        );
        return docs;
      })
    );
  }

  getDocsUsingPagination<T = any>(
    query: Query<DocumentData>
  ): Observable<PaginatedResult<T>> {
    return from(getDocs(query)).pipe(
      first(),
      map((refs) => {
        const docs = refs.docs.map(
          (doc) => Object.assign({ id: doc.id }, doc.data()) as T
        );
        return {
          data: docs,
          lastDocRef: refs.docs[refs.size - 1],
        };
      })
    );
  }

  getCount(query: Query<DocumentData>) {
    return from(getCountFromServer(query)).pipe(
      first(),
      map((snapshot) => snapshot.data().count)
    );
  }

  setDoc(path: string[], documentData: {}) {
    this.loaderService.showLoader();
    const ref = this.getDocRef(path);
    return from(
      setDoc(ref, documentData).then((_) => this.loaderService.hideLoader())
    );
  }

  addDoc(
    collectionRef: CollectionReference<any>,
    objectToAdd: any,
    showLoader: boolean = true
  ) {
    showLoader && this.loaderService.showLoader();
    return from(
      addDoc(collectionRef, JSON.parse(JSON.stringify(objectToAdd)))
    ).pipe(tap((_) => this.loaderService.hideLoader()));
  }

  updateDoc(
    collectionRef: DocumentReference<any>,
    updatedObject: any,
    showLoader: boolean = true
  ) {
    showLoader && this.loaderService.showLoader();
    this.loaderService.showLoader();
    return from(updateDoc(collectionRef, updatedObject)).pipe(
      tap((_) => this.loaderService.hideLoader())
    );
  }

  deleteDoc(path: string[], showLoader: boolean = true) {
    showLoader && this.loaderService.showLoader();
    return from(
      deleteDoc(doc(this.firestoreDB, path[0], ...path.slice(1)))
    ).pipe(tap((_) => this.loaderService.hideLoader()));
  }

  runTransaction(
    transactionCallBack: (transcation: Transaction) => Promise<void>
  ): Observable<any> {
    return from(
      runTransaction(this.firestoreDB, transactionCallBack).then(
        (_) => this.transactionResult
      )
    );
  }

  deleteFile(url: string) {
    const storageRef = ref(this.storage, url);
    deleteObject(storageRef);
  }

  deleteDocsByQuery(query: Query) {
    return from(getDocs(query)).pipe(
      first(),
      tap((refs) => {
        if (!refs.empty) {
          refs.docs.map((doc) => deleteDoc(doc.ref));
        }
      })
    );
  }
}
