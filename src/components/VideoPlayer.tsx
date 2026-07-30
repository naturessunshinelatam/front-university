import React from "react";
import { Play, ExternalLink } from "lucide-react";

interface VideoPlayerProps {
  url: string;
  title: string;
  type: "youtube" | "video";
  autoplay?: boolean;
}

export default function VideoPlayer({
  url,
  title,
  type,
  autoplay = false,
}: VideoPlayerProps) {
  const getYouTubeVideoId = (videoUrl: string) => {
    const patterns = [
      /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([^&\n?#/]+)/,
      /youtube\.com\/shorts\/([^&\n?#/]+)/,
      /youtube\.com\/embed\/([^&\n?#/]+)/,
    ];

    for (const pattern of patterns) {
      const match = videoUrl.match(pattern);
      if (match?.[1]) {
        return match[1];
      }
    }

    return null;
  };

  const getYouTubeEmbedUrl = (videoUrl: string) => {
    const videoId = getYouTubeVideoId(videoUrl);

    if (!videoId) {
      return null;
    }

    const params = new URLSearchParams();
    if (autoplay) {
      params.set("autoplay", "1");
    }
    params.set("playsinline", "1");

    const queryString = params.toString();
    return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ""}`;
  };

  if (type === "youtube") {
    const embedUrl = getYouTubeEmbedUrl(url);

    return (
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-gradient-to-br from-gray-900 to-gray-800 px-6 text-center">
            <Play className="w-12 h-12 text-white/90" />
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-white">{title}</h3>
              <p className="text-sm text-white/70">
                No se pudo incrustar el video. Ábrelo directamente en YouTube.
              </p>
            </div>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Abrir en YouTube</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg group cursor-pointer">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center group-hover:bg-opacity-30 transition-all duration-300">
          <Play className="w-8 h-8 text-white ml-1" />
        </div>
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-white hover:text-gray-200 transition-colors"
        >
          <ExternalLink className="w-4 h-4" />
          <span className="text-sm">Ver video completo</span>
        </a>
      </div>
    </div>
  );
}
