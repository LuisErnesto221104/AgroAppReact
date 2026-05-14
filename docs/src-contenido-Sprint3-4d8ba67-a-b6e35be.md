# Archivos de src - Sprint 3 (4d8ba67 a b6e35be)

## Commits incluidos:
- **4d8ba67** - Actualizacion_Home_Sprint3
- **ed0ea71** - AnexoG_H_Sprint3
- **f66f4b0** - AnexoF_Sprint3
- **b03211b** - AnexoE_y_EstadoVendido_Sprint3
- **3098f5c** - AnexoD_Sprint3
- **064281f** - AnexoC_Sprint3
- **23802bc** - AnexoB_Sprint3
- **b6e35be** - AnexoA_Spritn3

Total commits: 8

---

**Total archivos Ãºnicos en src:** 66

---


## src/components/animales/AnimalFotoCaptura.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/components/animales/AnimalSearchBar.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/components/animales/EstadoBadge.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/components/animales/EventoSanitarioItem.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/components/animales/GraficoBarrasCategorias.tsx

**Estado:** Eliminado

---

## src/components/animales/PesoChart.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/components/animales/ResumenInversionCard.tsx

**Estado:** Eliminado

---

## src/components/animales/VentaAnimalModal.tsx

**Estado:** Eliminado

---

## src/components/EventoClinicoCard.tsx

**Estado:** Eliminado

---

## src/components/EventoDetailModal.tsx

**Estado:** Eliminado

---

## src/components/nutricion/TablaRecomendacion.tsx

**Estado:** Eliminado

---

## src/components/sanitarios/CalendarioMensual.tsx

**Estado:** Eliminado

---

## src/data/NutricionData.ts

**Estado:** Eliminado

---

## src/features/animals/screens/AnimalsScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React from 'react';

import { AnimalesNavigator } from '../../../navigation/AnimalesNavigator';

type AnimalsScreenProps = {
  onBack: () => void;
};

export function AnimalsScreen({ onBack }: AnimalsScreenProps) {
  return <AnimalesNavigator onBack={onBack} />;
}
```

---

## src/features/animals/screens/HistorialClinico.tsx

**Estado:** Eliminado

---

## src/features/costs/screens/CostsScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React from 'react';

import { ModulePlaceholderScreen } from '../../../shared/components/ModulePlaceholderScreen';

type CostsScreenProps = {
  onBack: () => void;
};

export function CostsScreen({ onBack }: CostsScreenProps) {
  return (
    <ModulePlaceholderScreen
      title="Control de Costos"
      description="Ventana base creada. Aqui ira el registro de gastos, insumos, ventas y el balance por animal."
      emoji="­ƒÆÁ"
      onBack={onBack}
    />
  );
}
```

---

## src/features/costs/screens/GestionGastosScreen.tsx

**Estado:** Eliminado

---

## src/features/costs/screens/RegistrarGastoScreen.tsx

**Estado:** Eliminado

---

## src/features/health/screens/HealthScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React from 'react';

import { RegistrarEventoSanitario } from '../../../screens/sanitarios/RegistrarEventoSanitario';

type HealthScreenProps = {
  onBack: () => void;
};

export function HealthScreen({ onBack }: HealthScreenProps) {
  return <RegistrarEventoSanitario onBack={onBack} />;
}
```

---

## src/features/home/components/ModuleCard.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

type ModuleCardProps = {
  title: string;
  description: string;
};

export function ModuleCard({ title, description }: ModuleCardProps) {
  return (
    <Pressable style={styles.card}>
      <View style={styles.badgeRow}>
        <Text style={styles.badge}>PROXIMAMENTE</Text>
      </View>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 14,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#e2e8e4',
    padding: 14,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  badge: {
    fontSize: 10,
    fontWeight: '700',
    color: '#07612d',
    backgroundColor: '#e6f2ec',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1d1d1b',
  },
  description: {
    marginTop: 6,
    fontSize: 13,
    lineHeight: 20,
    color: '#45524a',
  },
});
```

---

## src/features/home/screens/HomeScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/features/home/types/homeNavigation.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
export type HomeModuleRoute =
  | 'animals'
  | 'health'
  | 'costs'
  | 'reports'
  | 'notifications';
```

---

## src/features/notifications/screens/NotificationsScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React from 'react';

import { ModulePlaceholderScreen } from '../../../shared/components/ModulePlaceholderScreen';

type NotificationsScreenProps = {
  onBack: () => void;
};

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  return (
    <ModulePlaceholderScreen
      title="Generacion de Notificaciones"
      description="Ventana base creada. Aqui ira el envio y control de notificaciones de eventos programados."
      emoji="­ƒöö"
      onBack={onBack}
    />
  );
}
```

---

## src/features/reports/screens/ReportsScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React from 'react';

import { ModulePlaceholderScreen } from '../../../shared/components/ModulePlaceholderScreen';

type ReportsScreenProps = {
  onBack: () => void;
};

export function ReportsScreen({ onBack }: ReportsScreenProps) {
  return (
    <ModulePlaceholderScreen
      title="Generacion de Reportes"
      description="Ventana base creada. Aqui iran los resumenes visuales y documentos exportables del sistema."
      emoji="­ƒôè"
      onBack={onBack}
    />
  );
}
```

---

## src/features/startup/screens/SplashScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React from 'react';
import { Image, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../../../shared/theme/identity';

export function SplashScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      <View style={styles.container}>
        <View style={styles.backgroundCircleTop} />
        <View style={styles.backgroundCircleBottom} />

        <Image
          source={require('../../../Logos/Logo_Blanco_Nombre.png')}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>AgroApp</Text>
        <Text style={styles.subtitle}>Gestion Ganadera Offline</Text>
        <Text style={styles.caption}>Cargando inicio...</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.primary,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  backgroundCircleTop: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: -90,
    right: -70,
  },
  backgroundCircleBottom: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    bottom: -110,
    left: -80,
  },
  logoBadge: {
    display: 'none',
  },
  logo: {
    width: 220,
    height: 120,
    marginBottom: 16,
  },
  logoText: {
    fontSize: 52,
    fontWeight: '800',
    color: COLORS.primary,
  },
  title: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    letterSpacing: 0.4,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.white,
  },
  caption: {
    marginTop: 28,
    fontSize: 12,
    fontFamily: FONTS.light,
    color: COLORS.white,
  },
});
```

---

## src/hooks/useCalendarioSanitario.ts

**Estado:** Eliminado

---

## src/hooks/useEventoSanitario.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import { useCallback, useState } from 'react';

import {
  obtenerEventosSanitarios,
  registrarEventoSanitario,
} from '../native/BridgeModule';
import type {
  EventoSanitarioModel,
  InsertEventoPayload,
  InsertEventoResult,
} from '../types/Sanitario';

type UseEventoSanitarioResult = {
  loading: boolean;
  error: string | null;
  eventos: EventoSanitarioModel[];
  registrar: (payload: InsertEventoPayload) => Promise<InsertEventoResult>;
  listar: (animalId: number) => Promise<EventoSanitarioModel[]>;
};

