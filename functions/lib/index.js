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
admin.initializeApp(functions.config().firebase);
exports.onUsersPostCreate = functions.firestore.document('/users/{userId}/posts/{postId}').onCreate((snapshot, context) => __awaiter(this, void 0, void 0, function* () {
    yield copyUsersPost(snapshot, context);
}));
exports.onUsersPostUpdate = functions.firestore.document('/users/{userId}/posts/{postId}').onUpdate((change, context) => __awaiter(this, void 0, void 0, function* () {
    yield copyUsersPost(change.after, context);
}));
function copyUsersPost(snapshot, context) {
    return __awaiter(this, void 0, void 0, function* () {
        const firestore = admin.firestore();
        const userId = context.params.userId;
        const data = snapshot.data();
        data.authorRef = firestore.collection('users').doc(userId);
        yield firestore.collection('posts').doc(snapshot.id).create(data);
    });
}
//# sourceMappingURL=index.js.map