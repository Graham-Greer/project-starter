"use client";

import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const VALID_ENVS = ["dev", "stage", "prod"];

function getClientEnvironment() {
  const env = process.env.NEXT_PUBLIC_CMS_FIREBASE_ENV || "dev";
  if (!VALID_ENVS.includes(env)) {
    throw new Error(`Invalid NEXT_PUBLIC_CMS_FIREBASE_ENV "${env}"`);
  }
  return env;
}

function getFirebaseClientConfig() {
  const environment = getClientEnvironment();
  const byEnv = {
    dev: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_DEV,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_DEV,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_DEV,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_DEV,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_DEV,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_DEV,
    },
    stage: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_STAGE,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_STAGE,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_STAGE,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_STAGE,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_STAGE,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_STAGE,
    },
    prod: {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_PROD,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_PROD,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_PROD,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_PROD,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_PROD,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_PROD,
    },
  };

  const config = byEnv[environment];
  const missing = Object.entries(config)
    .filter(([, value]) => !value)
    .map(([key]) => key);

  if (missing.length > 0) {
    throw new Error(`Missing Firebase client env keys for "${environment}": ${missing.join(", ")}`);
  }

  return config;
}

export function getFirebaseClientApp() {
  if (getApps().length > 0) return getApp();
  return initializeApp(getFirebaseClientConfig());
}

export function getFirebaseClientAuth() {
  return getAuth(getFirebaseClientApp());
}
