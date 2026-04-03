export default function NailLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 h-full text-center">
      {/* Spinning nail shape */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4 border-pink-400/20" />

        <div className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-pink-400 border-r-fuchsia-400" />

        {/* Nail shape in center */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-8 h-14 bg-gradient-to-b from-pink-300 to-pink-500 rounded-full shadow-lg" />
        </div>
      </div>

      {/* Text */}
      <div className="space-y-1">
        <p className="text-lg font-medium text-white/85">
          Creating your design...
        </p>
        <p className="text-sm text-white/50">
          Adding polish, sparkle, and perfection ✨
        </p>
      </div>
    </div>
  );
}