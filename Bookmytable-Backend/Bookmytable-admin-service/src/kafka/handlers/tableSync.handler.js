import BranchReadModel from "../../models/branchReadModel.js";
import { KAFKA_TOPICS } from "../topics/topics.js";

export const syncTable = async (topic, data) => {
  const { branchId, branch } = data; // table models typically have "branch" as branchId
  const targetBranchId = branchId || branch;

  if (!targetBranchId) {
    console.error("❌ Invalid table payload, missing branch relation:", data);
    return;
  }

  const incValue = topic === KAFKA_TOPICS.TABLE_CREATED ? 1 : 
                   topic === KAFKA_TOPICS.TABLE_DELETED ? -1 : 0;

  if (incValue !== 0) {
    await BranchReadModel.findByIdAndUpdate(targetBranchId, { $inc: { tablesCount: incValue } });
  }

  console.log(`🪑 Read-Model Synced: Table [${topic}] metric updated.`);
};
