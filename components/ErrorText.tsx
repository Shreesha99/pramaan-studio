"use client";

export default function ErrorText({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="text-sm text-red-500 mt-1 text-center animate-fadeIn">
      {message}
    </p>
  );
}
