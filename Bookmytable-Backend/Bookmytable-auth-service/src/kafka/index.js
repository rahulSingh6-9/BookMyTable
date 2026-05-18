import { connectProducer, disconnectProducer } from './producers/index.js';

export const initKafka = async () => {
  await connectProducer();
  // Initialize consumers if any
};

export const shutdownKafka = async () => {
  await disconnectProducer();
};

export * from './producers/index.js';
export * from './topics/index.js';
