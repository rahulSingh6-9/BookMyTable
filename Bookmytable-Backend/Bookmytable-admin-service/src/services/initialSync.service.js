import dotenv from 'dotenv'
dotenv.config()

import axios from "axios";
import { syncUser } from '../kafka/handlers/userSync.handler.js';
import UserReadModel from "../models/userReadModel.js";
import { syncRestaurant } from '../kafka/handlers/restaurantSync.handler.js'; 
import RestaurantReadModel from "../models/restaurantReadModel.js";

// New Handlers
import { syncBrand } from '../kafka/handlers/brandSync.handler.js';
import { syncBranch } from '../kafka/handlers/branchSync.handler.js';
import { syncMembership } from '../kafka/handlers/membershipSync.handler.js';

// New Models
import BrandReadModel from "../models/brandReadModel.js";
import BranchReadModel from "../models/branchReadModel.js";
import MembershipReadModel from "../models/membershipReadModel.js";

const headers = process.env.INTERNAL_API_TOKEN ? { "x-internal-token": process.env.INTERNAL_API_TOKEN } : {};

const performPagedSync = async ({ 
  model, 
  syncFn, 
  url, 
  entityName 
}) => {
  const count = await model.countDocuments();
  if (count > 0) {
    console.log(`⏭️ Initial ${entityName} sync skipped (data already exists)`);
    return;
  }

  console.log(`🔄 Starting initial ${entityName} sync...`);
  let page = 1;
  const limit = 100;

  while (true) {
    try {
      const fullUrl = `${url}?page=${page}&limit=${limit}`;
      const res = await axios.get(fullUrl, { headers });
      const items = res.data.data;

      if (!items || items.length === 0) break;

      console.log(`👀 ${entityName} fetched:`, items.length);
      
      // Sync all items in this page
      await Promise.all(items.map(item => syncFn(item)));

      console.log(`✅ Synced ${entityName} page ${page}`);

      const hasMore = res.data?.meta?.hasMore;
      if (hasMore === false || items.length < limit) break;
      
      page++;
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      console.error(`❌ Error during ${entityName} sync (page ${page}):`, errorMsg);
      // Optional: Log more details if it's a connection error
      if (!error.response) {
        console.error(`   Check if service at ${url} is running.`);
      }
      break;
    }
  }
  console.log(`🎉 Initial ${entityName} sync completed`);
};

export const initialUserSync = () => performPagedSync({
  model: UserReadModel,
  syncFn: syncUser,
  url: `${process.env.USER_SERVICE_URL}/internal/users/export`,
  entityName: "user"
});

export const initialRestaurantSync = () => performPagedSync({
  model: RestaurantReadModel,
  syncFn: syncRestaurant,
  url: `${process.env.RESTAURANT_SERVICE_URL}/internal/restaurants/export`,
  entityName: "restaurant"
});

export const initialBrandSync = () => performPagedSync({
  model: BrandReadModel,
  syncFn: syncBrand,
  url: `${process.env.RESTAURANT_SERVICE_URL}/internal/brands/export`,
  entityName: "brand"
});

export const initialBranchSync = () => performPagedSync({
  model: BranchReadModel,
  syncFn: syncBranch,
  url: `${process.env.RESTAURANT_SERVICE_URL}/internal/branches/export`,
  entityName: "branch"
});

export const initialMembershipSync = () => performPagedSync({
  model: MembershipReadModel,
  syncFn: syncMembership,
  url: `${process.env.RESTAURANT_SERVICE_URL}/internal/memberships/export`,
  entityName: "membership"
});