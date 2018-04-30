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
const admin = require("firebase-admin");
function deleteCollection(collectionRef, batchSize = 500) {
    return __awaiter(this, void 0, void 0, function* () {
        const firestore = admin.firestore();
        const query = collectionRef.orderBy('__name__').limit(batchSize);
        yield deleteQueryBatch(firestore, query, batchSize);
    });
}
exports.deleteCollection = deleteCollection;
function deleteQueryBatch(firestore, query, batchSize) {
    return __awaiter(this, void 0, void 0, function* () {
        const snapshot = yield query.get();
        if (snapshot.size === 0) {
            return;
        }
        const results = yield updateWithBatch((batch) => __awaiter(this, void 0, void 0, function* () {
            snapshot.docs.forEach((doc) => {
                batch.delete(doc.ref);
            });
        }));
        console.log(`deleted count: ${results.length}`);
        yield deleteQueryBatch(firestore, query, batchSize);
    });
}
function updateWithBatch(f) {
    return __awaiter(this, void 0, void 0, function* () {
        const batch = admin.firestore().batch();
        yield f(batch);
        return yield batch.commit();
    });
}
exports.updateWithBatch = updateWithBatch;
//# sourceMappingURL=util.js.map