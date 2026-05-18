import crypto from 'crypto';
import kafka from '../config/kafka.config.js';

const producer = kafka.producer();

export const connectProducer = async () => {
  try {
    await producer.connect();
    console.log('✅ Kafka Producer connected');
  } catch (error) {
    console.error('❌ Kafka Producer connection error:', error);
  }
};

export const disconnectProducer = async () => {
  await producer.disconnect();
};

/**
 * Standardized event emitter for Auth Service
 * Enforces: eventId, eventType, correlationId, timestamp, source, version, data, payload
 */
export const emitEvent = async (topic, payload, correlationId = crypto.randomUUID()) => {
  try {
    const event = {
      eventId: crypto.randomUUID(),
      eventType: topic,
      correlationId: payload.correlationId || correlationId,
      timestamp: new Date().toISOString(),
      source: "auth-service",
      version: "1.0",
      data: payload,
      payload: payload // Keep legacy support for existing consumers
    };

    await producer.send({
      topic,
      messages: [
        {
          key: payload.id || payload.userId || undefined,
          value: JSON.stringify(event),
        },
      ],
    });
    console.log(`[Kafka] Standardized Event emitted to topic: ${topic} [ID: ${event.eventId}]`);
    return event;
  } catch (error) {
    console.error(`[Kafka] Error emitting event to ${topic}:`, error);
    throw error;
  }
};

export default producer;
