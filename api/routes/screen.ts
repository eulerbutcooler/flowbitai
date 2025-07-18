import { Router, Request, Response } from "express";
import { authenticateJWT } from "../middleware/authMiddleware";
import fs from "fs";
import path from "path";

interface AuthenticatedRequest extends Request {
  user?: {
    customerId: string;
  };
}

const router = Router();

interface Screen {
  id: string;
  name: string;
  url: string;
  scope: string;
  module: string;
  route: string;
}

interface TenantConfig {
  name: string;
  screens: Screen[];
}

interface Registry {
  tenants: Record<string, TenantConfig>;
}

const loadRegistry = (): Registry => {
  try {
    const registryPath = path.join(process.cwd(), "registry.json");
    const registryContent = fs.readFileSync(registryPath, "utf-8");
    return JSON.parse(registryContent);
  } catch {
    return { tenants: {} };
  }
};

router.get("/me/screens", authenticateJWT, (req: AuthenticatedRequest, res: Response) => {
  try {
    const { customerId } = req.user || {};
    if (!customerId) {
      return res.status(401).json({ error: "User not authenticated" });
    }

    const registry = loadRegistry();
    const tenantConfig = registry.tenants[customerId];

    if (!tenantConfig) {
      return res.json({
        success: true,
        data: {
          tenant: customerId,
          screens: [],
        },
      });
    }

    res.json({
      success: true,
      data: {
        tenant: customerId,
        tenantName: tenantConfig.name,
        screens: tenantConfig.screens,
      },
    });
  } catch {
    res.status(500).json({
      success: false,
      error: "Failed to fetch screens",
    });
  }
});

export default router;
