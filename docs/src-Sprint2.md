# Cambios de src entre e253295 y 21b896d

- Commit inicial: e253295 (AnexoA_Sprint2)
- Commit final: 21b896d (Actualizacion_DetalleAnimal)
- Total de archivos de src con cambios: 19

---

## src/components/animales/AnimalFotoCaptura.tsx

- Estado: Agregado

### Contenido en e253295

[El archivo no existia en el commit inicial]

### Contenido en 21b896d

~~~tsx
import React, { useState } from 'react';
import {
  Alert,
  Image,
  PermissionsAndroid,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { launchCamera, launchGallery } from '../../native/cameraPicker';

type AnimalFotoCapturaProps = {
  rutaLocal: string | null;
  onRutaLocalChange: (rutaLocal: string | null) => void;
};

const requestCameraPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  const permissions = [PermissionsAndroid.PERMISSIONS.CAMERA];
  if (Number(Platform.Version) >= 33) {
    permissions.push(PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES);
  }

  const grants = await PermissionsAndroid.requestMultiple(permissions);
  return permissions.every(permission => grants[permission] === PermissionsAndroid.RESULTS.GRANTED);
};

export function AnimalFotoCaptura({ rutaLocal, onRutaLocalChange }: AnimalFotoCapturaProps) {
  const [cargando, setCargando] = useState(false);

  const applySelectedImage = (uri: string | null) => {
    onRutaLocalChange(uri);
  };

  const onCapturarFoto = async () => {
    if (cargando) {
      return;
    }

    const granted = await requestCameraPermissions();
    if (!granted) {
      Alert.alert('Permiso requerido', 'Necesitamos permiso de camara para capturar la fotografia del animal.');
      return;
    }

    try {
      setCargando(true);
      const response = await launchCamera({
        mediaType: 'photo',
        cameraType: 'back',
      });

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert('Error de camara', response.errorMessage ?? 'No se pudo capturar la fotografia.');
        return;
      }

      const asset = response.assets?.[0];
      applySelectedImage(asset?.uri ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo abrir la camara.';
      Alert.alert('Error de camara', message);
    } finally {
      setCargando(false);
    }
  };

  const onSeleccionarImagen = async () => {
    if (cargando) {
      return;
    }

    try {
      setCargando(true);
      const response = await launchGallery();

      if (response.didCancel) {
        return;
      }

      if (response.errorCode) {
        Alert.alert('Error de imagen', response.errorMessage ?? 'No se pudo seleccionar la imagen.');
        return;
      }

      const asset = response.assets?.[0];
      applySelectedImage(asset?.uri ?? null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo abrir la galeria.';
      Alert.alert('Error de imagen', message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <View style={styles.container}>
      <Pressable style={styles.button} onPress={onCapturarFoto}>
        <Text style={styles.buttonText}>{cargando ? 'Abriendo camara...' : 'Tomar fotografia'}</Text>
      </Pressable>

      <Pressable style={[styles.button, styles.secondaryButton]} onPress={onSeleccionarImagen}>
        <Text style={styles.secondaryButtonText}>{cargando ? 'Abriendo galeria...' : 'Seleccionar imagen'}</Text>
      </Pressable>

      <View style={styles.previewBox}>
        {rutaLocal ? (
          <Image key={rutaLocal} source={{ uri: rutaLocal }} style={styles.previewImage} resizeMode="cover" />
        ) : (
          <Text style={styles.previewPlaceholder}>Sin fotografia capturada</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 12,
  },
  button: {
    backgroundColor: '#0f6f35',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButton: {
    marginTop: 10,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#0f6f35',
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 15,
  },
  secondaryButtonText: {
    color: '#0f6f35',
    fontWeight: '800',
    fontSize: 15,
  },
  previewBox: {
    marginTop: 12,
    height: 180,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#d6dfcd',
    backgroundColor: '#f8faf4',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewPlaceholder: {
    color: '#6b7b67',
    fontWeight: '600',
  },
});
~~~

---

## src/components/animales/AnimalSearchBar.tsx

- Estado: Agregado

### Contenido en e253295

[El archivo no existia en el commit inicial]

### Contenido en 21b896d

~~~tsx
import React from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

type AnimalSearchBarProps = {
  value: string;
  onSearch: (value: string) => void;
  placeholder?: string;
};

export function AnimalSearchBar({ value, onSearch, placeholder = 'Buscar por arete...' }: AnimalSearchBarProps) {
  const showClear = value.trim().length > 0;

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={onSearch}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#859383"
        autoCapitalize="none"
        autoCorrect={false}
      />
      {showClear ? (
        <Pressable style={styles.clearButton} onPress={() => onSearch('')}>
          <Text style={styles.clearText}>X</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cfd9c5',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 2,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 2,
    color: '#1c2b1d',
    fontSize: 14,
  },
  clearButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#eff4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearText: {
    color: '#49614c',
    fontWeight: '800',
    fontSize: 12,
  },
});
~~~

---

## src/components/animales/EstadoBadge.tsx

- Estado: Agregado

### Contenido en e253295

[El archivo no existia en el commit inicial]

### Contenido en 21b896d

~~~tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { AnimalEstado } from '../../types/Animal';

type EstadoBadgeProps = {
  estado: AnimalEstado;
};

const ESTADO_LABELS: Record<AnimalEstado, string> = {
  ACTIVO: 'Activo',
  VENDIDO: 'Vendido',
  FALLECIDO: 'Fallecido',
};

export function EstadoBadge({ estado }: EstadoBadgeProps) {
  const badgeStyle =
    estado === 'ACTIVO' ? styles.activoBadge : estado === 'VENDIDO' ? styles.vendidoBadge : styles.fallecidoBadge;

  const textStyle =
    estado === 'ACTIVO' ? styles.activoText : estado === 'VENDIDO' ? styles.vendidoText : styles.fallecidoText;

  return (
    <View style={[styles.baseBadge, badgeStyle]}>
      <Text style={[styles.baseText, textStyle]}>{ESTADO_LABELS[estado]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  baseBadge: {
    borderRadius: 999,
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  baseText: {
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  activoBadge: {
    backgroundColor: '#e7f7ec',
    borderColor: '#39a861',
  },
  activoText: {
    color: '#1f7f44',
  },
  vendidoBadge: {
    backgroundColor: '#fff3df',
    borderColor: '#d08a20',
  },
  vendidoText: {
    color: '#b1700c',
  },
  fallecidoBadge: {
    backgroundColor: '#f0f2f3',
    borderColor: '#7c8790',
  },
  fallecidoText: {
    color: '#5e6972',
  },
});
~~~

---

## src/components/animales/EventoSanitarioItem.tsx

- Estado: Agregado

### Contenido en e253295

[El archivo no existia en el commit inicial]

### Contenido en 21b896d

~~~tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { EventoSanitarioResumen } from '../../types/Animal';

type EventoSanitarioItemProps = {
  evento: EventoSanitarioResumen;
};

export function EventoSanitarioItem({ evento }: EventoSanitarioItemProps) {
  const titulo = evento.enfermedad?.trim() || 'Evento sanitario';
  const fecha = evento.fecha || 'Sin fecha';
  const detalle =
    evento.tratamiento?.trim() ||
    evento.sintomas?.trim() ||
    evento.observaciones?.trim() ||
    'Sin detalle';

  return (
    <View style={styles.card}>
      <View style={styles.leftAccent} />
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>­ƒ®║</Text>
      </View>
      <View style={styles.contentWrap}>
        <Text style={styles.title}>{titulo}</Text>
        <Text style={styles.detail}>{detalle}</Text>
        <Text style={styles.fecha}>Aplicado: {fecha}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    padding: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftAccent: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: '#3aa65f',
    marginRight: 10,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#e3ebdf',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 16,
  },
  contentWrap: {
    flex: 1,
  },
  title: {
    color: '#1f1f1f',
    fontWeight: '800',
    fontSize: 14,
  },
  detail: {
    marginTop: 2,
    color: '#5a5a5a',
    fontWeight: '600',
    fontSize: 12,
  },
  fecha: {
    marginTop: 2,
    color: '#8a8a8a',
    fontWeight: '600',
    fontSize: 11,
  },
});
~~~

---

## src/components/animales/PesoChart.tsx

- Estado: Agregado

### Contenido en e253295

[El archivo no existia en el commit inicial]

### Contenido en 21b896d

~~~tsx
import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { PesoHistorialPoint } from '../../types/Animal';

type PesoChartProps = {
  data: PesoHistorialPoint[];
};

export function PesoChart({ data }: PesoChartProps) {
  const bars = useMemo(() => {
    const ordered = [...data].reverse();
    if (ordered.length === 0) {
      return [] as Array<{ fecha: string; peso: number; heightPct: number }>;
    }

    const pesos = ordered.map(item => Number(item.peso));
    const min = Math.min(...pesos);
    const max = Math.max(...pesos);
    const spread = max - min;

    return ordered.map(item => {
      const value = Number(item.peso);
      const normalized = spread <= 0 ? 1 : (value - min) / spread;

      return {
        fecha: item.fecha,
        peso: value,
        heightPct: 20 + normalized * 80,
      };
    });
  }, [data]);

  if (bars.length === 0) {
    return (
      <View style={styles.emptyWrap}>
        <Text style={styles.emptyText}>Sin registros aun</Text>
      </View>
    );
  }

  const minPeso = Math.min(...bars.map(item => item.peso));
  const maxPeso = Math.max(...bars.map(item => item.peso));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tendencia de peso</Text>
      <Text style={styles.subtitle}>Ultimos {bars.length} registros</Text>

      <View style={styles.chartWrap}>
        <View style={styles.barsRow}>
          {bars.map(bar => (
            <View key={`${bar.fecha}-${bar.peso}`} style={styles.barItem}>
              <View style={styles.barTrack}>
                <View style={[styles.barFill, { height: `${bar.heightPct}%` }]} />
              </View>
              <Text style={styles.barDate} numberOfLines={1}>
                {bar.fecha.slice(5)}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.legendRow}>
        <Text style={styles.legendText}>Min: {minPeso.toFixed(1)} kg</Text>
        <Text style={styles.legendText}>Max: {maxPeso.toFixed(1)} kg</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dfe5d8',
    backgroundColor: '#ffffff',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  title: {
    color: '#243924',
    fontWeight: '800',
    fontSize: 14,
  },
  subtitle: {
    marginTop: 3,
    color: '#647260',
    fontWeight: '600',
    fontSize: 12,
  },
  chartWrap: {
    marginTop: 12,
    backgroundColor: '#f7faf4',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 10,
  },
  barsRow: {
    height: 140,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 6,
  },
  barItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barTrack: {
    width: '100%',
    height: 110,
    backgroundColor: '#e6ecdf',
    borderRadius: 6,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    backgroundColor: '#2f5d3a',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  barDate: {
    marginTop: 6,
    fontSize: 10,
    color: '#5d6e5a',
    fontWeight: '700',
  },
  legendRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  legendText: {
    color: '#50624f',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyWrap: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dfe5d8',
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 28,
  },
  emptyText: {
    color: '#6d7c69',
    fontWeight: '700',
  },
});
~~~

---

## src/features/animals/screens/AnimalsScreen.tsx

- Estado: Modificado

### Contenido en e253295

~~~tsx
import React from 'react';

import { RegistrarAnimalScreen } from '../../../screens/animales/RegistrarAnimalScreen';

type AnimalsScreenProps = {
  onBack: () => void;
};

export function AnimalsScreen({ onBack }: AnimalsScreenProps) {
  return <RegistrarAnimalScreen onBack={onBack} />;
}
~~~

### Contenido en 21b896d

~~~tsx
import React from 'react';

import { AnimalesNavigator } from '../../../navigation/AnimalesNavigator';

type AnimalsScreenProps = {
  onBack: () => void;
};

export function AnimalsScreen({ onBack }: AnimalsScreenProps) {
  return <AnimalesNavigator onBack={onBack} />;
}
~~~

---

## src/features/home/screens/HomeScreen.tsx

- Estado: Modificado

### Contenido en e253295

~~~tsx
import React from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONTS } from '../../../shared/theme/identity';
import { HomeModuleRoute } from '../types/homeNavigation';

const QUICK_ACTIONS = [
  { key: 'animal', icon: '­ƒÉä', label: 'Animal', target: 'animals' as HomeModuleRoute },
  { key: 'salud', icon: '­ƒÆë', label: 'Sanidad', target: 'health' as HomeModuleRoute },
  { key: 'gasto', icon: '­ƒÆÁ', label: 'Gasto', target: 'costs' as HomeModuleRoute },
];

const UPCOMING_TASKS = [
  {
    key: 'desparasitacion',
    icon: '­ƒÆè',
    title: 'Desparasitacion Interna',
    subtitle: 'El Negro ÔÇó #0011322017',
    due: 'Manana',
    statusColor: '#f4a000',
    accentColor: '#f4a000',
  },
  {
    key: 'aftosa',
    icon: '­ƒÆë',
    title: 'Vacuna Aftosa',
    subtitle: 'La Pintita ÔÇó #0011302841',
    due: 'En 3 dias',
    statusColor: '#f4a000',
    accentColor: '#f4a000',
  },
  {
    key: 'vitamina',
    icon: '­ƒº¬',
    title: 'Vitamina B12',
    subtitle: 'Manchas ÔÇó #0011299034',
    due: 'En 5 dias',
    statusColor: '#7f916f',
    accentColor: '#8ba073',
  },
];

const NAV_TABS = [
  { key: 'animals', icon: '­ƒÉä', label: 'Animales', target: 'animals' as HomeModuleRoute },
  { key: 'health', icon: '­ƒÆë', label: 'Sanitario', target: 'health' as HomeModuleRoute },
  { key: 'costs', icon: '­ƒÆÁ', label: 'Gastos', target: 'costs' as HomeModuleRoute },
  { key: 'reports', icon: '­ƒôè', label: 'Reportes', target: 'reports' as HomeModuleRoute },
];

type HomeScreenProps = {
  onOpenModule: (target: HomeModuleRoute) => void;
};

export function HomeScreen({ onOpenModule }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const headerBodyHeight = isCompact ? 64 : 72;
  const headerHeight = headerBodyHeight + insets.top;
  const navInset = Math.max(insets.bottom, 8);
  const navHeight = 56 + navInset;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View
        style={[
          styles.headerCard,
          isCompact && styles.headerCardCompact,
          { paddingTop: insets.top, minHeight: headerHeight },
        ]}
      >
        <View>
          <Text style={[styles.greeting, isCompact && styles.greetingCompact]}>Hola, Productor</Text>
          <Text style={styles.bienvenida}>Bienvenido</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Image
            source={require('../../../Logos/Logo_Verde_Solo.png')}
            style={styles.avatarLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: headerHeight + 8,
            paddingBottom: navHeight + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statTitle}>Inventario Total</Text>
            <Text style={[styles.statValue, isCompact && styles.statValueCompact]}>12</Text>
            <Text style={styles.statCaption}>cabezas</Text>
            <View style={styles.statIconBadge}>
              <Text style={styles.statIconText}>­ƒÉä</Text>
            </View>
          </View>

          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statTitle}>Vacunas / Eventos</Text>
            <Text style={[styles.statValueOrange, isCompact && styles.statValueCompact]}>3</Text>
            <Text style={styles.statCaption}>proximas</Text>
            <View style={styles.statIconBadgeWarning}>
              <Text style={styles.statIconText}>ÔÜá´©Å</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, isCompact && styles.sectionTitleCompact]}>Acciones Rapidas</Text>
        <View style={[styles.quickActionsRow, isCompact && styles.quickActionsRowCompact]}>
          {QUICK_ACTIONS.map(action => (
            <Pressable
              key={action.key}
              style={[styles.quickCard, isCompact && styles.quickCardCompact]}
              onPress={() => onOpenModule(action.target)}
            >
              <View style={styles.quickIconWrap}>
                <Text style={styles.quickIcon}>{action.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.tasksHeaderRow}>
          <Text style={[styles.sectionTitle, isCompact && styles.sectionTitleCompact]}>
            Proximas Tareas (3)
          </Text>
          <Text style={styles.seeAll}>Ver todo</Text>
        </View>

        {UPCOMING_TASKS.map(task => (
          <View key={task.key} style={styles.taskCard}>
            <View style={[styles.taskAccent, { backgroundColor: task.accentColor }]} />
            <View style={styles.taskIconWrap}>
              <Text style={styles.taskIcon}>{task.icon}</Text>
            </View>
            <View style={styles.taskBody}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
              <Text style={[styles.taskDue, { color: task.statusColor }]}>{task.due}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomTabs, { paddingBottom: navInset, minHeight: navHeight }]}> 
        {NAV_TABS.map(tab => (
          <Pressable key={tab.key} style={styles.bottomTabItem} onPress={() => onOpenModule(tab.target)}>
            <Text style={[styles.bottomTabIcon, tab.target === 'animals' && styles.bottomTabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.bottomTabLabel, tab.target === 'animals' && styles.bottomTabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingBottom: 100,
  },
  headerCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCardCompact: {
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 18,
    color: COLORS.white,
    fontFamily: FONTS.bold,
    lineHeight: 24,
  },
  greetingCompact: {
    fontSize: 16,
    lineHeight: 22,
  },
  bienvenida: {
    marginTop: 0,
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#d8ead9',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLogo: {
    width: 26,
    height: 26,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.listBackground,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 118,
    borderLeftWidth: 4,
  },
  statCardGreen: {
    borderLeftColor: '#228f56',
  },
  statCardOrange: {
    borderLeftColor: '#f4a000',
  },
  statTitle: {
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  statValue: {
    marginTop: 6,
    color: COLORS.black,
    fontSize: 44,
    fontFamily: FONTS.bold,
    lineHeight: 48,
  },
  statValueCompact: {
    fontSize: 38,
    lineHeight: 42,
  },
  statValueOrange: {
    marginTop: 6,
    color: COLORS.warning,
    fontSize: 44,
    fontFamily: FONTS.bold,
    lineHeight: 48,
  },
  statCaption: {
    marginTop: 1,
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  statIconBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    minWidth: 34,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    backgroundColor: '#e6f2ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBadgeWarning: {
    position: 'absolute',
    right: 10,
    top: 10,
    minWidth: 34,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff2df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: 10,
  },
  sectionTitleCompact: {
    fontSize: 18,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  quickActionsRowCompact: {
    gap: 8,
  },
  quickCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickCardCompact: {
    paddingVertical: 10,
  },
  quickIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eef4ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickIcon: {
    fontSize: 18,
  },
  quickLabel: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  tasksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    marginBottom: 8,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.listBackground,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  taskAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  taskIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f1ebd7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginVertical: 12,
  },
  taskIcon: {
    fontSize: 18,
  },
  taskBody: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  taskTitle: {
    color: COLORS.black,
    fontSize: 15,
    fontFamily: FONTS.semiBold,
  },
  taskSubtitle: {
    marginTop: 1,
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  taskDue: {
    marginTop: 3,
    fontSize: 13,
    fontFamily: FONTS.semiBold,
  },
  bottomTabs: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    borderTopWidth: 1,
    borderTopColor: '#e3e3e3',
    backgroundColor: COLORS.white,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bottomTabItem: {
    alignItems: 'center',
    gap: 3,
  },
  bottomTabIcon: {
    fontSize: 17,
    color: COLORS.gray,
  },
  bottomTabIconActive: {
    color: COLORS.primary,
  },
  bottomTabLabel: {
    fontSize: 11,
    color: COLORS.gray,
    fontFamily: FONTS.semiBold,
  },
  bottomTabLabelActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});
~~~

### Contenido en 21b896d

~~~tsx
import React from 'react';
import {
  Image,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { COLORS, FONTS } from '../../../shared/theme/identity';
import { HomeModuleRoute } from '../types/homeNavigation';

const QUICK_ACTIONS = [
  { key: 'animal', icon: '­ƒÉä', label: 'Gestion de animales', target: 'animals' as HomeModuleRoute },
  { key: 'salud', icon: '­ƒÆë', label: 'Sanidad', target: 'health' as HomeModuleRoute },
  { key: 'gasto', icon: '­ƒÆÁ', label: 'Gasto', target: 'costs' as HomeModuleRoute },
];

const UPCOMING_TASKS = [
  {
    key: 'desparasitacion',
    icon: '­ƒÆè',
    title: 'Desparasitacion Interna',
    subtitle: 'El Negro ÔÇó #0011322017',
    due: 'Manana',
    statusColor: '#f4a000',
    accentColor: '#f4a000',
  },
  {
    key: 'aftosa',
    icon: '­ƒÆë',
    title: 'Vacuna Aftosa',
    subtitle: 'La Pintita ÔÇó #0011302841',
    due: 'En 3 dias',
    statusColor: '#f4a000',
    accentColor: '#f4a000',
  },
  {
    key: 'vitamina',
    icon: '­ƒº¬',
    title: 'Vitamina B12',
    subtitle: 'Manchas ÔÇó #0011299034',
    due: 'En 5 dias',
    statusColor: '#7f916f',
    accentColor: '#8ba073',
  },
];

const NAV_TABS = [
  { key: 'animals', icon: '­ƒÉä', label: 'Animales', target: 'animals' as HomeModuleRoute },
  { key: 'health', icon: '­ƒÆë', label: 'Sanitario', target: 'health' as HomeModuleRoute },
  { key: 'costs', icon: '­ƒÆÁ', label: 'Gastos', target: 'costs' as HomeModuleRoute },
  { key: 'reports', icon: '­ƒôè', label: 'Reportes', target: 'reports' as HomeModuleRoute },
];

type HomeScreenProps = {
  onOpenModule: (target: HomeModuleRoute) => void;
};

export function HomeScreen({ onOpenModule }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const headerBodyHeight = isCompact ? 64 : 72;
  const headerHeight = headerBodyHeight + insets.top;
  const navInset = Math.max(insets.bottom, 8);
  const navHeight = 56 + navInset;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View
        style={[
          styles.headerCard,
          isCompact && styles.headerCardCompact,
          { paddingTop: insets.top, minHeight: headerHeight },
        ]}
      >
        <View>
          <Text style={[styles.greeting, isCompact && styles.greetingCompact]}>Hola, Productor</Text>
          <Text style={styles.bienvenida}>Bienvenido</Text>
        </View>
        <View style={styles.avatarCircle}>
          <Image
            source={require('../../../Logos/Logo_Verde_Solo.png')}
            style={styles.avatarLogo}
            resizeMode="contain"
          />
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          {
            paddingTop: headerHeight + 8,
            paddingBottom: navHeight + 16,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >

        <View style={styles.statsRow}>
          <View style={[styles.statCard, styles.statCardGreen]}>
            <Text style={styles.statTitle}>Inventario Total</Text>
            <Text style={[styles.statValue, isCompact && styles.statValueCompact]}>12</Text>
            <Text style={styles.statCaption}>cabezas</Text>
            <View style={styles.statIconBadge}>
              <Text style={styles.statIconText}>­ƒÉä</Text>
            </View>
          </View>

          <View style={[styles.statCard, styles.statCardOrange]}>
            <Text style={styles.statTitle}>Vacunas / Eventos</Text>
            <Text style={[styles.statValueOrange, isCompact && styles.statValueCompact]}>3</Text>
            <Text style={styles.statCaption}>proximas</Text>
            <View style={styles.statIconBadgeWarning}>
              <Text style={styles.statIconText}>ÔÜá´©Å</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.sectionTitle, isCompact && styles.sectionTitleCompact]}>Acciones Rapidas</Text>
        <View style={[styles.quickActionsRow, isCompact && styles.quickActionsRowCompact]}>
          {QUICK_ACTIONS.map(action => (
            <Pressable
              key={action.key}
              style={[styles.quickCard, isCompact && styles.quickCardCompact]}
              onPress={() => onOpenModule(action.target)}
            >
              <View style={styles.quickIconWrap}>
                <Text style={styles.quickIcon}>{action.icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{action.label}</Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.tasksHeaderRow}>
          <Text style={[styles.sectionTitle, isCompact && styles.sectionTitleCompact]}>
            Proximas Tareas (3)
          </Text>
          <Text style={styles.seeAll}>Ver todo</Text>
        </View>

        {UPCOMING_TASKS.map(task => (
          <View key={task.key} style={styles.taskCard}>
            <View style={[styles.taskAccent, { backgroundColor: task.accentColor }]} />
            <View style={styles.taskIconWrap}>
              <Text style={styles.taskIcon}>{task.icon}</Text>
            </View>
            <View style={styles.taskBody}>
              <Text style={styles.taskTitle}>{task.title}</Text>
              <Text style={styles.taskSubtitle}>{task.subtitle}</Text>
              <Text style={[styles.taskDue, { color: task.statusColor }]}>{task.due}</Text>
            </View>
          </View>
        ))}
      </ScrollView>

      <View style={[styles.bottomTabs, { paddingBottom: navInset, minHeight: navHeight }]}> 
        {NAV_TABS.map(tab => (
          <Pressable key={tab.key} style={styles.bottomTabItem} onPress={() => onOpenModule(tab.target)}>
            <Text style={[styles.bottomTabIcon, tab.target === 'animals' && styles.bottomTabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[styles.bottomTabLabel, tab.target === 'animals' && styles.bottomTabLabelActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 14,
    paddingBottom: 100,
  },
  headerCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
    backgroundColor: COLORS.primary,
    borderRadius: 0,
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerCardCompact: {
    paddingBottom: 8,
  },
  greeting: {
    fontSize: 18,
    color: COLORS.white,
    fontFamily: FONTS.bold,
    lineHeight: 24,
  },
  greetingCompact: {
    fontSize: 16,
    lineHeight: 22,
  },
  bienvenida: {
    marginTop: 0,
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#d8ead9',
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLogo: {
    width: 26,
    height: 26,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.listBackground,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 118,
    borderLeftWidth: 4,
  },
  statCardGreen: {
    borderLeftColor: '#228f56',
  },
  statCardOrange: {
    borderLeftColor: '#f4a000',
  },
  statTitle: {
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  statValue: {
    marginTop: 6,
    color: COLORS.black,
    fontSize: 44,
    fontFamily: FONTS.bold,
    lineHeight: 48,
  },
  statValueCompact: {
    fontSize: 38,
    lineHeight: 42,
  },
  statValueOrange: {
    marginTop: 6,
    color: COLORS.warning,
    fontSize: 44,
    fontFamily: FONTS.bold,
    lineHeight: 48,
  },
  statCaption: {
    marginTop: 1,
    color: COLORS.gray,
    fontSize: 14,
    fontFamily: FONTS.regular,
  },
  statIconBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    minWidth: 34,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    backgroundColor: '#e6f2ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBadgeWarning: {
    position: 'absolute',
    right: 10,
    top: 10,
    minWidth: 34,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 8,
    backgroundColor: '#fff2df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: {
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: 10,
  },
  sectionTitleCompact: {
    fontSize: 18,
  },
  quickActionsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  quickActionsRowCompact: {
    gap: 8,
  },
  quickCard: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#dfdfdf',
    paddingVertical: 12,
    alignItems: 'center',
  },
  quickCardCompact: {
    paddingVertical: 10,
  },
  quickIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#eef4ed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickIcon: {
    fontSize: 18,
  },
  quickLabel: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  tasksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  seeAll: {
    color: COLORS.primary,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
    marginBottom: 8,
  },
  taskCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.listBackground,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  taskAccent: {
    width: 4,
    alignSelf: 'stretch',
  },
  taskIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#f1ebd7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginVertical: 12,
  },
  taskIcon: {
    fontSize: 18,
  },
  taskBody: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
  },
  taskTitle: {
    color: COLORS.black,
    fontSize: 15,
    fontFamily: FONTS.semiBold,
  },
  taskSubtitle: {
    marginTop: 1,
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  taskDue: {
    marginTop: 3,
    fontSize: 13,
    fontFamily: FONTS.semiBold,
  },
  bottomTabs: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 20,
    borderTopWidth: 1,
    borderTopColor: '#e3e3e3',
    backgroundColor: COLORS.white,
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  bottomTabItem: {
    alignItems: 'center',
    gap: 3,
  },
  bottomTabIcon: {
    fontSize: 17,
    color: COLORS.gray,
  },
  bottomTabIconActive: {
    color: COLORS.primary,
  },
  bottomTabLabel: {
    fontSize: 11,
    color: COLORS.gray,
    fontFamily: FONTS.semiBold,
  },
  bottomTabLabelActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});
~~~

---

## src/hooks/useSearch.ts

- Estado: Agregado

### Contenido en e253295

[El archivo no existia en el commit inicial]

### Contenido en 21b896d

~~~ts
import { useEffect, useState } from 'react';

export function useSearch(termino: string) {
  const [debouncedTermino, setDebouncedTermino] = useState(termino);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedTermino(termino);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [termino]);

  return debouncedTermino;
}
~~~

---

## src/native/AnimalModule.ts

- Estado: Modificado

### Contenido en e253295

~~~ts
import { NativeModules } from 'react-native';

import type { InsertAnimalPayload, InsertAnimalResult } from '../types/Animal';

type AnimalNativeModule = {
  insertAnimal(payload: InsertAnimalPayload): Promise<InsertAnimalResult>;
};

const { AnimalModule: NativeAnimalModule } = NativeModules;

const getAnimalBridge = (): AnimalNativeModule => {
  if (!NativeAnimalModule) {
    throw new Error('AnimalModule no esta disponible. Revisa AgroAppPackage y MainApplication.');
  }
  return NativeAnimalModule as AnimalNativeModule;
};

export const insertAnimal = (payload: InsertAnimalPayload): Promise<InsertAnimalResult> => {
  return getAnimalBridge().insertAnimal(payload);
};

export const AnimalModule = {
  insertAnimal,
};
~~~

### Contenido en 21b896d

~~~ts
import { NativeModules } from 'react-native';

import type {
  AnimalModel,
  AnimalEstado,
  HistorialResumen,
  ChangeEstadoPayload,
  ChangeEstadoResult,
  DeleteAnimalResult,
  InsertAnimalPayload,
  InsertAnimalResult,
  UpdateAnimalPayload,
  UpdateAnimalResult,
} from '../types/Animal';

type AnimalNativeModule = {
  logEvent(event: string): void;
  insertAnimal(payload: InsertAnimalPayload): Promise<InsertAnimalResult>;
  listAnimals(): Promise<AnimalModel[]>;
  getAnimalById(id: number): Promise<AnimalModel>;
  getHistorialResumen(id: number): Promise<HistorialResumen>;
  getAnimalesByEstado(estado: AnimalEstado): Promise<AnimalModel[]>;
  buscarPorArete(termino: string, estado: AnimalEstado): Promise<AnimalModel[]>;
  updateAnimal(payload: UpdateAnimalPayload): Promise<UpdateAnimalResult>;
  changeEstado(payload: ChangeEstadoPayload): Promise<ChangeEstadoResult>;
  deleteAnimal(payload: { id: number }): Promise<DeleteAnimalResult>;
};

const { AnimalModule: NativeAnimalModule } = NativeModules;
let inFlightBuscarKey: string | null = null;
let inFlightBuscarPromise: Promise<AnimalModel[]> | null = null;

const getAnimalBridge = (): AnimalNativeModule => {
  if (!NativeAnimalModule) {
    throw new Error('AnimalModule no esta disponible. Revisa AgroAppPackage y MainApplication.');
  }
  return NativeAnimalModule as AnimalNativeModule;
};

export const logEvent = (event: string): void => {
  getAnimalBridge().logEvent(event);
};

export const insertAnimal = (payload: InsertAnimalPayload): Promise<InsertAnimalResult> => {
  return getAnimalBridge().insertAnimal(payload);
};

export const listAnimals = (): Promise<AnimalModel[]> => {
  return getAnimalBridge().listAnimals();
};

export const getAnimalById = (id: number): Promise<AnimalModel> => {
  return getAnimalBridge().getAnimalById(id);
};

export const getHistorialResumen = (id: number): Promise<HistorialResumen> => {
  return getAnimalBridge().getHistorialResumen(id);
};

export const getAnimalesByEstado = (estado: AnimalEstado): Promise<AnimalModel[]> => {
  return getAnimalBridge().getAnimalesByEstado(estado);
};

export const buscarPorArete = (termino: string, estado: AnimalEstado): Promise<AnimalModel[]> => {
  const normalizedTermino = (termino ?? '').trim();
  const key = `${estado}::${normalizedTermino}`;

  if (inFlightBuscarPromise && inFlightBuscarKey === key) {
    return inFlightBuscarPromise;
  }

  const promise = getAnimalBridge()
    .buscarPorArete(termino, estado)
    .finally(() => {
      if (inFlightBuscarKey === key) {
        inFlightBuscarKey = null;
        inFlightBuscarPromise = null;
      }
    });

  inFlightBuscarKey = key;
  inFlightBuscarPromise = promise;

  return promise;
};

export const updateAnimal = (payload: UpdateAnimalPayload): Promise<UpdateAnimalResult> => {
  return getAnimalBridge().updateAnimal(payload);
};

export const changeEstado = (payload: ChangeEstadoPayload): Promise<ChangeEstadoResult> => {
  return getAnimalBridge().changeEstado(payload);
};

export const deleteAnimal = (id: number): Promise<DeleteAnimalResult> => {
  return getAnimalBridge().deleteAnimal({ id });
};

export const AnimalModule = {
  logEvent,
  insertAnimal,
  listAnimals,
  getAnimalById,
  getHistorialResumen,
  getAnimalesByEstado,
  buscarPorArete,
  updateAnimal,
  changeEstado,
  deleteAnimal,
};
~~~

---

## src/native/AuthModule.ts

- Estado: Modificado

### Contenido en e253295

~~~ts
import { NativeModules } from 'react-native';

type AuthStatus = {
  hasUsers: boolean;
  primaryUserName: string;
  isAdminPrimary: boolean;
};

type AuthSession = {
  ok: boolean;
  userId: number;
  name: string;
  role: 'ADMIN' | 'USUARIO';
};

type AuthRegisterResult = {
  ok: boolean;
  userId: number;
  name: string;
};

type AuthNativeModule = {
  getAuthStatus(): Promise<AuthStatus>;
  loginPrimaryUser(pin: string): Promise<AuthSession>;
  login(nombre: string, pin: string): Promise<AuthSession>;
  registerUser(nombre: string, pin: string): Promise<AuthRegisterResult>;
  updatePrimaryUserPin(pin: string): Promise<AuthSession>;
};

const { AuthModule } = NativeModules;

const getAuthBridge = (): AuthNativeModule => {
  if (!AuthModule) {
    throw new Error('AuthModule no esta disponible. Revisa AgroAppPackage y MainApplication.');
  }
  return AuthModule as AuthNativeModule;
};

// Estado de autenticacion offline en SQLite local.
export const obtenerEstadoAuth = (): Promise<AuthStatus> => {
  return getAuthBridge().getAuthStatus();
};

// Login principal por PIN (sin red), pensado para el flujo del prototipo.
export const iniciarSesionPrincipal = (pin: string): Promise<AuthSession> => {
  return getAuthBridge().loginPrimaryUser(pin);
};

// Login explicito por nombre + PIN (tambien offline) para flujos futuros.
export const iniciarSesion = (nombre: string, pin: string): Promise<AuthSession> => {
  return getAuthBridge().login(nombre, pin);
};

// Registro de usuario local con validaciones aplicadas en Java.
export const registrarUsuario = (nombre: string, pin: string): Promise<AuthRegisterResult> => {
  return getAuthBridge().registerUser(nombre, pin);
};

// Actualiza el PIN del usuario principal (admin/primario) y retorna sesion activa.
export const actualizarPinPrincipal = (pin: string): Promise<AuthSession> => {
  return getAuthBridge().updatePrimaryUserPin(pin);
};
~~~

### Contenido en 21b896d

~~~ts
import { NativeModules } from 'react-native';

type AuthStatus = {
  hasUsers: boolean;
  primaryUserName: string;
  isAdminPrimary: boolean;
};

type AuthSession = {
  ok: boolean;
  userId: number;
  name: string;
  role: 'ADMIN' | 'USUARIO';
};

type AuthRegisterResult = {
  ok: boolean;
  userId: number;
  name: string;
};

type AuthNativeModule = {
  getAuthStatus(): Promise<AuthStatus>;
  loginPrimaryUser(pin: string): Promise<AuthSession>;
  login(nombre: string, pin: string): Promise<AuthSession>;
  registerUser(nombre: string, pin: string): Promise<AuthRegisterResult>;
  updatePrimaryUserPin(pin: string): Promise<AuthSession>;
};

const { AuthModule } = NativeModules;

const getAuthBridge = (): AuthNativeModule => {
  if (!AuthModule) {
    throw new Error('AuthModule no esta disponible. Revisa AgroAppPackage y MainApplication.');
  }
  return AuthModule as AuthNativeModule;
};

// Estado de autenticacion offline en SQLite local.
export const obtenerEstadoAuth = (): Promise<AuthStatus> => {
  return getAuthBridge().getAuthStatus();
};

// Login principal por PIN (sin red), pensado para el flujo del prototipo.
export const iniciarSesionPrincipal = (pin: string): Promise<AuthSession> => {
  return getAuthBridge().loginPrimaryUser(pin);
};

// Login explicito por nombre + PIN (tambien offline) para flujos futuros.
export const iniciarSesion = (nombre: string, pin: string): Promise<AuthSession> => {
  return getAuthBridge().login(nombre, pin);
};

// Registro de usuario local con validaciones aplicadas en Java.
export const registrarUsuario = (nombre: string, pin: string): Promise<AuthRegisterResult> => {
  return getAuthBridge().registerUser(nombre, pin);
};

// Actualiza el PIN del usuario principal (admin/primario) y retorna sesion activa.
export const actualizarPinPrincipal = (pin: string): Promise<AuthSession> => {
  return getAuthBridge().updatePrimaryUserPin(pin);
};
~~~

---

## src/native/cameraPicker.ts

- Estado: Agregado

### Contenido en e253295

[El archivo no existia en el commit inicial]

### Contenido en 21b896d

~~~ts
import { NativeModules, Platform } from 'react-native';

type LaunchCameraOptions = {
  mediaType: 'photo';
  cameraType: 'back' | 'front';
};

type LaunchCameraAsset = {
  uri: string;
  fileName: string | null;
  path: string | null;
};

type LaunchCameraResponse = {
  didCancel: boolean;
  errorCode?: string;
  errorMessage?: string;
  assets?: LaunchCameraAsset[];
};

type NativeCameraModule = {
  launchCamera(): Promise<{ uri: string; path: string; fileName: string }>;
  launchGallery(): Promise<{ uri: string; path: string; fileName: string | null }>;
};

const { AnimalCameraModule } = NativeModules;

const getCameraBridge = (): NativeCameraModule => {
  if (!AnimalCameraModule) {
    throw new Error('AnimalCameraModule no esta disponible. Revisa AgroAppPackage y MainApplication.');
  }

  return AnimalCameraModule as NativeCameraModule;
};

export const launchCamera = async (_options: LaunchCameraOptions): Promise<LaunchCameraResponse> => {
  const result = await getCameraBridge().launchCamera();

  return {
    didCancel: false,
    assets: [
      {
        uri: Platform.OS === 'android' ? `file://${result.path}` : result.uri,
        path: result.path,
        fileName: result.fileName,
      },
    ],
  };
};

export const launchGallery = async (): Promise<LaunchCameraResponse> => {
  const result = await getCameraBridge().launchGallery();

  return {
    didCancel: false,
    assets: [
      {
        uri: result.uri,
        path: result.path,
        fileName: result.fileName,
      },
    ],
  };
};
~~~

---

## src/navigation/AnimalesNavigator.tsx

- Estado: Agregado

### Contenido en e253295

[El archivo no existia en el commit inicial]

### Contenido en 21b896d

~~~tsx
import React, { useState } from 'react';

import { EditarAnimalScreen } from '../screens/animales/EditarAnimalScreen';
import { ListadoAnimalesScreen } from '../screens/animales/ListadoAnimalesScreen';
import { RegistrarAnimalScreen } from '../screens/animales/RegistrarAnimalScreen';
import { AnimalModel } from '../types/Animal';
import { DetalleAnimalScreen } from '../screens/animales/DetalleAnimalScreen';

type AnimalesNavigatorProps = {
  onBack: () => void;
};

type AnimalRoute =
  | { name: 'list' }
  | { name: 'register' }
  | { name: 'detail'; animalId: number; refreshToken: number }
  | { name: 'edit'; animal: AnimalModel };

export function AnimalesNavigator({ onBack }: AnimalesNavigatorProps) {
  const [route, setRoute] = useState<AnimalRoute>({ name: 'list' });

  const refreshList = () => {
    setRoute({ name: 'list' });
  };

  if (route.name === 'register') {
    return <RegistrarAnimalScreen onBack={() => setRoute({ name: 'list' })} onSuccess={refreshList} />;
  }

  if (route.name === 'detail') {
    return (
      <DetalleAnimalScreen
        key={`${route.animalId}-${route.refreshToken}`}
        animalId={route.animalId}
        refreshToken={route.refreshToken}
        onBack={() => setRoute({ name: 'list' })}
        onEdit={animal => setRoute({ name: 'edit', animal })}
        onDeleted={refreshList}
      />
    );
  }

  if (route.name === 'edit') {
    return (
      <EditarAnimalScreen
        animal={route.animal}
        onBack={() => setRoute({ name: 'detail', animalId: route.animal.id, refreshToken: Date.now() })}
        onSaved={() => setRoute({ name: 'detail', animalId: route.animal.id, refreshToken: Date.now() })}
      />
    );
  }

  return (
    <ListadoAnimalesScreen
      onBackHome={onBack}
      onCreateAnimal={() => setRoute({ name: 'register' })}
      onOpenDetail={animalId => setRoute({ name: 'detail', animalId, refreshToken: Date.now() })}
    />
  );
}
~~~

---

## src/screens/animales/DetalleAnimalScreen.tsx

- Estado: Agregado

### Contenido en e253295

[El archivo no existia en el commit inicial]

### Contenido en 21b896d

~~~tsx
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EventoSanitarioItem } from '../../components/animales/EventoSanitarioItem';
import { EstadoBadge } from '../../components/animales/EstadoBadge';
import { AnimalModule } from '../../native/AnimalModule';
import { AnimalModel, HistorialResumen } from '../../types/Animal';

const calcularTiempoEnRancho = (fechaIngreso: string | null | undefined): string => {
  if (!fechaIngreso) return 'Sin dato';
  const ingreso = new Date(fechaIngreso);
  const hoy = new Date();
  let a├▒os = hoy.getFullYear() - ingreso.getFullYear();
  let meses = hoy.getMonth() - ingreso.getMonth();
  let dias = hoy.getDate() - ingreso.getDate();
  if (dias < 0) {
    meses -= 1;
    dias += new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
  }
  if (meses < 0) { a├▒os -= 1; meses += 12; }
  if (a├▒os > 0) return meses > 0 ? `${a├▒os} a├▒o${a├▒os > 1 ? 's' : ''}, ${meses} mes${meses > 1 ? 'es' : ''}` : `${a├▒os} a├▒o${a├▒os > 1 ? 's' : ''}`;
  if (meses > 0) return `${meses} mes${meses > 1 ? 'es' : ''}`;
  return `${dias} d├¡a${dias !== 1 ? 's' : ''}`;
};

const formatSexo = (sexo: string | null | undefined) => {
  if (!sexo) {
    return 'Sin dato';
  }
  if (sexo === 'F') {
    return 'H';
  }
  return sexo;
};

type DetalleAnimalScreenProps = {
  animalId: number;
  refreshToken: number;
  onBack: () => void;
  onEdit: (animal: AnimalModel) => void;
  onDeleted: () => void;
};

export function DetalleAnimalScreen({ animalId, refreshToken, onBack, onEdit, onDeleted }: DetalleAnimalScreenProps) {
  const [currentAnimal, setCurrentAnimal] = useState<AnimalModel | null>(null);
  const [historial, setHistorial] = useState<HistorialResumen>({
    historial_peso: [],
    eventos_recientes: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [photoLoadFailed, setPhotoLoadFailed] = useState(false);

  const loadDetalle = useCallback(async () => {
    setLoading(true);
    setError(null);
    setPhotoLoadFailed(false);

    try {
      const [animal, historialResumen] = await Promise.all([
        AnimalModule.getAnimalById(animalId),
        AnimalModule.getHistorialResumen(animalId),
      ]);
      setCurrentAnimal(animal);
      setHistorial(historialResumen);
    } catch (loadError) {
      const message =
        loadError instanceof Error ? loadError.message : 'No se pudo cargar el detalle del animal.';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [animalId]);

  useEffect(() => {
    void loadDetalle();
  }, [loadDetalle, refreshToken]);

  const photoSource = useMemo(() => {
    if (!currentAnimal?.foto || photoLoadFailed) {
      return null;
    }
    const raw = currentAnimal.foto.trim();
    if (!raw || raw === 'null' || raw === 'undefined') {
      return null;
    }
    const baseUri = raw.startsWith('file://') || raw.startsWith('content://') || raw.startsWith('http')
      ? raw
      : `file://${raw}`;
    return { uri: `${baseUri}?v=${refreshToken}` };
  }, [currentAnimal?.foto, photoLoadFailed, refreshToken]);

  const animalDisplayName = useMemo(() => {
    if (!currentAnimal) {
      return '';
    }
    return currentAnimal.especie?.trim() || `Animal #${currentAnimal.arete}`;
  }, [currentAnimal]);

  const onConfirmDelete = async () => {
    if (!currentAnimal) {
      return;
    }

    try {
      setLoadingDelete(true);
      await AnimalModule.deleteAnimal(currentAnimal.id);
      setDeleteModalVisible(false);
      Alert.alert('Eliminado', 'El animal fue eliminado correctamente.');
      onDeleted();
    } catch (deleteError) {
      const message =
        deleteError instanceof Error
          ? deleteError.message
          : 'No se pudo eliminar el animal en este momento.';
      Alert.alert('Error', message);
    } finally {
      setLoadingDelete(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#0b6d33" />
          <Text style={styles.centerText}>Cargando detalle...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !currentAnimal) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error ?? 'No se encontro el animal.'}</Text>
          <Pressable style={styles.retryButton} onPress={() => void loadDetalle()}>
            <Text style={styles.retryText}>Reintentar</Text>
          </Pressable>
          <Pressable style={styles.backInlineButton} onPress={onBack}>
            <Text style={styles.backInlineText}>Volver al listado</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const eventosRecientes = historial.eventos_recientes.slice(0, 2);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>ÔåÉ</Text>
        </Pressable>

        <View style={styles.headerTextBlock}>
          <Text style={styles.title}>Detalle del Animal</Text>
          <Text style={styles.subtitle}>Arete: #{currentAnimal.arete}</Text>
        </View>

        <Pressable onPress={() => setDeleteModalVisible(true)} style={styles.deleteLinkButton}>
          <Text style={styles.deleteLinkText}>Eliminar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryPhotoWrap}>
            {photoSource ? (
              <Image
                key={`${currentAnimal.id}-${currentAnimal.foto ?? 'nofoto'}-${refreshToken}`}
                source={photoSource}
                style={styles.summaryPhoto}
                resizeMode="cover"
                onError={() => setPhotoLoadFailed(true)}
              />
            ) : (
              <View style={styles.summaryPhotoFallback}>
                <Text style={styles.summaryPhotoFallbackText}>­ƒÉä</Text>
              </View>
            )}
          </View>

          <View style={styles.summaryTextWrap}>
            <Text style={styles.summaryName}>{animalDisplayName}</Text>
            <Text style={styles.summaryArete}>#{currentAnimal.arete}</Text>
            <Text style={styles.summaryDate}>Ingreso: {currentAnimal.fecha}</Text>
          </View>

          <EstadoBadge estado={currentAnimal.estado} />
        </View>

        <Text style={styles.sectionTitle}>Datos Generales</Text>
        <View style={styles.generalCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Raza</Text>
              <Text style={styles.infoValue}>{currentAnimal.especie || 'Sin dato'}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Sexo</Text>
              <Text style={styles.infoValue}>{formatSexo(currentAnimal.sexo)}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Peso Actual</Text>
              <Text style={styles.infoValue}>{currentAnimal.peso != null ? `${currentAnimal.peso} kg` : 'Sin registro'}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Estado</Text>
              <Text style={styles.infoValue}>{currentAnimal.estado}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Fecha de Ingreso</Text>
              <Text style={styles.infoValue}>{currentAnimal.fecha || 'Sin dato'}</Text>
            </View>
            <View style={styles.infoCell}>
              <Text style={styles.infoLabel}>Tiempo en Rancho</Text>
              <Text style={styles.infoValue}>{calcularTiempoEnRancho(currentAnimal.fecha)}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Ultimos Eventos</Text>
        {eventosRecientes.length === 0 ? (
          <View style={styles.emptyEventsWrap}>
            <Text style={styles.emptyEventsText}>Sin registros aun</Text>
          </View>
        ) : (
          eventosRecientes.map(evento => <EventoSanitarioItem key={String(evento.id)} evento={evento} />)
        )}

        <Pressable onPress={() => Alert.alert('Historial', 'Vista completa de historial cl├¡nico: pr├│ximamente.')}>
          <Text style={styles.historialLink}>Ver historial cl├¡nico completo ÔåÆ</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.actionBar}>
        <Pressable style={styles.outlineButton} onPress={() => onEdit(currentAnimal)}>
          <Text style={styles.outlineButtonText}>Ô£Å´©Å Editar Datos del Animal</Text>
        </Pressable>

        <Pressable
          style={styles.primaryButton}
          onPress={() => Alert.alert('Eventos', 'Registro de eventos sanitarios: pr├│ximamente.')}
        >
          <Text style={styles.primaryButtonText}>Registrar Nuevo Evento</Text>
        </Pressable>
      </View>

      <Modal
        visible={deleteModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setDeleteModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.warningIconWrap}>
              <Text style={styles.warningIcon}>ÔÜá´©Å</Text>
            </View>

            <Text style={styles.modalTitle}>┬┐Eliminar Animal?</Text>
            <Text style={styles.modalText}>┬┐Eliminar a {animalDisplayName} (arete: {currentAnimal.arete})?</Text>
            <Text style={styles.modalTextMuted}>
              Esta acci├│n eliminar├í tambi├®n su historial, eventos sanitarios y gastos.
            </Text>

            <Pressable
              style={styles.modalCancelButton}
              onPress={() => setDeleteModalVisible(false)}
              disabled={loadingDelete}
            >
              <Text style={styles.modalCancelText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[styles.modalDeleteButton, loadingDelete && styles.disabledButton]}
              onPress={() => void onConfirmDelete()}
              disabled={loadingDelete}
            >
              <Text style={styles.modalDeleteText}>
                {loadingDelete ? 'Eliminando...' : '­ƒùæ Eliminar Definitivamente'}
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ececec',
  },
  header: {
    backgroundColor: '#0a6b33',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  headerTextBlock: {
    flex: 1,
    marginLeft: 6,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    color: '#d5e8d8',
    marginTop: 2,
    fontWeight: '600',
    fontSize: 12,
  },
  deleteLinkButton: {
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
  deleteLinkText: {
    color: '#ffd3d3',
    fontSize: 12,
    fontWeight: '700',
  },
  body: {
    padding: 12,
    paddingBottom: 140,
  },
  summaryCard: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  summaryPhotoWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    overflow: 'hidden',
    backgroundColor: '#d8e2d8',
  },
  summaryPhoto: {
    width: '100%',
    height: '100%',
  },
  summaryPhotoFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryPhotoFallbackText: {
    fontSize: 20,
  },
  summaryTextWrap: {
    flex: 1,
  },
  summaryName: {
    color: '#0b6d33',
    fontSize: 24,
    fontWeight: '900',
  },
  summaryArete: {
    color: '#1f2e1f',
    fontWeight: '700',
    marginTop: 2,
  },
  summaryDate: {
    color: '#8a8a8a',
    fontSize: 12,
    marginTop: 2,
  },
  sectionTitle: {
    marginTop: 14,
    marginBottom: 8,
    color: '#1d1d1d',
    fontSize: 22,
    fontWeight: '800',
  },
  generalCard: {
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    padding: 12,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 12,
  },
  infoCell: {
    flex: 1,
  },
  infoLabel: {
    color: '#8a8a8a',
    fontSize: 12,
    marginBottom: 4,
  },
  infoValue: {
    color: '#1c1c1c',
    fontWeight: '800',
    fontSize: 18,
  },
  infoDivider: {
    marginVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#dddddd',
  },
  emptyEventsWrap: {
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    paddingVertical: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyEventsText: {
    color: '#6d7c69',
    fontWeight: '700',
  },
  historialLink: {
    marginTop: 10,
    color: '#0567d9',
    fontWeight: '700',
    textAlign: 'center',
  },
  actionBar: {
    position: 'absolute',
    left: 12,
    right: 12,
    bottom: 12,
    gap: 8,
  },
  outlineButton: {
    borderWidth: 2,
    borderColor: '#0a6b33',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    paddingVertical: 12,
  },
  outlineButtonText: {
    color: '#0a6b33',
    fontWeight: '800',
  },
  primaryButton: {
    borderRadius: 10,
    backgroundColor: '#0a6b33',
    alignItems: 'center',
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 18,
  },
  warningIconWrap: {
    alignSelf: 'center',
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: '#fde8eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningIcon: {
    fontSize: 28,
  },
  modalTitle: {
    marginTop: 14,
    textAlign: 'center',
    color: '#1d1d1d',
    fontSize: 22,
    fontWeight: '900',
  },
  modalText: {
    marginTop: 10,
    textAlign: 'center',
    color: '#5f5f5f',
    fontSize: 14,
  },
  modalTextMuted: {
    marginTop: 4,
    textAlign: 'center',
    color: '#8f8f8f',
    fontSize: 13,
  },
  modalCancelButton: {
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#dbdbdb',
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalCancelText: {
    color: '#2c2c2c',
    fontWeight: '700',
  },
  modalDeleteButton: {
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: '#e53e3e',
    alignItems: 'center',
    paddingVertical: 12,
  },
  modalDeleteText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  disabledButton: {
    opacity: 0.6,
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  centerText: {
    marginTop: 10,
    color: '#5b6d58',
    fontWeight: '700',
  },
  errorText: {
    color: '#c73d3d',
    textAlign: 'center',
    fontWeight: '800',
  },
  retryButton: {
    marginTop: 14,
    backgroundColor: '#0f6f35',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  backInlineButton: {
    marginTop: 8,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2f5d3a',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backInlineText: {
    color: '#2f5d3a',
    fontWeight: '800',
  },
});
~~~

---

## src/screens/animales/EditarAnimalScreen.tsx

- Estado: Agregado

### Contenido en e253295

[El archivo no existia en el commit inicial]

### Contenido en 21b896d

~~~tsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AnimalFotoCaptura } from '../../components/animales/AnimalFotoCaptura';
import { AnimalModule } from '../../native/AnimalModule';
import { AnimalModel, UpdateAnimalPayload } from '../../types/Animal';

const ESPECIES_OPTIONS = [
  'Holstein',
  'Suizo Pardo',
  'Jersey',
  'Brahman',
  'Angus',
  'Hereford',
  'Charolais',
  'Simmental',
  'Criollo',
  'Limousin',
];

const SEXO_OPTIONS = [
  { label: 'Macho', value: 'M' },
  { label: 'Hembra', value: 'H' },
];

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

type EditarAnimalScreenProps = {
  animal: AnimalModel;
  onBack: () => void;
  onSaved: () => void;
};

type EditFormState = {
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: string;
  fotoPath: string | null;
  estado: 'ACTIVO' | 'FALLECIDO';
  fechaBaja: string;
  motivoBaja: string;
};

export function EditarAnimalScreen({ animal, onBack, onSaved }: EditarAnimalScreenProps) {
  const normalizeSexo = (sexo: string | null | undefined) => {
    if (sexo === 'F') {
      return 'H';
    }
    return sexo ?? 'M';
  };

  const initialPhotoUri = useMemo(() => {
    const raw = animal.foto?.trim();
    if (!raw) {
      return null;
    }
    if (raw.startsWith('file://') || raw.startsWith('content://') || raw.startsWith('http')) {
      return raw;
    }
    return `file://${raw}`;
  }, [animal.foto]);

  const [form, setForm] = useState<EditFormState>({
    arete: animal.arete,
    especie: animal.especie,
    sexo: normalizeSexo(animal.sexo),
    fecha: animal.fecha,
    peso: animal.peso == null ? '' : String(Math.trunc(animal.peso)),
    fotoPath: initialPhotoUri,
    estado: animal.estado === 'FALLECIDO' ? 'FALLECIDO' : 'ACTIVO',
    fechaBaja: animal.fecha_baja ?? '',
    motivoBaja: animal.motivo_baja ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerBajaVisible, setDatePickerBajaVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    return form.fecha ? new Date(`${form.fecha}T00:00:00`) : new Date();
  });

  const canSubmit = useMemo(() => {
    return form.especie.trim().length > 0 && form.sexo.trim().length > 0 && form.fecha.trim().length > 0;
  }, [form]);

  useEffect(() => {
    if (form.estado !== 'FALLECIDO') {
      return;
    }

    setForm(prev => {
      const today = formatDate(new Date());
      const nextFechaBaja = prev.fechaBaja.trim().length > 0 ? prev.fechaBaja : today;
      const nextMotivoBaja = prev.motivoBaja.trim().length > 0 ? prev.motivoBaja : 'Cambio de estado registrado desde editar';

      if (nextFechaBaja === prev.fechaBaja && nextMotivoBaja === prev.motivoBaja) {
        return prev;
      }

      return {
        ...prev,
        fechaBaja: nextFechaBaja,
        motivoBaja: nextMotivoBaja,
      };
    });
  }, [form.estado]);

  const setField = (key: keyof EditFormState, value: string | null) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);
    return candidate.getTime() > today.getTime();
  };

  const parseCalendarDate = (year: number, month: number, day: number) => {
    return new Date(year, month, day);
  };

  const getMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = [];

    for (let i = 0; i < firstDay; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(parseCalendarDate(year, month, day));
    }

    return cells;
  };

  const openCalendar = () => {
    setCalendarMonth(form.fecha ? new Date(`${form.fecha}T00:00:00`) : new Date());
    setDatePickerVisible(true);
  };

  const openCalendarBaja = () => {
    setCalendarMonth(form.fechaBaja ? new Date(`${form.fechaBaja}T00:00:00`) : new Date());
    setDatePickerBajaVisible(true);
  };

  const closeCalendar = () => setDatePickerVisible(false);

  const closeCalendarBaja = () => setDatePickerBajaVisible(false);

  const selectDate = (date: Date) => {
    if (isFutureDate(date)) {
      Alert.alert('Fecha invalida', 'No puedes seleccionar una fecha posterior a hoy.');
      return;
    }
    setField('fecha', formatDate(date));
    setDatePickerVisible(false);
  };

  const selectDateBaja = (date: Date) => {
    if (isFutureDate(date)) {
      Alert.alert('Fecha invalida', 'No puedes seleccionar una fecha posterior a hoy.');
      return;
    }
    setField('fechaBaja', formatDate(date));
    setDatePickerBajaVisible(false);
  };

  const goPreviousMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const isAtCurrentMonth = () => {
    const now = new Date();
    return (
      calendarMonth.getFullYear() > now.getFullYear() ||
      (calendarMonth.getFullYear() === now.getFullYear() && calendarMonth.getMonth() >= now.getMonth())
    );
  };

  const goNextMonth = () => {
    if (isAtCurrentMonth()) {
      return;
    }
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const onGuardar = async () => {
    if (!canSubmit || loading) {
      return;
    }

    const normalizedSelectedPhoto = form.fotoPath?.trim() ?? '';
    const normalizedInitialPhoto = initialPhotoUri?.trim() ?? '';
    const hasNewPhoto = normalizedSelectedPhoto.length > 0 && normalizedSelectedPhoto !== normalizedInitialPhoto;

    const payload: UpdateAnimalPayload = {
      id: animal.id,
      arete: animal.arete,
      especie: form.especie.trim(),
      sexo: form.sexo.trim(),
      fecha: form.fecha.trim(),
      peso: form.peso.trim().length === 0 ? null : Number(form.peso),
      foto_path: hasNewPhoto ? form.fotoPath : null,
    };

    if (payload.peso !== null && Number.isNaN(payload.peso)) {
      Alert.alert('Dato invalido', 'El peso debe ser numerico.');
      return;
    }

    try {
      setLoading(true);
      await AnimalModule.updateAnimal(payload);

      if (animal.estado === 'ACTIVO' && form.estado === 'FALLECIDO') {
        await AnimalModule.changeEstado({
          id: animal.id,
          estado: 'FALLECIDO',
          fecha_baja: form.fechaBaja.trim().length > 0 ? form.fechaBaja.trim() : formatDate(new Date()),
          motivo_baja:
            form.motivoBaja.trim().length > 0
              ? form.motivoBaja.trim()
              : 'Cambio de estado registrado desde editar',
        });
      } else if (animal.estado === 'FALLECIDO' && form.estado === 'ACTIVO') {
        await AnimalModule.changeEstado({
          id: animal.id,
          estado: 'ACTIVO',
        });
      }

      Alert.alert('Actualizado', `Animal ${animal.arete} actualizado correctamente.`);
      onSaved();
    } catch (updateError) {
      const message =
        updateError instanceof Error ? updateError.message : 'No se pudo guardar los cambios del animal.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>ÔåÉ</Text>
        </Pressable>
        <View>
          <Text style={styles.title}>Editar Animal</Text>
          <Text style={styles.subtitle}>La {animal.especie} ÔÇó #{animal.arete}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>N├║mero de Arete SINIIGA ­ƒöÆ</Text>
        <TextInput value={form.arete} style={[styles.input, styles.inputDisabled]} editable={false} />
        <Text style={styles.helperText}>El arete oficial no se puede modificar</Text>

        <Text style={styles.label}>Estado actual del animal *</Text>
        <View style={styles.estadoSelectorRow}>
          <Pressable
            style={[styles.estadoSelectorChip, form.estado === 'ACTIVO' && styles.estadoSelectorChipActive]}
            onPress={() => setField('estado', 'ACTIVO')}
          >
            <Text
              style={[
                styles.estadoSelectorText,
                form.estado === 'ACTIVO' && styles.estadoSelectorTextActive,
              ]}
            >
              ­ƒƒó Activo
            </Text>
          </Pressable>

          <View style={[styles.estadoSelectorChip, styles.estadoSelectorChipDisabled]}>
            <Text style={styles.estadoSelectorTextDisabled}>­ƒƒá Vendido</Text>
          </View>

          <Pressable
            style={[styles.estadoSelectorChip, form.estado === 'FALLECIDO' && styles.estadoSelectorChipFallecido]}
            onPress={() => setField('estado', 'FALLECIDO')}
          >
            <Text
              style={[
                styles.estadoSelectorText,
                form.estado === 'FALLECIDO' && styles.estadoSelectorTextFallecido,
              ]}
            >
              ­ƒƒú Fallecido
            </Text>
          </Pressable>
        </View>

        {animal.estado !== 'VENDIDO' ? (
          <Pressable
            style={[styles.fallecidoToggle, form.estado === 'FALLECIDO' && styles.fallecidoToggleActive]}
            onPress={() =>
              setForm(prev => ({
                ...prev,
                estado: prev.estado === 'ACTIVO' ? 'FALLECIDO' : 'ACTIVO',
              }))
            }
          >
            <Text style={styles.fallecidoToggleText}>
              {form.estado === 'FALLECIDO' ? 'Quitar marca de fallecido' : 'Marcar como fallecido'}
            </Text>
          </Pressable>
        ) : null}

        {form.estado === 'FALLECIDO' ? (
          <>
            <Text style={styles.label}>Fecha de baja *</Text>
            <Pressable style={styles.dateField} onPress={openCalendarBaja}>
              <Text style={[styles.dateFieldText, !form.fechaBaja && styles.dateFieldPlaceholder]}>
                {form.fechaBaja || 'Selecciona una fecha'}
              </Text>
              <Text style={styles.dateFieldIcon}>­ƒôà</Text>
            </Pressable>

            <Text style={styles.label}>Causa de fallecimiento *</Text>
            <TextInput
              value={form.motivoBaja}
              onChangeText={value => setField('motivoBaja', value)}
              placeholder="Describe la causa"
              style={styles.input}
            />
          </>
        ) : null}

        <Text style={styles.label}>Nombre / Alias</Text>
        <View style={styles.chipWrap}>
          {ESPECIES_OPTIONS.map(option => {
            const selected = form.especie === option;
            return (
              <Pressable
                key={option}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setField('especie', option)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Sexo</Text>
        <View style={styles.chipWrap}>
          {SEXO_OPTIONS.map(option => {
            const selected = form.sexo === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.sexChip, selected && styles.sexChipSelected]}
                onPress={() => setField('sexo', option.value)}
              >
                <Text style={[styles.sexChipText, selected && styles.sexChipTextSelected]}>
                  {option.value} ({option.label})
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Fecha de Ingreso</Text>
        <Pressable style={styles.dateField} onPress={openCalendar}>
          <Text style={[styles.dateFieldText, !form.fecha && styles.dateFieldPlaceholder]}>
            {form.fecha || 'Selecciona una fecha'}
          </Text>
          <Text style={styles.dateFieldIcon}>­ƒôà</Text>
        </Pressable>

        <Text style={styles.label}>Peso actual (kg)</Text>
        <TextInput
          value={form.peso}
          onChangeText={value => setField('peso', sanitizeDigits(value))}
          placeholder="Ej. 352"
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
        />

        <Text style={styles.label}>Fotografia del animal</Text>
        <AnimalFotoCaptura
          rutaLocal={form.fotoPath ?? initialPhotoUri}
          onRutaLocalChange={rutaLocal => setField('fotoPath', rutaLocal)}
        />

        <Pressable
          onPress={onGuardar}
          disabled={!canSubmit || loading}
          style={[styles.submitButton, (!canSubmit || loading) && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>{loading ? 'Guardando...' : 'Guardar cambios'}</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={datePickerVisible} transparent animationType="fade" onRequestClose={closeCalendar}>
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Pressable onPress={goPreviousMonth} style={styles.calendarNavButton}>
                <Text style={styles.calendarNavText}>ÔÇ╣</Text>
              </Pressable>
              <Text style={styles.calendarTitle}>
                {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>
              <Pressable
                onPress={goNextMonth}
                style={[styles.calendarNavButton, isAtCurrentMonth() && styles.calendarNavButtonDisabled]}
                disabled={isAtCurrentMonth()}
              >
                <Text style={[styles.calendarNavText, isAtCurrentMonth() && styles.calendarNavTextDisabled]}>ÔÇ║</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAY_LABELS.map(day => (
                <Text key={day} style={styles.weekLabel}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getMonthDays(calendarMonth).map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const isSelected = form.fecha === formatDate(day);
                const isDisabled = isFutureDate(day);
                return (
                  <Pressable
                    key={day.toISOString()}
                    style={[styles.dayCell, isSelected && styles.dayCellSelected, isDisabled && styles.dayCellDisabled]}
                    onPress={() => selectDate(day)}
                    disabled={isDisabled}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day.getDate()}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.calendarCloseButton} onPress={closeCalendar}>
              <Text style={styles.calendarCloseText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={datePickerBajaVisible} transparent animationType="fade" onRequestClose={closeCalendarBaja}>
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Pressable onPress={goPreviousMonth} style={styles.calendarNavButton}>
                <Text style={styles.calendarNavText}>ÔÇ╣</Text>
              </Pressable>
              <Text style={styles.calendarTitle}>
                {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>
              <Pressable
                onPress={goNextMonth}
                style={[styles.calendarNavButton, isAtCurrentMonth() && styles.calendarNavButtonDisabled]}
                disabled={isAtCurrentMonth()}
              >
                <Text style={[styles.calendarNavText, isAtCurrentMonth() && styles.calendarNavTextDisabled]}>ÔÇ║</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAY_LABELS.map(day => (
                <Text key={day} style={styles.weekLabel}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getMonthDays(calendarMonth).map((day, index) => {
                if (!day) {
                  return <View key={`baja-empty-${index}`} style={styles.dayCell} />;
                }

                const isSelected = form.fechaBaja === formatDate(day);
                const isDisabled = isFutureDate(day);
                return (
                  <Pressable
                    key={`baja-${day.toISOString()}`}
                    style={[styles.dayCell, isSelected && styles.dayCellSelected, isDisabled && styles.dayCellDisabled]}
                    onPress={() => selectDateBaja(day)}
                    disabled={isDisabled}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day.getDate()}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.calendarCloseButton} onPress={closeCalendarBaja}>
              <Text style={styles.calendarCloseText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#ececec',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: '#0a6b33',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  backButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '700',
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 2,
    color: '#d5e8d8',
    fontWeight: '600',
    fontSize: 12,
  },
  container: {
    padding: 12,
    paddingBottom: 28,
  },
  label: {
    marginBottom: 6,
    marginTop: 10,
    color: '#1d1d1d',
    fontWeight: '700',
  },
  helperText: {
    marginTop: 4,
    color: '#7d7d7d',
    fontSize: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1f1f1f',
  },
  inputDisabled: {
    backgroundColor: '#e8e8e8',
    color: '#646464',
  },
  estadoSelectorRow: {
    marginTop: 2,
    flexDirection: 'row',
    gap: 8,
  },
  estadoSelectorChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#d5d5d5',
    borderRadius: 999,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  estadoSelectorChipActive: {
    borderColor: '#0a6b33',
    backgroundColor: '#0a6b33',
  },
  estadoSelectorChipDisabled: {
    opacity: 0.7,
  },
  estadoSelectorChipFallecido: {
    borderColor: '#9145aa',
    backgroundColor: '#f6eefa',
  },
  estadoSelectorText: {
    color: '#2a2a2a',
    fontWeight: '700',
    fontSize: 12,
  },
  estadoSelectorTextActive: {
    color: '#ffffff',
  },
  estadoSelectorTextDisabled: {
    color: '#9b9b9b',
    fontWeight: '700',
    fontSize: 12,
  },
  estadoSelectorTextFallecido: {
    color: '#7a3a8d',
  },
  fallecidoToggle: {
    marginTop: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#d2d2d2',
    backgroundColor: '#f0f0f0',
    paddingVertical: 11,
    alignItems: 'center',
  },
  fallecidoToggleActive: {
    borderColor: '#9a2f2f',
    backgroundColor: '#fff4f4',
  },
  fallecidoToggleText: {
    color: '#344b36',
    fontWeight: '700',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#d7d7d7',
    backgroundColor: '#f0f0f0',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipSelected: {
    backgroundColor: '#0f6f35',
    borderColor: '#0f6f35',
  },
  chipText: {
    color: '#1c2b1d',
    fontWeight: '700',
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  sexChip: {
    borderWidth: 1,
    borderColor: '#d7d7d7',
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sexChipSelected: {
    backgroundColor: '#0f6f35',
    borderColor: '#0f6f35',
  },
  sexChipText: {
    color: '#1c2b1d',
    fontWeight: '700',
    fontSize: 13,
  },
  sexChipTextSelected: {
    color: '#ffffff',
  },
  dateField: {
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateFieldText: {
    color: '#1c2b1d',
    fontSize: 14,
  },
  dateFieldPlaceholder: {
    color: '#8b9784',
  },
  dateFieldIcon: {
    fontSize: 16,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    padding: 18,
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavText: {
    color: '#0f6f35',
    fontSize: 22,
    fontWeight: '800',
  },
  calendarNavButtonDisabled: {
    opacity: 0.3,
  },
  calendarNavTextDisabled: {
    color: '#aaaaaa',
  },
  calendarTitle: {
    color: '#1c2b1d',
    fontSize: 16,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekLabel: {
    width: '14.2857%',
    textAlign: 'center',
    color: '#6b7b67',
    fontWeight: '700',
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: '#0f6f35',
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    color: '#1c2b1d',
    fontWeight: '700',
  },
  dayTextSelected: {
    color: '#ffffff',
  },
  calendarCloseButton: {
    marginTop: 14,
    backgroundColor: '#0f6f35',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  calendarCloseText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#0a6b33',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});
~~~

---

## src/screens/animales/ListadoAnimalesScreen.tsx

- Estado: Agregado

### Contenido en e253295

[El archivo no existia en el commit inicial]

### Contenido en 21b896d

~~~tsx
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { EstadoBadge } from '../../components/animales/EstadoBadge';
import { AnimalSearchBar } from '../../components/animales/AnimalSearchBar';
import { useSearch } from '../../hooks/useSearch';
import { AnimalModule } from '../../native/AnimalModule';
import { AnimalEstado, AnimalModel } from '../../types/Animal';

const formatSexo = (sexo: string | null | undefined) => {
  if (!sexo) {
    return 'Sin dato';
  }
  if (sexo === 'F') {
    return 'H';
  }
  return sexo;
};

type ListadoAnimalesScreenProps = {
  onBackHome: () => void;
  onCreateAnimal: () => void;
  onOpenDetail: (animalId: number) => void;
};

export function ListadoAnimalesScreen({
  onBackHome,
  onCreateAnimal,
  onOpenDetail,
}: ListadoAnimalesScreenProps) {
  const [estadoFiltro, setEstadoFiltro] = useState<AnimalEstado>('ACTIVO');
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useSearch(searchTerm);
  const [animals, setAnimals] = useState<AnimalModel[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const requestIdRef = useRef(0);
  const loadAnimals = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setError(null);
    setRefreshing(true);

    try {
      const rows = await AnimalModule.listAnimals();
      if (requestId !== requestIdRef.current) {
        return;
      }

      setAnimals(rows);
    } catch (loadError) {
      if (requestId !== requestIdRef.current) {
        return;
      }

      const message =
        loadError instanceof Error ? loadError.message : 'No se pudo cargar el listado de animales.';
      setError(message);
    } finally {
      if (requestId === requestIdRef.current) {
        setInitialLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadAnimals();
  }, [loadAnimals]);

  const visibleAnimals = useMemo(() => {
    const normalizedSearch = debouncedSearch.trim().toLowerCase();

    return animals.filter(item => {
      const matchesEstado = item.estado === estadoFiltro;
      const matchesSearch =
        normalizedSearch.length === 0 || String(item.arete).toLowerCase().includes(normalizedSearch);

      return matchesEstado && matchesSearch;
    });
  }, [animals, estadoFiltro, debouncedSearch]);

  const onRefresh = useCallback(() => {
    void loadAnimals();
  }, [loadAnimals]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.title}>Listado de Animales</Text>
        <Text style={styles.subtitle}>Selecciona un animal para ver detalle, editar o eliminar.</Text>
      </View>

      <View style={styles.topActions}>
        <Pressable style={styles.primaryButton} onPress={onCreateAnimal}>
          <Text style={styles.primaryButtonText}>Registrar animal</Text>
        </Pressable>
        <Pressable style={styles.ghostButton} onPress={onBackHome}>
          <Text style={styles.ghostButtonText}>Volver al inicio</Text>
        </Pressable>
      </View>

      <View style={styles.selectorWrap}>
        <AnimalSearchBar value={searchTerm} onSearch={setSearchTerm} />
        <Text style={styles.selectorTitle}>Filtrar por estado</Text>
        <View style={styles.selectorRow}>
          {(['ACTIVO', 'VENDIDO', 'FALLECIDO'] as AnimalEstado[]).map(estado => {
            const selected = estadoFiltro === estado;
            return (
              <Pressable
                key={estado}
                style={[styles.selectorChip, selected && styles.selectorChipSelected]}
                onPress={() => setEstadoFiltro(estado)}
              >
                <EstadoBadge estado={estado} />
              </Pressable>
            );
          })}
        </View>
      </View>

      {initialLoading && animals.length === 0 ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2f5d3a" />
          <Text style={styles.centerStateText}>Cargando animales...</Text>
        </View>
      ) : null}

      {!initialLoading && error ? (
        <View style={styles.centerState}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {!initialLoading && !error ? (
        <FlatList
          data={visibleAnimals}
          keyExtractor={item => String(item.id)}
          refreshing={refreshing}
          onRefresh={onRefresh}
          contentContainerStyle={visibleAnimals.length === 0 ? styles.emptyContainer : styles.listContainer}
          ListEmptyComponent={<Text style={styles.emptyText}>No hay animales registrados todav├¡a.</Text>}
          renderItem={({ item }) => (
            <Pressable style={styles.itemCard} onPress={() => onOpenDetail(item.id)}>
              <View>
                <Text style={styles.arete}>Arete: {item.arete}</Text>
                <Text style={styles.metaText}>Especie: {item.especie}</Text>
                <Text style={styles.metaText}>Sexo: {formatSexo(item.sexo)}</Text>
                <Text style={styles.metaText}>Fecha ingreso: {item.fecha}</Text>
                <View style={styles.itemEstadoWrap}>
                  <EstadoBadge estado={item.estado} />
                </View>
              </View>
              <Text style={styles.chevron}>ÔÇ║</Text>
            </Pressable>
          )}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f1e7',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 12,
    backgroundColor: '#2f5d3a',
  },
  title: {
    color: '#ffffff',
    fontSize: 21,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    color: '#dbe9db',
    fontSize: 13,
  },
  topActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 6,
  },
  selectorWrap: {
    paddingHorizontal: 16,
    paddingBottom: 10,
  },
  selectorTitle: {
    color: '#485848',
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 8,
  },
  selectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  selectorChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#d6ded0',
    padding: 4,
    backgroundColor: '#ffffff',
  },
  selectorChipSelected: {
    borderColor: '#2f5d3a',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  primaryButton: {
    flex: 1,
    backgroundColor: '#0f6f35',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  ghostButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#2f5d3a',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  ghostButtonText: {
    color: '#2f5d3a',
    fontWeight: '700',
  },
  centerState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  centerStateText: {
    marginTop: 10,
    color: '#506152',
    fontWeight: '600',
  },
  errorText: {
    color: '#c73d3d',
    textAlign: 'center',
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    gap: 10,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  emptyText: {
    color: '#59655a',
    fontWeight: '600',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#dfe5d8',
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arete: {
    color: '#1c2b1d',
    fontWeight: '800',
    fontSize: 15,
  },
  metaText: {
    marginTop: 2,
    color: '#4f5f50',
    fontWeight: '600',
    fontSize: 12,
  },
  itemEstadoWrap: {
    marginTop: 7,
  },
  chevron: {
    color: '#2f5d3a',
    fontSize: 26,
    fontWeight: '800',
  },
});
~~~

---

## src/screens/animales/RegistrarAnimalScreen.tsx

- Estado: Modificado

### Contenido en e253295

~~~tsx
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AnimalModule } from '../../native/AnimalModule';
import type { AnimalFormState, InsertAnimalPayload } from '../../types/Animal';

type RegistrarAnimalScreenProps = {
  onBack: () => void;
};

const INITIAL_FORM_STATE: AnimalFormState = {
  arete: '',
  especie: '',
  sexo: '',
  fecha: '',
  peso: '',
  foto: '',
};

export function RegistrarAnimalScreen({ onBack }: RegistrarAnimalScreenProps) {
  const [form, setForm] = useState<AnimalFormState>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return (
      form.arete.trim().length > 0 &&
      form.especie.trim().length > 0 &&
      form.sexo.trim().length > 0 &&
      form.fecha.trim().length > 0
    );
  }, [form]);

  const setField = (key: keyof AnimalFormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const buildPayload = (): InsertAnimalPayload => {
    const pesoValue = form.peso.trim();
    return {
      arete: form.arete.trim(),
      especie: form.especie.trim(),
      sexo: form.sexo.trim(),
      fecha: form.fecha.trim(),
      peso: pesoValue.length > 0 ? Number(pesoValue) : null,
      foto: form.foto.trim().length > 0 ? form.foto.trim() : null,
    };
  };

  const onRegistrar = async () => {
    if (!canSubmit || loading) {
      return;
    }

    const payload = buildPayload();
    if (payload.peso !== null && Number.isNaN(payload.peso)) {
      Alert.alert('Dato invalido', 'El peso debe ser numerico.');
      return;
    }

    try {
      setLoading(true);
      await AnimalModule.insertAnimal(payload);
      Alert.alert('Registro exitoso', `Animal con arete ${payload.arete} registrado.`);
      setForm(INITIAL_FORM_STATE);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se pudo registrar el animal.';
      Alert.alert('Error de registro', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
        <Text style={styles.title}>Registro Arete SINIIGA</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Arete</Text>
        <TextInput
          value={form.arete}
          onChangeText={value => setField('arete', value)}
          placeholder="Ej. MX-0011223344"
          style={styles.input}
          autoCapitalize="characters"
        />

        <Text style={styles.label}>Especie</Text>
        <TextInput
          value={form.especie}
          onChangeText={value => setField('especie', value)}
          placeholder="Bovino, Ovino, Caprino"
          style={styles.input}
        />

        <Text style={styles.label}>Sexo</Text>
        <TextInput
          value={form.sexo}
          onChangeText={value => setField('sexo', value)}
          placeholder="Macho o Hembra"
          style={styles.input}
        />

        <Text style={styles.label}>Fecha</Text>
        <TextInput
          value={form.fecha}
          onChangeText={value => setField('fecha', value)}
          placeholder="YYYY-MM-DD"
          style={styles.input}
        />

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          value={form.peso}
          onChangeText={value => setField('peso', value)}
          placeholder="Ej. 352.7"
          style={styles.input}
          keyboardType="decimal-pad"
        />

        <Text style={styles.label}>Foto (URI o ruta)</Text>
        <TextInput
          value={form.foto}
          onChangeText={value => setField('foto', value)}
          placeholder="file:///... o content://..."
          style={styles.input}
          autoCapitalize="none"
        />

        <Pressable
          onPress={onRegistrar}
          disabled={!canSubmit || loading}
          style={[styles.submitButton, (!canSubmit || loading) && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>{loading ? 'Registrando...' : 'Registrar'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f1e7',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#2f5d3a',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#e8edd8',
  },
  backText: {
    color: '#2f5d3a',
    fontWeight: '700',
  },
  title: {
    marginTop: 12,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  container: {
    padding: 16,
    paddingBottom: 28,
  },
  label: {
    marginBottom: 6,
    marginTop: 10,
    color: '#1c2b1d',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#b6c7a0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1c2b1d',
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#2f5d3a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});
~~~

### Contenido en 21b896d

~~~tsx
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import { AnimalFotoCaptura } from '../../components/animales/AnimalFotoCaptura';
import { AnimalModule } from '../../native/AnimalModule';
import type { AnimalFormState, InsertAnimalPayload } from '../../types/Animal';
import { validateArete } from '../../utils/validaciones/areteValidator';

const ESPECIES_OPTIONS = [
  'Holstein',
  'Suizo Pardo',
  'Jersey',
  'Brahman',
  'Angus',
  'Hereford',
  'Charolais',
  'Simmental',
  'Criollo',
  'Limousin',
];

const SEXO_OPTIONS = [
  { label: 'Macho', value: 'M' },
  { label: 'Hembra', value: 'H' },
];

const MONTH_NAMES = [
  'Enero',
  'Febrero',
  'Marzo',
  'Abril',
  'Mayo',
  'Junio',
  'Julio',
  'Agosto',
  'Septiembre',
  'Octubre',
  'Noviembre',
  'Diciembre',
];

const WEEKDAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

type RegistrarAnimalScreenProps = {
  onBack: () => void;
  onSuccess?: () => void;
};

const INITIAL_FORM_STATE: AnimalFormState = {
  arete: '',
  especie: ESPECIES_OPTIONS[0],
  sexo: SEXO_OPTIONS[0].value,
  fecha: '',
  peso: '',
  fotoPath: null,
};

export function RegistrarAnimalScreen({ onBack, onSuccess }: RegistrarAnimalScreenProps) {
  const [form, setForm] = useState<AnimalFormState>(INITIAL_FORM_STATE);
  const [loading, setLoading] = useState(false);
  const submittingRef = React.useRef(false);
  const [areteError, setAreteError] = useState<string | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    return form.fecha ? new Date(`${form.fecha}T00:00:00`) : new Date();
  });

  const canSubmit = useMemo(() => {
    const areteValidation = validateArete(form.arete);
    return (
      areteValidation.valid &&
      form.especie.trim().length > 0 &&
      form.sexo.trim().length > 0 &&
      form.fecha.trim().length > 0
    );
  }, [form]);

  const setField = (key: keyof AnimalFormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const sanitizeDigits = (value: string) => value.replace(/\D/g, '');

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const isFutureDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);
    return candidate.getTime() > today.getTime();
  };

  const parseCalendarDate = (year: number, month: number, day: number) => {
    return new Date(year, month, day);
  };

  const getMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = [];

    for (let i = 0; i < firstDay; i += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(parseCalendarDate(year, month, day));
    }

    return cells;
  };

  const openCalendar = () => {
    setCalendarMonth(form.fecha ? new Date(`${form.fecha}T00:00:00`) : new Date());
    setDatePickerVisible(true);
  };

  const closeCalendar = () => setDatePickerVisible(false);

  const selectDate = (date: Date) => {
    if (isFutureDate(date)) {
      Alert.alert('Fecha invalida', 'No puedes seleccionar una fecha posterior a hoy.');
      return;
    }
    setField('fecha', formatDate(date));
    setDatePickerVisible(false);
  };

  const goPreviousMonth = () => {
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const isAtCurrentMonth = () => {
    const now = new Date();
    return (
      calendarMonth.getFullYear() > now.getFullYear() ||
      (calendarMonth.getFullYear() === now.getFullYear() && calendarMonth.getMonth() >= now.getMonth())
    );
  };

  const goNextMonth = () => {
    if (isAtCurrentMonth()) {
      return;
    }
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const onAreteChange = (value: string) => {
    setField('arete', value);
    const result = validateArete(value);
    setAreteError(result.errorMsg);
  };

  const buildPayload = (): InsertAnimalPayload => {
    const pesoValue = form.peso.trim();
    return {
      arete: form.arete.trim(),
      especie: form.especie.trim(),
      sexo: form.sexo.trim(),
      fecha: form.fecha.trim(),
      peso: pesoValue.length > 0 ? Number(pesoValue) : null,
      foto_path: form.fotoPath,
    };
  };

  const onRegistrar = async () => {
    if (!canSubmit || loading || submittingRef.current) {
      return;
    }

    submittingRef.current = true;

    const areteValidation = validateArete(form.arete);
    if (!areteValidation.valid) {
      setAreteError(areteValidation.errorMsg);
      return;
    }

    setAreteError(null);

    const payload = buildPayload();
    if (payload.peso !== null && Number.isNaN(payload.peso)) {
      Alert.alert('Dato invalido', 'El peso debe ser numerico.');
      return;
    }

    try {
      setLoading(true);
      await AnimalModule.insertAnimal(payload);
      Alert.alert('Registro exitoso', `Animal con arete ${payload.arete} registrado.`);
      setForm(INITIAL_FORM_STATE);
      setAreteError(null);
      onSuccess?.();
    } catch (error) {
      const errorCode =
        typeof error === 'object' && error !== null && 'code' in error
          ? String((error as { code?: unknown }).code)
          : null;

      if (errorCode === 'ERR_ARETE_EMPTY') {
        setAreteError('El numero de arete es obligatorio.');
        return;
      }

      if (errorCode === 'ERR_ARETE_FORMAT') {
        setAreteError('El arete debe tener 10 digitos y no puede iniciar en 0.');
        return;
      }

      if (errorCode === 'ERR_ARETE_DUPLICATE') {
        setAreteError('El arete ya existe en el registro SINIIGA.');
        return;
      }

      const message = error instanceof Error ? error.message : 'No se pudo registrar el animal.';
      Alert.alert('Error de registro', message);
    } finally {
      setLoading(false);
      submittingRef.current = false;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
        <Text style={styles.title}>Registrar Animal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.label}>Numero de Arete SINIIGA *</Text>
        <TextInput
          value={form.arete}
          onChangeText={value => onAreteChange(sanitizeDigits(value))}
          placeholder="0013482956"
          style={[styles.input, areteError ? styles.inputError : undefined]}
          keyboardType="number-pad"
          maxLength={10}
        />
        {areteError ? <Text style={styles.errorText}>{areteError}</Text> : null}

        <Text style={styles.label}>Especie / Raza</Text>
        <View style={styles.chipWrap}>
          {ESPECIES_OPTIONS.map(option => {
            const selected = form.especie === option;
            return (
              <Pressable
                key={option}
                style={[styles.chip, selected && styles.chipSelected]}
                onPress={() => setField('especie', option)}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Sexo</Text>
        <View style={styles.chipWrap}>
          {SEXO_OPTIONS.map(option => {
            const selected = form.sexo === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.sexChip, selected && styles.sexChipSelected]}
                onPress={() => setField('sexo', option.value)}
              >
                <Text style={[styles.sexChipText, selected && styles.sexChipTextSelected]}>
                  {option.value} ({option.label})
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Fecha de ingreso</Text>
        <Pressable style={styles.dateField} onPress={openCalendar}>
          <Text style={[styles.dateFieldText, !form.fecha && styles.dateFieldPlaceholder]}>
            {form.fecha || 'Selecciona una fecha'}
          </Text>
          <Text style={styles.dateFieldIcon}>­ƒôà</Text>
        </Pressable>

        <Text style={styles.label}>Peso (kg)</Text>
        <TextInput
          value={form.peso}
          onChangeText={value => setField('peso', sanitizeDigits(value))}
          placeholder="Ej. 352.7"
          style={styles.input}
          keyboardType="number-pad"
          maxLength={6}
        />

        <Text style={styles.label}>Fotografia del animal</Text>
        <AnimalFotoCaptura
          rutaLocal={form.fotoPath}
          onRutaLocalChange={rutaLocal => setForm(prev => ({ ...prev, fotoPath: rutaLocal }))}
        />

        <Pressable
          onPress={onRegistrar}
          disabled={!canSubmit || loading}
          style={[styles.submitButton, (!canSubmit || loading) && styles.submitDisabled]}
        >
          <Text style={styles.submitText}>{loading ? 'Registrando...' : 'Registrar'}</Text>
        </Pressable>
      </ScrollView>

      <Modal visible={datePickerVisible} transparent animationType="fade" onRequestClose={closeCalendar}>
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Pressable onPress={goPreviousMonth} style={styles.calendarNavButton}>
                <Text style={styles.calendarNavText}>ÔÇ╣</Text>
              </Pressable>
              <Text style={styles.calendarTitle}>
                {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>
              <Pressable
                onPress={goNextMonth}
                style={[styles.calendarNavButton, isAtCurrentMonth() && styles.calendarNavButtonDisabled]}
                disabled={isAtCurrentMonth()}
              >
                <Text style={[styles.calendarNavText, isAtCurrentMonth() && styles.calendarNavTextDisabled]}>ÔÇ║</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAY_LABELS.map(day => (
                <Text key={day} style={styles.weekLabel}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getMonthDays(calendarMonth).map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const isSelected = form.fecha === formatDate(day);
                const isDisabled = isFutureDate(day);
                return (
                  <Pressable
                    key={day.toISOString()}
                    style={[styles.dayCell, isSelected && styles.dayCellSelected, isDisabled && styles.dayCellDisabled]}
                    onPress={() => selectDate(day)}
                    disabled={isDisabled}
                  >
                    <Text style={[styles.dayText, isSelected && styles.dayTextSelected]}>{day.getDate()}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Pressable style={styles.calendarCloseButton} onPress={closeCalendar}>
              <Text style={styles.calendarCloseText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f1e7',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 8,
    backgroundColor: '#2f5d3a',
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#e8edd8',
  },
  backText: {
    color: '#2f5d3a',
    fontWeight: '700',
  },
  title: {
    marginTop: 12,
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '800',
  },
  container: {
    padding: 16,
    paddingBottom: 28,
  },
  label: {
    marginBottom: 6,
    marginTop: 10,
    color: '#1c2b1d',
    fontWeight: '700',
  },
  input: {
    borderWidth: 1,
    borderColor: '#b6c7a0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#1c2b1d',
  },
  inputError: {
    borderColor: '#d23d3d',
  },
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    borderWidth: 1,
    borderColor: '#cfd9c3',
    backgroundColor: '#ffffff',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  chipSelected: {
    backgroundColor: '#0f6f35',
    borderColor: '#0f6f35',
  },
  chipText: {
    color: '#1c2b1d',
    fontWeight: '700',
    fontSize: 13,
  },
  chipTextSelected: {
    color: '#ffffff',
  },
  sexChip: {
    borderWidth: 1,
    borderColor: '#cfd9c3',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sexChipSelected: {
    backgroundColor: '#0f6f35',
    borderColor: '#0f6f35',
  },
  sexChipText: {
    color: '#1c2b1d',
    fontWeight: '700',
    fontSize: 13,
  },
  sexChipTextSelected: {
    color: '#ffffff',
  },
  dateField: {
    borderWidth: 1,
    borderColor: '#b6c7a0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateFieldText: {
    color: '#1c2b1d',
    fontSize: 14,
  },
  dateFieldPlaceholder: {
    color: '#8b9784',
  },
  dateFieldIcon: {
    fontSize: 16,
  },
  errorText: {
    marginTop: 6,
    color: '#d23d3d',
    fontSize: 12,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    justifyContent: 'center',
    padding: 18,
  },
  calendarCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef4ea',
    alignItems: 'center',
    justifyContent: 'center',
  },
  calendarNavText: {
    color: '#0f6f35',
    fontSize: 22,
    fontWeight: '800',
  },
  calendarNavButtonDisabled: {
    opacity: 0.3,
  },
  calendarNavTextDisabled: {
    color: '#aaaaaa',
  },
  calendarTitle: {
    color: '#1c2b1d',
    fontSize: 16,
    fontWeight: '800',
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekLabel: {
    width: '14.2857%',
    textAlign: 'center',
    color: '#6b7b67',
    fontWeight: '700',
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  dayCellSelected: {
    backgroundColor: '#0f6f35',
  },
  dayCellDisabled: {
    opacity: 0.35,
  },
  dayText: {
    color: '#1c2b1d',
    fontWeight: '700',
  },
  dayTextSelected: {
    color: '#ffffff',
  },
  calendarCloseButton: {
    marginTop: 14,
    backgroundColor: '#0f6f35',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 12,
  },
  calendarCloseText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#2f5d3a',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitDisabled: {
    opacity: 0.55,
  },
  submitText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 16,
  },
});
~~~

---

## src/types/Animal.ts

- Estado: Modificado

### Contenido en e253295

~~~ts
export interface AnimalFormState {
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: string;
  foto: string;
}

export interface AnimalModel {
  id: number;
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: number | null;
  foto: string | null;
}

export interface InsertAnimalPayload {
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: number | null;
  foto: string | null;
}

export interface InsertAnimalResult {
  ok: boolean;
  animalId: number;
  arete: string;
}
~~~

### Contenido en 21b896d

~~~ts
export interface AnimalFormState {
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: string;
  fotoPath: string | null;
}

export interface AnimalModel {
  id: number;
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: number | null;
  foto: string | null;
  estado: AnimalEstado;
  fecha_baja: string | null;
  motivo_baja: string | null;
}

export type AnimalEstado = 'ACTIVO' | 'VENDIDO' | 'FALLECIDO';

export interface UpdateAnimalPayload {
  id: number;
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: number | null;
  foto_path: string | null;
}

export interface InsertAnimalPayload {
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: number | null;
  foto_path: string | null;
}

export interface InsertAnimalResult {
  ok: boolean;
  animalId: number;
  arete: string;
}

export interface UpdateAnimalResult {
  ok: boolean;
  animal: AnimalModel;
}

export interface DeleteAnimalResult {
  ok: boolean;
  animalId: number;
}

export interface ChangeEstadoPayload {
  id: number;
  estado: AnimalEstado;
  fecha_baja?: string;
  motivo_baja?: string;
}

export interface ChangeEstadoResult {
  ok: boolean;
  animal: AnimalModel;
}

export interface PesoHistorialPoint {
  fecha: string;
  peso: number;
}

export interface EventoSanitarioResumen {
  id: number;
  fecha: string | null;
  enfermedad: string | null;
  sintomas: string | null;
  tratamiento: string | null;
  estado: string | null;
  observaciones: string | null;
}

export interface HistorialResumen {
  historial_peso: PesoHistorialPoint[];
  eventos_recientes: EventoSanitarioResumen[];
}
~~~

---

## src/utils/animales/tiempoEnRancho.ts

- Estado: Agregado

### Contenido en e253295

[El archivo no existia en el commit inicial]

### Contenido en 21b896d

~~~ts
const parseIsoDate = (value: string): Date | null => {
  const normalized = value.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(normalized);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const parsed = new Date(year, month, day);

  if (
    Number.isNaN(parsed.getTime()) ||
    parsed.getFullYear() !== year ||
    parsed.getMonth() !== month ||
    parsed.getDate() !== day
  ) {
    return null;
  }

  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

export const calcularTiempoEnRancho = (fechaIngreso: string | null | undefined): string => {
  if (!fechaIngreso || fechaIngreso.trim().length === 0) {
    return 'Sin dato';
  }

  const ingreso = parseIsoDate(fechaIngreso);
  if (!ingreso) {
    return 'Sin dato';
  }

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  if (ingreso.getTime() > hoy.getTime()) {
    return 'Sin dato';
  }

  let a├▒os = hoy.getFullYear() - ingreso.getFullYear();
  let meses = hoy.getMonth() - ingreso.getMonth();
  let dias = hoy.getDate() - ingreso.getDate();

  if (dias < 0) {
    meses -= 1;
    const diasDelMesAnterior = new Date(hoy.getFullYear(), hoy.getMonth(), 0).getDate();
    dias += diasDelMesAnterior;
  }

  if (meses < 0) {
    a├▒os -= 1;
    meses += 12;
  }

  if (a├▒os > 0) {
    return meses > 0
      ? `${a├▒os} a├▒o${a├▒os > 1 ? 's' : ''}, ${meses} mes${meses > 1 ? 'es' : ''}`
      : `${a├▒os} a├▒o${a├▒os > 1 ? 's' : ''}`;
  }

  if (meses > 0) {
    return `${meses} mes${meses > 1 ? 'es' : ''}`;
  }

  return `${dias} d├¡a${dias !== 1 ? 's' : ''}`;
};
~~~

---

## src/utils/validaciones/areteValidator.ts

- Estado: Agregado

### Contenido en e253295

[El archivo no existia en el commit inicial]

### Contenido en 21b896d

~~~ts
export interface ValidationResult {
  valid: boolean;
  errorMsg: string | null;
}

const ARETE_REGEX = /^[1-9]\d{9}$/;

export const validateArete = (arete: string): ValidationResult => {
  const value = arete.trim();

  if (value.length === 0) {
    return {
      valid: false,
      errorMsg: 'El numero de arete es obligatorio.',
    };
  }

  if (!ARETE_REGEX.test(value)) {
    return {
      valid: false,
      errorMsg: 'El arete debe tener 10 digitos y no puede iniciar en 0.',
    };
  }

  return {
    valid: true,
    errorMsg: null,
  };
};
~~~

---

