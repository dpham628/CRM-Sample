//page configured for Zoom Phone

export default function SmartEmbed() {
  return (
    <div className="w-full max-w-md mx-auto p-4">
      <div className="rounded-xl shadow-md bg-white border border-gray-200 overflow-hidden">
        <iframe
          src="https://applications.zoom.us/integration/phone/embeddablephone/home"
          allow="clipboard-read; clipboard-write https://applications.zoom.us"
          id="zoom-embeddable-phone-iframe"
          className="w-full h-[calc(100dvh-8rem)] md:h-[80vh] border-none"
        ></iframe>
      </div>
    </div>
  );
}
