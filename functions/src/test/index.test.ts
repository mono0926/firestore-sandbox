// assertを使えるように
import * as chai from 'chai';
const assert = chai.assert;
// Firebaseライブラリ
import * as admin from 'firebase-admin';
import * as fftest from 'firebase-functions-test';
// 自動テスト用プロジェクトを初期化
const test = fftest({
  databaseURL: 'https://firestore-test-mono.firebaseio.com',
  storageBucket: 'firestore-test-mono.appspot.com',
  projectId: 'firestore-test-mono'
}, `${__dirname}/../../keys/serviceAccountKey.json`);

import * as target from '../index';
const firestore = admin.firestore();

import * as myUtil from '../util';

describe('index.tsに定義されたFirestoreトリガー', () => {
  after(() => {
    test.cleanup();
    myUtil.deleteCollection(firestore.collection('posts'));
  });
  describe('onUsersPostCreateトリガー', () => {
    const userId = 'test-user1';
    const postId = 'test-post1';
    const refPath = `users/${userId}/posts/${postId}`;
    const title = 'test-title';
    const body = 'test-body';
    const post: target.Post = {
      title,
      body
    };
    context('onUsersPostCreate: /users/test-user1/posts/test-post1 に新規ドキュメント追加', () => {
      before(async () => {
        const snapshot = test.firestore.makeDocumentSnapshot(post, `users/${userId}/posts/${postId}`);
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
});