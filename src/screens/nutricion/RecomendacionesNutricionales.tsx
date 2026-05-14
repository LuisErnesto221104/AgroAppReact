import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import type { EtapaProductiva, TipoAnimal } from '../../types/Nutricion';
import { ETAPA_LABELS, TIPO_LABELS } from '../../types/Nutricion';
import { getRecomendacion } from '../../data/NutricionData';
import { TablaRecomendacion } from '../../components/nutricion/TablaRecomendacion';
import { formatMXN } from '../../utils/formatMXN';

const ETAPAS: EtapaProductiva[] = ['CRIA', 'ENGORDA', 'LECHERA'];
const TIPOS: TipoAnimal[] = ['BOVINO', 'OVINO', 'CAPRINO'];
const VERDE = '#07612d';

interface RecomendacionesNutricionalesProps {
  onBack: () => void;
}

export function RecomendacionesNutricionales({ onBack }: RecomendacionesNutricionalesProps) {
  const [etapa, setEtapa] = useState<EtapaProductiva>('ENGORDA');
  const [tipo, setTipo] = useState<TipoAnimal>('BOVINO');
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const recomendacion = getRecomendacion(etapa, tipo);

  const animarCambio = (cambio: () => void) => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 120,
      useNativeDriver: true,
    }).start(() => {
      cambio();
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });
  };

  const onSharePress = async () => {
    const r = recomendacion;
    const texto =
      `📋 Recomendación Nutricional — AgroApp\n` +
      `Etapa: ${ETAPA_LABELS[r.etapa]}  |  Animal: ${TIPO_LABELS[r.tipoAnimal]}\n\n` +
      `• Proteína mínima: ${r.proteinaMin}% BS\n` +
      `• Energía: ${r.energiaMcal} Mcal EM/kg MS\n` +
      `• Fibra máxima (FDN): ${r.fibraMaxima}% MS\n` +
      `• Agua: ${r.aguaLitrosDia} L/día\n\n` +
      `Suplementos:\n${r.suplementos.map(s => `  - ${s}`).join('\n')}\n\n` +
      `Costo estimado: ${formatMXN(r.gastosEstimadosMXN.mensualPorAnimal)}/mes por animal\n` +
      `Fuente: ${r.gastosEstimadosMXN.fuente}\n\n` +
      `Observaciones: ${r.observaciones}`;

    try {
      await Share.share({ message: texto });
    } catch {
      // el usuario canceló
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Volver</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Nutrición Animal</Text>
        <Pressable onPress={onSharePress} style={styles.shareBtn}>
          <Text style={styles.shareBtnText}>Compartir</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Selectores */}
        <View style={styles.pickersRow}>
          {/* Etapa */}
          <View style={styles.pickerBlock}>
            <Text style={styles.pickerLabel}>Etapa productiva</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={etapa}
                onValueChange={val => animarCambio(() => setEtapa(val as EtapaProductiva))}
                style={styles.picker}
              >
                {ETAPAS.map(e => (
                  <Picker.Item key={e} label={ETAPA_LABELS[e]} value={e} />
                ))}
              </Picker>
            </View>
          </View>

          {/* Tipo animal */}
          <View style={styles.pickerBlock}>
            <Text style={styles.pickerLabel}>Tipo de animal</Text>
            <View style={styles.pickerWrap}>
              <Picker
                selectedValue={tipo}
                onValueChange={val => animarCambio(() => setTipo(val as TipoAnimal))}
                style={styles.picker}
              >
                {TIPOS.map(t => (
                  <Picker.Item key={t} label={TIPO_LABELS[t]} value={t} />
                ))}
              </Picker>
            </View>
          </View>
        </View>

        {/* Chip de selección actual */}
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>
              {TIPO_LABELS[tipo]} — {ETAPA_LABELS[etapa]}
            </Text>
          </View>
        </View>

        {/* Tabla con FadeIn */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TablaRecomendacion recomendacion={recomendacion} />
        </Animated.View>

        {/* Botón share grande al final */}
        <Pressable style={styles.shareBtnBottom} onPress={onSharePress}>
          <Text style={styles.shareBtnBottomText}>Compartir por WhatsApp / Correo</Text>
        </Pressable>

        <Text style={styles.fuenteNota}>
          Datos basados en NRC (2016/2021) e INIFAP. Ajustar según condiciones locales.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: VERDE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 8,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  headerTitle: {
    flex: 1,
    color: 'white',
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    marginLeft: 4,
  },
  shareBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 999,
  },
  shareBtnText: {
    color: 'white',
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
  },
  scroll: {
    padding: 14,
    paddingBottom: 32,
  },
  pickersRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  pickerBlock: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-SemiBold',
    color: '#444',
    marginBottom: 4,
  },
  pickerWrap: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d0e8d8',
    overflow: 'hidden',
  },
  picker: {
    height: 44,
  },
  chipRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  chip: {
    backgroundColor: VERDE,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 5,
  },
  chipText: {
    color: 'white',
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
  },
  shareBtnBottom: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 12,
  },
  shareBtnBottomText: {
    color: 'white',
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
  },
  fuenteNota: {
    fontSize: 10,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    textAlign: 'center',
    marginBottom: 8,
  },
});