export function useEventoSanitario(): UseEventoSanitarioResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [eventos, setEventos] = useState<EventoSanitarioModel[]>([]);

  const registrar = useCallback(async (payload: InsertEventoPayload) => {
    setLoading(true);
    setError(null);

    try {
      const result = await registrarEventoSanitario(payload);
      return result;
    } catch (registrationError) {
      const message =
        registrationError instanceof Error
          ? registrationError.message
          : 'No se pudo registrar el evento sanitario.';
      setError(message);
      throw registrationError;
    } finally {
      setLoading(false);
    }
  }, []);

  const listar = useCallback(async (animalId: number) => {
    setLoading(true);
    setError(null);

    try {
      const rows = await obtenerEventosSanitarios(animalId);
      setEventos(rows);
      return rows;
    } catch (listError) {
      const message =
        listError instanceof Error ? listError.message : 'No se pudieron obtener los eventos.';
      setError(message);
      throw listError;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    eventos,
    registrar,
    listar,
  };
}
```

---

## src/hooks/useHistorialClinico.ts

**Estado:** Eliminado

---

## src/hooks/useSearch.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/Logos/Logo_Blanco_Nombre.png

**Estado:** Modificado

*(Archivo binario - no incluido)*

---

## src/Logos/Logo_Blanco_Solo.png

**Estado:** Modificado

*(Archivo binario - no incluido)*

---

## src/Logos/Logo_Verde_Nombre.png

**Estado:** Modificado

*(Archivo binario - no incluido)*

---

## src/Logos/Logo_Verde_Solo.png

**Estado:** Modificado

*(Archivo binario - no incluido)*

---

## src/Logos/Nombre_Blanco.png

**Estado:** Modificado

*(Archivo binario - no incluido)*

---

## src/Logos/Nombre_Verde.png

**Estado:** Modificado

*(Archivo binario - no incluido)*

---

## src/native/AnimalModule.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/native/AuthModule.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/native/BridgeModule.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import { NativeModules } from 'react-native';

import type { EventoSanitarioModel, InsertEventoPayload, InsertEventoResult } from '../types/Sanitario';

type BridgeInfo = {
  module: string;
  language: string;
  ready: boolean;
  pattern: string;
};

type AgroBridgeNativeModule = {
  testConnection(nombre: string): Promise<string>;
  getBridgeInfo(): Promise<BridgeInfo>;
  registrarEventoSanitario(datos: InsertEventoPayload): Promise<InsertEventoResult>;
  obtenerEventosSanitarios(animalId: number): Promise<EventoSanitarioModel[]>;
};

// Obtenemos el modulo, pero no lanzamos error aqui en tiempo de carga.
// El error se lanzara solo cuando se intente usar la funcion.
const { AgroBridgeModule } = NativeModules;

const getBridge = (): AgroBridgeNativeModule => {
  if (!AgroBridgeModule) {
    throw new Error(
      'AgroBridgeModule no esta disponible. Revisa el registro en AgroAppPackage/MainApplication.',
    );
  }
  return AgroBridgeModule as AgroBridgeNativeModule;
};

// Metodo simple para comprobar una llamada JS -> Java y su respuesta Java -> JS.
export const probarBridge = (nombre: string): Promise<string> => {
  const bridge = getBridge();
  return bridge.testConnection(nombre);
};

// Metodo opcional para validar que el modulo expone metadata esperada.
export const obtenerInfoBridge = (): Promise<BridgeInfo> => {
  const bridge = getBridge();
  return bridge.getBridgeInfo();
};

export const registrarEventoSanitario = (
  datos: InsertEventoPayload,
): Promise<InsertEventoResult> => {
  return getBridge().registrarEventoSanitario(datos);
};

export const obtenerEventosSanitarios = (animalId: number): Promise<EventoSanitarioModel[]> => {
  return getBridge().obtenerEventosSanitarios(animalId);
};
```

---

## src/native/cameraPicker.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/navigation/AnimalesNavigator.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/navigation/AppNavigator.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, StyleSheet, View } from 'react-native';

import { AnimalsScreen } from '../features/animals/screens/AnimalsScreen';
import { CostsScreen } from '../features/costs/screens/CostsScreen';
import { HealthScreen } from '../features/health/screens/HealthScreen';
import { HomeModuleRoute } from '../features/home/types/homeNavigation';
import { HomeScreen } from '../features/home/screens/HomeScreen';
import { NotificationsScreen } from '../features/notifications/screens/NotificationsScreen';
import { ReportsScreen } from '../features/reports/screens/ReportsScreen';
import { SplashScreen } from '../features/startup/screens/SplashScreen';
import {
  clearSession,
  markAppBackgrounded,
  markSessionAuthenticated,
  resolveStartupSession,
  SESSION_TIMEOUT_MS,
  validateSessionOnForeground,
} from '../shared/services/sessionManager';
import AuthFlow from '../screens/auth/AuthFlow';

type AppRoute = 'startup' | 'auth' | 'home' | HomeModuleRoute;

export default function AppNavigator() {
  const [route, setRoute] = useState<AppRoute>('startup');
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const protectedRoute = route !== 'startup' && route !== 'auth';

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current != null) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const expireSession = useCallback(() => {
    clearInactivityTimer();
    clearSession('timeout')
      .catch(() => {
        // Si falla escritura local, forzamos lock de UI de todas maneras.
      })
      .finally(() => setRoute('auth'));
  }, [clearInactivityTimer]);

  const startInactivityTimer = useCallback(() => {
    if (!protectedRoute) {
      clearInactivityTimer();
      return;
    }

    clearInactivityTimer();
    inactivityTimerRef.current = setTimeout(() => {
      expireSession();
    }, SESSION_TIMEOUT_MS);
  }, [clearInactivityTimer, expireSession, protectedRoute]);

  const registerActivity = useCallback(() => {
    startInactivityTimer();
  }, [startInactivityTimer]);

  useEffect(() => {
    let mounted = true;

    // Primero mostramos splash de arranque y luego resolvemos sesion.
    const timer = setTimeout(() => {
      resolveStartupSession()
        .then(hasSession => {
          if (!mounted) {
            return;
          }

          if (hasSession) {
            setRoute('home');
            return;
          }
          setRoute('auth');
        })
        .catch(() => {
          if (mounted) {
            setRoute('auth');
          }
        });
    }, 1800);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (protectedRoute) {
      startInactivityTimer();
      return;
    }

    clearInactivityTimer();
  }, [clearInactivityTimer, protectedRoute, startInactivityTimer]);

  useEffect(() => {
    return () => {
      clearInactivityTimer();
    };
  }, [clearInactivityTimer]);

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'inactive' || nextState === 'background') {
        clearInactivityTimer();
        markAppBackgrounded().catch(() => {
          // No bloqueamos UX por fallas de almacenamiento local.
        });
        return;
      }

      if (nextState === 'active') {
        validateSessionOnForeground()
          .then(isSessionActive => {
            if (!isSessionActive) {
              setRoute('auth');
              return;
            }

            startInactivityTimer();
          })
          .catch(() => {
            setRoute('auth');
          });
      }
    };

    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [clearInactivityTimer, startInactivityTimer]);

  const wrapProtectedScreen = (screen: React.ReactNode) => {
    if (!protectedRoute) {
      return screen;
    }

    return (
      <View
        style={styles.protectedContainer}
        onStartShouldSetResponderCapture={() => {
          registerActivity();
          return false;
        }}
        onMoveShouldSetResponderCapture={() => {
          registerActivity();
          return false;
        }}
      >
        {screen}
      </View>
    );
  };

  if (route === 'startup') {
    return <SplashScreen />;
  }

  if (route === 'auth') {
    return (
      <AuthFlow
        onAuthenticated={async () => {
          await markSessionAuthenticated();
          setRoute('home');
        }}
      />
    );
  }

  if (route === 'animals') {
    return wrapProtectedScreen(<AnimalsScreen onBack={() => setRoute('home')} />);
  }

  if (route === 'health') {
    return wrapProtectedScreen(<HealthScreen onBack={() => setRoute('home')} />);
  }

  if (route === 'costs') {
    return wrapProtectedScreen(<CostsScreen onBack={() => setRoute('home')} />);
  }

  if (route === 'reports') {
    return wrapProtectedScreen(<ReportsScreen onBack={() => setRoute('home')} />);
  }

  if (route === 'notifications') {
    return wrapProtectedScreen(<NotificationsScreen onBack={() => setRoute('home')} />);
  }

  return wrapProtectedScreen(<HomeScreen onOpenModule={target => setRoute(target)} />);
}

