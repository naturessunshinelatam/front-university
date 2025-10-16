import React from 'react';
import { Play, ExternalLink } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title: string;
  type: 'youtube' | 'video';
  autoplay?: boolean;
}

export default function VideoPlayer({ url, title, type, autoplay = false }: VideoPlayerProps) {
  const getYouTubeEmbedUrl = (url: string) => {
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    if (videoId) {
      return `https://www.youtube.com/embed/${videoId[1]}${autoplay ? '?autoplay=1' : ''}`;
    }
    return url;
  };

  if (type === 'youtube') {
    return (
      <div className="relative w-full aspect-video bg-gray-900 rounded-lg overflow-hidden shadow-lg">
        <iframe
          src={getYouTubeEmbedUrl(url)}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
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