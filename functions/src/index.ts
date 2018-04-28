import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

export const onUsersPostCreate = functions.firestore.document('/users/{userId}/posts/{postId}').onCreate(async (snapshot, context) => {
  await copyUsersPost(snapshot, context);
});
export const onUsersPostUpdate = functions.firestore.document('/users/{userId}/posts/{postId}').onUpdate(async (change, context) => {
  await copyUsersPost(change.after, context);
});

async function copyUsersPost(snapshot: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) {
  const firestore = admin.firestore();
  const userId = context.params.userId;
  const data = snapshot.data();
  data.authorRef = firestore.collection('users').doc(userId);
  await firestore.collection('posts').doc(snapshot.id).create(data)
}