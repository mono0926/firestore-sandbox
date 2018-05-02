// assertを使えるように
import * as chai from 'chai';
const assert = chai.assert;
// Firebaseライブラリ
import * as admin from 'firebase-admin';
import * as fftest from 'firebase-functions-test';
export const test = fftest({
  databaseURL: 'https://firestore-test-mono.firebaseio.com',
  storageBucket: 'firestore-test-mono.appspot.com',
  projectId: 'firestore-test-mono'
}, `${__dirname}/../../keys/serviceAccountKey.json`);

import * as target from '../index';

const firestore = admin.firestore();
const database = admin.database();

import * as myUtil from '../util';
import { FeaturesList } from 'firebase-functions-test/lib/features';
import { StatusForDatabase, State, Status } from '../databaseTriggers';

describe('index.tsに定義されたCloud Fuctions', () => {
  after(() => {
    test.cleanup();
  });
  describe('Firestor Triggers', () => {
    const userId = 'test-user1';
    const postId = 'test-post1';
    const refPath = `users/${userId}/posts/${postId}`;
    const title = 'test-title';
    const body = 'test-body';
    const post: target.Post = {
      title,
      body
    };
    afterEach(async () => {
      await myUtil.deleteCollection(firestore.collection('posts'));
    });
    context('onUsersPostCreate: /users/test-user1/posts/test-post1 に新規ドキュメント追加', () => {
      before(async () => {
        const snapshot = test.firestore.makeDocumentSnapshot(post, refPath);
        const wrapped = test.wrap(target.onUsersPostCreate);
        await wrapped(snapshot, { params: { userId } });
      });
      it('ルートの posts/test-post1 にコピーされる', async () => {
        const snap = await firestore.collection('posts').doc(postId).get();
        const postCopied = snap.data() as target.RootPost;
        assert.equal(postCopied.title, title);
        assert.equal(postCopied.body, body);
        assert.equal(postCopied.authorRef.path, 'users/test-user1');
      });
    });
    context('onUsersPostUpdate: /users/test-user1/posts/test-post1 のドキュメント更新', () => {
      before(async () => {
        const beforeSnap = test.firestore.makeDocumentSnapshot({}, refPath);
        const afterSnap = test.firestore.makeDocumentSnapshot(post, refPath);
        const change = test.makeChange(beforeSnap, afterSnap)
        const wrapped = test.wrap(target.onUsersPostUpdate);
        await wrapped(change, { params: { userId } });
      });
      it('ルートの posts/test-post1 にコピーされる', async () => {
        const snapshot = await firestore.collection('posts').doc(postId).get();
        const postCopied = snapshot.data() as target.RootPost;
        assert.equal(postCopied.title, title);
        assert.equal(postCopied.body, body);
        assert.equal(postCopied.authorRef.path, 'users/test-user1');
      });
    });
  });
  describe('Databaseトリガー', () => {
    const userId = 'test-user1';
    const statusForDatabase: StatusForDatabase = {
      state: State.online,
      lastChanged: 1522540800000 // 2018-04-01T00:00:00+00:00
    };
    afterEach(async () => {
      await myUtil.deleteCollection(firestore.collection('users'));
    });
    context('onDatabaseStatusUpdated: /status/{userId} にstatus更新通知', () => {
      before(async () => {
        const refPath = `status/${userId}`;
        await database.ref(refPath).set(statusForDatabase);
        const beforeSnap = test.database.makeDataSnapshot({}, refPath);
        const afterSnap = test.database.makeDataSnapshot(statusForDatabase, refPath);
        const change = test.makeChange(beforeSnap, afterSnap)
        const wrapped = test.wrap(target.onDatabaseStatusUpdated);
        await wrapped(change, { params: { userId } });
        console.log(target.onDatabaseStatusUpdated);
      });
      it('ルートの users/status にコピーされる', async () => {
        const snap = await firestore.collection('users').doc(userId).get();
        const status = snap.data().status as Status;
        assert.equal(status.state, State.online);
        assert.equal(status.lastChanged.getTime(), statusForDatabase.lastChanged);
      });
    });
  });
});

