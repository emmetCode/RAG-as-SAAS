'use client';
import FileUploadComponent from './components/file-upload';
import ChatComponent from './components/chat';

export default function Home() {
  return (
    <div className="overflow-x-hidden">
      <div className="min-h-screen w-full flex flex-col md:flex-row p-4">
        <div className="flex-1 basis-full md:basis-1/3 min-w-0 min-h-[40vh] md:min-h-screen p-2 flex justify-center items-center">
          <FileUploadComponent />
        </div>
        <div className="flex-1 basis-full md:basis-2/3 min-w-0 min-h-[60vh] md:min-h-screen border-t-2 md:border-t-0 md:border-l-2 border-gray-200 p-2">
          <ChatComponent />
        </div>
      </div>
    </div>
  );
}