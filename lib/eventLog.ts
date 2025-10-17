export type PixelEvent = {
  id: string;
  timestamp: number;
  address: string;
  x: number;
  y: number;
};

const MAX_EVENTS = 50;
const events: PixelEvent[] = [];

// Counter to ensure unique IDs even within the same millisecond
let eventCounter = 0;

export function addEvent(address: string, x: number, y: number): PixelEvent {
  const event: PixelEvent = {
    id: `${Date.now()}-${eventCounter++}-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: Date.now(),
    address,
    x,
    y,
  };
  
  events.unshift(event);
  
  if (events.length > MAX_EVENTS) {
    events.pop();
  }
  
  return event;
}

export function getEvents(): PixelEvent[] {
  return [...events];
}

