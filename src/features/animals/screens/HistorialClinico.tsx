import React, { useState } from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View, Pressable } from 'react-native';
import { RegistrarEventoSanitario } from '../../../screens/sanitarios/RegistrarEventoSanitario';
import { useHistorialClinico } from '../../../hooks/useHistorialClinico';
import EventoClinicoCard from '../../../components/EventoClinicoCard';
import { COLORS, FONTS } from '../../../shared/theme/identity';

type Props = {
  route: any;
  navigation: any;
};

export default function HistorialClinico({ route, navigation }: Props) {
  const animalId = route?.params?.animalId || 0;
  const [showRegistrar, setShowRegistrar] = useState(false);
  const { eventos, loading, hasMore, cargarMas, recargar } = useHistorialClinico(animalId);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor={COLORS.primary} barStyle="light-content" />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backTxt}>← Volver</Text>
        </Pressable>
        <Text style={styles.title}>Historial Clínico</Text>
      </View>

      {eventos.length === 0 && !loading ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Sin historial clínico registrado</Text>
        </View>
      ) : (
        <FlatList
          data={eventos}
          keyExtractor={item => String(item.id)}
          renderItem={({ item }) => <EventoClinicoCard evento={item} />}
          onEndReached={() => { if (hasMore) cargarMas(); }}
          onEndReachedThreshold={0.5}
          refreshing={loading}
          onRefresh={recargar}
          contentContainerStyle={{ padding: 16, paddingBottom: 160 }}
        />
      )}

      <Pressable
        style={styles.fab}
        onPress={() => {
          try {
            if (navigation && typeof navigation.navigate === 'function') {
              navigation.navigate('NuevoEvento', { animalId });
              return;
            }
          } catch (e) {
            // fallthrough to local modal
          }

          setShowRegistrar(true);
        }}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {showRegistrar ? (
        <RegistrarEventoSanitario onBack={() => setShowRegistrar(false)} animalId={animalId} />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f4f4f4' },
  header: { backgroundColor: COLORS.primary, padding: 12, flexDirection: 'row', alignItems: 'center' },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginRight: 8,
  },
  backTxt: { color: '#fff', fontSize: 14, fontFamily: FONTS.bold },
  title: { color: '#fff', fontSize: 18, fontFamily: FONTS.bold },
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyText: { color: '#888', fontFamily: FONTS.regular },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 84,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 6,
  },
  fabText: { color: '#fff', fontSize: 24, fontFamily: FONTS.bold },
});
