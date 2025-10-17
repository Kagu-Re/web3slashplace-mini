import { NextApiRequest } from 'next';
import { Server as HTTPServer } from 'http';
import { Server as IOServer } from 'socket.io';
import { getIO, setIO } from '@/lib/state';

export const config = { api: { bodyParser: false } };

export default function handler(req: NextApiRequest, res: any) {
  if (!res.socket.server.io) {
    const httpServer: HTTPServer = res.socket.server as any;
    
    // Configure CORS based on environment
    const corsOrigin = process.env.NODE_ENV === 'production'
      ? process.env.APP_BASE_URL || 'https://yourdomain.com'
      : '*'; // Allow all origins in development
    
    const io = new IOServer(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: { 
        origin: corsOrigin, 
        methods: ['GET', 'POST'],
        credentials: true
      },
      allowEIO3: true,
      transports: ['polling'], // Force polling for Vercel serverless compatibility
      pingTimeout: 30000,
      pingInterval: 25000,
    });
    setIO(io);
    res.socket.server.io = io;
  }
  
  // Handle the request properly
  if (req.method === 'GET') {
    res.status(200).json({ status: 'Socket.IO server ready' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
