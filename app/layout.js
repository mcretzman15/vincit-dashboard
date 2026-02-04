import './globals.css';

export const metadata = {
  title: 'Vincit Group | Sales Pipeline Executive Report',
  description: 'Real-time HubSpot sales pipeline dashboard for Vincit Group',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
