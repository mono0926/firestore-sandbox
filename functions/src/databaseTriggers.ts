import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { DataSnapshot } from 'firebase-functions/lib/providers/database';
const firestore = admin.firestore();

export enum State {
  online = 'online',
  offline = 'offline'
}

export interface Status {
  readonly state: State;
  readonly lastChanged: Date;
}

export interface StatusForDatabase {
  readonly state: State;
  readonly lastChanged: number;
}

export const onStatusUpdated = functions.database.ref(`/status/{userId}`).onUpdate(async (change, context) => {  
  const eventStatus: StatusForDatabase = change.after.val();
  const eventStatusRef = change.after.ref;
  const userId = context.params.userId;

  const newStatusSnapshot: DataSnapshot = await eventStatusRef.once('value');
  const newStatus: StatusForDatabase = newStatusSnapshot.val();
  if (newStatus.lastChanged > eventStatus.lastChanged) {
    return;
  }
  const statusForFirestore: Status = {
    state: newStatus.state,
    lastChanged: new Date(newStatus.lastChanged)
  };
  const userRef = firestore.collection('users').doc(userId);
  await userRef.set({ status: statusForFirestore }, { merge: true });
});