const styles = StyleSheet.create({
  protectedContainer: {
    flex: 1,
  },
});
```

---

## src/navigation/CostsNavigator.tsx

**Estado:** Eliminado

---

## src/screens/animales/DetalleAnimalScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
import { RegistrarEventoSanitario } from '../sanitarios/RegistrarEventoSanitario';

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
  const [showRegistrarEvento, setShowRegistrarEvento] = useState(false);


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
          onPress={() => setShowRegistrarEvento(true)}
        >
          <Text style={styles.primaryButtonText}>Registrar Nuevo Evento</Text>
        </Pressable>
      </View>

      <Modal
        visible={showRegistrarEvento}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setShowRegistrarEvento(false)}
      >
        <RegistrarEventoSanitario
          animalId={animalId}
          onBack={() => setShowRegistrarEvento(false)}
        />
      </Modal>

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
```

---

## src/screens/animales/EditarAnimalScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/screens/animales/ListadoAnimalesScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/screens/animales/RegistrarAnimalScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/screens/auth/AuthenticatedScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React from 'react';
import { Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';

import { AUTH_COLOR, authStyles } from './authStyles';

type AuthenticatedScreenProps = {
  onBackToLogin: () => void;
};

export function AuthenticatedScreen({ onBackToLogin }: AuthenticatedScreenProps) {
  return (
    <SafeAreaView style={authStyles.authenticatedSafeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={AUTH_COLOR.white} />
      <View style={authStyles.authenticatedContainer}>
        <Text style={authStyles.authenticatedTitle}>Sesion iniciada</Text>
        <Text style={authStyles.authenticatedBody}>
          Login local exitoso. Ya puedes conectar esta pantalla con el menu principal del APK.
        </Text>

        <Pressable style={[authStyles.primaryButton, authStyles.authenticatedButton]} onPress={onBackToLogin}>
          <Text style={authStyles.primaryButtonText}>Volver al Login</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
```

---

## src/screens/auth/AuthFlow.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React, { useEffect, useMemo, useState } from 'react';
import { Alert } from 'react-native';

import {
  actualizarPinPrincipal,
  iniciarSesionPrincipal,
  obtenerEstadoAuth,
  registrarUsuario,
} from '../../native/AuthModule';
import { consumeSessionLockReason, shouldShowAuthIntroOnEntry } from '../../shared/services/sessionManager';
import { LoadingScreen } from './LoadingScreen';
import { PIN_MAX, PIN_MIN } from './authStyles';
import { PinLoginScreen } from './PinLoginScreen';
import { SplashScreen } from './SplashScreen';

type ScreenMode = 'splash' | 'login' | 'setup';

type AuthFlowProps = {
  onAuthenticated?: () => void | Promise<void>;
};

export default function AuthFlow({ onAuthenticated }: AuthFlowProps) {
  const [mode, setMode] = useState<ScreenMode>('login');
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isFirstEntry, setIsFirstEntry] = useState(false);
  const [primaryUserName, setPrimaryUserName] = useState('Administrador');
  const [pin, setPin] = useState('');
  const [pendingSetupPin, setPendingSetupPin] = useState('');
  const [error, setError] = useState('');
  const [infoMessage, setInfoMessage] = useState('');

  useEffect(() => {
    // Carga del estado local de autenticacion para mantener flujo completamente offline.
    const loadAuthState = async () => {
      try {
        const [status, lockReason] = await Promise.all([
          obtenerEstadoAuth(),
          consumeSessionLockReason(),
        ]);
        if (status.primaryUserName) {
          setPrimaryUserName(status.primaryUserName);
        } else if (!status.hasUsers) {
          setPrimaryUserName('Propietario');
        }

        if (lockReason === 'timeout') {
          setInfoMessage('Sesion cerrada por inactividad. Ingrese su PIN para continuar.');
          setMode('login');
          return;
        }

        if (!status.hasUsers) {
          setRequiresSetup(true);
          const mustShowIntro = await shouldShowAuthIntroOnEntry();
          setInfoMessage('Defina su PIN principal para proteger la aplicacion.');
          setMode(mustShowIntro ? 'splash' : 'setup');
          return;
        }

        setRequiresSetup(false);

        const mustShowIntro = await shouldShowAuthIntroOnEntry();
        setIsFirstEntry(mustShowIntro);
        setMode(mustShowIntro ? 'splash' : 'login');
      } catch {
        // Si no se puede leer estado, mantenemos defaults para no bloquear la vista.
        setIsFirstEntry(false);
        setMode('login');
      } finally {
        setLoading(false);
      }
    };

    loadAuthState();
  }, []);

  const pinIndicators = useMemo(() => {
    return Array.from({ length: PIN_MIN }, (_, index) => index < pin.length);
  }, [pin]);

  const onPressDigit = (digit: string) => {
    setError('');
    setInfoMessage('');
    setPin(current => {
      if (current.length >= PIN_MAX) {
        return current;
      }
      return current + digit;
    });
  };

  const onPressDelete = () => {
    setError('');
    setInfoMessage('');
    setPin(current => current.slice(0, -1));
  };

  const onSubmitPin = async () => {
    if (pin.length < PIN_MIN) {
      setError('El PIN debe tener minimo 4 digitos.');
      return;
    }

    if (mode === 'setup') {
      if (!pendingSetupPin) {
        setPendingSetupPin(pin);
        setPin('');
        setError('');
        setInfoMessage('Confirme su nuevo PIN para finalizar.');
        return;
      }

      if (pendingSetupPin !== pin) {
        setPin('');
        setPendingSetupPin('');
        setError('Los PIN no coinciden. Intente nuevamente.');
        setInfoMessage('');
        return;
      }

      try {
        // Evita conflicto con el admin sembrado; el primer usuario real no debe reutilizar ese nombre.
        const normalizedPrimaryName = (primaryUserName ?? '').trim();
        const ownerName =
          normalizedPrimaryName && normalizedPrimaryName.toLowerCase() !== 'administrador'
            ? normalizedPrimaryName
            : 'Propietario';
        await registrarUsuario(ownerName, pin);
        const session = await iniciarSesionPrincipal(pin);
        setError('');
        setInfoMessage('');
        setPin('');
        setPendingSetupPin('');
        Alert.alert('PIN creado', `Bienvenido ${session.name}.`);
        await onAuthenticated?.();
      } catch (nativeError: any) {
        const message = nativeError?.message ?? 'No fue posible crear el PIN. Intente de nuevo.';
        setError(message);
        setPin('');
        setPendingSetupPin('');
      }
      return;
    }

    try {
      const session = await iniciarSesionPrincipal(pin);
      setError('');
      setInfoMessage('');
      setIsFirstEntry(false);
      setPin('');
      Alert.alert('Acceso permitido', `Bienvenido ${session.name}.`);
      await onAuthenticated?.();
    } catch (nativeError: any) {
      if (isFirstEntry) {
        try {
          const session = await actualizarPinPrincipal(pin);
          setError('');
          setInfoMessage('PIN creado y guardado correctamente.');
          setIsFirstEntry(false);
          setPin('');
          Alert.alert('PIN creado', `Bienvenido ${session.name}.`);
          await onAuthenticated?.();
          return;
        } catch (updateError: any) {
          const bootstrapMessage =
            updateError?.message ?? 'No se pudo crear el PIN inicial. Intente de nuevo.';
          setError(bootstrapMessage);
          setPin('');
          return;
        }
      }

      const message = nativeError?.message ?? 'PIN incorrecto. Intente de nuevo.';
      setError(message);
      setPin('');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (mode === 'splash') {
    return <SplashScreen onContinue={() => setMode(requiresSetup ? 'setup' : 'login')} />;
  }

  if (mode === 'login' || mode === 'setup') {
    const isSetupMode = mode === 'setup';
    return (
      <PinLoginScreen
        primaryUserName={primaryUserName}
        subtitle={isSetupMode ? 'Cree su PIN principal' : 'Ingrese su PIN'}
        submitLabel={isSetupMode ? 'Guardar PIN' : 'Ingresar'}
        pinIndicators={pinIndicators}
        error={error}
        infoMessage={infoMessage}
        onPressDigit={onPressDigit}
        onPressDelete={onPressDelete}
        onSubmitPin={onSubmitPin}
      />
    );
  }

  return <LoadingScreen />;
}
```

---

## src/screens/auth/authStyles.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import { StyleSheet } from 'react-native';
import { COLORS, FONTS } from '../../shared/theme/identity';

export const AUTH_COLOR = {
  primary: COLORS.primary,
  white: COLORS.white,
  textOnLight: COLORS.black,
  secondaryText: COLORS.gray,
  error: COLORS.error,
  keyOverlay: 'rgba(255, 255, 255, 0.18)',
  keyBorder: 'rgba(255, 255, 255, 0.85)',
};

export const PIN_MIN = 4;
export const PIN_MAX = 6;

export const PIN_KEY_ROWS: string[][] = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['0', 'BORRAR'],
];

export const authStyles = StyleSheet.create({
  loaderSafeArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: AUTH_COLOR.white,
  },
  loaderText: {
    color: AUTH_COLOR.textOnLight,
    fontSize: 14,
    fontWeight: '500',
  },
  splashSafeArea: {
    flex: 1,
    backgroundColor: AUTH_COLOR.primary,
  },
  splashContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  logoBadgeLight: {
    width: 92,
    height: 92,
    borderRadius: 46,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AUTH_COLOR.primary,
    marginBottom: 12,
  },
  splashLogoFull: {
    width: 210,
    height: 106,
    marginBottom: 14,
  },
  logoBadgeDark: {
    width: 82,
    height: 82,
    borderRadius: 41,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: AUTH_COLOR.white,
    marginBottom: 10,
  },
  logoBadgeText: {
    fontSize: 42,
    fontWeight: '700',
    color: AUTH_COLOR.white,
  },
  logoBadgeTextDark: {
    color: AUTH_COLOR.primary,
  },
  splashTitle: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: AUTH_COLOR.white,
  },
  splashSubtitle: {
    marginTop: 2,
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: AUTH_COLOR.white,
    textAlign: 'center',
  },
  splashBody: {
    marginTop: 20,
    maxWidth: 290,
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 22,
    color: AUTH_COLOR.white,
    fontFamily: FONTS.semiBold,
  },
  progressRow: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 10,
  },
  progressDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#d7d7d7',
  },
  progressDotActive: {
    backgroundColor: AUTH_COLOR.primary,
  },
  primaryButton: {
    marginTop: 26,
    minWidth: 210,
    borderRadius: 14,
    backgroundColor: AUTH_COLOR.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: AUTH_COLOR.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  footerTextLight: {
    position: 'absolute',
    bottom: 24,
    fontSize: 12,
    fontFamily: FONTS.light,
    color: '#d8ead9',
  },
  loginSafeArea: {
    flex: 1,
    backgroundColor: AUTH_COLOR.primary,
  },
  loginContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 22,
  },
  loginLogoIcon: {
    width: 74,
    height: 74,
  },
  loginLogoText: {
    width: 176,
    height: 52,
    marginTop: 4,
  },
  loginTitle: {
    marginTop: 6,
    fontSize: 40,
    fontWeight: '800',
    color: AUTH_COLOR.white,
  },
  loginSubtitle: {
    marginTop: 2,
    fontSize: 18,
    fontFamily: FONTS.semiBold,
    color: '#e7f6eb',
  },
  loginUserLabel: {
    marginTop: 4,
    fontSize: 13,
    fontFamily: FONTS.regular,
    color: '#d7eddc',
  },
  indicatorRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 10,
  },
  indicatorDot: {
    width: 13,
    height: 13,
    borderRadius: 6.5,
    borderWidth: 1,
    borderColor: AUTH_COLOR.white,
    backgroundColor: 'transparent',
  },
  indicatorDotFilled: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  errorPill: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: '#f9e7e7',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  errorText: {
    color: AUTH_COLOR.error,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  infoPill: {
    marginTop: 16,
    borderRadius: 999,
    backgroundColor: '#e8f2ff',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  infoText: {
    color: '#1b4b9a',
    fontSize: 13,
    fontFamily: FONTS.semiBold,
  },
  keypad: {
    marginTop: 20,
    width: '100%',
    maxWidth: 320,
    gap: 10,
  },
  keyRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  keyButton: {
    width: 95,
    height: 60,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: AUTH_COLOR.keyBorder,
    backgroundColor: AUTH_COLOR.keyOverlay,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyButtonZero: {
    marginRight: 0,
  },
  keyText: {
    color: AUTH_COLOR.white,
    fontSize: 34,
    fontWeight: '700',
    lineHeight: 38,
  },
  deleteKeyText: {
    fontSize: 24,
  },
  submitButton: {
    marginTop: 20,
    minWidth: 240,
    borderRadius: 14,
    backgroundColor: AUTH_COLOR.white,
    paddingVertical: 14,
    alignItems: 'center',
  },
  submitButtonText: {
    color: AUTH_COLOR.primary,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  footerTextDark: {
    position: 'absolute',
    bottom: 20,
    fontSize: 12,
    fontFamily: FONTS.light,
    color: '#d8ead9',
    textDecorationLine: 'underline',
  },
  authenticatedSafeArea: {
    flex: 1,
    backgroundColor: AUTH_COLOR.white,
  },
  authenticatedContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  authenticatedTitle: {
    fontSize: 30,
    fontWeight: '800',
    color: AUTH_COLOR.primary,
  },
  authenticatedBody: {
    marginTop: 12,
    fontSize: 16,
    lineHeight: 24,
    color: AUTH_COLOR.textOnLight,
    textAlign: 'center',
  },
  authenticatedButton: {
    marginTop: 18,
  },
});
```

---

## src/screens/auth/LoadingScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React from 'react';
import { ActivityIndicator, SafeAreaView, Text } from 'react-native';

import { AUTH_COLOR, authStyles } from './authStyles';

export function LoadingScreen() {
  return (
    <SafeAreaView style={authStyles.loaderSafeArea}>
      <ActivityIndicator size="large" color={AUTH_COLOR.primary} />
      <Text style={authStyles.loaderText}>Cargando autenticacion local...</Text>
    </SafeAreaView>
  );
}
```

---

## src/screens/auth/PinLoginScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React from 'react';
import { Image, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';

import { AUTH_COLOR, authStyles, PIN_KEY_ROWS } from './authStyles';

type PinLoginScreenProps = {
  primaryUserName: string;
  subtitle?: string;
  submitLabel?: string;
  pinIndicators: boolean[];
  error: string;
  infoMessage?: string;
  onPressDigit: (digit: string) => void;
  onPressDelete: () => void;
  onSubmitPin: () => void;
};

export function PinLoginScreen({
  primaryUserName,
  subtitle = 'Ingrese su PIN',
  submitLabel = 'Ingresar',
  pinIndicators,
  error,
  infoMessage,
  onPressDigit,
  onPressDelete,
  onSubmitPin,
}: PinLoginScreenProps) {
  return (
    <SafeAreaView style={authStyles.loginSafeArea}>
      <StatusBar barStyle="light-content" backgroundColor={AUTH_COLOR.primary} />
      <View style={authStyles.loginContainer}>
        <Image
          source={require('../../Logos/Logo_Blanco_Solo.png')}
          style={authStyles.loginLogoIcon}
          resizeMode="contain"
        />
        <Image
          source={require('../../Logos/Nombre_Blanco.png')}
          style={authStyles.loginLogoText}
          resizeMode="contain"
        />

        <Text style={authStyles.loginSubtitle}>{subtitle}</Text>
        <Text style={authStyles.loginUserLabel}>{primaryUserName}</Text>

        <View style={authStyles.indicatorRow}>
          {pinIndicators.map((filled, index) => (
            <View key={index} style={[authStyles.indicatorDot, filled && authStyles.indicatorDotFilled]} />
          ))}
        </View>

        {error ? (
          <View style={authStyles.errorPill}>
            <Text style={authStyles.errorText}>{error}</Text>
          </View>
        ) : null}

        {!error && infoMessage ? (
          <View style={authStyles.infoPill}>
            <Text style={authStyles.infoText}>{infoMessage}</Text>
          </View>
        ) : null}

        <View style={authStyles.keypad}>
          {PIN_KEY_ROWS.map((row, rowIndex) => (
            <View key={rowIndex} style={authStyles.keyRow}>
              {row.map(key => {
                const isDelete = key === 'BORRAR';
                const isSingleZero = key === '0';
                return (
                  <Pressable
                    key={key}
                    style={[authStyles.keyButton, isSingleZero && authStyles.keyButtonZero]}
                    onPress={() => (isDelete ? onPressDelete() : onPressDigit(key))}
                  >
                    <Text style={[authStyles.keyText, isDelete && authStyles.deleteKeyText]}>
                      {isDelete ? '<' : key}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          ))}
        </View>

        <Pressable style={authStyles.submitButton} onPress={onSubmitPin}>
          <Text style={authStyles.submitButtonText}>{submitLabel}</Text>
        </Pressable>

        <Text style={authStyles.footerTextDark}>Olvido su PIN? Contacte al administrador</Text>
      </View>
    </SafeAreaView>
  );
}
```

---

## src/screens/auth/SplashScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React from 'react';
import { Image, Pressable, SafeAreaView, StatusBar, Text, View } from 'react-native';

import { AUTH_COLOR, authStyles } from './authStyles';

type SplashScreenProps = {
  onContinue: () => void;
};

export function SplashScreen({ onContinue }: SplashScreenProps) {
  return (
    <SafeAreaView style={authStyles.splashSafeArea}>
      <StatusBar barStyle="light-content" backgroundColor={AUTH_COLOR.primary} />
      <View style={authStyles.splashContainer}>
        <Image
          source={require('../../Logos/Logo_Blanco_Nombre.png')}
          style={authStyles.splashLogoFull}
          resizeMode="contain"
        />

        <Text style={authStyles.splashTitle}>AgroApp</Text>
        <Text style={authStyles.splashSubtitle}>Gestion Ganadera Offline</Text>
        <Text style={authStyles.splashBody}>Cree su PIN de seguridad de 4 digitos</Text>

        <View style={authStyles.progressRow}>
          {[0, 1, 2, 3].map(step => (
            <View key={step} style={[authStyles.progressDot, step === 0 && authStyles.progressDotActive]} />
          ))}
        </View>

        <Pressable onPress={onContinue} style={authStyles.primaryButton}>
          <Text style={authStyles.primaryButtonText}>Continuar</Text>
        </Pressable>

        <Text style={authStyles.footerTextLight}>Sus datos nunca salen del dispositivo</Text>
      </View>
    </SafeAreaView>
  );
}
```

---

## src/screens/nutricion/RecomendacionesNutricionales.tsx

**Estado:** Eliminado

---

## src/screens/sanitarios/CalendarioSanitario.tsx

**Estado:** Eliminado

---

## src/screens/sanitarios/RegistrarEventoSanitario.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Switch,
} from 'react-native';

import { useEventoSanitario } from '../../hooks/useEventoSanitario';
import { COLORS, FONTS } from '../../shared/theme/identity';
import { TipoEvento } from '../../types/Sanitario';

const TIPOS_EVENTO = Object.values(TipoEvento);
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

type RegistrarEventoSanitarioProps = {
  onBack: () => void;
  animalId?: number;
};

type FormState = {
  animalIdInput: string;
  tipoEvento: TipoEvento;
  descripcion: string;
  veterinario: string;
  dosis: string;
  observaciones: string;
  fechaEvento: string;
  fechaProximoEvento: string;
};

const INITIAL_FORM: FormState = {
  animalIdInput: '',
  tipoEvento: TipoEvento.VACUNA,
  descripcion: '',
  veterinario: '',
  dosis: '',
  observaciones: '',
  fechaEvento: '',
  fechaProximoEvento: '',
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (value: string) => new Date(`${value}T00:00:00`);

const normalizeToday = (date: Date) => {
  const candidate = new Date(date);
  candidate.setHours(0, 0, 0, 0);
  return candidate;
};

const validateInline = (form: FormState, animalIdResolved: number | null) => {
  const errors: Partial<Record<keyof FormState | 'general', string>> = {};

  if (!animalIdResolved || animalIdResolved <= 0) {
    errors.animalIdInput = 'Ingresa un arete valido.';
  }

  if (!TIPOS_EVENTO.includes(form.tipoEvento)) {
    errors.tipoEvento = 'Selecciona un tipo valido.';
  }

  if (!form.descripcion.trim()) {
    errors.descripcion = 'La descripcion es obligatoria.';
  }

  if (!form.fechaEvento) {
    errors.fechaEvento = 'Selecciona la fecha del evento.';
  }

  if (!form.fechaProximoEvento) {
    errors.fechaProximoEvento = 'Selecciona la proxima fecha.';
  }

  if (form.fechaEvento && form.fechaProximoEvento) {
    const fechaEvento = parseDate(form.fechaEvento);
    const fechaProximo = parseDate(form.fechaProximoEvento);
    const today = normalizeToday(new Date());

    if (fechaEvento.getTime() > today.getTime()) {
      errors.fechaEvento = 'La fecha no puede ser futura.';
    }

    if (fechaProximo.getTime() < fechaEvento.getTime()) {
      errors.fechaProximoEvento = 'La fecha proxima debe ser mayor o igual a la inicial.';
    }
  }

  return errors;
};

export function RegistrarEventoSanitario({ onBack, animalId }: RegistrarEventoSanitarioProps) {
  const [form, setForm] = useState<FormState>(() => ({
    ...INITIAL_FORM,
    animalIdInput: animalId ? String(animalId) : '',
  }));
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof FormState | 'general', string>>>({});
  const [calendarTarget, setCalendarTarget] = useState<'fechaEvento' | 'fechaProximoEvento' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [listVisible, setListVisible] = useState(false);

  const { loading, error, eventos, registrar, listar } = useEventoSanitario();

  const animalIdResolved = useMemo(() => {
    const raw = animalId ?? Number.parseInt(form.animalIdInput, 10);
    return Number.isFinite(raw) && raw > 0 ? raw : null;
  }, [animalId, form.animalIdInput]);

  useEffect(() => {
    if (!animalIdResolved) {
      return;
    }

    void listar(animalIdResolved).then(() => {
      setListVisible(true);
    }).catch(() => {
      setListVisible(false);
    });
  }, [animalIdResolved, listar]);

  const setField = (key: keyof FormState, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const openCalendar = (target: 'fechaEvento' | 'fechaProximoEvento') => {
    const currentValue = form[target];
    setCalendarMonth(currentValue ? parseDate(currentValue) : new Date());
    setCalendarTarget(target);
  };

  const closeCalendar = () => setCalendarTarget(null);

  const getMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = [];

    for (let index = 0; index < firstDay; index += 1) {
      cells.push(null);
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push(new Date(year, month, day));
    }

    return cells;
  };

  const isFutureDate = (date: Date) => {
    const today = normalizeToday(new Date());
    return normalizeToday(date).getTime() > today.getTime();
  };

  const canGoNextMonth = () => {
    if (calendarTarget === 'fechaProximoEvento') {
      return true;
    }

    const now = new Date();
    return (
      calendarMonth.getFullYear() < now.getFullYear() ||
      (calendarMonth.getFullYear() === now.getFullYear() && calendarMonth.getMonth() < now.getMonth())
    );
  };

  const selectDate = (date: Date) => {
    if (!calendarTarget) {
      return;
    }

    if (calendarTarget === 'fechaEvento' && isFutureDate(date)) {
      Alert.alert('Fecha invalida', 'La fecha del evento no puede ser futura.');
      return;
    }

    setField(calendarTarget, formatDate(date));
    setCalendarTarget(null);
  };

  const onSubmit = async () => {
    const errors = validateInline(form, animalIdResolved);
    setFieldErrors(errors);

    if (Object.keys(errors).length > 0 || !animalIdResolved) {
      return;
    }

    try {
      await registrar({
        animalId: animalIdResolved,
        tipoEvento: form.tipoEvento,
        descripcion: form.descripcion.trim(),
        veterinario: form.veterinario.trim(),
        dosis: form.dosis.trim(),
        observaciones: form.observaciones.trim(),
        fechaEvento: form.fechaEvento,
        fechaProximoEvento: form.fechaProximoEvento,
      });

      Alert.alert('Guardado', 'El evento sanitario fue registrado correctamente.');
      setForm(prev => ({
        ...INITIAL_FORM,
        animalIdInput: animalId ? String(animalId) : prev.animalIdInput,
      }));

      if (animalIdResolved) {
        await listar(animalIdResolved);
        setListVisible(true);
      }
    } catch {
      // El estado del hook ya refleja el error.
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>Volver</Text>
        </Pressable>
        <Text style={styles.title}>Registrar Evento Sanitario</Text>
        <Text style={styles.subtitle}>Vacunas, desparasitaciones y seguimiento cl├¡nico.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!animalId ? (
          <View style={styles.card}>
            <Text style={styles.label}>Arete</Text>
            <TextInput
              value={form.animalIdInput}
              onChangeText={value => setField('animalIdInput', value.replace(/\s/g, ''))}
              placeholder="Ingresa el arete"
              keyboardType="default"
              onFocus={() => setFocusedField('animalIdInput')}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                fieldErrors.animalIdInput ? styles.inputError : undefined,
                focusedField === 'animalIdInput' && styles.inputFocused,
              ]}
            />
            {fieldErrors.animalIdInput ? <Text style={styles.errorText}>{fieldErrors.animalIdInput}</Text> : null}
          </View>
        ) : null}

        <View style={styles.card}>
          <Text style={styles.label}>Tipo de evento</Text>
          <View style={styles.chipsRow}>
            {TIPOS_EVENTO.map(tipo => {
              const selected = form.tipoEvento === tipo;
              return (
                <Pressable
                  key={tipo}
                  onPress={() => setField('tipoEvento', tipo)}
                  style={[styles.chip, selected && styles.chipSelected]}
                >
                  <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{tipo}</Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Descripcion *</Text>
          <TextInput
            value={form.descripcion}
            onChangeText={value => setField('descripcion', value)}
            placeholder="Descripcion del evento"
            onFocus={() => setFocusedField('descripcion')}
            onBlur={() => setFocusedField(null)}
            style={[
              styles.input,
              fieldErrors.descripcion ? styles.inputError : undefined,
              focusedField === 'descripcion' && styles.inputFocused,
            ]}
            multiline
          />
          {fieldErrors.descripcion ? <Text style={styles.errorText}>{fieldErrors.descripcion}</Text> : null}

          <Text style={styles.label}>Veterinario</Text>
          <TextInput
            value={form.veterinario}
            onChangeText={value => setField('veterinario', value)}
            placeholder="Nombre del veterinario"
            onFocus={() => setFocusedField('veterinario')}
            onBlur={() => setFocusedField(null)}
            style={[styles.input, focusedField === 'veterinario' && styles.inputFocused]}
          />

          <Text style={styles.label}>Dosis</Text>
          <TextInput
            value={form.dosis}
            onChangeText={value => setField('dosis', value)}
            placeholder="Ej. 5 ml"
            onFocus={() => setFocusedField('dosis')}
            onBlur={() => setFocusedField(null)}
            style={[styles.input, focusedField === 'dosis' && styles.inputFocused]}
          />

          <Text style={styles.label}>Observaciones</Text>
          <TextInput
            value={form.observaciones}
            onChangeText={value => setField('observaciones', value)}
            placeholder="Notas adicionales"
            onFocus={() => setFocusedField('observaciones')}
            onBlur={() => setFocusedField(null)}
            style={[styles.input, focusedField === 'observaciones' && styles.inputFocused]}
            multiline
          />
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Fecha del evento</Text>
          <Pressable
            style={[
              styles.dateField,
              fieldErrors.fechaEvento ? styles.inputError : undefined,
              calendarTarget === 'fechaEvento' && styles.inputFocused,
            ]}
            onPress={() => openCalendar('fechaEvento')}
          >
            <Text style={[styles.dateText, !form.fechaEvento && styles.datePlaceholder]}>
              {form.fechaEvento || 'Seleccionar fecha'}
            </Text>
            <Text style={styles.dateIcon}>­ƒôà</Text>
          </Pressable>
          {fieldErrors.fechaEvento ? <Text style={styles.errorText}>{fieldErrors.fechaEvento}</Text> : null}

          <Text style={styles.label}>Fecha proxima</Text>
          <Pressable
            style={[
              styles.dateField,
              fieldErrors.fechaProximoEvento ? styles.inputError : undefined,
              calendarTarget === 'fechaProximoEvento' && styles.inputFocused,
            ]}
            onPress={() => openCalendar('fechaProximoEvento')}
          >
            <Text style={[styles.dateText, !form.fechaProximoEvento && styles.datePlaceholder]}>
              {form.fechaProximoEvento || 'Seleccionar fecha'}
            </Text>
            <Text style={styles.dateIcon}>­ƒôà</Text>
          </Pressable>
          {fieldErrors.fechaProximoEvento ? (
            <Text style={styles.errorText}>{fieldErrors.fechaProximoEvento}</Text>
          ) : null}
        </View>

        <View style={styles.reminderCard}>
          <View style={styles.reminderTextWrap}>
            <Text style={styles.reminderLabel}>Programar Recordatorio</Text>
            <Text style={styles.reminderHint}>(Al d├¡a de la pr├│xima dosis)</Text>
          </View>
          <View style={styles.reminderToggleWrap}>
            <Switch
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              trackColor={{ true: COLORS.primary, false: '#d0d0d0' }}
              thumbColor="#ffffff"
            />
          </View>
        </View>

        {error || fieldErrors.general ? (
          <Text style={styles.errorBanner}>{error ?? fieldErrors.general}</Text>
        ) : null}

        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={({ pressed }) => [styles.saveButton, (pressed || loading) && styles.saveButtonPressed]}
        >
          <Text style={styles.saveButtonText}>{loading ? 'Guardando...' : 'Guardar Evento Sanitario'}</Text>
        </Pressable>

        {listVisible && animalIdResolved ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Eventos registrados</Text>
            {eventos.length === 0 ? (
              <Text style={styles.emptyText}>Aun no hay eventos para este animal.</Text>
            ) : (
              eventos.map(evento => (
                <View key={String(evento.id)} style={styles.eventItem}>
                  <Text style={styles.eventTitle}>{evento.tipoEvento}</Text>
                  <Text style={styles.eventBody}>{evento.descripcion || 'Sin descripcion'}</Text>
                  <Text style={styles.eventMeta}>{evento.fechaEvento}</Text>
                </View>
              ))
            )}
          </View>
        ) : null}
      </ScrollView>

      <Modal visible={calendarTarget != null} transparent animationType="fade" onRequestClose={closeCalendar}>
        <View style={styles.modalBackdrop}>
          <View style={styles.calendarCard}>
            <View style={styles.calendarHeader}>
              <Pressable
                onPress={() => setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                style={styles.calendarNavButton}
              >
                <Text style={styles.calendarNavText}>ÔÇ╣</Text>
              </Pressable>
              <Text style={styles.calendarTitleText}>
                {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>
              <Pressable
                onPress={() => {
                  if (canGoNextMonth()) {
                    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                  }
                }}
                style={[styles.calendarNavButton, !canGoNextMonth() && styles.calendarNavButtonDisabled]}
              >
                <Text style={[styles.calendarNavText, !canGoNextMonth() && styles.calendarNavTextDisabled]}>ÔÇ║</Text>
              </Pressable>
            </View>

            <View style={styles.weekRow}>
              {WEEKDAY_LABELS.map(day => (
                <Text key={day} style={styles.weekDay}>
                  {day}
                </Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getMonthDays(calendarMonth).map((day, index) => {
                if (!day) {
                  return <View key={`empty-${index}`} style={styles.dayCell} />;
                }

                const disableDay = calendarTarget === 'fechaEvento' && isFutureDate(day);

                return (
                  <Pressable
                    key={day.toISOString()}
                    style={[styles.dayCell, disableDay && styles.dayCellDisabled]}
                    disabled={disableDay}
                    onPress={() => selectDate(day)}
                  >
                    <Text style={styles.dayCellText}>{day.getDate()}</Text>
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
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
  },
  backText: {
    color: COLORS.white,
    fontFamily: FONTS.semiBold,
  },
  title: {
    marginTop: 14,
    color: COLORS.white,
    fontSize: 22,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    marginTop: 4,
    color: '#d9eadc',
    fontFamily: FONTS.regular,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
    gap: 14,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000000',
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  label: {
    marginBottom: 6,
    color: COLORS.black,
    fontFamily: FONTS.semiBold,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d9e1d8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: COLORS.black,
    fontFamily: FONTS.regular,
    marginBottom: 12,
    backgroundColor: '#fbfcfa',
  },
  inputError: {
    borderColor: '#c84141',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#c8d5c7',
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#f6f8f3',
  },
  chipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  chipText: {
    color: COLORS.black,
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  chipTextSelected: {
    color: COLORS.white,
  },
  dateField: {
    borderWidth: 1,
    borderColor: '#d9e1d8',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fbfcfa',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  dateText: {
    color: COLORS.black,
    fontFamily: FONTS.regular,
  },
  datePlaceholder: {
    color: '#8b9889',
  },
  dateIcon: {
    fontSize: 18,
  },
  errorText: {
    color: '#c84141',
    fontFamily: FONTS.semiBold,
    fontSize: 12,
    marginBottom: 10,
  },
  errorBanner: {
    color: '#9d2f2f',
    backgroundColor: '#fdeeee',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    fontFamily: FONTS.semiBold,
  },
  saveButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  saveButtonPressed: {
    opacity: 0.85,
  },
  saveButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  sectionTitle: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: 10,
  },
  emptyText: {
    color: '#667066',
    fontFamily: FONTS.regular,
  },
  eventItem: {
    borderRadius: 14,
    padding: 12,
    backgroundColor: '#f5f9f3',
    marginBottom: 10,
  },
  eventTitle: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  eventBody: {
    marginTop: 3,
    color: COLORS.black,
    fontFamily: FONTS.regular,
  },
  eventMeta: {
    marginTop: 4,
    color: '#6c7869',
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 18,
  },
  calendarCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  calendarNavButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf2e9',
  },
  calendarNavButtonDisabled: {
    opacity: 0.35,
  },
  calendarNavText: {
    color: COLORS.primary,
    fontSize: 22,
    fontFamily: FONTS.bold,
  },
  calendarNavTextDisabled: {
    color: '#8a9387',
  },
  calendarTitleText: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    color: '#788277',
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 2,
    borderRadius: 12,
  },
  dayCellDisabled: {
    opacity: 0.25,
  },
  dayCellText: {
    color: COLORS.black,
    fontFamily: FONTS.semiBold,
  },
  calendarCloseButton: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  calendarCloseText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.06,
  },
  reminderCard: {
    marginTop: 6,
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 2,
    borderColor: '#e6efe6',
  },
  reminderTextWrap: {
    flex: 1,
  },
  reminderLabel: {
    color: COLORS.black,
    fontFamily: FONTS.semiBold,
  },
  reminderHint: {
    color: '#7a8b7a',
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  reminderToggleWrap: {
    marginLeft: 12,
  },
  saveButtonFull: {
    marginTop: 18,
    paddingVertical: 16,
    borderRadius: 999,
  },
});
```

---

## src/shared/components/ModulePlaceholderScreen.tsx

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import React from 'react';
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { COLORS, FONTS } from '../theme/identity';

type ModulePlaceholderScreenProps = {
  title: string;
  description: string;
  emoji: string;
  onBack: () => void;
};

export function ModulePlaceholderScreen({
  title,
  description,
  emoji,
  onBack,
}: ModulePlaceholderScreenProps) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />
      <View style={styles.container}>
        <View style={styles.emojiCircle}>
          <Text style={styles.emoji}>{emoji}</Text>
        </View>

        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>

        <Pressable style={styles.button} onPress={onBack}>
          <Text style={styles.buttonText}>Volver al Home</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  emojiCircle: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#e4efe8',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 46,
  },
  title: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'center',
  },
  description: {
    marginTop: 10,
    fontSize: 14,
    lineHeight: 24,
    color: COLORS.black,
    fontFamily: FONTS.regular,
    textAlign: 'center',
  },
  button: {
    marginTop: 24,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 22,
    paddingVertical: 13,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
});
```

---

## src/shared/services/notificacionSanitaria.ts

**Estado:** Eliminado

---

## src/shared/services/sessionManager.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

type SessionState = {
  authenticated: boolean;
  backgroundedAt: number | null;
};

export type SessionLockReason = 'timeout' | 'manual';

const SESSION_STORAGE_KEY = '@agroapp/session-state-v1';
const SESSION_LOCK_REASON_KEY = '@agroapp/session-lock-reason-v1';
const AUTH_INTRO_SHOWN_KEY = '@agroapp/auth-intro-shown-v1';
export const SESSION_TIMEOUT_MS = 30_000;

const DEFAULT_STATE: SessionState = {
  authenticated: false,
  backgroundedAt: null,
};

const readSessionState = async (): Promise<SessionState> => {
  try {
    const rawState = await AsyncStorage.getItem(SESSION_STORAGE_KEY);
    if (!rawState) {
      return DEFAULT_STATE;
    }

    const parsed = JSON.parse(rawState) as Partial<SessionState>;
    return {
      authenticated: Boolean(parsed.authenticated),
      backgroundedAt: typeof parsed.backgroundedAt === 'number' ? parsed.backgroundedAt : null,
    };
  } catch {
    return DEFAULT_STATE;
  }
};

const writeSessionState = async (state: SessionState): Promise<void> => {
  await AsyncStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
};

export const markSessionAuthenticated = async (): Promise<void> => {
  await AsyncStorage.removeItem(SESSION_LOCK_REASON_KEY);
  await writeSessionState({
    authenticated: true,
    backgroundedAt: null,
  });
};

export const clearSession = async (reason: SessionLockReason = 'manual'): Promise<void> => {
  if (reason === 'timeout') {
    await AsyncStorage.setItem(SESSION_LOCK_REASON_KEY, reason);
  } else {
    await AsyncStorage.removeItem(SESSION_LOCK_REASON_KEY);
  }

  await writeSessionState(DEFAULT_STATE);
};

export const consumeSessionLockReason = async (): Promise<SessionLockReason | null> => {
  try {
    const raw = await AsyncStorage.getItem(SESSION_LOCK_REASON_KEY);
    await AsyncStorage.removeItem(SESSION_LOCK_REASON_KEY);

    if (raw === 'timeout' || raw === 'manual') {
      return raw;
    }

    return null;
  } catch {
    return null;
  }
};

export const shouldShowAuthIntroOnEntry = async (): Promise<boolean> => {
  try {
    const alreadyShown = await AsyncStorage.getItem(AUTH_INTRO_SHOWN_KEY);
    if (alreadyShown === '1') {
      return false;
    }

    await AsyncStorage.setItem(AUTH_INTRO_SHOWN_KEY, '1');
    return true;
  } catch {
    return false;
  }
};

export const resolveStartupSession = async (): Promise<boolean> => {
  const state = await readSessionState();

  if (!state.authenticated) {
    return false;
  }

  if (state.backgroundedAt == null) {
    return true;
  }

  const timedOut = Date.now() - state.backgroundedAt >= SESSION_TIMEOUT_MS;
  if (timedOut) {
    await clearSession('timeout');
    return false;
  }

  await writeSessionState({
    authenticated: true,
    backgroundedAt: null,
  });
  return true;
};

export const markAppBackgrounded = async (): Promise<void> => {
  const state = await readSessionState();

  if (!state.authenticated) {
    return;
  }

  await writeSessionState({
    ...state,
    backgroundedAt: Date.now(),
  });
};

export const validateSessionOnForeground = async (): Promise<boolean> => {
  const state = await readSessionState();

  if (!state.authenticated) {
    return false;
  }

  if (state.backgroundedAt == null) {
    return true;
  }

  const timedOut = Date.now() - state.backgroundedAt >= SESSION_TIMEOUT_MS;
  if (timedOut) {
    await clearSession('timeout');
    return false;
  }

  await writeSessionState({
    authenticated: true,
    backgroundedAt: null,
  });
  return true;
};
```

---

## src/shared/theme/identity.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
export const COLORS = {
  primary: '#07612d',
  black: '#1d1d1b',
  white: '#ffffff',
  gray: '#98a287',
  error: '#D32F2F',
  warning: '#FFA000',
  success: '#4CAF50',
  listBackground: '#F4F4F4',
};

export const FONTS = {
  bold: 'Poppins-Bold',
  semiBold: 'Poppins-SemiBold',
  regular: 'Poppins-Regular',
  light: 'Poppins-Light',
};
```

---

## src/types/Animal.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/types/Costos.ts

**Estado:** Eliminado

---

## src/types/Nutricion.ts

**Estado:** Eliminado

---

## src/types/Sanitario.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
export enum TipoEvento {
  VACUNA = 'VACUNA',
  DESPARASITACION = 'DESPARASITACION',
  ENFERMEDAD = 'ENFERMEDAD',
  CIRUGIA = 'CIRUGIA',
  OTRO = 'OTRO',
}

export interface EventoSanitarioModel {
  id: number;
  animalId: number;
  tipoEvento: TipoEvento;
  descripcion: string | null;
  fechaEvento: string;
  veterinario: string | null;
  dosis: string | null;
  observaciones: string | null;
  fechaProximoEvento: string | null;
}

export interface InsertEventoPayload {
  animalId: number;
  tipoEvento: TipoEvento;
  descripcion: string;
  veterinario: string;
  dosis: string;
  observaciones: string;
  fechaEvento: string;
  fechaProximoEvento: string;
}

export interface InsertEventoResult {
  ok: boolean;
  eventoId: number;
}
```

---

## src/utils/animales/tiempoEnRancho.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---

## src/utils/formatMXN.ts

**Estado:** Eliminado

---

## src/utils/validaciones/areteValidator.ts

**Estado:** Modificado

### Contenido en b6e35be:

```typescript
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
```

---
