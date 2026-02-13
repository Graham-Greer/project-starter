import "server-only";

import { getFirebaseAdminConfig, getFirebaseConfigHealth, getFirebaseEnvironment } from "@/lib/config";
import { getFirebaseAdminDb } from "@/lib/firebase";

export function createFirebaseAdapter({ environment } = {}) {
  const resolvedEnvironment = environment || getFirebaseEnvironment();
  const configHealth = getFirebaseConfigHealth(resolvedEnvironment);
  const getDb = () => {
    getFirebaseAdminConfig(resolvedEnvironment);
    return getFirebaseAdminDb(resolvedEnvironment);
  };

  return {
    environment: resolvedEnvironment,
    get configHealth() {
      return configHealth;
    },
    async getDocument({ collection, id }) {
      if (!collection || !id) {
        throw new Error("firebase adapter: getDocument requires collection and id");
      }

      const snapshot = await getDb().collection(collection).doc(id).get();
      if (!snapshot.exists) return null;
      return { ...snapshot.data(), id: snapshot.id };
    },
    async setDocument({ collection, id, payload, merge = false }) {
      if (!collection || !id) {
        throw new Error("firebase adapter: setDocument requires collection and id");
      }

      await getDb().collection(collection).doc(id).set(payload || {}, { merge });
      return { id };
    },
    async listDocuments({ collection, where = [] }) {
      if (!collection) {
        throw new Error("firebase adapter: listDocuments requires collection");
      }

      let query = getDb().collection(collection);
      where.forEach(([field, operator, value]) => {
        query = query.where(field, operator, value);
      });

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
    },
    async createDocument({ collection, id, payload }) {
      if (!collection) {
        throw new Error("firebase adapter: createDocument requires collection");
      }

      const ref = id ? getDb().collection(collection).doc(id) : getDb().collection(collection).doc();
      await ref.set(payload || {});
      return { id: ref.id };
    },
    async deleteDocument({ collection, id }) {
      if (!collection || !id) {
        throw new Error("firebase adapter: deleteDocument requires collection and id");
      }
      await getDb().collection(collection).doc(id).delete();
      return { id };
    },
  };
}
