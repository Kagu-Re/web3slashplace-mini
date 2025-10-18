import './globals.css';

export const metadata = { 
  title: 'CanvasW3 - Web3 Pixel Canvas',
  description: 'A Web3-powered collaborative pixel canvas with real-time updates, multi-chain wallet support, and engaging game mechanics.'
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">
        {children}
      </body>
    </html>
  );
}
