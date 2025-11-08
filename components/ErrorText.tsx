import { ExclamationTriangleIcon } from "@heroicons/react/24/solid";

export default function ErrorText({ message }: { message?: string }) {
  if (!message) return null;

  return (
    <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2 mt-2 shadow-sm animate-fade-in">
      <ExclamationTriangleIcon className="w-5 h-5 text-red-500 mt-[2px]" />
      <p className="text-sm text-red-700 leading-snug font-medium">{message}</p>
    </div>
  );
}
