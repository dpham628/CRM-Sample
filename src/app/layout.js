import { AuthProvider } from "@/context/auth-context";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import PhonePanel from "@/components/PhonePanel";
import EventLog from "@/components/EventLog";
import { CallProvider} from "@/context/global-context";
import { TaskProvider } from "@/context/task-context";

export const metadata = {
  title: "My CRM",
  description: "Contacts, calls, and follow-up tasks in one place.",
  appleWebApp: { capable: true, title: "My CRM", statusBarStyle: "default" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#2563eb",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="crm-shell">
          <div className="crm-sidebar">
          <Sidebar />
        </div>
        <div className="crm-content">
          <header className="mobile-brand">My CRM</header>
          <TaskProvider>
            <EventLog />
            <AuthProvider>
              <CallProvider>
                <main id="crm-main">{children}</main>
              </CallProvider>
            </AuthProvider>
          </TaskProvider>
        </div>
        <PhonePanel />
        </div>
      </body>
    </html>
  );
}

