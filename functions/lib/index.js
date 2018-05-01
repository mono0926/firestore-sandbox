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
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const util = require("util");
admin.initializeApp(functions.config().firebase);
const firestore = admin.firestore();
const databaseTriggers = require("./databaseTriggers");
exports.onUsersPostCreate = functions.firestore.document('/users/{userId}/posts/{postId}').onCreate((snapshot, context) => __awaiter(this, void 0, void 0, function* () {
    console.log(`snapshot: ${util.inspect(snapshot.ref.path)}`);
    yield copyToRootWithUsersPostSnapshot(snapshot, context);
}));
exports.onUsersPostUpdate = functions.firestore.document('/users/{userId}/posts/{postId}').onUpdate((change, context) => __awaiter(this, void 0, void 0, function* () {
    yield copyToRootWithUsersPostSnapshot(change.after, context);
}));
exports.onDatabaseStatusUpdated = databaseTriggers.onStatusUpdated;
function copyToRootWithUsersPostSnapshot(snapshot, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const postId = snapshot.id;
        const userId = context.params.userId;
        const post = snapshot.data();
        post.authorRef = firestore.collection('users').doc(userId);
        yield firestore.collection('posts').doc(postId).set(post, { merge: true });
    });
}
//# sourceMappingURL=index.js.map