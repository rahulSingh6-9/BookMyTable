import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

const saslMechanism = process.env.KAFKA_SASL_MECHANISM || "scram-sha-256";

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "notification-service",
  brokers: process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",")
    : (() => { throw new Error("[Kafka] KAFKA_BROKERS environment variable is not set"); })(),
  ssl: process.env.KAFKA_SSL === "true",
  sasl: process.env.KAFKA_USERNAME
    ? {
        mechanism: saslMechanism,
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
      }
    : undefined,
  retry: {
    initialRetryTime: 300,
    retries: 10,
  },
});

export const producer = kafka.producer();
export default kafka;
