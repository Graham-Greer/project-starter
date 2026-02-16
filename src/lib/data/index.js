import { createFirebaseAdapter } from "./adapters/firebase-adapter";
import {
  createAssetRepository,
  createAlertRepository,
  createAuditLogRepository,
  createPageRepository,
  createSiteRepository,
  createSnapshotRepository,
  createWorkspaceRepository,
} from "./repositories";
import { createSecureCmsDataServices } from "./secure-cms-services";

export function createDataServices({ adapter = createFirebaseAdapter() } = {}) {
  return {
    workspaces: createWorkspaceRepository({ adapter }),
    sites: createSiteRepository({ adapter }),
    pages: createPageRepository({ adapter }),
    snapshots: createSnapshotRepository({ adapter }),
    assets: createAssetRepository({ adapter }),
    auditLogs: createAuditLogRepository({ adapter }),
    alerts: createAlertRepository({ adapter }),
  };
}

export { createSecureCmsDataServices };

export * from "./errors";
export * from "./repositories";
