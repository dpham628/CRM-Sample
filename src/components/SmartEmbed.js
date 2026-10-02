//page configured for Zoom Phone

export default function SmartEmbed() {
  return (
    <div className="smart-embed w-full max-w-md mx-auto p-4">
      <div className="smart-embed-frame rounded-xl shadow-md bg-white border border-gray-200 overflow-hidden">
        <iframe
          src="https://applications.zoom.us/integration/phone/embeddablephone/home"
          allow="clipboard-read; clipboard-write https://applications.zoom.us"
          id="zoom-embeddable-phone-iframe"
          title="Zoom Phone softphone"
          className="w-full h-[80dvh] border-none"
        ></iframe>
      </div>
    </div>
  );
}
