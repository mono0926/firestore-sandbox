import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
admin.initializeApp(functions.config().firebase);

interface Post {
  readonly title: string;
  readonly body: string;
}

interface RootPost extends Post {
  authorRef?: FirebaseFirestore.DocumentReference;
}

export const onUsersPostCreate = functions.firestore.document('/users/{userId}/posts/{postId}').onCreate(async (snapshot, context) => {
  await copyUsersPost(snapshot, context);
});
export const onUsersPostUpdate = functions.firestore.document('/users/{userId}/posts/{postId}').onUpdate(async (change, context) => {
  await copyUsersPost(change.after, context);
});

async function copyUsersPost(snapshot: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) {
  const firestore = admin.firestore();
  const userId = context.params.userId;
  const post = snapshot.data() as RootPost;
  post.authorRef = firestore.collection('users').doc(userId);
  await firestore.collection('posts').doc(snapshot.id).set(post, { merge: true });
}