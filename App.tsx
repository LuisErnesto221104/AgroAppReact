import { useState } from 'react';
import { Button, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { obtenerInfoBridge, probarBridge } from './src/native/BridgeModule';

function App() {
  const [resultado, setResultado] = useState('Sin prueba todavia.');
  const [infoModulo, setInfoModulo] = useState('Sin info del modulo.');

  const ejecutarPrueba = async () => {
    try {
      // Llamada minima para validar el flujo JS -> Java -> JS.
      const mensaje = await probarBridge('Ernesto');
      setResultado(mensaje);

      // Segunda llamada opcional para confirmar metadata del modulo nativo.
      const info = await obtenerInfoBridge();
      setInfoModulo(
        `Modulo: ${info.module} | Lenguaje: ${info.language} | Ready: ${String(info.ready)}`,
      );
    } catch (error: any) {
      const mensajeError = error?.message ?? 'Error desconocido en la prueba del bridge.';
      setResultado(`Error: ${mensajeError}`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Prueba Native Modules Bridge</Text>
        <Text style={styles.subtitle}>Sin UI compleja: solo llamada y respuesta.</Text>

        <Button title="Probar llamada JS <-> Java" onPress={ejecutarPrueba} />

        <Text style={styles.label}>Resultado:</Text>
        <Text style={styles.value}>{resultado}</Text>

        <Text style={styles.label}>Info modulo:</Text>
        <Text style={styles.value}>{infoModulo}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1B1B1B',
  },
  subtitle: {
    fontSize: 14,
    color: '#3D3D3D',
    marginBottom: 8,
  },
  label: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#1B1B1B',
  },
  value: {
    fontSize: 14,
    color: '#2E2E2E',
  },
});

export default App;
