import { Kafka } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "notification-service",
  brokers: process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",")
    : ["kafka:9092"],
  ssl: process.env.KAFKA_SSL === "true",
  sasl: process.env.KAFKA_USERNAME
    ? {
        mechanism: "plain",
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
      }
    : undefined,
  retry: {
    initialRetryTime: 300,
    retries: 10
  }
});

export default kafka;
