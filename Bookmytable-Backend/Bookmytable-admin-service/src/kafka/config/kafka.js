import { Kafka, Partitioners } from "kafkajs";
import dotenv from "dotenv";
dotenv.config();

const kafka = new Kafka({
  clientId: process.env.KAFKA_CLIENT_ID || "admin-service",
  brokers: process.env.KAFKA_BROKERS
    ? process.env.KAFKA_BROKERS.split(",")
    : ["localhost:9092"],
  ssl: process.env.KAFKA_SSL === "true",
  sasl: process.env.KAFKA_USERNAME
    ? {
        mechanism: "plain",
        username: process.env.KAFKA_USERNAME,
        password: process.env.KAFKA_PASSWORD,
      }
    : undefined,
});

export const producer = kafka.producer({
  createPartitioner: Partitioners.LegacyPartitioner,
});

export default kafka;
