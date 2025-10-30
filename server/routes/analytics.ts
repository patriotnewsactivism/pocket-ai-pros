import { Router } from "express";

import DataStore from "../lib/datastore";

export const createAnalyticsRouter = (store: DataStore) => {
  const router = Router();

  router.get("/summary", async (_req, res, next) => {
    try {
      const summary = await store.getAnalyticsSummary();
      res.json({ summary });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

export default createAnalyticsRouter;
