import { connectProducer, disconnectProducer } from './producers/index.js';

export const initKafka = async (retries = 5, delay = 5000) => {
  for (let i = 0; i < retries; i++) {
    try {
      await connectProducer();
      console.log("📡 Auth Service Kafka Producer Connected");
      // Initialize consumers if any
      return;
    } catch (error) {
      console.error(`❌ Auth Service Kafka Startup Error (attempt ${i + 1}/${retries}):`, error.message);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay));
      } else {
        console.error("🔥 Auth Service Kafka Failed after max retries.");
        throw error;
      }
    }
  }
};

export const shutdownKafka = async () => {
  await disconnectProducer();
};

export * from './producers/index.js';
export * from './topics/index.js';
