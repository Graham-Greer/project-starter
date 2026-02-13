import "server-only";

import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { getFirebaseAdminConfig, getFirebaseEnvironment, getFirebaseWebConfig } from "@/lib/config";

function getAppName(environment) {
  return `cms-${environment}`;
}

export function getFirebaseAdminApp(environment = getFirebaseEnvironment()) {
  const appName = getAppName(environment);
  const existing = getApps().find((app) => app.name === appName);
  if (existing) return existing;

  const adminConfig = getFirebaseAdminConfig(environment);
  const webConfig = getFirebaseWebConfig(environment);

  return initializeApp(
    {
      credential: cert({
        projectId: adminConfig.projectId,
        clientEmail: adminConfig.clientEmail,
        privateKey: adminConfig.privateKey,
      }),
      storageBucket: webConfig.storageBucket,
    },
    appName
  );
}

export function getFirebaseAdminDb(environment = getFirebaseEnvironment()) {
  return getFirestore(getFirebaseAdminApp(environment));
}

export function getFirebaseAdminStorage(environment = getFirebaseEnvironment()) {
  return getStorage(getFirebaseAdminApp(environment));
}

export function getFirebaseAdminAuth(environment = getFirebaseEnvironment()) {
  return getAuth(getFirebaseAdminApp(environment));
}
