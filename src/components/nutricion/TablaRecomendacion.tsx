import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { RecomendacionNutricional } from '../../types/Nutricion';
import { formatMXN } from '../../utils/formatMXN';

interface FilaProps {
  label: string;
  valor: string;
  par: boolean;
}

function Fila({ label, valor, par }: FilaProps) {
  return (
    <View style={[styles.fila, par ? styles.filaPar : styles.filaImpar]}>
      <Text style={styles.filaLabel}>{label}</Text>
      <Text style={styles.filaValor}>{valor}</Text>
    </View>
  );
}

function Seccion({ titulo, children }: { titulo: string; children: React.ReactNode }) {
  return (
    <View style={styles.seccion}>
      <View style={styles.seccionHeader}>
        <Text style={styles.seccionTitulo}>{titulo}</Text>
      </View>
      {children}
    </View>
  );
}

interface TablaRecomendacionProps {
  recomendacion: RecomendacionNutricional;
}

export function TablaRecomendacion({ recomendacion: r }: TablaRecomendacionProps) {
  return (
    <View style={styles.container}>
      {/* Sección 1: Parámetros Nutricionales */}
      <Seccion titulo="Parámetros Nutricionales">
        <Fila label="Proteína mínima" valor={`${r.proteinaMin}% BS`} par={true} />
        <Fila label="Energía metabolizable" valor={`${r.energiaMcal} Mcal EM/kg MS`} par={false} />
        <Fila label="Fibra máxima (FDN)" valor={`${r.fibraMaxima}% MS`} par={true} />
        <Fila label="Agua requerida" valor={`${r.aguaLitrosDia} L/día`} par={false} />
      </Seccion>

      {/* Sección 2: Suplementos */}
      <Seccion titulo="Suplementos Recomendados">
        {r.suplementos.map((sup, i) => (
          <Fila key={i} label={`•`} valor={sup} par={i % 2 === 0} />
        ))}
      </Seccion>

      {/* Sección 3: Estimación de Gasto */}
      <Seccion titulo="Estimación de Gasto">
        <Fila
          label="Costo mensual / animal"
          valor={formatMXN(r.gastosEstimadosMXN.mensualPorAnimal)}
          par={true}
        />
        <Fila label="Fuente" valor={r.gastosEstimadosMXN.fuente} par={false} />
      </Seccion>

      {/* Observaciones */}
      <View style={styles.obsContainer}>
        <Text style={styles.obsTitle}>Observaciones</Text>
        <Text style={styles.obsTexto}>{r.observaciones}</Text>
      </View>
    </View>
  );
}

const VERDE = '#07612d';

const styles = StyleSheet.create({
  container: {
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cde8d5',
    marginBottom: 16,
  },
  seccion: {
    marginBottom: 0,
  },
  seccionHeader: {
    backgroundColor: VERDE,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  seccionTitulo: {
    color: 'white',
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
  },
  fila: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filaPar: {
    backgroundColor: '#dff0e5',
  },
  filaImpar: {
    backgroundColor: '#ffffff',
  },
  filaLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    flex: 1,
  },
  filaValor: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
    flex: 2,
    textAlign: 'right',
  },
  obsContainer: {
    backgroundColor: '#f0f8f2',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#cde8d5',
  },
  obsTitle: {
    fontSize: 12,
    fontFamily: 'Poppins-Bold',
    color: VERDE,
    marginBottom: 4,
  },
  obsTexto: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#444',
    lineHeight: 17,
  },
});
