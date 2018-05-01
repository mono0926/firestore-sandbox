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
const firestore = admin.firestore();
var State;
(function (State) {
    State["online"] = "online";
    State["offline"] = "offline";
})(State = exports.State || (exports.State = {}));
exports.onStatusUpdated = functions.database.ref(`/status/{userId}`).onUpdate((change, context) => __awaiter(this, void 0, void 0, function* () {
    const eventStatus = change.after.val();
    const eventStatusRef = change.after.ref;
    const userId = context.params.userId;
    const newStatusSnapshot = yield eventStatusRef.once('value');
    const newStatus = newStatusSnapshot.val();
    if (newStatus.lastChanged > eventStatus.lastChanged) {
        return;
    }
    const statusForFirestore = {
        state: newStatus.state,
        lastChanged: new Date(newStatus.lastChanged)
    };
    const userRef = firestore.collection('users').doc(userId);
    yield userRef.set({ status: statusForFirestore }, { merge: true });
}));
//# sourceMappingURL=databaseTriggers.js.map