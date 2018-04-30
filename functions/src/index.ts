import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as util from 'util';
admin.initializeApp(functions.config().firebase);
const firestore = admin.firestore();

export interface Post {
  readonly title: string;
  readonly body: string;
}

export interface RootPost extends Post {
  authorRef?: FirebaseFirestore.DocumentReference;
}

export const onUsersPostCreate = functions.firestore.document('/users/{userId}/posts/{postId}').onCreate(async (snapshot, context) => {
  console.log(`snapshot: ${util.inspect(snapshot.ref.path)}`);
  await copyToRootWithUsersPostSnapshot(snapshot, context);
});
export const onUsersPostUpdate = functions.firestore.document('/users/{userId}/posts/{postId}').onUpdate(async (change, context) => {
  await copyToRootWithUsersPostSnapshot(change.after, context);
});

async function copyToRootWithUsersPostSnapshot(snapshot: FirebaseFirestore.DocumentSnapshot, context: functions.EventContext) {
  const postId = snapshot.id;
  const userId = context.params.userId;
  const post = snapshot.data() as RootPost;
  post.authorRef = firestore.collection('users').doc(userId);
  await firestore.collection('posts').doc(postId).set(post, { merge: true });
}