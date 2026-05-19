import React from 'react';
import { Alert, Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS } from '../shared/theme/identity';

type EventoDetailModalProps = {
  visible: boolean;
  evento: any;
  onClose: () => void;
  onEdit?: (evento: any) => void;
  onDelete?: (evento: any) => void;
  arete?: string;
};

export function EventoDetailModal({ visible, evento, onClose, onEdit, onDelete, arete }: EventoDetailModalProps) {
  if (!evento) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <View style={styles.header}>
            <View style={styles.titleWrap}>
              <Text style={styles.title}>{evento.tipoEvento || 'Evento Sanitario'}</Text>
              {arete && <Text style={styles.subtitle}>Arete: {arete}</Text>}
            </View>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {evento.descripcion && (
              <View style={styles.field}>
                <Text style={styles.label}>Descripción</Text>
                <Text style={styles.value}>{evento.descripcion}</Text>
              </View>
            )}

            {evento.fechaEvento && (
              <View style={styles.field}>
                <Text style={styles.label}>Fecha del Evento</Text>
                <Text style={styles.value}>{evento.fechaEvento}</Text>
              </View>
            )}

            {evento.veterinario && (
              <View style={styles.field}>
                <Text style={styles.label}>Veterinario</Text>
                <Text style={styles.value}>{evento.veterinario}</Text>
              </View>
            )}

            {evento.dosis && (
              <View style={styles.field}>
                <Text style={styles.label}>Dosis</Text>
                <Text style={styles.value}>{evento.dosis}</Text>
              </View>
            )}

            {evento.fechaProximoEvento && (
              <View style={styles.field}>
                <Text style={styles.label}>Próximo Evento</Text>
                <Text style={styles.value}>{evento.fechaProximoEvento}</Text>
              </View>
            )}

            {evento.observaciones && (
              <View style={styles.field}>
                <Text style={styles.label}>Observaciones</Text>
                <Text style={styles.value}>{evento.observaciones}</Text>
              </View>
            )}
          </ScrollView>

          <View style={styles.actions}>
            {onEdit && (
              <Pressable style={styles.editBtn} onPress={() => onEdit(evento)}>
                <Text style={styles.editBtnText}>✎ Modificar</Text>
              </Pressable>
            )}
            {onDelete && (
              <Pressable
                style={styles.deleteBtn}
                onPress={() => {
                  Alert.alert(
                    'Eliminar evento',
                    '¿Estás seguro de que deseas eliminar este evento sanitario? Esta acción no se puede deshacer.',
                    [
                      { text: 'Cancelar', style: 'cancel' },
                      { text: 'Eliminar', style: 'destructive', onPress: () => onDelete(evento) },
                    ],
                  );
                }}
              >
                <Text style={styles.deleteBtnText}>🗑 Eliminar</Text>
              </Pressable>
            )}
            <Pressable style={styles.closeActionBtn} onPress={onClose}>
              <Text style={styles.closeActionBtnText}>Cerrar</Text>
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
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  card: {
    width: '100%',
    height: '85%',
    backgroundColor: '#fff',
    borderRadius: 18,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  titleWrap: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 22,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.9)',
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    marginTop: 6,
  },
  closeBtn: {
    width: 50,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    color: '#fff',
    fontSize: 28,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  field: {
    marginBottom: 26,
  },
  label: {
    fontFamily: FONTS.semiBold,
    fontSize: 17,
    color: COLORS.primary,
    marginBottom: 8,
  },
  value: {
    fontFamily: FONTS.regular,
    fontSize: 18,
    color: '#333',
    lineHeight: 28,
  },
  actions: {
    flexDirection: 'row',
    gap: 14,
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  editBtn: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: {
    color: '#fff',
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    fontWeight: '700',
  },
  deleteBtn: {
    flex: 1,
    backgroundColor: '#fff0f0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e53935',
  },
  deleteBtnText: {
    color: '#e53935',
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    fontWeight: '700',
  },
  closeActionBtn: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeActionBtnText: {
    color: '#333',
    fontFamily: FONTS.semiBold,
    fontSize: 14,
    fontWeight: '700',
  },
});
