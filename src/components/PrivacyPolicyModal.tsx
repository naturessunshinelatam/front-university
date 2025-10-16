import React, { useState } from 'react';
import { useCountry } from '../contexts/CountryContext';
import { Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function PrivacyPolicyModal() {
  const { 
    showPrivacyModal, 
    selectedCountry,
    acceptPrivacyPolicy,
    rejectPrivacyPolicy
  } = useCountry();

  const [showRejectConfirm, setShowRejectConfirm] = useState(false);

  if (!showPrivacyModal) {
    return null;
  }

  const handleReject = () => {
    setShowRejectConfirm(true);
  };

  const confirmReject = () => {
    rejectPrivacyPolicy();
    setShowRejectConfirm(false);
  };

  const cancelReject = () => {
    setShowRejectConfirm(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full mx-4 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white p-6">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Políticas de Privacidad</h3>
              <p className="text-sm text-white/90 mt-1">
                {selectedCountry.flag} {selectedCountry.name}
              </p>
            </div>
          </div>
        </div>
        
        {/* Content - Scrollable */}
        <div className="overflow-y-auto flex-1">
          <div className="p-6">
            {!showRejectConfirm ? (
              <>
                {/* Welcome Message */}
                <div className="mb-6">
                <div className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <Shield className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-800 font-medium mb-1">
                      Bienvenido a Universidad Sunshine
                    </p>
                    <p className="text-gray-600 text-sm">
                      Detectamos que te encuentras en <span className="font-semibold">{selectedCountry.name}</span>. 
                      Para continuar, por favor lee y acepta nuestras políticas de privacidad.
                    </p>
                  </div>
                </div>
              </div>

              {/* Privacy Policy Content */}
              <div className="mb-6 max-h-[400px] overflow-y-auto border border-gray-200 rounded-lg p-6 bg-gray-50">
                <h4 className="text-lg font-bold text-gray-900 mb-4">
                  Política de Privacidad y Protección de Datos
                </h4>
                
                <div className="space-y-4 text-sm text-gray-700 leading-relaxed">
                  <section>
                    <h5 className="font-semibold text-gray-900 mb-2">1. Información que Recopilamos</h5>
                    <p>
                      En Universidad Sunshine, recopilamos información necesaria para brindarte una experiencia 
                      educativa personalizada. Esto incluye datos de navegación, preferencias de contenido, 
                      y ubicación geográfica para ofrecerte contenido relevante para tu país.
                    </p>
                  </section>

                  <section>
                    <h5 className="font-semibold text-gray-900 mb-2">2. Uso de la Información</h5>
                    <p>
                      Utilizamos tu información para:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Personalizar el contenido educativo según tu ubicación</li>
                      <li>Mejorar nuestros servicios y experiencia de usuario</li>
                      <li>Enviar comunicaciones relevantes sobre productos Nature's Sunshine</li>
                      <li>Cumplir con requisitos legales y regulatorios de {selectedCountry.name}</li>
                    </ul>
                  </section>

                  <section>
                    <h5 className="font-semibold text-gray-900 mb-2">3. Protección de Datos</h5>
                    <p>
                      Implementamos medidas de seguridad técnicas y organizativas para proteger tu información 
                      personal contra acceso no autorizado, pérdida, o alteración. Cumplimos con las leyes de 
                      protección de datos aplicables en {selectedCountry.name}.
                    </p>
                  </section>

                  <section>
                    <h5 className="font-semibold text-gray-900 mb-2">4. Cookies y Tecnologías Similares</h5>
                    <p>
                      Utilizamos cookies y tecnologías similares para mejorar tu experiencia de navegación, 
                      recordar tus preferencias, y analizar el uso de nuestra plataforma. Puedes gestionar 
                      las cookies desde la configuración de tu navegador.
                    </p>
                  </section>

                  <section>
                    <h5 className="font-semibold text-gray-900 mb-2">5. Compartir Información</h5>
                    <p>
                      No vendemos tu información personal a terceros. Podemos compartir información con:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Proveedores de servicios que nos ayudan a operar la plataforma</li>
                      <li>Autoridades cuando sea requerido por ley</li>
                      <li>Afiliados de Nature's Sunshine para fines comerciales legítimos</li>
                    </ul>
                  </section>

                  <section>
                    <h5 className="font-semibold text-gray-900 mb-2">6. Tus Derechos</h5>
                    <p>
                      Tienes derecho a:
                    </p>
                    <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
                      <li>Acceder a tu información personal</li>
                      <li>Solicitar corrección de datos inexactos</li>
                      <li>Solicitar eliminación de tu información</li>
                      <li>Oponerte al procesamiento de tus datos</li>
                      <li>Retirar tu consentimiento en cualquier momento</li>
                    </ul>
                  </section>

                  <section>
                    <h5 className="font-semibold text-gray-900 mb-2">7. Contacto</h5>
                    <p>
                      Para ejercer tus derechos o realizar consultas sobre privacidad, contáctanos en:
                      <br />
                      <span className="font-medium">Email:</span> privacidad@naturessunshine.com
                      <br />
                      <span className="font-medium">Teléfono:</span> Consulta el número de tu país en nuestro sitio web
                    </p>
                  </section>

                  <section>
                    <h5 className="font-semibold text-gray-900 mb-2">8. Cambios a esta Política</h5>
                    <p>
                      Podemos actualizar esta política periódicamente. Te notificaremos sobre cambios 
                      significativos a través de la plataforma o por correo electrónico.
                    </p>
                  </section>

                  <section className="pt-4 border-t border-gray-300">
                    <p className="text-xs text-gray-600">
                      <span className="font-semibold">Última actualización:</span> Enero 2025
                      <br />
                      <span className="font-semibold">Aplicable a:</span> {selectedCountry.name}
                    </p>
                  </section>
                </div>
              </div>


                {/* Footer Note */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  Al aceptar, confirmas que has leído y comprendido nuestra política de privacidad
                </p>
              </>
            ) : (
              /* Reject Confirmation */
              <>
                <div className="mb-6">
                <div className="flex items-start space-x-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-gray-800 font-bold mb-2">
                      ¿Estás seguro que deseas rechazar?
                    </p>
                    <p className="text-gray-600 text-sm mb-3">
                      Si rechazas nuestras políticas de privacidad, serás redirigido automáticamente 
                      al contenido de <span className="font-semibold">Panamá</span>, donde no se requiere 
                      aceptación de políticas.
                    </p>
                    <p className="text-gray-600 text-sm">
                      Podrás volver a intentar acceder al contenido de {selectedCountry.name} en cualquier 
                      momento desde el selector de países.
                    </p>
                  </div>
                </div>
              </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={cancelReject}
                    className="flex-1 bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200"
                  >
                    Volver y Aceptar
                  </button>
                  
                  <button
                    onClick={confirmReject}
                    className="flex-1 bg-red-600 text-white py-4 px-6 rounded-xl font-semibold hover:bg-red-700 transition-all duration-200"
                  >
                    Confirmar Rechazo
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Action Buttons - Fixed at bottom */}
        {!showRejectConfirm && (
          <div className="p-6 border-t border-gray-200 bg-white">
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={acceptPrivacyPolicy}
                className="flex-1 bg-gradient-to-r from-[#124C45] to-[#023D4F] text-white py-4 px-6 rounded-xl font-semibold hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 hover:scale-[1.02]"
              >
                <CheckCircle className="w-5 h-5" />
                <span>Aceptar y Continuar</span>
              </button>
              
              <button
                onClick={handleReject}
                className="flex-1 bg-gray-200 text-gray-700 py-4 px-6 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-200 flex items-center justify-center space-x-2"
              >
                <XCircle className="w-5 h-5" />
                <span>Rechazar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
