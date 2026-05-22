import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { CategoriaGasto, CATEGORIA_GASTO_LABELS } from '../../../types/Costos';
import { FONTS } from '../../../shared/theme/identity';

export interface FiltroGastosParams {
  fechaDesde: string | null;
  fechaHasta: string | null;
  categoria: CategoriaGasto | null;
}

interface FiltroGastosModalProps {
  visible: boolean;
  onClose: () => void;
  onAplicar: (f: FiltroGastosParams) => void;
}

const FILTRO_VACIO: FiltroGastosParams = {
  fechaDesde: null,
  fechaHasta: null,
  categoria: null,
};

const CATEGORIAS = Object.values(CategoriaGasto);

// Auto-inserta guiones: 20260507 → 2026-05-07
function formatFecha(raw: string): string {
  const d = raw.replace(/\D/g, '').slice(0, 8);
  if (d.length <= 4) return d;
  if (d.length <= 6) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return `${d.slice(0, 4)}-${d.slice(4, 6)}-${d.slice(6)}`;
}

export function FiltroGastosModal({ visible, onClose, onAplicar }: FiltroGastosModalProps) {
  const [fechaDesde, setFechaDesde] = useState('');
  const [fechaHasta, setFechaHasta] = useState('');
  const [categoria, setCategoria] = useState<CategoriaGasto | null>(null);

  const handleLimpiar = () => {
    setFechaDesde('');
    setFechaHasta('');
    setCategoria(null);
    onAplicar(FILTRO_VACIO);
    onClose();
  };

  const handleAplicar = () => {
    const desde = fechaDesde.trim() || null;
    const hasta  = fechaHasta.trim() || null;
    if (desde && hasta && hasta < desde) {
      Alert.alert('Rango inválido', 'La fecha "Hasta" no puede ser anterior a "Desde".', [{ text: 'Entendido' }]);
      return;
    }
    onAplicar({ fechaDesde: desde, fechaHasta: hasta, categoria });
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>

      {/* Contenedor full-screen: backdrop arriba + sheet abajo como HERMANOS */}
      <View style={styles.container}>

        {/* Backdrop — toca aquí para cerrar */}
        <Pressable style={styles.backdrop} onPress={onClose} />

        {/* Sheet — sube con el teclado en iOS */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.sheet}
        >
          {/* Tirador visual */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtrar Gastos</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={10}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          {/* Cuerpo con scroll */}
          <ScrollView
            keyboardShouldPersistTaps="always"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.bodyContent}
          >
            {/* Fechas */}
            <Text style={styles.sectionLabel}>RANGO DE FECHAS</Text>
            <Text style={styles.hint}>Solo escribe números — los guiones se insertan solos</Text>

            <TextInput
              style={styles.input}
              placeholder="Desde  YYYY-MM-DD"
              placeholderTextColor="#a0b4a8"
              keyboardType="number-pad"
              value={fechaDesde}
              onChangeText={v => setFechaDesde(formatFecha(v))}
              maxLength={10}
              autoCorrect={false}
              returnKeyType="next"
            />
            <TextInput
              style={styles.input}
              placeholder="Hasta  YYYY-MM-DD"
              placeholderTextColor="#a0b4a8"
              keyboardType="number-pad"
              value={fechaHasta}
              onChangeText={v => setFechaHasta(formatFecha(v))}
              maxLength={10}
              autoCorrect={false}
              returnKeyType="done"
            />

            {/* Categoría */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>CATEGORÍA</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
              keyboardShouldPersistTaps="always"
              nestedScrollEnabled
            >
              <Pressable
                style={[styles.chip, categoria === null && styles.chipActive]}
                onPress={() => setCategoria(null)}
              >
                <Text style={[styles.chipText, categoria === null && styles.chipTextActive]}>
                  Todas
                </Text>
              </Pressable>

              {CATEGORIAS.map(cat => {
                const activo = categoria === cat;
                return (
                  <Pressable
                    key={cat}
                    style={[styles.chip, activo && styles.chipActive]}
                    onPress={() => setCategoria(cat)}
                  >
                    <Text style={[styles.chipText, activo && styles.chipTextActive]}>
                      {CATEGORIA_GASTO_LABELS[cat]}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
          </ScrollView>

          {/* Botones */}
          <View style={styles.footer}>
            <Pressable
              style={({ pressed }) => [styles.btnLimpiar, pressed && { opacity: 0.7 }]}
              onPress={handleLimpiar}
            >
              <Text style={styles.btnLimpiarText}>Limpiar</Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [styles.btnAplicar, pressed && { opacity: 0.85 }]}
              onPress={handleAplicar}
            >
              <Text style={styles.btnAplicarText}>Aplicar filtros</Text>
            </Pressable>
          </View>

        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  // Contenedor full-screen
  container: {
    flex: 1,
    justifyContent: 'flex-end',
  },

  // Backdrop semitransparente — flex:1 ocupa todo el espacio sobre el sheet
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },

  // Sheet — altura natural según contenido, máx 85% de pantalla
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '85%',
    // SIN overflow:'hidden' — bloqueaba TextInput en Android
  },

  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#dde8dd',
    marginTop: 10,
    marginBottom: 4,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2ee',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: '#1c2b1d',
  },
  closeBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: '#f0f4f0',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#4a6350',
    fontFamily: FONTS.bold,
  },

  // Cuerpo
  bodyContent: {
    padding: 20,
    paddingBottom: 16,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#6a8a72',
    letterSpacing: 1.2,
    marginBottom: 6,
  },
  hint: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: '#a0b4a8',
    marginBottom: 10,
  },

  // Inputs
  input: {
    borderWidth: 1.5,
    borderColor: '#c8dece',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 13,
    fontFamily: FONTS.regular,
    fontSize: 15,
    color: '#1c2b1d',
    backgroundColor: '#ffffff',
    marginBottom: 10,
  },

  // Chips de categoría
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
    paddingTop: 2,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: '#07612d',
    backgroundColor: '#ffffff',
  },
  chipActive: {
    backgroundColor: '#07612d',
  },
  chipText: {
    fontSize: 12,
    fontFamily: FONTS.semiBold,
    color: '#07612d',
  },
  chipTextActive: {
    color: '#ffffff',
  },

  // Footer
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eef2ee',
  },
  btnLimpiar: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#07612d',
    alignItems: 'center',
  },
  btnLimpiarText: {
    color: '#07612d',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  btnAplicar: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 12,
    backgroundColor: '#07612d',
    alignItems: 'center',
  },
  btnAplicarText: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
});
