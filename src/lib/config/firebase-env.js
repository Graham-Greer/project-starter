const FIREBASE_ENVS = ["dev", "stage", "prod"];

function toEnvSuffix(environment) {
  return environment.toUpperCase();
}

function readEnv(name) {
  const value = process.env[name];
  if (typeof value !== "string") return "";
  return value.trim();
}

function requiredKeysByType(environment, type) {
  const suffix = toEnvSuffix(environment);

  if (type === "web") {
    return [
      `NEXT_PUBLIC_FIREBASE_API_KEY_${suffix}`,
      `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_${suffix}`,
      `NEXT_PUBLIC_FIREBASE_PROJECT_ID_${suffix}`,
      `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_${suffix}`,
      `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_${suffix}`,
      `NEXT_PUBLIC_FIREBASE_APP_ID_${suffix}`,
    ];
  }

  if (type === "admin") {
    return [
      `FIREBASE_ADMIN_PROJECT_ID_${suffix}`,
      `FIREBASE_ADMIN_CLIENT_EMAIL_${suffix}`,
      `FIREBASE_ADMIN_PRIVATE_KEY_${suffix}`,
    ];
  }

  return [];
}

function getMissingKeys(keys) {
  return keys.filter((key) => !readEnv(key));
}

function assertEnvironment(environment) {
  if (!FIREBASE_ENVS.includes(environment)) {
    throw new Error(`Invalid CMS_FIREBASE_ENV "${environment}". Use one of: ${FIREBASE_ENVS.join(", ")}`);
  }
}

function assertRequiredKeys(environment, type) {
  const requiredKeys = requiredKeysByType(environment, type);
  const missingKeys = getMissingKeys(requiredKeys);

  if (missingKeys.length > 0) {
    throw new Error(`Missing Firebase ${type} env keys for "${environment}": ${missingKeys.join(", ")}`);
  }
}

export function getFirebaseEnvironment() {
  const env = readEnv("CMS_FIREBASE_ENV") || "dev";
  assertEnvironment(env);
  return env;
}

export function getFirebaseWebConfig(environment = getFirebaseEnvironment()) {
  assertEnvironment(environment);
  assertRequiredKeys(environment, "web");
  const suffix = toEnvSuffix(environment);

  return {
    apiKey: readEnv(`NEXT_PUBLIC_FIREBASE_API_KEY_${suffix}`),
    authDomain: readEnv(`NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_${suffix}`),
    projectId: readEnv(`NEXT_PUBLIC_FIREBASE_PROJECT_ID_${suffix}`),
    storageBucket: readEnv(`NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_${suffix}`),
    messagingSenderId: readEnv(`NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_${suffix}`),
    appId: readEnv(`NEXT_PUBLIC_FIREBASE_APP_ID_${suffix}`),
  };
}

export function getFirebaseAdminConfig(environment = getFirebaseEnvironment()) {
  assertEnvironment(environment);
  assertRequiredKeys(environment, "admin");
  const suffix = toEnvSuffix(environment);

  return {
    projectId: readEnv(`FIREBASE_ADMIN_PROJECT_ID_${suffix}`),
    clientEmail: readEnv(`FIREBASE_ADMIN_CLIENT_EMAIL_${suffix}`),
    privateKey: readEnv(`FIREBASE_ADMIN_PRIVATE_KEY_${suffix}`).replace(/\\n/g, "\n"),
  };
}

export function getFirebaseConfigHealth(environment = getFirebaseEnvironment()) {
  assertEnvironment(environment);

  return {
    environment,
    webMissingKeys: getMissingKeys(requiredKeysByType(environment, "web")),
    adminMissingKeys: getMissingKeys(requiredKeysByType(environment, "admin")),
  };
}
