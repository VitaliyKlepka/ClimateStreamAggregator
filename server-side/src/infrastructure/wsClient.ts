import WebSocket from 'ws';
import { config } from '../config';
import { ClimateEvent } from '../domain/candlestick/interfaces/ClimateEvent';
import { RedisBuffer } from './redis';

export class WSClient {
  private ws: WebSocket | null = null;
  private buffer: RedisBuffer;

  constructor(buffer: RedisBuffer) {
    this.buffer = buffer;
  }

  connect() {
    this.ws = new WebSocket(config.websocket.url);

    this.ws.on('open', () => {
      console.log('✅ WebSocket connected');
    });

    this.ws.on('message', async (data: string = '') => {
      try {
        const event: ClimateEvent = JSON.parse(data);
        const { city, temperature, timestamp } = event;
        await this.buffer.storeTemperatureReading({ city, temperature, timestamp: new Date(`${timestamp}`) });
      } catch (err) {
        console.error('❌ WS message error:', err);
      }
    });

    this.ws.on('close', () => {
      console.log('🔴 WebSocket disconnected. Reconnecting in 3s...');
      setTimeout(() => this.connect(), 3000);
    });

    this.ws.on('error', (err) => {
      console.error('❌ WebSocket error:', err);
    });
  }
}