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
        // console.log("[DEBUG]::[WEATHER_EVENT]::", event);
        // {
        //   city: 'Berlin',
        //   timestamp: '2025-07-21T14:15',
        //   temperature: 20.4,
        //   windspeed: 15.5,
        //   winddirection: 306
        // }
        
        const { city, temperature, timestamp } = event;
        // convert timestamp to UTC Date
        const [date, time] = timestamp.split('T');
        const [hours, minutes, _] = time.split(':');
        const utcDate = new Date(
          Date.UTC(
            Number(date.split('-')[0]), 
            Number(date.split('-')[1]) - 1, 
            Number(date.split('-')[2]), 
            Number(hours), 
            Number(minutes),
          )
        );

        await this.buffer.storeTemperatureReading({ city, temperature, timestamp: utcDate });
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

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}