import React, { useState, useEffect } from 'react';
import { X, Download, Loader2, ZoomIn, ZoomOut, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

interface ImagePreviewModalProps {
  imageId: string;
  imageTitle: string;
  onClose: () => void;
  onDownload: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  currentIndex?: number;
  totalImages?: number;
}

export default function ImagePreviewModal({ 
  imageId, 
  imageTitle, 
  onClose, 
  onDownload,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  currentIndex,
  totalImages
}: ImagePreviewModalProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  useEffect(() => {
    loadImage();
  }, [imageId]);

  const loadImage = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('authToken');
      
      // Usar el proxy de Vercel en lugar de llamada directa al backend
      const proxyUrl = `/api/proxy?path=Hostinger/getImage/${imageId}`;

      const response = await fetch(proxyUrl, {
        method: 'GET',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Accept': 'application/json, image/*',
        },
      });

      if (!response.ok) {
        throw new Error('Error al cargar la imagen');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } catch (err) {
      console.error('Error loading image:', err);
      setError('No se pudo cargar la imagen');
    } finally {
      setLoading(false);
    }
  };

  // Limpiar URL cuando se desmonte el componente
  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  // Cerrar con tecla ESC y navegar con flechas
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && hasPrevious && onPrevious) {
        onPrevious();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, onNext, onPrevious, hasNext, hasPrevious]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadSuccess(false);
    
    try {
      // Ejecutar la descarga
      onDownload();
      
      // Simular un pequeño delay para mostrar el estado de descarga
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mostrar mensaje de éxito
      setDownloadSuccess(true);
      
      // Ocultar mensaje después de 3 segundos
      setTimeout(() => {
        setDownloadSuccess(false);
      }, 3000);
    } catch (err) {
      console.error('Error al descargar:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
      onClick={handleBackdropClick}
    >
      {/* Modal Container */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#124C45] to-[#023D4F]">
          {/* Título - Fila separada en móvil */}
          <div className="p-3 sm:p-4 border-b border-white/10 lg:border-b-0">
            <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-white truncate">
              {imageTitle}
            </h3>
          </div>
          
          {/* Controles - Fila separada en móvil */}
          <div className="flex items-center justify-between p-2 sm:p-3 lg:p-4 lg:pt-0">
            {/* Zoom Controls - Ahora controlados por TransformWrapper */}
            {!loading && !error && (
              <div className="flex items-center gap-1 sm:gap-2">
                <p className="text-white text-xs sm:text-sm">
                  Usa la rueda del mouse o pellizca para hacer zoom
                </p>
              </div>
            )}
            
            {/* Right Controls */}
            <div className="flex items-center gap-1 sm:gap-2">
              {/* Download Button */}
              <button
                onClick={handleDownload}
                disabled={loading || !!error || isDownloading}
                className="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed relative"
                title={isDownloading ? "Descargando..." : "Descargar"}
              >
                {isDownloading ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                )}
              </button>
              
              {/* Close Button */}
              <button
                onClick={onClose}
                className="p-1.5 sm:p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                title="Cerrar (ESC)"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Image Container */}
        <div className="relative bg-gray-100" style={{ height: 'calc(90vh - 140px)' }}>
          {loading && (
            <div className="flex flex-col items-center justify-center h-full">
              <Loader2 className="w-12 h-12 text-[#124C45] animate-spin mb-4" />
              <p className="text-gray-600">Cargando imagen...</p>
            </div>
          )}

          {error && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-red-500 text-center">
                <X className="w-12 h-12 mx-auto mb-4" />
                <p className="text-lg font-semibold mb-2">Error</p>
                <p className="text-sm">{error}</p>
              </div>
              <button
                onClick={loadImage}
                className="mt-4 px-4 py-2 bg-[#124C45] text-white rounded-lg hover:bg-[#0f3d37] transition-colors"
              >
                Reintentar
              </button>
            </div>
          )}

          {!loading && !error && imageUrl && (
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={3}
              centerOnInit={true}
              limitToBounds={false}
              panning={{ disabled: false, velocityDisabled: false }}
              wheel={{ step: 0.1 }}
              doubleClick={{ disabled: false, step: 0.7 }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  {/* Controles de Zoom Flotantes */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-black/60 backdrop-blur-md rounded-lg p-2">
                    <button
                      onClick={() => zoomIn()}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      title="Acercar"
                    >
                      <ZoomIn className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => zoomOut()}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
                      title="Alejar"
                    >
                      <ZoomOut className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors text-xs"
                      title="Resetear"
                    >
                      1:1
                    </button>
                  </div>

                  <TransformComponent
                    wrapperStyle={{
                      width: '100%',
                      height: '100%',
                      cursor: 'grab'
                    }}
                    contentStyle={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <img
                      src={imageUrl}
                      alt={imageTitle}
                      className="rounded-lg shadow-lg max-w-full max-h-full object-contain"
                      draggable={false}
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>
          )}
        </div>

        {/* Botones de Navegación - Fijos sobre el contenedor */}
        {!loading && !error && (
          <>
            {/* Botón Anterior - Lado Izquierdo - Posición Fija */}
            {hasPrevious && onPrevious && (
              <button
                onClick={onPrevious}
                className="fixed left-4 sm:left-8 top-1/2 transform -translate-y-1/2 z-50 bg-black/60 hover:bg-black/80 text-white p-3 sm:p-4 rounded-full transition-all duration-200 backdrop-blur-md shadow-2xl border border-white/20"
                title="Imagen anterior (←)"
                style={{
                  left: 'max(1rem, calc((100vw - 1536px) / 2 + 1rem))'
                }}
              >
                <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}

            {/* Botón Siguiente - Lado Derecho - Posición Fija */}
            {hasNext && onNext && (
              <button
                onClick={onNext}
                className="fixed right-4 sm:right-8 top-1/2 transform -translate-y-1/2 z-50 bg-black/60 hover:bg-black/80 text-white p-3 sm:p-4 rounded-full transition-all duration-200 backdrop-blur-md shadow-2xl border border-white/20"
                title="Siguiente imagen (→)"
                style={{
                  right: 'max(1rem, calc((100vw - 1536px) / 2 + 1rem))'
                }}
              >
                <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            )}
          </>
        )}

        {/* Footer with instructions */}
        {!loading && !error && (
          <div className="p-3 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500 flex-1">
                <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">ESC</kbd> cerrar
                {(hasNext || hasPrevious) && (
                  <>
                    {' • '}
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">←</kbd>
                    {' '}
                    <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs">→</kbd>
                    {' '}navegar
                  </>
                )}
                {' • Arrastra para mover'}
              </p>
              {currentIndex !== undefined && totalImages !== undefined && (
                <p className="text-xs text-gray-600 font-medium ml-2">
                  {currentIndex + 1} / {totalImages}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Download Success Toast */}
        {downloadSuccess && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
            <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-2xl flex items-center space-x-3 min-w-[280px] sm:min-w-[320px]">
              <div className="flex-shrink-0">
                <CheckCircle className="w-6 h-6 animate-in zoom-in duration-300" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm sm:text-base">¡Descarga exitosa!</p>
                <p className="text-xs sm:text-sm opacity-90">La imagen se ha descargado correctamente</p>
              </div>
              <button
                onClick={() => setDownloadSuccess(false)}
                className="flex-shrink-0 hover:bg-white/20 rounded p-1 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
