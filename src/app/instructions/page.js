import React from 'react';

const HomeInstructions = () => {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 text-gray-800 break-words md:break-normal">
      <h1 className="text-2xl font-bold mb-4">📘 Welcome to the Zoom CRM Demo App</h1>

      <p className="mb-4">
        This is a sample CRM built to demonstrate how Zoom&apos;s Phone and Contact Center platforms can be integrated using Smart Embed, Zoom APIs, and OAuth authentication.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">🧰 Tech Stack</h2>
      <ul className="list-disc list-inside mb-4">
        <li>Next.js & React</li>
        <li>TailwindCSS</li>
        <li>Zoom Smart Embed</li>
        <li>Node.js API Routes</li>
        <li>Admin-Level OAuth App</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">🚀 Getting Started</h2>
      <ol className="list-decimal list-inside mb-4">
        <li>Clone the repository and select the branch that fits your use case: <strong>main</strong>, <strong>phone</strong>, or <strong>contact-center</strong>.</li>
        <li>Install dependencies with <code>npm install</code>.</li>
        <li>Set up your <code>.env</code> file with Zoom OAuth credentials.</li>
        <li>Run the app with <code>npm run dev</code>.</li>
      </ol>

      <h2 className="text-xl font-semibold mt-6 mb-2">🔐 Zoom OAuth Setup</h2>
      <p className="mb-2">Use an Admin-level OAuth app in the Zoom App Marketplace with the following:</p>
      <ul className="list-disc list-inside mb-4">
        <li>Add redirect URI like: <code className="break-all md:break-normal">https://your-ngrok-url.ngrok-free.app/api/auth/callback/zoom</code></li>
        <li>Include required scopes for Zoom Phone or Contact Center</li>
      </ul>

      <h2 className="text-xl font-semibold mt-6 mb-2">📞 Smart Embed Setup</h2>
      <p className="mb-2"><strong>For Zoom Phone:</strong> Configure via the Zoom Phone Smart Embed app.</p>
      <p className="mb-2"><strong>For Contact Center:</strong> Set up the integration inside Zoom&apos;s Contact Center Management panel.</p>

      <h2 className="text-xl font-semibold mt-6 mb-2">🔄 App Modes</h2>
      <ul className="list-disc list-inside mb-4">
        <li><strong>main</strong>: UI with hardcoded data + embedded Zoom Phone</li>
        <li><strong>phone</strong>: Live Zoom Phone with Smart Embed + API</li>
        <li><strong>contact-center</strong>: Contact Center Smart Embed + API</li>
      </ul>

      <p className="mt-6 text-sm text-gray-500">
        ⚠️ This app is for demo purposes only. Don&apos;t use real secrets in a public deployment.
      </p>
    </div>
  );
};

export default HomeInstructions;