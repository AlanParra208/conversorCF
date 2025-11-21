"use client";
import { useState, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';

export default function Home() {
  const [modelo, setModelo] = useState<tf.LayersModel | null > (null);
  const [celsius, setCelsius] = useState('');
  const [resultado, setResultado] = useState(null);
  const [estadoCarga, setEstadoCarga] = useState('Cargando IA...');

  // 1. Cargar el modelo al iniciar la página
  useEffect(() => {
    async function cargarModelo() {
      try {
        // Asegúrate que en la carpeta public/model existan el .json Y los archivos .bin
        const m = await tf.loadLayersModel('/model/model.json');
        setModelo(m);
        setEstadoCarga('IA Lista para usar 🚀');
        console.log("Modelo cargado correctamente");
      } catch (error) {
        console.error("Error al cargar el modelo:", error);
        setEstadoCarga('Error al cargar la IA');
      }
    }
    cargarModelo();
  }, []);

  // 2. Función para convertir (Ahora se activa con el botón)
  const convertir = async () => {
    if (!modelo) {
        alert("El modelo aún no ha cargado");
        return;
    }
    
    if (celsius === '') {
        alert("Por favor ingresa un valor");
        return;
    }
    
    const valorNumerico = parseFloat(celsius);
    
    // a. Crear tensor
    const inputTensor = tf.tensor2d([valorNumerico], [1, 1]);
    
    // b. Predecir
    const prediccionTensor = modelo.predict(inputTensor);
    
    // c. Obtener datos
    const valores = await prediccionTensor.data();
    
    // d. Actualizar estado
    setResultado(valores[0].toFixed(2));
    
    // Limpieza de memoria
    inputTensor.dispose();
    prediccionTensor.dispose();
  };

  return (
    <>
    <div className="text-center p-8 bg-gray-900 min-h-screen text-white">
        <h1 className="text-3xl font-bold mb-6">Conversor neural</h1>
        
        <div>
            {/* Indicador de Estado */}
            <div className={`text-sm mb-4 ${estadoCarga.includes('Error') ? 'text-red-400' : estadoCarga.includes('Lista') ? 'text-green-400' : 'text-yellow-400'}`}>
                {estadoCarga}
            </div>

            <div className="max-w-md mx-auto">
                <div className="mb-4">
                    <label htmlFor="celsius" className="block text-sm font-medium text-gray-400 mb-2">
                        Grados Celsius
                    </label>
                    <input
                        id="celsius"
                        type="number"
                        value={celsius}
                        onChange={(e) => {
                            setCelsius(e.target.value);
                            setResultado(null); // Limpia el resultado si cambia el número
                        }} 
                        placeholder="Ingresa valor..."
                        className="w-full p-3 rounded bg-gray-700 border border-gray-600 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                </div>

                {/* --- NUEVO BOTÓN DE CONVERSIÓN --- */}
                <button
                    onClick={convertir}
                    disabled={!modelo || estadoCarga.includes('Error')}
                    className={`w-full p-3 rounded font-bold transition-colors ${
                        !modelo 
                        ? 'bg-gray-600 cursor-not-allowed text-gray-400' 
                        : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg'
                    }`}
                >
                    {modelo ? 'Realizar Conversión' : 'Esperando Modelo...'}
                </button>

                {resultado && (
                    <div className="mt-6 p-4 bg-green-900 rounded-lg shadow-lg animate-pulse">
                        <h3 className="text-lg font-semibold text-green-300 mb-2">
                            Predicción de la IA
                        </h3>
                        <p className="text-4xl font-extrabold text-white">
                            {resultado} °F
                        </p>
                    </div>
                )}
            </div>
        </div>
    </div>
    </>
  );
}