import React, { useState } from 'react';
import {
  Alert,
  Modal,
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
    const hasta = fechaHasta.trim() || null;

    if (desde && hasta && hasta < desde) {
      Alert.alert(
        'Rango inválido',
        'La fecha "Hasta" no puede ser anterior a la fecha "Desde".',
        [{ text: 'Entendido' }],
      );
      return;
    }

    onAplicar({ fechaDesde: desde, fechaHasta: hasta, categoria });
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Filtrar Gastos</Text>
            <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Rango de fechas */}
            <Text style={styles.sectionLabel}>RANGO DE FECHAS</Text>

            <TextInput
              style={styles.input}
              placeholder="Desde YYYY-MM-DD"
              placeholderTextColor="#a0b4a8"
              keyboardType="numeric"
              value={fechaDesde}
              onChangeText={setFechaDesde}
              maxLength={10}
            />
            <TextInput
              style={styles.input}
              placeholder="Hasta YYYY-MM-DD"
              placeholderTextColor="#a0b4a8"
              keyboardType="numeric"
              value={fechaHasta}
              onChangeText={setFechaHasta}
              maxLength={10}
            />

            {/* Categoría */}
            <Text style={[styles.sectionLabel, { marginTop: 20 }]}>CATEGORÍA</Text>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipsRow}
            >
              {/* Chip Todas */}
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

        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    overflow: 'hidden',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
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
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 16,
    backgroundColor: '#f0f4f0',
  },
  closeBtnText: {
    fontSize: 16,
    color: '#4a6350',
    fontFamily: FONTS.bold,
  },

  // Body
  body: { flex: 1 },
  bodyContent: {
    padding: 20,
    paddingBottom: 8,
  },
  sectionLabel: {
    fontSize: 10,
    fontFamily: FONTS.bold,
    color: '#6a8a72',
    letterSpacing: 1.2,
    marginBottom: 10,
  },

  // Inputs
  input: {
    borderWidth: 1,
    borderColor: '#c8dece',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: '#1c2b1d',
    backgroundColor: '#f9fcf9',
    marginBottom: 10,
  },

  // Chips
  chipsRow: {
    flexDirection: 'row',
    gap: 8,
    paddingBottom: 4,
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
