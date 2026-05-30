import { Kafka } from "kafkajs";

const kafka = new Kafka({
  clientId: "booking-service",
  brokers: [process.env.KAFKA_BROKERS || "kafka:9092"],
});

export const producer = kafka.producer();
// export const consumer = kafka.consumer({ groupId: "booking-service-group" });
