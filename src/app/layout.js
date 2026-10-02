import { AuthProvider } from "@/context/auth-context";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Sidebar from "../components/Sidebar";
import PhonePanel from "@/components/PhonePanel";
import EventLog from "@/components/EventLog";
import { CallProvider} from "@/context/global-context";
import { TaskProvider } from "@/context/task-context";

export const metadata = {
  title: "My CRM",
  description: "Sample CRM with Zoom Phone Smart Embed",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#2563eb",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <div className="md:flex md:w-screen md:h-screen md:overflow-x-hidden">
          <div className="md:w-[200px] md:shrink-0 sticky top-0 z-40 md:static md:z-auto">
          <Sidebar />
        </div>
        <div className="md:flex-1 min-w-0 pb-24 md:pb-0">
          <TaskProvider>
            <EventLog />
            <AuthProvider>
              <CallProvider>
                <main>{children}</main>
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


