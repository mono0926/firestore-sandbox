"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// assertを使えるように
const chai = require("chai");
const assert = chai.assert;
// Firebaseライブラリ
const admin = require("firebase-admin");
const fftest = require("firebase-functions-test");
exports.test = fftest({
    databaseURL: 'https://firestore-test-mono.firebaseio.com',
    storageBucket: 'firestore-test-mono.appspot.com',
    projectId: 'firestore-test-mono'
}, `${__dirname}/../../keys/serviceAccountKey.json`);
const target = require("../index");
const firestore = admin.firestore();
const database = admin.database();
const myUtil = require("../util");
const databaseTriggers_1 = require("../databaseTriggers");
describe('index.tsに定義されたCloud Fuctions', () => {
    after(() => {
        exports.test.cleanup();
    });
    describe('Firestor Triggers', () => {
        const userId = 'test-user1';
        const postId = 'test-post1';
        const refPath = `users/${userId}/posts/${postId}`;
        const title = 'test-title';
        const body = 'test-body';
        const post = {
            title,
            body
        };
        afterEach(() => __awaiter(this, void 0, void 0, function* () {
            yield myUtil.deleteCollection(firestore.collection('posts'));
        }));
        context('onUsersPostCreate: /users/test-user1/posts/test-post1 に新規ドキュメント追加', () => {
            before(() => __awaiter(this, void 0, void 0, function* () {
                const snapshot = exports.test.firestore.makeDocumentSnapshot(post, refPath);
                const wrapped = exports.test.wrap(target.onUsersPostCreate);
                yield wrapped(snapshot, { params: { userId } });
            }));
            it('ルートの posts/test-post1 にコピーされる', () => __awaiter(this, void 0, void 0, function* () {
                const snap = yield firestore.collection('posts').doc(postId).get();
                const postCopied = snap.data();
                assert.equal(postCopied.title, title);
                assert.equal(postCopied.body, body);
                assert.equal(postCopied.authorRef.path, 'users/test-user1');
            }));
        });
        context('onUsersPostUpdate: /users/test-user1/posts/test-post1 のドキュメント更新', () => {
            before(() => __awaiter(this, void 0, void 0, function* () {
                const beforeSnap = exports.test.firestore.makeDocumentSnapshot({}, refPath);
                const afterSnap = exports.test.firestore.makeDocumentSnapshot(post, refPath);
                const change = exports.test.makeChange(beforeSnap, afterSnap);
                const wrapped = exports.test.wrap(target.onUsersPostUpdate);
                yield wrapped(change, { params: { userId } });
            }));
            it('ルートの posts/test-post1 にコピーされる', () => __awaiter(this, void 0, void 0, function* () {
                const snapshot = yield firestore.collection('posts').doc(postId).get();
                const postCopied = snapshot.data();
                assert.equal(postCopied.title, title);
                assert.equal(postCopied.body, body);
                assert.equal(postCopied.authorRef.path, 'users/test-user1');
            }));
        });
    });
    describe('Databaseトリガー', () => {
        const userId = 'test-user1';
        const statusForDatabase = {
            state: databaseTriggers_1.State.online,
            lastChanged: 1522540800000 // 2018-04-01T00:00:00+00:00
        };
        afterEach(() => __awaiter(this, void 0, void 0, function* () {
            yield myUtil.deleteCollection(firestore.collection('users'));
        }));
        context('onDatabaseStatusUpdated: /status/{userId} にstatus更新通知', () => {
            before(() => __awaiter(this, void 0, void 0, function* () {
                const refPath = `status/${userId}`;
                yield database.ref(refPath).set(statusForDatabase);
                const beforeSnap = exports.test.database.makeDataSnapshot({}, refPath);
                const afterSnap = exports.test.database.makeDataSnapshot(statusForDatabase, refPath);
                const change = exports.test.makeChange(beforeSnap, afterSnap);
                const wrapped = exports.test.wrap(target.onDatabaseStatusUpdated);
                yield wrapped(change, { params: { userId } });
                console.log(target.onDatabaseStatusUpdated);
            }));
            it('ルートの users/status にコピーされる', () => __awaiter(this, void 0, void 0, function* () {
                const snap = yield firestore.collection('users').doc(userId).get();
                const status = snap.data().status;
                assert.equal(status.state, databaseTriggers_1.State.online);
                assert.equal(status.lastChanged.getTime(), statusForDatabase.lastChanged);
            }));
        });
    });
});
//# sourceMappingURL=index.test.js.map