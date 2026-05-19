# Archivos de src - Sprint 3 (4d8ba67 a f6abc6d)

## Commits incluidos:
- **4d8ba67** - Actualizacion_Home_Sprint3
- **ed0ea71** - AnexoG_H_Sprint3
- **f66f4b0** - AnexoF_Sprint3
- **b03211b** - AnexoE_y_EstadoVendido_Sprint3
- **3098f5c** - AnexoD_Sprint3
- **064281f** - AnexoC_Sprint3
- **23802bc** - AnexoB_Sprint3
- **b6e35be** - AnexoA_Spritn3
- **f6abc6d** - Mewjoras_Sprint3

Total commits: 9

---

**Total archivos Ãºnicos en src:** 66

---

## Ajustes incorporados en f6abc6d

- src/components/animales/AnimalSearchBar.tsx: refinamiento del buscador de arete y limpieza visual del campo.
- src/features/animals/screens/HistorialClinico.tsx: ajuste del flujo de historial para alinearlo con la nueva navegacion de animales.
- src/features/costs/screens/GestionGastosScreen.tsx y src/features/costs/screens/RegistrarGastoScreen.tsx: mejoras en gestion y captura de gastos.
- src/features/health/screens/HealthScreen.tsx: integracion del flujo de eventos sanitarios con recomendaciones nutricionales.
- src/screens/animales/DetalleAnimalScreen.tsx, src/screens/animales/EditarAnimalScreen.tsx, src/screens/animales/ListadoAnimalesScreen.tsx y src/screens/animales/RegistrarAnimalScreen.tsx: ajustes del ciclo de vida del animal y validaciones asociadas.
- src/screens/sanitarios/RegistrarEventoSanitario.tsx: refactor principal del sprint, con seleccion multiple de animales, validacion de fechas y sugerencia de proxima fecha.

---

## src/components/animales/AnimalFotoCaptura.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

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

  const handleChange = (text: string) => {
    onSearch(text.replace(/\D/g, ''));
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={value}
        onChangeText={handleChange}
        style={styles.input}
        placeholder={placeholder}
        placeholderTextColor="#859383"
        keyboardType="number-pad"
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

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

```typescript
import React from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';

import { EventoSanitarioResumen } from '../../types/Animal';

type EventoSanitarioItemProps = {
  evento: EventoSanitarioResumen;
  primaryLabel?: string;
  onPrimaryAction?: (evento: EventoSanitarioResumen) => void;
  secondaryLabel?: string;
  onSecondaryAction?: (evento: EventoSanitarioResumen) => void;
  showCompleted?: boolean;
  onOpenDetail?: (evento: EventoSanitarioResumen) => void;
};

export function EventoSanitarioItem({
  evento,
  primaryLabel,
  onPrimaryAction,
  secondaryLabel,
  onSecondaryAction,
  showCompleted,
  onOpenDetail,
}: EventoSanitarioItemProps) {
  const titulo = evento.enfermedad?.trim() || 'Evento sanitario';
  const fecha = (evento.fechaEvento || evento.fecha) || 'Sin fecha';
  const detalle =
    (evento.observaciones && evento.observaciones.trim()) ||
    (evento.descripcion && evento.descripcion.trim()) ||
    'Sin detalle';

  return (
    <Pressable onPress={() => onOpenDetail && onOpenDetail(evento)} style={styles.card}>
      <View style={styles.leftAccent} />
      <View style={styles.iconWrap}>
        <Text style={styles.iconText}>­ƒ®║</Text>
      </View>
      <View style={styles.contentWrap}>
        <Text style={styles.title}>{titulo}</Text>
        <Text style={styles.detail}>{detalle}</Text>
        <Text style={styles.fecha}>Aplicado: {fecha}</Text>
      </View>
      <View style={styles.actionsWrap}>
        {showCompleted ? (
          <View style={styles.completedBadge}><Text style={{ color: '#fff' }}>Ô£ô</Text></View>
        ) : (
          <>
            {secondaryLabel && onSecondaryAction ? (
              <Pressable style={styles.secondaryBtn} onPress={() => onSecondaryAction(evento)}>
                <Text style={styles.secondaryBtnText}>{secondaryLabel}</Text>
              </Pressable>
            ) : null}
            {primaryLabel && onPrimaryAction ? (
              <Pressable style={styles.primaryBtn} onPress={() => onPrimaryAction(evento)}>
                <Text style={styles.primaryBtnText}>{primaryLabel}</Text>
              </Pressable>
            ) : null}
          </>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leftAccent: {
    width: 5,
    alignSelf: 'stretch',
    borderRadius: 2,
    backgroundColor: '#3aa65f',
    marginRight: 12,
  },
  iconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#e3ebdf',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 22,
  },
  contentWrap: {
    flex: 1,
  },
  title: {
    color: '#1f1f1f',
    fontWeight: '800',
    fontSize: 16,
  },
  detail: {
    marginTop: 3,
    color: '#5a5a5a',
    fontWeight: '600',
    fontSize: 14,
  },
  fecha: {
    marginTop: 3,
    color: '#8a8a8a',
    fontWeight: '600',
    fontSize: 12,
  },
  actionsWrap: {
    marginLeft: 10,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  primaryBtn: {
    backgroundColor: '#0a6b33',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    marginTop: 3,
  },
  primaryBtnText: { color: '#fff', fontWeight: '700', fontSize: 11 },
  secondaryBtn: {
    backgroundColor: '#fff',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  secondaryBtnText: { color: '#333', fontWeight: '700', fontSize: 10 },
  completedBadge: { backgroundColor: '#39a861', padding: 10, borderRadius: 14 },
});
```

---

## src/components/animales/GraficoBarrasCategorias.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { formatMXN } from '../../utils/formatMXN';

const COLORES_CATEGORIA: Record<string, string> = {
  ALIMENTACION: '#43A047',
  MEDICAMENTOS: '#E53935',
  TRASLADO: '#FB8C00',
  VETERINARIO: '#1E88E5',
  OTRO: '#8E24AA',
};

const LABELS_CATEGORIA: Record<string, string> = {
  ALIMENTACION: 'Alimentaci├│n',
  MEDICAMENTOS: 'Medicamentos',
  TRASLADO: 'Traslado',
  VETERINARIO: 'Veterinario',
  OTRO: 'Otro',
};

interface GraficoBarrasCategoriasProps {
  datos: Record<string, number>;
  totalGeneral: number;
}

function BarraAnimada({
  categoria,
  monto,
  proporcion,
  color,
  delay,
}: {
  categoria: string;
  monto: number;
  proporcion: number;
  color: string;
  delay: number;
}) {
  const animWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animWidth, {
      toValue: proporcion,
      duration: 600,
      delay,
      useNativeDriver: false,
    }).start();
  }, [proporcion, delay]);

  const widthPercent = animWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.barraRow}>
      <Text style={styles.barraLabel}>{LABELS_CATEGORIA[categoria] ?? categoria}</Text>
      <View style={styles.barraContainer}>
        <Animated.View
          style={[
            styles.barraFill,
            {
              backgroundColor: color,
              width: widthPercent.interpolate
                ? widthPercent.interpolate({
                    inputRange: ['0%', '100%'],
                    outputRange: ['0%', `${Math.max(proporcion * 100, 2)}%`],
                  })
                : `${Math.max(proporcion * 100, 2)}%`,
            },
          ]}
        />
      </View>
      <Text style={styles.barraMonto}>{formatMXN(monto)}</Text>
    </View>
  );
}

export function GraficoBarrasCategorias({
  datos,
  totalGeneral,
}: GraficoBarrasCategoriasProps) {
  if (!datos || totalGeneral <= 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>Sin datos para graficar</Text>
      </View>
    );
  }

  const entradas = Object.entries(datos).sort(([, a], [, b]) => b - a);

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Gastos por Categor├¡a</Text>
      {entradas.map(([categoria, monto], index) => {
        const proporcion = totalGeneral > 0 ? monto / totalGeneral : 0;
        const color = COLORES_CATEGORIA[categoria] ?? '#9E9E9E';
        return (
          <BarraAnimada
            key={categoria}
            categoria={categoria}
            monto={monto}
            proporcion={proporcion}
            color={color}
            delay={index * 100}
          />
        );
      })}
      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Total</Text>
        <Text style={styles.totalMonto}>{formatMXN(totalGeneral)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  titulo: {
    fontSize: 15,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 16,
  },
  barraRow: {
    marginBottom: 12,
  },
  barraLabel: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#555',
    marginBottom: 4,
  },
  barraContainer: {
    height: 18,
    backgroundColor: '#f0f0f0',
    borderRadius: 9,
    overflow: 'hidden',
    marginBottom: 3,
  },
  barraFill: {
    height: '100%',
    borderRadius: 9,
    minWidth: 6,
  },
  barraMonto: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#888',
    textAlign: 'right',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 12,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#333',
  },
  totalMonto: {
    fontSize: 13,
    fontFamily: 'Poppins-Bold',
    color: '#07612d',
  },
  empty: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    fontFamily: 'Poppins-Regular',
    color: '#999',
  },
});
```

---

## src/components/animales/PesoChart.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

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

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  NativeModules,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { COLORS, FONTS } from '../../shared/theme/identity';

interface ResumenInversionCardProps {
  animalId: number;
  animalEstado: 'ACTIVO' | 'FALLECIDO' | 'VENDIDO';
  onRegistrarVenta?: () => void;
}

interface MargenData {
  inversionTotal: number;
  precioCompra: number;
  sumaGastos: number;
  precioVenta: number;
  margen: number;
  porcentaje: number;
  esGanancia: boolean;
  estaVendido: boolean;
  fechaVenta?: string;
  error?: string;
}

export function ResumenInversionCard({
  animalId,
  animalEstado,
}: ResumenInversionCardProps) {
  const [margenData, setMargenData] = useState<MargenData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (animalEstado === 'VENDIDO') {
      loadMargenReal();
    }
  }, [animalId, animalEstado]);

  const loadMargenReal = async () => {
    setLoading(true);
    try {
      const result = await NativeModules.AgroBridgeModule.getMargenRealAnimal(animalId);
      if (!result.error) {
        setMargenData(result);
      } else {
        Alert.alert('Error', result.error || 'No se pudo cargar la informaci├│n de inversi├│n');
      }
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Error al cargar margen');
    } finally {
      setLoading(false);
    }
  };

  if (animalEstado !== 'VENDIDO') {
    return null;
  }

  if (loading) {
    return (
      <View style={styles.card}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (!margenData) {
    return null;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Resultado Final de Venta</Text>

      <View style={styles.row}>
        <Text style={styles.label}>Inversi├│n total:</Text>
        <Text style={styles.value}>${margenData.inversionTotal.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Precio compra:</Text>
        <Text style={styles.value}>${margenData.precioCompra.toFixed(2)}</Text>
      </View>

      <View style={styles.row}>
        <Text style={styles.label}>Gastos (sanitarios + alimentaci├│n):</Text>
        <Text style={styles.value}>${margenData.sumaGastos.toFixed(2)}</Text>
      </View>

      <View style={[styles.separatorLine, styles.spacer]} />

      <View style={styles.row}>
        <Text style={styles.label}>Precio de venta:</Text>
        <Text style={styles.value}>${margenData.precioVenta.toFixed(2)}</Text>
      </View>

      <View
        style={[
          styles.row,
          styles.resultRow,
          margenData.esGanancia ? styles.resultGanancia : styles.resultPerdida,
        ]}
      >
        <Text style={[styles.label, styles.resultLabel]}>
          {margenData.esGanancia ? 'Ganancia' : 'P├®rdida'}:
        </Text>
        <Text
          style={[
            styles.value,
            styles.resultValue,
            margenData.esGanancia ? styles.resultValueGreen : styles.resultValueRed,
          ]}
        >
          ${margenData.margen.toFixed(2)} ({margenData.porcentaje.toFixed(1)}%)
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginVertical: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.primary,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
    fontFamily: FONTS.bold,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
  },
  label: {
    fontSize: 13,
    color: '#555',
    fontFamily: FONTS.regular,
    flex: 1,
  },
  value: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
    fontFamily: FONTS.bold,
    textAlign: 'right',
  },
  resultRow: {
    marginTop: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  resultGanancia: {
    backgroundColor: '#f0fef0',
  },
  resultPerdida: {
    backgroundColor: '#fef0f0',
  },
  resultLabel: {
    color: '#333',
  },
  resultValue: {
    fontSize: 14,
  },
  resultValueGreen: {
    color: '#39a861',
  },
  resultValueRed: {
    color: '#D32F2F',
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#eee',
  },
  spacer: {
    marginVertical: 12,
  },
});
```

---

## src/components/animales/VentaAnimalModal.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  NativeModules,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { COLORS, FONTS } from '../../shared/theme/identity';
import { VentaAnimalResult } from '../../types/Animal';

interface VentaAnimalModalProps {
  visible: boolean;
  animalId: number;
  arete: string;
  precioVentaExistente?: number | null;
  fechaVentaExistente?: string | null;
  onVentaExitosa: (resultado: VentaAnimalResult) => void;
  onCancelar: () => void;
}

const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const WEEKDAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

export function VentaAnimalModal({
  visible,
  animalId,
  arete,
  precioVentaExistente,
  fechaVentaExistente,
  onVentaExitosa,
  onCancelar,
}: VentaAnimalModalProps) {
  const [precioVenta, setPrecioVenta] = useState('');
  const [fechaVenta, setFechaVenta] = useState('');
  const [comprador, setComprador] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorPrecio, setErrorPrecio] = useState<string | null>(null);
  const [errorFecha, setErrorFecha] = useState<string | null>(null);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(new Date());

  // Precargar datos cuando el modal se abre
  React.useEffect(() => {
    if (visible) {
      // Precargar datos existentes sin validaci├│n estricta
      if (precioVentaExistente != null) {
        setPrecioVenta(precioVentaExistente.toString());
      }
      if (fechaVentaExistente != null) {
        setFechaVenta(fechaVentaExistente);
      }
    } else {
      // Limpiar cuando el modal se cierra (excepto si el modal vuelve a abrir)
      setTimeout(() => {
        if (!visible) {
          setPrecioVenta('');
          setFechaVenta('');
          setComprador('');
          setErrorPrecio(null);
          setErrorFecha(null);
        }
      }, 300);
    }
  }, [visible]);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}/${month}/${year}`;
  };

  const parseDate = (value: string) => new Date(`${value}T00:00:00`);

  const normalizeToday = (date: Date) => {
    const candidate = new Date(date);
    candidate.setHours(0, 0, 0, 0);
    return candidate;
  };

  const isFutureDate = (date: Date) => {
    const today = normalizeToday(new Date());
    return normalizeToday(date).getTime() > today.getTime();
  };

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

  const selectDate = (date: Date) => {
    if (isFutureDate(date)) {
      Alert.alert('Fecha inv├ílida', 'La fecha de venta no puede ser futura.');
      return;
    }
    setFechaVenta(formatDate(date));
    setDatePickerVisible(false);
  };

  const canGoNextMonth = () => {
    const now = new Date();
    return (
      calendarMonth.getFullYear() < now.getFullYear() ||
      (calendarMonth.getFullYear() === now.getFullYear() && calendarMonth.getMonth() < now.getMonth())
    );
  };

  const onConfirmarVenta = async () => {
    const precioNum = parseFloat(precioVenta.replace(',', '.'));

    if (Number.isNaN(precioNum) || precioNum <= 0) {
      setErrorPrecio('El precio debe ser mayor a $0');
      return;
    }
    setErrorPrecio(null);

    if (!fechaVenta) {
      setErrorFecha('La fecha de venta es obligatoria');
      return;
    }
    setErrorFecha(null);

    setLoading(true);
    try {
      const motivoBaja = comprador.trim() ? `Venta - ${comprador.trim()}` : 'Venta';
      await NativeModules.AnimalModule.changeEstado({
        id: animalId,
        estado: 'VENDIDO',
        precioVenta: precioNum,
        fechaVenta: fechaVenta,
        fecha_baja: fechaVenta,
        motivo_baja: motivoBaja,
      });

      setLoading(false);
      onVentaExitosa({
        ok: true,
        animalId,
        precioVenta: precioNum,
        margenEstimado: null,
      });

      // Limpiar estado
      setPrecioVenta('');
      setFechaVenta('');
      setComprador('');
    } catch (e: any) {
      setLoading(false);
      Alert.alert('Error', e.message || 'No se pudo registrar la venta');
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancelar}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerText}>┬┐Registrar venta del animal #{arete}?</Text>
          </View>

          {/* Body */}
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            {/* Precio */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Precio de venta *</Text>
              <View style={styles.priceInputRow}>
                <Text style={styles.pricePrefix}>$</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  keyboardType="decimal-pad"
                  value={precioVenta}
                  onChangeText={val => {
                    setPrecioVenta(val);
                    setErrorPrecio(null);
                  }}
                />
                <Text style={styles.priceSuffix}>MXN</Text>
              </View>
              {errorPrecio && <Text style={styles.errorText}>{errorPrecio}</Text>}
            </View>

            {/* Fecha */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Fecha de venta *</Text>
              <Pressable
                style={[styles.dateField, errorFecha && styles.dateFieldError]}
                onPress={() => {
                  setDatePickerVisible(true);
                  setCalendarMonth(fechaVenta ? parseDate(fechaVenta) : new Date());
                }}
              >
                <Text style={[styles.dateText, !fechaVenta && styles.datePlaceholder]}>
                  {fechaVenta ? formatDisplayDate(fechaVenta) : 'DD/MM/AAAA'}
                </Text>
                <Text style={styles.dateIcon}>­ƒôà</Text>
              </Pressable>
              {errorFecha && <Text style={styles.errorText}>{errorFecha}</Text>}
            </View>

            {/* Comprador */}
            <View style={styles.fieldGroup}>
              <Text style={styles.labelOptional}>Comprador (opcional)</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre del comprador (opcional)"
                value={comprador}
                onChangeText={setComprador}
              />
            </View>
          </ScrollView>

          {/* Footer - Botones */}
          <View style={styles.footer}>
            <Pressable
              style={styles.cancelButton}
              onPress={onCancelar}
              disabled={loading}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </Pressable>

            <Pressable
              style={[
                styles.confirmButton,
                (!precioVenta.trim() || Number.isNaN(parseFloat(precioVenta)) || parseFloat(precioVenta) <= 0 || !fechaVenta.trim() || loading) &&
                  styles.confirmButtonDisabled,
              ]}
              onPress={onConfirmarVenta}
              disabled={
                !precioVenta.trim() ||
                Number.isNaN(parseFloat(precioVenta)) ||
                parseFloat(precioVenta) <= 0 ||
                !fechaVenta.trim() ||
                loading
              }
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirmar Venta</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {/* Date Picker Modal */}
      <Modal visible={datePickerVisible} transparent animationType="fade" onRequestClose={() => setDatePickerVisible(false)}>
        <View style={styles.datePickerBackdrop}>
          <View style={styles.datePickerCard}>
            <View style={styles.datePickerHeader}>
              <Pressable
                onPress={() =>
                  setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
                }
                style={styles.datePickerNavButton}
              >
                <Text style={styles.datePickerNavText}>ÔÇ╣</Text>
              </Pressable>
              <Text style={styles.datePickerTitle}>
                {MONTH_NAMES[calendarMonth.getMonth()]} {calendarMonth.getFullYear()}
              </Text>
              <Pressable
                onPress={() => {
                  if (canGoNextMonth()) {
                    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
                  }
                }}
                style={[styles.datePickerNavButton, !canGoNextMonth() && styles.datePickerNavButtonDisabled]}
              >
                <Text style={[styles.datePickerNavText, !canGoNextMonth() && styles.datePickerNavTextDisabled]}>ÔÇ║</Text>
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
                const disableDay = isFutureDate(day);
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

            <Pressable
              style={styles.datePickerCloseButton}
              onPress={() => setDatePickerVisible(false)}
            >
              <Text style={styles.datePickerCloseText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  card: {
    width: '100%',
    maxHeight: '92%',
    minHeight: '65%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  body: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1b',
    marginBottom: 8,
    fontFamily: FONTS.semiBold,
  },
  labelOptional: {
    fontSize: 14,
    fontWeight: '400',
    color: '#555555',
    marginBottom: 8,
    fontFamily: FONTS.regular,
  },
  priceInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e6efe6',
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: '#fafafa',
  },
  pricePrefix: {
    fontSize: 16,
    fontWeight: '700',
    color: '#07612d',
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#333',
  },
  priceSuffix: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555555',
    marginLeft: 8,
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    marginTop: 6,
    fontFamily: FONTS.regular,
  },
  dateField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#e6efe6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#fafafa',
  },
  dateFieldError: {
    borderColor: '#D32F2F',
  },
  dateText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: '#333',
  },
  datePlaceholder: {
    color: '#bbb',
  },
  dateIcon: {
    fontSize: 18,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e6efe6',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: FONTS.regular,
    backgroundColor: '#fafafa',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButtonText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontFamily: FONTS.semiBold,
  },
  confirmButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonDisabled: {
    opacity: 0.4,
  },
  confirmButtonText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
  // Date Picker Styles
  datePickerBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  datePickerCard: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
  },
  datePickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  datePickerNavButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#edf2e9',
  },
  datePickerNavButtonDisabled: {
    opacity: 0.35,
  },
  datePickerNavText: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  datePickerNavTextDisabled: {
    color: '#8a9387',
  },
  datePickerTitle: {
    color: '#1d1d1b',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: FONTS.bold,
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
    marginBottom: 12,
  },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
  },
  dayCellDisabled: {
    opacity: 0.25,
  },
  dayCellText: {
    color: '#1d1d1b',
    fontWeight: '700',
    fontFamily: FONTS.semiBold,
  },
  datePickerCloseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  datePickerCloseText: {
    color: '#fff',
    fontWeight: '700',
    fontFamily: FONTS.bold,
  },
});
```

---

## src/components/EventoClinicoCard.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { FONTS, COLORS } from '../shared/theme/identity';
import type { EventoSanitarioModel } from '../types/Sanitario';

type Props = {
  evento: EventoSanitarioModel;
  onEditar?: () => void;
};

const colorByTipo = (tipo?: string) => {
  switch (tipo) {
    case 'VACUNA':
      return '#2e7d32';
    case 'DESPARASITACION':
      return '#FFA000';
    case 'ENFERMEDAD':
      return '#e53935';
    case 'CIRUGIA':
      return '#fb8c00';
    default:
      return '#9e9e9e';
  }
};

export default function EventoClinicoCard({ evento, onEditar }: Props) {
  const [expanded, setExpanded] = useState(false);
  const fecha = evento.fechaEvento || evento.fechaProgramada || '';
  const fechaLabel = (() => {
    try {
      const d = new Date(fecha + 'T00:00:00');
      const day = String(d.getDate()).padStart(2, '0');
      const month = d.toLocaleString('default', { month: 'short' });
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    } catch {
      return fecha;
    }
  })();

  const descripcion = evento.descripcion || '';
  const short = descripcion.length > 80 && !expanded ? descripcion.slice(0, 80) + 'ÔÇª' : descripcion;

  return (
    <View style={styles.card}>
      <View style={[styles.chip, { backgroundColor: `${colorByTipo(evento.tipoEvento)}22`, borderColor: colorByTipo(evento.tipoEvento) }]}>
        <Text style={[styles.chipText, { color: colorByTipo(evento.tipoEvento) }]}>{evento.tipoEvento}</Text>
      </View>

      <View style={styles.body}>
        <Text style={styles.date}>{fechaLabel}</Text>
        <Text style={styles.description}>{short}</Text>
        {descripcion.length > 80 ? (
          <Pressable onPress={() => setExpanded(v => !v)}>
            <Text style={styles.toggle}>{expanded ? 'Ver menos' : 'Ver m├ís'}</Text>
          </Pressable>
        ) : null}

        <View style={styles.metaRow}>
          {evento.veterinario ? <Text style={styles.metaText}>{evento.veterinario}</Text> : null}
          {evento.dosis ? <Text style={styles.metaText}> ┬À {evento.dosis}</Text> : null}
        </View>
      </View>

      {onEditar ? (
        <Pressable style={styles.editBtn} onPress={onEditar}>
          <Text style={styles.editTxt}>Editar</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  chip: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    marginRight: 10,
  },
  chipText: {
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  body: {
    flex: 1,
  },
  date: {
    fontFamily: FONTS.semiBold,
    color: '#333333',
    marginBottom: 6,
  },
  description: {
    fontFamily: FONTS.regular,
    color: '#222222',
  },
  toggle: {
    marginTop: 6,
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  metaRow: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    color: '#555555',
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  editBtn: {
    marginLeft: 10,
    alignSelf: 'center',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  editTxt: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});
```

---

## src/components/EventoDetailModal.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import React from 'react';
import { Modal, View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { COLORS, FONTS } from '../shared/theme/identity';

type EventoDetailModalProps = {
  visible: boolean;
  evento: any;
  onClose: () => void;
  onEdit?: (evento: any) => void;
  arete?: string;
};

export function EventoDetailModal({ visible, evento, onClose, onEdit, arete }: EventoDetailModalProps) {
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
              <Text style={styles.closeBtnText}>Ô£ò</Text>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {evento.descripcion && (
              <View style={styles.field}>
                <Text style={styles.label}>Descripci├│n</Text>
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
                <Text style={styles.label}>Pr├│ximo Evento</Text>
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
                <Text style={styles.editBtnText}>Ô£Ä Modificar Evento</Text>
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
```

---

## src/components/nutricion/TablaRecomendacion.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
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
      {/* Secci├│n 1: Par├ímetros Nutricionales */}
      <Seccion titulo="Par├ímetros Nutricionales">
        <Fila label="Prote├¡na m├¡nima" valor={`${r.proteinaMin}% BS`} par={true} />
        <Fila label="Energ├¡a metabolizable" valor={`${r.energiaMcal} Mcal EM/kg MS`} par={false} />
        <Fila label="Fibra m├íxima (FDN)" valor={`${r.fibraMaxima}% MS`} par={true} />
        <Fila label="Agua requerida" valor={`${r.aguaLitrosDia} L/d├¡a`} par={false} />
      </Seccion>

      {/* Secci├│n 2: Suplementos */}
      <Seccion titulo="Suplementos Recomendados">
        {r.suplementos.map((sup, i) => (
          <Fila key={i} label={`ÔÇó`} valor={sup} par={i % 2 === 0} />
        ))}
      </Seccion>

      {/* Secci├│n 3: Estimaci├│n de Gasto */}
      <Seccion titulo="Estimaci├│n de Gasto">
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
```

---

## src/components/sanitarios/CalendarioMensual.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import React, { memo } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import type { EventoSanitarioModel, TipoEvento } from '../../types/Sanitario';

type Props = {
  year: number;
  month: number; // 1-12
  eventos: Record<string, EventoSanitarioModel[]>;
  selectedDate: string | null;
  onSelectDate: (date: string) => void;
};

const DOT_COLORS: Record<string, string> = {
  VACUNA: '#39a861',
  DESPARASITACION: '#FFA000',
  ENFERMEDAD: '#D32F2F',
};

function pad(n: number) {
  return n < 10 ? `0${n}` : `${n}`;
}

function buildMonthMatrix(year: number, month: number) {
  // month: 1-12
  const first = new Date(year, month - 1, 1);
  const startDay = first.getDay(); // 0-6 Sun-Sat
  const daysInMonth = new Date(year, month, 0).getDate();

  const cells: Array<number | null> = [];
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  // pad to multiple of 7
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: number[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7) as number[]);
  }
  return weeks;
}

const DayCell = memo(function DayCell({
  year,
  month,
  day,
  eventos,
  selected,
  onPress,
}: {
  year: number;
  month: number;
  day: number | null;
  eventos: Record<string, EventoSanitarioModel[]>;
  selected: boolean;
  onPress: (date: string) => void;
}) {
  if (!day) {
    return <View style={styles.dayCellEmpty} />;
  }

  const dateKey = `${year}-${pad(month)}-${pad(day)}`;
  const lista = eventos[dateKey] || [];

  const typesPresent = Array.from(new Set(lista.map(e => String(e.tipoEvento))));

  return (
    <Pressable
      onPress={() => onPress(dateKey)}
      style={[styles.dayCell, selected && styles.dayCellSelected]}
    >
      <Text style={[styles.dayNumber, selected && styles.dayNumberSelected]}>{day}</Text>
      <View style={styles.dotsRow}>
        {typesPresent.slice(0, 3).map((t) => (
          <View key={t} style={[styles.dot, { backgroundColor: DOT_COLORS[t] || '#888' }]} />
        ))}
      </View>
    </Pressable>
  );
});

export default function CalendarioMensual({ year, month, eventos, selectedDate, onSelectDate }: Props) {
  const weeks = buildMonthMatrix(year, month);

  return (
    <View style={styles.container}>
      <View style={styles.weekHeader}>
        {['Do','Lu','Ma','Mi','Ju','Vi','Sa'].map(d => (
          <Text key={d} style={styles.weekHeaderText}>{d}</Text>
        ))}
      </View>
      {weeks.map((week, i) => (
        <View key={String(i)} style={styles.weekRow}>
          {week.map((day, idx) => (
            <DayCell
              key={String(idx)}
              year={year}
              month={month}
              day={day ?? null}
              eventos={eventos}
              selected={selectedDate === (day ? `${year}-${pad(month)}-${pad(day)}` : null)}
              onPress={onSelectDate}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 8 },
  weekHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  weekHeaderText: { flex: 1, textAlign: 'center', color: '#6b6b6b', fontSize: 12 },
  weekRow: { flexDirection: 'row', marginTop: 6 },
  dayCell: { flex: 1, aspectRatio: 1, alignItems: 'center', justifyContent: 'center', borderRadius: 8 },
  dayCellEmpty: { flex: 1, aspectRatio: 1 },
  dayNumber: { color: '#222' },
  dayNumberSelected: { color: '#fff' },
  dayCellSelected: { backgroundColor: '#07612d' },
  dotsRow: { flexDirection: 'row', marginTop: 6, gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
});
```

---

## src/data/NutricionData.ts

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import type {
  EtapaProductiva,
  TipoAnimal,
  RecomendacionNutricional,
} from '../types/Nutricion';

// Fuentes: NRC (Nutrient Requirements of Beef Cattle, 2016) e INIFAP
const TABLAS_NUTRICION: Record<EtapaProductiva, Record<TipoAnimal, RecomendacionNutricional>> = {
  CRIA: {
    BOVINO: {
      etapa: 'CRIA',
      tipoAnimal: 'BOVINO',
      proteinaMin: 18,
      energiaMcal: 2.6,
      fibraMaxima: 35,
      aguaLitrosDia: 8,
      suplementos: [
        'Calostro primeras 6 horas (3ÔÇô4 L)',
        'Vitamina E 150ÔÇô200 UI/d├¡a',
        'Selenio 0.1 mg/kg MS',
        'Vitamina A 2200 UI/kg MS',
        'Coccidiost├ítico (monensina) a partir de 4a semana',
      ],
      observaciones:
        'Terneros en lactancia: leche entera o sustituto l├ícteo (12ÔÇô15% grasa, 24% prote├¡na). Introducir forraje de calidad desde la 2a semana. Destete entre 60ÔÇô90 d├¡as. Evitar estr├®s t├®rmico. INIFAP recomienda pesaje semanal para ajuste de suministro.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 1400,
        fuente: 'INIFAP 2023 ÔÇö Regi├│n Centro-Norte',
      },
    },
    OVINO: {
      etapa: 'CRIA',
      tipoAnimal: 'OVINO',
      proteinaMin: 20,
      energiaMcal: 2.7,
      fibraMaxima: 30,
      aguaLitrosDia: 2,
      suplementos: [
        'Calostro 200 mL/kg PV en primeras 12 h',
        'Vitamina E + Selenio (BoSe┬«)',
        'Hierro dextrano IM 150 mg a los 3 d├¡as',
        'Coccidiost├ítico desde 3a semana',
      ],
      observaciones:
        'Corderos: leche materna o sustituto (3├ù al d├¡a). Destete a 45ÔÇô60 d├¡as. Ofrecer concentrado de arranque 18% PC desde 2a semana. NRC Sheep 2007.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 650,
        fuente: 'INIFAP 2023 ÔÇö Baj├¡o',
      },
    },
    CAPRINO: {
      etapa: 'CRIA',
      tipoAnimal: 'CAPRINO',
      proteinaMin: 20,
      energiaMcal: 2.8,
      fibraMaxima: 28,
      aguaLitrosDia: 1.5,
      suplementos: [
        'Calostro caprino 150ÔÇô200 mL/kg PV',
        'Vitamina D3 si hay confinamiento total',
        'Coccidiost├ítico (amprolium) semana 3ÔÇô6',
        'Cobre quelado 10 mg/kg MS',
      ],
      observaciones:
        'Cabritos: lactar m├¡nimo 6 semanas. Introducir heno de alfalfa picado a 2a semana. Cuidado con exceso de cobre en praderas h├║medas. NRC Dairy Goat 2007.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 500,
        fuente: 'INIFAP 2022 ÔÇö Zona ├írida',
      },
    },
  },

  ENGORDA: {
    BOVINO: {
      etapa: 'ENGORDA',
      tipoAnimal: 'BOVINO',
      proteinaMin: 13,
      energiaMcal: 3.1,
      fibraMaxima: 20,
      aguaLitrosDia: 35,
      suplementos: [
        'Monensina 200ÔÇô360 mg/animal/d├¡a',
        'Tilosina si hay riesgo hep├ítico',
        'Vitamina A 2200 UI/kg MS',
        'Zinc metionina 50 mg/kg MS',
        'Buffer (NaHCOÔéâ) 0.75% en raciones altas en grano',
      ],
      observaciones:
        'Adaptar grano en 21 d├¡as (15%ÔåÆ80% en dieta). Consumo esperado 2.5ÔÇô3% PV en MS. GDP objetivo: 1.2ÔÇô1.5 kg/d├¡a. Revisar pH ruminal. NRC Beef 2016.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 3200,
        fuente: 'INIFAP 2023 ÔÇö Sonora / Chihuahua',
      },
    },
    OVINO: {
      etapa: 'ENGORDA',
      tipoAnimal: 'OVINO',
      proteinaMin: 14,
      energiaMcal: 3.0,
      fibraMaxima: 22,
      aguaLitrosDia: 5,
      suplementos: [
        'Monensina 15ÔÇô25 mg/kg MS',
        'Amonio propionato en dietas altas en grano',
        'Vitamina E 30 UI/kg MS',
        'Azufre 0.15% MS (limitar en agua dura)',
      ],
      observaciones:
        'GDP esperada: 250ÔÇô350 g/d├¡a. Peso de sacrificio: 35ÔÇô45 kg PV. Adaptar concentrado en 14 d├¡as. Evitar urolitiasis (relaci├│n Ca:P 2:1). NRC Sheep 2007.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 900,
        fuente: 'INIFAP 2023 ÔÇö Altiplano',
      },
    },
    CAPRINO: {
      etapa: 'ENGORDA',
      tipoAnimal: 'CAPRINO',
      proteinaMin: 14,
      energiaMcal: 2.9,
      fibraMaxima: 25,
      aguaLitrosDia: 4,
      suplementos: [
        'Biotina 2 mg/d├¡a en engorda intensiva',
        'Vitamina E 50 UI/kg MS',
        'Selenio org├ínico 0.3 mg/kg MS',
        'Rumensin (monensina) 15 mg/kg MS',
      ],
      observaciones:
        'GDP esperada: 150ÔÇô200 g/d├¡a. Peso sacrificio: 25ÔÇô35 kg. Alta eficiencia de conversi├│n (4.5:1). Forrajear m├¡nimo 20% FDN. NRC Small Ruminants 2007.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 750,
        fuente: 'INIFAP 2022 ÔÇö Sem├írido',
      },
    },
  },

  LECHERA: {
    BOVINO: {
      etapa: 'LECHERA',
      tipoAnimal: 'BOVINO',
      proteinaMin: 17,
      energiaMcal: 3.2,
      fibraMaxima: 28,
      aguaLitrosDia: 80,
      suplementos: [
        'Calcio 0.7% MS (preparto 0.3% MS)',
        'F├│sforo 0.4% MS',
        'Niacina 6 g/vaca/d├¡a (pico de lactancia)',
        'Propilenglicol 300 mL/d├¡a semana preparto',
        'Selenio + Vitamina E IM 10 d├¡as antes del parto',
        'Bypass fat si producci├│n > 30 L/d├¡a',
      ],
      observaciones:
        'Raci├│n total mezclada (RTM) ├│ptima. Relaci├│n forraje:concentrado 55:45 en pico de lactancia. Monitorear BCS: 3.0ÔÇô3.5 al parto. NRC Dairy 2021. Adaptar si raza: Holstein > Jersey en requerimientos.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 5500,
        fuente: 'INIFAP 2023 ÔÇö Jalisco / Coahuila',
      },
    },
    OVINO: {
      etapa: 'LECHERA',
      tipoAnimal: 'OVINO',
      proteinaMin: 16,
      energiaMcal: 2.9,
      fibraMaxima: 30,
      aguaLitrosDia: 6,
      suplementos: [
        'Calcio 0.5% MS',
        'Vitamina D3 500 UI/kg MS en estabulaci├│n',
        'Cobre 7ÔÇô11 mg/kg MS',
        'Zinc 50 mg/kg MS',
        'Concentrado energ├®tico 400ÔÇô600 g/d├¡a en pico',
      ],
      observaciones:
        'Producci├│n media: 0.8ÔÇô1.5 L/d├¡a (razas Churra, Manchega). Orde├▒o 1ÔÇô2 veces/d├¡a. Ofrecer heno de alfalfa ad libitum. Cuidado con hipocalcemia posparto. INIFAP Oaxaca 2021.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 1100,
        fuente: 'INIFAP 2021 ÔÇö Sur-Sureste',
      },
    },
    CAPRINO: {
      etapa: 'LECHERA',
      tipoAnimal: 'CAPRINO',
      proteinaMin: 16,
      energiaMcal: 3.0,
      fibraMaxima: 30,
      aguaLitrosDia: 8,
      suplementos: [
        'Calcio 0.45% MS',
        'F├│sforo 0.35% MS',
        'Vitamina E 50 UI/kg MS',
        'Cobre 10ÔÇô15 mg/kg MS (precauci├│n raza Saanen)',
        'Concentrado 300ÔÇô500 g por litro de leche adicional',
      ],
      observaciones:
        'Producci├│n media: 2ÔÇô4 L/d├¡a (razas Saanen, Nubia). Dos orde├▒os/d├¡a. Riesgo de hipocalcemia y acetonemia en pico. Pastoreo complementario reduce costos 30%. NRC Dairy Goat 2007.',
      gastosEstimadosMXN: {
        mensualPorAnimal: 1300,
        fuente: 'INIFAP 2023 ÔÇö Sem├írido Norte',
      },
    },
  },
};

export function getRecomendacion(
  etapa: EtapaProductiva,
  tipoAnimal: TipoAnimal,
): RecomendacionNutricional {
  return TABLAS_NUTRICION[etapa][tipoAnimal];
}

export { TABLAS_NUTRICION };
```

---

## src/features/animals/screens/AnimalsScreen.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

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

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
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
          <Text style={styles.backTxt}>ÔåÉ Volver</Text>
        </Pressable>
        <Text style={styles.title}>Historial Cl├¡nico</Text>
      </View>

      {eventos.length === 0 && !loading ? (
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>Sin historial cl├¡nico registrado</Text>
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
```

---

## src/features/costs/screens/CostsScreen.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import React from 'react';

import { CostsNavigator } from '../../../navigation/CostsNavigator';

type CostsScreenProps = {
  onBack: () => void;
};

export function CostsScreen({ onBack }: CostsScreenProps) {
  return <CostsNavigator onBack={onBack} />;
}
```

---

## src/features/costs/screens/GestionGastosScreen.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Text,
  RefreshControl,
} from 'react-native';
import { NativeModules } from 'react-native';
import { GastoModel, CATEGORIA_GASTO_LABELS, CATEGORIA_COLORES } from '../../../types/Costos';

const { AgroBridgeModule, AnimalModule } = NativeModules;

interface AnimalRef {
  id: number;
  arete: string;
}

interface GestionGastosScreenProps {
  onBack: () => void;
  onNewGasto: () => void;
  onEditGasto: (gastoId: number) => void;
}

export function GestionGastosScreen({
  onBack,
  onNewGasto,
  onEditGasto,
}: GestionGastosScreenProps) {
  const [gastos, setGastos] = useState<GastoModel[]>([]);
  const [animales, setAnimales] = useState<AnimalRef[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    void cargarAnimales();
    void cargarGastos();
  }, []);

  const cargarAnimales = async () => {
    try {
      const resultado = await AnimalModule.listAnimals();
      if (resultado && Array.isArray(resultado)) {
        setAnimales(resultado.map((a: any) => ({ id: a.id, arete: a.arete })));
      }
    } catch {
      // Si falla, simplemente mostramos el ID
    }
  };

  const getAreteAnimal = (animalId: number | null | undefined): string | null => {
    if (!animalId || animalId <= 0) return null;
    return animales.find(a => a.id === animalId)?.arete ?? null;
  };

  const cargarGastos = async () => {
    try {
      setLoading(true);
      const resultado = await AgroBridgeModule.obtenerTodosGastos();
      if (resultado && Array.isArray(resultado)) {
        setGastos(resultado);
      }
    } catch (error) {
      console.error('Error cargando gastos:', error);
      Alert.alert('Error', 'No se pudieron cargar los gastos');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([cargarGastos(), cargarAnimales()]);
    setRefreshing(false);
  };

  const confirmarEliminar = (gasto: GastoModel) => {
    Alert.alert(
      'Confirmar eliminaci├│n',
      `┬┐Eliminar gasto: ${gasto.descripcion}?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarGasto(gasto.id),
        },
      ]
    );
  };

  const eliminarGasto = async (id: number) => {
    try {
      await AgroBridgeModule.deleteGasto(id);
      Alert.alert('├ëxito', 'Gasto eliminado');
      await cargarGastos();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Error al eliminar el gasto');
    }
  };

  const formatoMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 2,
    }).format(monto);
  };

  const renderGasto = ({ item }: { item: GastoModel }) => (
    <View style={styles.gastoCard}>
      <View style={styles.gastoHeader}>
        <View style={styles.gastoInfo}>
          <Text style={styles.categoria} numberOfLines={1}>
            {CATEGORIA_GASTO_LABELS[item.categoria]}
          </Text>
          <Text style={styles.descripcion} numberOfLines={2}>
            {item.descripcion}
          </Text>
          {item.animalId && item.animalId > 0 && (
            <Text style={styles.animal}>­ƒÉä Arete: {getAreteAnimal(item.animalId) ?? `#${item.animalId}`}</Text>
          )}
          {(!item.animalId || item.animalId <= 0) && (
            <Text style={styles.animal}>­ƒôï Gasto General</Text>
          )}
          <Text style={styles.fecha}>{item.fecha}</Text>
        </View>

        <View style={[styles.montoBadge, { backgroundColor: CATEGORIA_COLORES[item.categoria] }]}>
          <Text style={styles.montoText}>{formatoMoneda(item.monto)}</Text>
        </View>
      </View>

      {item.notas && (
        <Text style={styles.notas}>{item.notas}</Text>
      )}

      <View style={styles.gastoActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => onEditGasto(item.id)}
        >
          <Text style={styles.editButtonText}>Ô£Å´©Å Editar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => confirmarEliminar(item)}
        >
          <Text style={styles.deleteButtonText}>­ƒùæ´©Å Eliminar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const totalGastos = gastos.reduce((sum, g) => sum + g.monto, 0);
  const gastosGenerales = gastos.filter(g => !g.animalId || g.animalId <= 0);
  const gastosPorAnimal = gastos.filter(g => g.animalId && g.animalId > 0);

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.loadingText}>ÔÅ│ Cargando gastos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButtonWrap}>
          <Text style={styles.backButtonText}>ÔåÉ Volver</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Gesti├│n de Gastos</Text>
      </View>

      {/* Resumen */}
      <View style={styles.resumeContainer}>
        <View style={styles.resumeBox}>
          <Text style={styles.resumeLabel}>Total Invertido</Text>
          <Text style={styles.resumeValue}>{formatoMoneda(totalGastos)}</Text>
        </View>
        <View style={styles.resumeBox}>
          <Text style={styles.resumeLabel}>Registros</Text>
          <Text style={styles.resumeValue}>{gastos.length}</Text>
        </View>
        <View style={styles.resumeBox}>
          <Text style={styles.resumeLabel}>General / Animal</Text>
          <Text style={styles.resumeValue}>
            {gastosGenerales.length} / {gastosPorAnimal.length}
          </Text>
        </View>
      </View>

      {/* Lista de gastos */}
      {gastos.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>­ƒô¡</Text>
          <Text style={styles.emptyTitle}>Sin gastos registrados</Text>
          <Text style={styles.emptyDescription}>
            Toca el bot├│n + para registrar tu primer gasto
          </Text>
          <TouchableOpacity style={styles.emptyButton} onPress={onNewGasto}>
            <Text style={styles.emptyButtonText}>Registrar Gasto</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={gastos}
          renderItem={renderGasto}
          keyExtractor={(item) => item.id.toString()}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          scrollEnabled
          style={styles.list}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={onNewGasto}>
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#666',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButtonWrap: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#e8f5ec',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#07612d',
    fontFamily: 'Poppins-SemiBold',
    fontWeight: '700',
  },
  title: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    flex: 1,
  },
  resumeContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  resumeBox: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  resumeLabel: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#999',
    marginBottom: 4,
  },
  resumeValue: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: '#07612d',
  },
  list: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 160,
  },
  gastoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  gastoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  gastoInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoria: {
    fontSize: 12,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
    marginBottom: 4,
  },
  descripcion: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  animal: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#07612d',
    marginBottom: 4,
  },
  fecha: {
    fontSize: 11,
    fontFamily: 'Poppins-Regular',
    color: '#999',
  },
  montoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 80,
  },
  montoText: {
    fontSize: 14,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  notas: {
    fontSize: 12,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 8,
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: '#07612d',
  },
  gastoActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  editButton: {
    flex: 1,
    backgroundColor: '#3B82F6',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
  fab: {
    position: 'absolute',
    bottom: 84,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#07612d',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  fabText: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#07612d',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  emptyButtonText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
});
```

---

## src/features/costs/screens/RegistrarGastoScreen.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Text,
  Platform,
  Modal,
  Pressable,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { NativeModules } from 'react-native';
import { CategoriaGasto, CATEGORIA_GASTO_LABELS, InsertGastoPayload } from '../../../types/Costos';

const { AgroBridgeModule, AnimalModule } = NativeModules;

interface AnimalBasico {
  id: number;
  arete: string;
  especie: string;
}

interface RegistrarGastoScreenProps {
  onBack: () => void;
  onSuccess: () => void;
  gastoId?: number; // Si se proporciona, es edici├│n
}

export function RegistrarGastoScreen({ onBack, onSuccess, gastoId }: RegistrarGastoScreenProps) {
  const [animalId, setAnimalId] = useState<number | null>(null);
  const [esGastoGeneral, setEsGastoGeneral] = useState(true);
  const [categoria, setCategoria] = useState<CategoriaGasto>(CategoriaGasto.ALIMENTACION);
  const [descripcion, setDescripcion] = useState('');
  const [monto, setMonto] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [notas, setNotas] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [animales, setAnimales] = useState<AnimalBasico[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAnimalPicker, setShowAnimalPicker] = useState(false);

  useEffect(() => {
    cargarAnimales();
  }, []);

  const cargarAnimales = async () => {
    try {
      const resultado = await AnimalModule.listAnimals();
      if (resultado && Array.isArray(resultado)) {
        setAnimales(resultado as AnimalBasico[]);
      }
    } catch (error) {
      console.error('Error cargando animales:', error);
    }
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (selectedDate) {
      setFecha(selectedDate);
    }
  };

  const formatoFecha = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const formatoMoneda = (value: string) => {
    return value.replace(/[^0-9.]/g, '');
  };

  const validarFormulario = (): boolean => {
    if (!categoria || !descripcion.trim() || !monto.trim() || !fecha) {
      Alert.alert('Error', 'Completa todos los campos obligatorios');
      return false;
    }

    const montoNum = parseFloat(monto);
    if (isNaN(montoNum) || montoNum <= 0) {
      Alert.alert('Error', 'El monto debe ser mayor a 0');
      return false;
    }

    if (!esGastoGeneral && !animalId) {
      Alert.alert('Error', 'Selecciona un animal para este gasto');
      return false;
    }

    return true;
  };

  const guardarGasto = async () => {
    if (!validarFormulario()) return;

    setLoading(true);
    try {
      const payload: InsertGastoPayload = {
        animalId: esGastoGeneral ? null : animalId,
        categoria,
        descripcion: descripcion.trim(),
        monto: parseFloat(monto),
        fecha: formatoFecha(fecha),
        notas: notas.trim() || null,
      };

      if (gastoId) {
        // Edici├│n
        await AgroBridgeModule.updateGasto({
          ...payload,
          id: gastoId,
        });
      } else {
        // Inserci├│n
        await AgroBridgeModule.registrarGasto(payload);
      }

      Alert.alert('├ëxito', gastoId ? 'Gasto actualizado' : 'Gasto registrado');
      onSuccess();
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Error al guardar el gasto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 90 }}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButtonWrap}>
          <Text style={styles.backButtonText}>ÔåÉ Volver</Text>
        </Pressable>
        <Text style={styles.title}>{gastoId ? 'Editar Gasto' : 'Registrar Gasto'}</Text>
      </View>

      {/* Toggle General / Por Animal */}
      <View style={styles.toggleContainer}>
        <TouchableOpacity
          style={[styles.toggleOption, esGastoGeneral && styles.toggleActive]}
          onPress={() => setEsGastoGeneral(true)}
        >
          <Text style={esGastoGeneral ? styles.toggleTextActive : styles.toggleText}>
            ­ƒôï Gasto General
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.toggleOption, !esGastoGeneral && styles.toggleActive]}
          onPress={() => setEsGastoGeneral(false)}
        >
          <Text style={!esGastoGeneral ? styles.toggleTextActive : styles.toggleText}>
            ­ƒÉä Por Animal
          </Text>
        </TouchableOpacity>
      </View>

      {/* Selector de Animal (si es por animal) */}
      {!esGastoGeneral && (
        <View style={styles.section}>
          <Text style={styles.label}>Animal *</Text>
          <TouchableOpacity
            style={styles.animalButton}
            onPress={() => setShowAnimalPicker(true)}
          >
            <Text style={styles.buttonText}>
              {animalId
                ? animales.find(a => a.id === animalId)?.arete || `Animal #${animalId}`
                : 'Seleccionar animal'}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Categor├¡a */}
      <View style={styles.section}>
        <Text style={styles.label}>Categor├¡a *</Text>
        <View style={styles.picker}>
          <Picker
            selectedValue={categoria}
            onValueChange={setCategoria}
          >
            {Object.values(CategoriaGasto).map(cat => (
              <Picker.Item
                key={cat}
                label={CATEGORIA_GASTO_LABELS[cat]}
                value={cat}
              />
            ))}
          </Picker>
        </View>
      </View>

      {/* Descripci├│n */}
      <View style={styles.section}>
        <Text style={styles.label}>Descripci├│n *</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej: Sacos de alimento balanceado"
          value={descripcion}
          onChangeText={setDescripcion}
          placeholderTextColor="#999"
        />
      </View>

      {/* Monto */}
      <View style={styles.section}>
        <Text style={styles.label}>Monto (MXN) *</Text>
        <View style={styles.montoContainer}>
          <Text style={styles.currencySymbol}>$</Text>
          <TextInput
            style={styles.inputMonto}
            placeholder="0.00"
            value={monto}
            onChangeText={(text) => setMonto(formatoMoneda(text))}
            keyboardType="decimal-pad"
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Fecha */}
      <View style={styles.section}>
        <Text style={styles.label}>Fecha *</Text>
        <TouchableOpacity
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateText}>{formatoFecha(fecha)}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={fecha}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
          />
        )}
      </View>

      {/* Notas */}
      <View style={styles.section}>
        <Text style={styles.label}>Notas (opcional)</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Observaciones o detalles adicionales"
          value={notas}
          onChangeText={setNotas}
          multiline
          numberOfLines={3}
          placeholderTextColor="#999"
        />
      </View>

      {/* Bot├│n Guardar */}
      <TouchableOpacity
        style={[styles.saveButton, loading && styles.saveButtonDisabled]}
        onPress={guardarGasto}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? 'ÔÅ│ Guardando...' : 'Ô£à Guardar'}
        </Text>
      </TouchableOpacity>

      {/* Modal de Animales */}
      <Modal
        visible={showAnimalPicker}
        transparent
        animationType="slide"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Seleccionar Animal</Text>
            <ScrollView>
              {animales.map(animal => (
                <TouchableOpacity
                  key={animal.id}
                  style={[
                    styles.animalOption,
                    animalId === animal.id && styles.animalOptionSelected,
                  ]}
                  onPress={() => {
                    setAnimalId(animal.id);
                    setShowAnimalPicker(false);
                  }}
                >
                  <Text style={styles.animalOptionText}>
                    {animal.arete} ÔÇö {animal.especie}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Pressable
              style={styles.modalCloseButton}
              onPress={() => setShowAnimalPicker(false)}
            >
              <Text style={styles.modalCloseText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButtonWrap: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: '#e8f5ec',
    marginRight: 12,
  },
  backButtonText: {
    fontSize: 14,
    color: '#07612d',
    fontFamily: 'Poppins-SemiBold',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    flex: 1,
  },
  toggleContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 12,
  },
  toggleOption: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleActive: {
    backgroundColor: '#07612d',
    borderColor: '#07612d',
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#666',
  },
  toggleTextActive: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: 'white',
  },
  section: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    overflow: 'hidden',
  },
  montoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  currencySymbol: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#07612d',
    marginRight: 8,
  },
  inputMonto: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1a1a1a',
  },
  dateButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
  },
  animalButton: {
    backgroundColor: 'white',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
    paddingVertical: 10,
    justifyContent: 'center',
  },
  buttonText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
  },
  saveButton: {
    backgroundColor: '#07612d',
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: 'center',
    marginVertical: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Poppins-Bold',
    color: 'white',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-Bold',
    color: '#1a1a1a',
    marginBottom: 16,
    textAlign: 'center',
  },
  animalOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  animalOptionSelected: {
    backgroundColor: '#f0f8f0',
  },
  animalOptionText: {
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    color: '#1a1a1a',
  },
  modalCloseButton: {
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    marginTop: 12,
    marginBottom: 24,
  },
  modalCloseText: {
    fontSize: 14,
    fontFamily: 'Poppins-SemiBold',
    color: '#07612d',
  },
});
```

---

## src/features/health/screens/HealthScreen.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import React, { useState, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View, ActivityIndicator, TextInput, Modal, ScrollView, FlatList } from 'react-native';

import CalendarioSanitario from '../../../screens/sanitarios/CalendarioSanitario';
import { RegistrarEventoSanitario } from '../../../screens/sanitarios/RegistrarEventoSanitario';
import { NotificationsScreen } from '../../../features/notifications/screens/NotificationsScreen';
import { RecomendacionesNutricionales } from '../../../screens/nutricion/RecomendacionesNutricionales';
import { obtenerEventosMes } from '../../../native/BridgeModule';
import { EventoSanitarioItem } from '../../../components/animales/EventoSanitarioItem';
import { EventoDetailModal } from '../../../components/EventoDetailModal';
import { COLORS, FONTS } from '../../../shared/theme/identity';

type HealthScreenProps = {
  onBack: () => void;
};

export function HealthScreen({ onBack }: HealthScreenProps) {
  const [view, setView] = useState<'lista' | 'registro' | 'nutricion'>('lista');
  const [eventsList, setEventsList] = useState<any[]>([]);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [filter, setFilter] = useState<'pendientes' | 'historial' | 'vacunas'>('pendientes');
  const [selectedAnimalForRegister, setSelectedAnimalForRegister] = useState<number | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showCalendarModal, setShowCalendarModal] = useState(false);
  const [showNotificationsModal, setShowNotificationsModal] = useState(false);
  const [detailEvento, setDetailEvento] = useState<any>(null);
  const [areteMap, setAreteMap] = useState<{ [key: number]: string }>({});

  const loadEvents = async (year?: number, month?: number) => {
    setEventsLoading(true);
    try {
      const y = year ?? new Date().getFullYear();
      const m = month ?? new Date().getMonth() + 1;
      const rows = await obtenerEventosMes(y, m);
      setEventsList(rows || []);

      // Extraer arete si viene en el evento, o mapear animalId -> arete
      const newAreteMap: { [key: number]: string } = {};
      rows?.forEach((e: any) => {
        if (e.arete) {
          newAreteMap[e.animalId] = e.arete;
        } else if (e.animalId) {
          newAreteMap[e.animalId] = `${e.animalId}`;
        }
      });
      setAreteMap(newAreteMap);
    } catch (e) {
      setEventsList([]);
    } finally {
      setEventsLoading(false);
    }
  };

  React.useEffect(() => {
    void loadEvents();
  }, []);

  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const filteredEvents = useMemo(() => {
    if (!eventsList || eventsList.length === 0) return [];

    let list = [...eventsList];

    if (filter === 'vacunas') {
      list = list.filter((e: any) => e.tipoEvento === 'VACUNA');
    } else if (filter === 'historial') {
      list = list.filter((e: any) => !!e.fechaEvento);
    } else {
      // pendientes
      list = list.filter((e: any) => !!e.fechaProximoEvento || !e.fechaEvento);
    }

    // B├║squeda
    if (searchText.trim()) {
      const query = searchText.toLowerCase();
      list = list.filter((e: any) => {
        const desc = (e.descripcion || '').toLowerCase();
        const tipo = (e.tipoEvento || '').toLowerCase();
        return desc.includes(query) || tipo.includes(query);
      });
    }

    // Ordenar
    if (filter === 'historial') {
      return list.sort((a: any, b: any) => (b.fechaEvento || '').localeCompare(a.fechaEvento || ''));
    }

    return list.sort((a: any, b: any) => {
      const aDate = a.fechaProximoEvento || a.fechaEvento || '';
      const bDate = b.fechaProximoEvento || b.fechaEvento || '';
      return aDate.localeCompare(bDate);
    });
  }, [eventsList, filter, searchText]);

  // Agrupar por fecha para Historial
  const groupedByDate = useMemo(() => {
    if (filter !== 'historial') return {};

    const groups: { [key: string]: any[] } = {};
    filteredEvents.forEach((e: any) => {
      const date = e.fechaEvento || 'Sin fecha';
      if (!groups[date]) groups[date] = [];
      groups[date].push(e);
    });
    return groups;
  }, [filteredEvents, filter]);

  if (view === 'nutricion') {
    return <RecomendacionesNutricionales onBack={() => setView('lista')} />;
  }

  if (view === 'registro') {
    return (
      <RegistrarEventoSanitario
        onBack={() => {
          setSelectedAnimalForRegister(null);
          setView('lista');
          void loadEvents();
        }}
        animalId={selectedAnimalForRegister ?? undefined}
      />
    );
  }

  // Lista principal
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>ÔåÉ Volver</Text>
        </Pressable>
        <Text style={styles.title}>Eventos Sanitarios</Text>
      </View>

      {/* SearchBox */}
      <View style={styles.searchWrap}>
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Buscar por tipo o descripci├│n..."
          placeholderTextColor="#999"
          style={styles.searchBox}
        />
      </View>

      {/* Filtros - Scroll horizontal */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsRowScroll}
        contentContainerStyle={styles.chipsRow}
      >
        <Pressable
          style={[styles.chip, filter === 'pendientes' && styles.chipActive]}
          onPress={() => setFilter('pendientes')}
        >
          <Text style={filter === 'pendientes' ? styles.chipTextActive : styles.chipText}>Pendientes</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, filter === 'historial' && styles.chipActive]}
          onPress={() => setFilter('historial')}
        >
          <Text style={filter === 'historial' ? styles.chipTextActive : styles.chipText}>Historial</Text>
        </Pressable>
        <Pressable
          style={[styles.chip, filter === 'vacunas' && styles.chipActive]}
          onPress={() => setFilter('vacunas')}
        >
          <Text style={filter === 'vacunas' ? styles.chipTextActive : styles.chipText}>Vacunas</Text>
        </Pressable>

        {/* Separador visual */}
        <View style={styles.chipSeparator} />

        {/* Botones secundarios a la derecha */}
        <Pressable style={styles.chipIcon} onPress={() => setShowCalendarModal(true)}>
          <Text style={styles.chipText}>­ƒôà Calendario</Text>
        </Pressable>
        <Pressable style={styles.chipIcon} onPress={() => setShowNotificationsModal(true)}>
          <Text style={styles.chipText}>­ƒöö Notificaciones</Text>
        </Pressable>
        <Pressable style={[styles.chipIcon, styles.chipNutricion]} onPress={() => setView('nutricion')}>
          <Text style={styles.chipNutricionText}>­ƒî┐ Nutrici├│n</Text>
        </Pressable>
      </ScrollView>

      {/* Lista */}
      {eventsLoading ? (
        <View style={{ padding: 16, alignItems: 'center' }}>
          <ActivityIndicator color={COLORS.primary} />
        </View>
      ) : filteredEvents.length === 0 ? (
        <View style={{ padding: 10, paddingHorizontal: 12 }}>
          <Text style={styles.emptyText}>
            {filter === 'historial' ? 'Sin historiales todav├¡a.' : 'No hay eventos.'}
          </Text>
        </View>
      ) : filter === 'historial' ? (
        // Historial: agrupado por fechas, sin botones
        <ScrollView style={[styles.listContainer, { paddingHorizontal: 12 }]} contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
          {Object.entries(groupedByDate).map(([date, eventos]) => (
            <View key={date}>
              <Text style={styles.dateGroupTitle}>{date}</Text>
              {(eventos as any[]).map((e: any) => (
                <Pressable
                  key={String(e.id)}
                  style={styles.historialItem}
                  onPress={() => setDetailEvento(e)}
                >
                  <Text style={styles.historialItemType}>{e.tipoEvento || 'Evento'}</Text>
                  <Text style={styles.historialItemDesc}>{e.descripcion || 'Sin descripci├│n'}</Text>
                </Pressable>
              ))}
            </View>
          ))}
        </ScrollView>
      ) : (
        // Pendientes y Vacunas: con botones
        <ScrollView style={[styles.listContainer, { paddingHorizontal: 12 }]} contentContainerStyle={{ paddingBottom: 160 }} showsVerticalScrollIndicator={false}>
          {filteredEvents.map((item: any) => {
            const fechaProx = item.fechaProximoEvento ? new Date(item.fechaProximoEvento + 'T00:00:00') : null;
            const isVencido = fechaProx ? fechaProx.getTime() < today.getTime() : false;
            const isPendiente = !!item.fechaProximoEvento;

            const primaryLabel = isVencido ? 'Aplicar' : isPendiente ? 'Revisar' : undefined;

            return (
              <EventoSanitarioItem
                key={String(item.id)}
                evento={item}
                primaryLabel={primaryLabel}
                onPrimaryAction={() => {
                  if (primaryLabel === 'Revisar') {
                    setDetailEvento(item);
                  } else {
                    setSelectedAnimalForRegister(item.animalId ?? null);
                    setView('registro');
                  }
                }}
                onOpenDetail={() => setDetailEvento(item)}
              />
            );
          })}
        </ScrollView>
      )}

      {/* FAB */}
      <Pressable style={styles.fab} onPress={() => setView('registro')}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* Calendar Modal */}
      <Modal
        visible={showCalendarModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCalendarModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Calendario Sanitario</Text>
            <Pressable onPress={() => setShowCalendarModal(false)} style={styles.closeModalBtn}>
              <Text style={styles.closeModalBtnText}>Ô£ò</Text>
            </Pressable>
          </View>
          <CalendarioSanitario />
        </View>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        visible={showNotificationsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowNotificationsModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notificaciones</Text>
            <Pressable onPress={() => setShowNotificationsModal(false)} style={styles.closeModalBtn}>
              <Text style={styles.closeModalBtnText}>Ô£ò</Text>
            </Pressable>
          </View>
          <NotificationsScreen onBack={() => setShowNotificationsModal(false)} />
        </View>
      </Modal>

      {/* Evento Detail Modal */}
      <EventoDetailModal
        visible={!!detailEvento}
        evento={detailEvento}
        onClose={() => setDetailEvento(null)}
        onEdit={(e) => {
          setDetailEvento(null);
          setSelectedAnimalForRegister(e.animalId ?? null);
          setView('registro');
        }}
        arete={detailEvento ? (detailEvento.arete || areteMap[detailEvento.animalId] || String(detailEvento.animalId)) : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    gap: 8,
  },
  backButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: FONTS.bold,
  },
  title: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    fontSize: 15,
    flex: 1,
    marginLeft: 8,
  },
  listContainer: {
    flex: 1,
    paddingVertical: 4,
  },
  searchWrap: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  searchBox: {
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: '#eee',
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  chipsRowScroll: {
    paddingHorizontal: 8,
    paddingBottom: 6,
    paddingTop: 6,
    flexGrow: 0,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
    paddingRight: 8,
  },
  chipSeparator: {
    width: 6,
    height: 1,
    backgroundColor: 'transparent',
  },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f2f2f2',
  },
  chipActive: {
    backgroundColor: COLORS.primary,
  },
  chipText: {
    color: '#666',
    fontFamily: FONTS.semiBold,
    fontSize: 9.5,
  },
  chipTextActive: {
    color: '#fff',
    fontFamily: FONTS.semiBold,
    fontSize: 9.5,
  },
  chipIcon: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e6e6e6',
  },
  chipNutricion: {
    backgroundColor: '#e8f5ec',
    borderColor: '#07612d',
  },
  chipNutricionText: {
    color: '#07612d',
    fontFamily: FONTS.semiBold,
    fontSize: 9.5,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    marginTop: 8,
    marginBottom: 6,
    marginHorizontal: 12,
    fontSize: 12,
  },
  emptyText: {
    color: '#777',
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginHorizontal: 12,
  },
  dateGroupTitle: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.primary,
    marginTop: 10,
    marginBottom: 6,
  },
  historialItem: {
    backgroundColor: '#f9f9f9',
    borderRadius: 6,
    padding: 8,
    marginBottom: 5,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.primary,
  },
  historialItemType: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: '#333',
  },
  historialItemDesc: {
    fontFamily: FONTS.regular,
    fontSize: 10,
    color: '#666',
    marginTop: 2,
  },
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
  fabText: {
    color: '#fff',
    fontSize: 24,
    fontFamily: FONTS.bold,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: 12,
    paddingBottom: 12,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    color: '#fff',
    fontFamily: FONTS.bold,
    fontSize: 16,
    flex: 1,
  },
  closeModalBtn: {
    padding: 8,
  },
  closeModalBtnText: {
    color: '#fff',
    fontSize: 20,
  },
});
```

---

## src/features/home/components/ModuleCard.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

```typescript
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  NativeModules,
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

const { AnimalModule, AgroBridgeModule } = NativeModules;

const NAV_BAR_HEIGHT = 64; // altura aprox de la barra persistente en AppNavigator

type HomeScreenProps = {
  onOpenModule: (target: HomeModuleRoute) => void;
};

interface DashboardStats {
  inventarioTotal: number;
  activos: number;
  vendidos: number;
  fallecidos: number;
  vacunasPr├│ximas: number;
  tareasCount: number;
}

interface TareaItem {
  id: number;
  tipoEvento: string;
  descripcion: string;
  fechaProximoEvento: string;
  animalId: number;
  arete?: string;
  diasRestantes: number;
}

function diasHasta(fechaStr: string): number {
  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);
  const fecha = new Date(fechaStr + 'T00:00:00');
  return Math.ceil((fecha.getTime() - hoy.getTime()) / 86400000);
}

function labelDias(dias: number): string {
  if (dias < 0) return `Vencida hace ${Math.abs(dias)} d├¡a${Math.abs(dias) !== 1 ? 's' : ''}`;
  if (dias === 0) return 'Hoy';
  if (dias === 1) return 'Ma├▒ana';
  return `En ${dias} d├¡as`;
}

function colorDias(dias: number): string {
  if (dias < 0) return '#D32F2F';
  if (dias <= 1) return '#f4a000';
  if (dias <= 7) return '#f4a000';
  return '#7f916f';
}

const TIPO_ICON: Record<string, string> = {
  VACUNA: '­ƒÆë',
  DESPARASITACION: '­ƒÆè',
  ENFERMEDAD: '­ƒ®║',
  CIRUGIA: '­ƒö¬',
  OTRO: '­ƒº¬',
};

export function HomeScreen({ onOpenModule }: HomeScreenProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const headerBodyHeight = isCompact ? 64 : 72;
  const headerHeight = headerBodyHeight + insets.top;

  const [stats, setStats] = useState<DashboardStats>({
    inventarioTotal: 0,
    activos: 0,
    vendidos: 0,
    fallecidos: 0,
    vacunasPr├│ximas: 0,
    tareasCount: 0,
  });
  const [tareas, setTareas] = useState<TareaItem[]>([]);
  const [loading, setLoading] = useState(true);

  const cargarDatos = useCallback(async () => {
    setLoading(true);
    try {
      // Inventario de animales
      const animales: any[] = (await AnimalModule.listAnimals()) ?? [];
      const activos = animales.filter((a: any) => a.estado === 'ACTIVO').length;
      const vendidos = animales.filter((a: any) => a.estado === 'VENDIDO').length;
      const fallecidos = animales.filter((a: any) => a.estado === 'FALLECIDO').length;

      // Mapa arete por animalId
      const areteMap: Record<number, string> = {};
      animales.forEach((a: any) => { areteMap[a.id] = a.arete; });

      // Eventos del mes actual + pr├│ximo mes para capturar eventos futuros cercanos
      const hoy = new Date();
      const [eventos1, eventos2] = await Promise.all([
        AgroBridgeModule.getEventosMes(hoy.getFullYear(), hoy.getMonth() + 1),
        AgroBridgeModule.getEventosMes(
          hoy.getMonth() === 11 ? hoy.getFullYear() + 1 : hoy.getFullYear(),
          hoy.getMonth() === 11 ? 1 : hoy.getMonth() + 2
        ),
      ]);

      const todosEventos: any[] = [...(eventos1 ?? []), ...(eventos2 ?? [])];

      // Filtrar solo los que tienen fecha pr├│xima (pendientes)
      const hoy0 = new Date();
      hoy0.setHours(0, 0, 0, 0);

      const eventosConProxima = todosEventos
        .filter((e: any) => e.fechaProximoEvento && e.fechaProximoEvento.trim() !== '')
        .map((e: any) => ({
          id: e.id,
          tipoEvento: e.tipoEvento ?? 'OTRO',
          descripcion: e.descripcion ?? '',
          fechaProximoEvento: e.fechaProximoEvento,
          animalId: e.animalId,
          arete: areteMap[e.animalId] ?? String(e.animalId),
          diasRestantes: diasHasta(e.fechaProximoEvento),
        }))
        // Eliminar duplicados por id
        .filter((e, idx, arr) => arr.findIndex(x => x.id === e.id) === idx)
        // Solo los que vencen en los pr├│ximos 30 d├¡as o ya vencidos
        .filter(e => e.diasRestantes <= 30)
        .sort((a, b) => a.diasRestantes - b.diasRestantes);

      const pr├│ximas = eventosConProxima.filter(e => e.diasRestantes <= 30).length;

      setStats({
        inventarioTotal: animales.length,
        activos,
        vendidos,
        fallecidos,
        vacunasPr├│ximas: pr├│ximas,
        tareasCount: pr├│ximas,
      });
      setTareas(eventosConProxima.slice(0, 5));
    } catch (err) {
      // Sin datos de BD, muestra 0s
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void cargarDatos();
  }, [cargarDatos]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      {/* Header fijo */}
      <View
        style={[
          styles.headerCard,
          isCompact && styles.headerCardCompact,
          { paddingTop: insets.top, minHeight: headerHeight },
        ]}
      >
        <View>
          <Text style={[styles.greeting, isCompact && styles.greetingCompact]}>Hola, Productor</Text>
          <Text style={styles.bienvenida}>Bienvenido a tu rancho digital</Text>
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
            paddingBottom: NAV_BAR_HEIGHT + 24,
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Cargando datos...</Text>
          </View>
        ) : (
          <>
            {/* Stats Row */}
            <View style={styles.statsRow}>
              <Pressable
                style={[styles.statCard, styles.statCardGreen]}
                onPress={() => onOpenModule('animals')}
              >
                <Text style={styles.statTitle}>Inventario Total</Text>
                <Text style={[styles.statValue, isCompact && styles.statValueCompact]}>
                  {stats.inventarioTotal}
                </Text>
                <Text style={styles.statCaption}>cabezas</Text>
                <View style={styles.statDetail}>
                  <Text style={styles.statDetailText}>Activos: {stats.activos}</Text>
                  <Text style={styles.statDetailText}>Vendidos: {stats.vendidos}</Text>
                </View>
                <View style={styles.statIconBadge}>
                  <Text style={styles.statIconText}>­ƒÉä</Text>
                </View>
              </Pressable>

              <Pressable
                style={[styles.statCard, styles.statCardOrange]}
                onPress={() => onOpenModule('health')}
              >
                <Text style={styles.statTitle}>Vacunas / Eventos</Text>
                <Text style={[styles.statValueOrange, isCompact && styles.statValueCompact]}>
                  {stats.vacunasPr├│ximas}
                </Text>
                <Text style={styles.statCaption}>pr├│ximos 30 d├¡as</Text>
                <View style={styles.statDetail}>
                  <Text style={styles.statDetailText}>
                    {stats.vacunasPr├│ximas === 0 ? 'Sin pendientes' : 'Pendientes'}
                  </Text>
                </View>
                <View style={styles.statIconBadgeWarning}>
                  <Text style={styles.statIconText}>ÔÜá´©Å</Text>
                </View>
              </Pressable>
            </View>

            {/* Pr├│ximas Tareas */}
            <View style={styles.tasksHeaderRow}>
              <Text style={[styles.sectionTitle, isCompact && styles.sectionTitleCompact]}>
                Pr├│ximas Tareas
              </Text>
              {stats.tareasCount > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{stats.tareasCount}</Text>
                </View>
              )}
              <Pressable onPress={() => onOpenModule('health')}>
                <Text style={styles.seeAll}>Ver todo</Text>
              </Pressable>
            </View>

            {tareas.length === 0 ? (
              <View style={styles.emptyTareas}>
                <Text style={styles.emptyIcon}>Ô£à</Text>
                <Text style={styles.emptyTitle}>Sin tareas pendientes</Text>
                <Text style={styles.emptySubtitle}>No hay eventos sanitarios pr├│ximos</Text>
              </View>
            ) : (
              tareas.map(tarea => (
                <Pressable
                  key={tarea.id}
                  style={styles.taskCard}
                  onPress={() => onOpenModule('health')}
                >
                  <View
                    style={[
                      styles.taskAccent,
                      { backgroundColor: colorDias(tarea.diasRestantes) },
                    ]}
                  />
                  <View style={styles.taskIconWrap}>
                    <Text style={styles.taskIcon}>
                      {TIPO_ICON[tarea.tipoEvento] ?? '­ƒº¬'}
                    </Text>
                  </View>
                  <View style={styles.taskBody}>
                    <Text style={styles.taskTitle}>
                      {tarea.tipoEvento.charAt(0) + tarea.tipoEvento.slice(1).toLowerCase()}
                    </Text>
                    <Text style={styles.taskSubtitle} numberOfLines={1}>
                      {tarea.descripcion || 'Sin descripci├│n'} ┬À #{tarea.arete}
                    </Text>
                    <Text
                      style={[styles.taskDue, { color: colorDias(tarea.diasRestantes) }]}
                    >
                      {labelDias(tarea.diasRestantes)}
                    </Text>
                  </View>
                </Pressable>
              ))
            )}
          </>
        )}
      </ScrollView>
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
  loadingWrap: {
    paddingTop: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    color: COLORS.gray,
    fontFamily: FONTS.regular,
    fontSize: 13,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.listBackground,
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 12,
    minHeight: 128,
    borderLeftWidth: 4,
  },
  statCardGreen: { borderLeftColor: '#228f56' },
  statCardOrange: { borderLeftColor: '#f4a000' },
  statTitle: {
    color: COLORS.gray,
    fontSize: 11,
    fontFamily: FONTS.semiBold,
  },
  statValue: {
    marginTop: 4,
    color: COLORS.black,
    fontSize: 40,
    fontFamily: FONTS.bold,
    lineHeight: 44,
  },
  statValueCompact: {
    fontSize: 34,
    lineHeight: 38,
  },
  statValueOrange: {
    marginTop: 4,
    color: COLORS.warning,
    fontSize: 40,
    fontFamily: FONTS.bold,
    lineHeight: 44,
  },
  statCaption: {
    color: COLORS.gray,
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  statDetail: {
    marginTop: 6,
    gap: 2,
  },
  statDetailText: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  statIconBadge: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 30,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#e6f2ec',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconBadgeWarning: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 30,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff2df',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconText: { fontSize: 13 },
  sectionTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  sectionTitleCompact: { fontSize: 17 },
  tasksHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  countBadge: {
    backgroundColor: '#f4a000',
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countBadgeText: {
    color: 'white',
    fontSize: 11,
    fontFamily: FONTS.bold,
  },
  seeAll: {
    marginLeft: 'auto',
    color: COLORS.primary,
    fontSize: 13,
    fontFamily: FONTS.semiBold,
  },
  emptyTareas: {
    alignItems: 'center',
    paddingVertical: 32,
    backgroundColor: COLORS.listBackground,
    borderRadius: 14,
    gap: 6,
  },
  emptyIcon: { fontSize: 36 },
  emptyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 15,
    color: COLORS.black,
  },
  emptySubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.gray,
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1ebd7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
    marginVertical: 12,
  },
  taskIcon: { fontSize: 17 },
  taskBody: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 10,
  },
  taskTitle: {
    color: COLORS.black,
    fontSize: 14,
    fontFamily: FONTS.semiBold,
  },
  taskSubtitle: {
    marginTop: 1,
    color: COLORS.gray,
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  taskDue: {
    marginTop: 3,
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
});
```

---

## src/features/home/types/homeNavigation.ts

**Estado:** Modificado

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

```typescript
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  SectionList,
  Switch,
  ToastAndroid,
  Platform,
} from 'react-native';

import { useCalendarioSanitario } from '../../../hooks/useCalendarioSanitario';
import type { EventoSanitarioModel } from '../../../types/Sanitario';
import { COLORS, FONTS } from '../../../shared/theme/identity';
import {
  cancelarNotificacionesEventos,
  getNotificationsEnabled,
  reprogramarNotificacionesEventos,
  setNotificationsEnabled,
  programarNotificacionEvento,
  checkNotificationPermission,
  openAppSettings,
} from '../../../shared/services/notificacionSanitaria';

type NotificationsScreenProps = {
  onBack: () => void;
};

export function NotificationsScreen({ onBack }: NotificationsScreenProps) {
  const today = new Date();
  const [filter, setFilter] = useState<'todas' | 'noLeidas' | 'ajustes'>('todas');
  const [selectedItem, setSelectedItem] = useState<NotificationItem | null>(null);
  const [alertsEnabled, setAlertsEnabledState] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [syncingAlerts, setSyncingAlerts] = useState(false);
  const { eventsByDate } = useCalendarioSanitario(today.getFullYear(), today.getMonth() + 1);

  const uniqueEventos = useMemo(() => {
    const values = Object.values(eventsByDate).flat();
    return Array.from(new Map(values.map(evento => [evento.id, evento])).values());
  }, [eventsByDate]);

  React.useEffect(() => {
    void getNotificationsEnabled().then(setAlertsEnabledState).catch(() => {
      setAlertsEnabledState(true);
    });
    void checkNotificationPermission().then(granted => setPermissionGranted(granted)).catch(() => setPermissionGranted(false));
  }, []);

  const notifications = useMemo(() => {
    const entries = Object.entries(eventsByDate).flatMap(([dateKey, eventos]) =>
      eventos.map(evento => buildNotificationFromEvent(evento, dateKey, today)),
    );

    const grouped = entries.sort((a, b) => b.priority - a.priority);
    return grouped;
  }, [eventsByDate, today]);

  const todayItems = notifications.filter(item => item.group === 'Hoy');
  const olderItems = notifications.filter(item => item.group === 'Anteriores');
  const futureItems = notifications.filter(item => item.group === 'Pr├│ximas');
  const sections = useMemo(
    () => [
      { title: 'Hoy', data: todayItems },
      { title: 'Pr├│ximas', data: futureItems },
      { title: 'Anteriores', data: olderItems },
    ],
    [futureItems, olderItems, todayItems],
  );
  const visibleSections = useMemo(
    () => sections.filter(section => section.data.length > 0),
    [sections],
  );

  if (selectedItem) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

        <View style={styles.header}>
          <Pressable onPress={() => setSelectedItem(null)} style={styles.backButton}>
            <Text style={styles.backButtonText}>ÔåÉ</Text>
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={styles.title}>Detalle</Text>
            <Text style={styles.subtitle}>Notificaci├│n sanitaria</Text>
          </View>
        </View>

        <View style={styles.detailContainer}>
          <View style={[styles.detailAccent, { backgroundColor: selectedItem.accent }]} />
          <View style={styles.detailCard}>
            <View style={[styles.iconCircle, { backgroundColor: `${selectedItem.accent}22` }]}>
              <Text style={styles.iconText}>{selectedItem.icon}</Text>
            </View>

            <Text style={styles.detailTitle}>{selectedItem.title}</Text>
            <Text style={styles.detailSubtitle}>{selectedItem.subtitle}</Text>
            <Text style={styles.detailMeta}>{selectedItem.meta}</Text>

            <View style={styles.detailInfoBox}>
              <Text style={styles.detailInfoLabel}>Grupo</Text>
              <Text style={styles.detailInfoValue}>{selectedItem.group}</Text>
              <Text style={styles.detailInfoLabel}>Fecha</Text>
              <Text style={styles.detailInfoValue}>{formatDateLong(selectedItem.dateKey)} ┬À {relativeDateLabel(selectedItem.dateKey)}</Text>
              <Text style={styles.detailInfoLabel}>Estado</Text>
              <Text style={styles.detailInfoValue}>{selectedItem.unread ? 'Pendiente' : 'Le├¡da'}</Text>
            </View>

            <Pressable style={styles.detailAction} onPress={() => setSelectedItem(null)}>
              <Text style={styles.detailActionText}>Volver al listado</Text>
            </Pressable>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const openBatterySettings = async () => {
    try {
      await Linking.openSettings();
    } catch {
      Alert.alert('Ajustes', 'No se pudieron abrir los ajustes del sistema.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>ÔåÉ</Text>
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.title}>Notificaciones</Text>
          <Text style={styles.subtitle}>Alertas locales offline</Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.summaryCard}>
          <SummaryPill label="Hoy" value={todayItems.length} tone="red" />
          <SummaryPill label="Pr├│ximas" value={futureItems.length} tone="amber" />
          <SummaryPill label="Anteriores" value={olderItems.length} tone="green" />
        </View>

        <View style={styles.tabsRow}>
          <TabButton label="Todas" active={filter === 'todas'} onPress={() => setFilter('todas')} />
          <TabButton label="No le├¡das" active={filter === 'noLeidas'} onPress={() => setFilter('noLeidas')} />
          <TabButton label="Ajustes" active={filter === 'ajustes'} onPress={() => setFilter('ajustes')} />
        </View>

        {filter === 'ajustes' ? (
          <View style={styles.settingsPanel}>
            <Text style={styles.settingsPanelTitle}>Ajustes de alertas locales</Text>
            <Text style={styles.settingsPanelSubtitle}>Gestiona permisos y comportamiento del canal sanitario.</Text>

            <View style={styles.toggleRow}>
              <View style={styles.toggleRowTextWrap}>
                <Text style={styles.toggleRowTitle}>Alertas activas</Text>
                <Text style={styles.toggleRowText}>
                  {alertsEnabled ? 'Las notificaciones se programan normalmente.' : 'No se programar├ín nuevas alertas.'}
                </Text>
              </View>
              <Switch
                value={alertsEnabled}
                onValueChange={async value => {
                  setAlertsEnabledState(value);
                  await setNotificationsEnabled(value);
                }}
                trackColor={{ false: '#d7d7d7', true: COLORS.primary }}
                thumbColor="#ffffff"
              />
            </View>

              <Pressable
                style={[styles.syncButton, syncingAlerts && styles.syncButtonDisabled]}
                disabled={syncingAlerts}
                onPress={async () => {
                  try {
                    setSyncingAlerts(true);
                    const result = await reprogramarNotificacionesEventos(uniqueEventos);
                    Alert.alert('Listo', `Se reprogramaron ${result.programadas} eventos del mes.`);
                  } catch {
                    Alert.alert('Error', 'No se pudieron reprogramar las alertas.');
                  } finally {
                    setSyncingAlerts(false);
                  }
                }}
              >
                <Text style={styles.syncButtonText}>{syncingAlerts ? 'Reprogramando...' : 'Reprogramar mes visible'}</Text>
              </Pressable>

              <Pressable
                style={[styles.cancelButton, syncingAlerts && styles.syncButtonDisabled]}
                disabled={syncingAlerts}
                onPress={async () => {
                  try {
                    setSyncingAlerts(true);
                    const result = await cancelarNotificacionesEventos(uniqueEventos);
                    Alert.alert('Listo', `Se cancelaron ${result.canceladas} eventos del mes.`);
                  } catch {
                    Alert.alert('Error', 'No se pudieron cancelar las alertas.');
                  } finally {
                    setSyncingAlerts(false);
                  }
                }}
              >
                <Text style={styles.cancelButtonText}>{syncingAlerts ? 'Cancelando...' : 'Cancelar mes visible'}</Text>
              </Pressable>

            <SettingsRow
              icon="­ƒöö"
              title="Permisos de notificaci├│n"
              text={
                permissionGranted == null
                  ? 'Comprobando permiso...'
                  : permissionGranted
                    ? 'Permiso concedido'
                    : 'Permiso denegado - abrir ajustes'
              }
              onPress={async () => {
                if (Platform.OS === 'android' && Platform.Version >= 33 && permissionGranted === false) {
                  await openAppSettings();
                  return;
                }

                await openAppSettings();
              }}
            />
            <SettingsRow
              icon="­ƒöï"
              title="Bater├¡a y segundo plano"
              text="Permitir ejecuci├│n en segundo plano y exclusiones de ahorro"
              onPress={openBatterySettings}
            />
            <SettingsRow
              icon="ÔÅ░"
              title="Canal sanitario"
              text="Notificaciones de vacunas, desparasitaci├│n y enfermedad"
              onPress={openBatterySettings}
            />
          </View>
        ) : (
          <SectionList
            sections={filter === 'noLeidas' ? [{ title: 'Hoy', data: todayItems }] : visibleSections}
            keyExtractor={item => String(item.id)}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => <NotificationCard item={item} onPress={() => setSelectedItem(item)} />}
            renderSectionHeader={({ section }) => <SectionHeader title={section.title} count={section.data.length} />}
            ListEmptyComponent={<EmptyMessage text="No hay notificaciones registradas." />}
            ListFooterComponent={<SettingsShortcut onPress={openBatterySettings} />}
            stickySectionHeadersEnabled={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

type NotificationItem = {
  id: string;
  title: string;
  subtitle: string;
  meta: string;
  group: 'Hoy' | 'Pr├│ximas' | 'Anteriores';
  accent: string;
  unread?: boolean;
  icon: string;
  priority: number;
  dateKey: string;
  evento?: EventoSanitarioModel;
};

const getAnimalLabel = (evento: EventoSanitarioModel) => {
  const nombre = evento.descripcion?.trim() || evento.tipoEvento;
  return `Animal: ${nombre} (arete: ${evento.animalId})`;
};

const buildNotificationFromEvent = (
  evento: EventoSanitarioModel,
  dateKey: string,
  today: Date,
): NotificationItem => {
  const eventDate = new Date(`${dateKey}T00:00:00`);
  const diffDays = Math.round((eventDate.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / 86400000);
  const isToday = diffDays === 0;
  const isFuture = diffDays > 0;
  const type = String(evento.tipoEvento);
  const baseTitle = eventLabelByType(type, evento);
  const subtitle = getAnimalLabel(evento);

  return {
    id: `${evento.id}-${dateKey}`,
    title: isToday ? `${baseTitle} Vence Hoy` : isFuture ? `${baseTitle} Pr├│xima` : `${baseTitle} Anterior`,
    subtitle,
    meta: isToday
      ? `Hoy ┬À ${formatClock(selectedTimeFor(evento))} ┬À Toca para ver detalle`
      : isFuture
        ? `Programado para ${relativeDateLabel(dateKey)} a las ${formatClock(selectedTimeFor(evento))}`
        : `${relativeDateLabel(dateKey)} ┬À ${formatDateLong(dateKey)}`,
    group: isToday ? 'Hoy' : isFuture ? 'Pr├│ximas' : 'Anteriores',
    accent: accentByType(type),
    unread: isToday,
    icon: iconByType(type),
    priority: isToday ? 100 : isFuture ? 50 : 10,
    dateKey,
    evento,
  };
};

const eventLabelByType = (type: string, evento: EventoSanitarioModel) => {
  const description = evento.descripcion?.trim();
  if (description) {
    return description;
  }

  switch (type) {
    case 'VACUNA':
      return 'Vacuna';
    case 'DESPARASITACION':
      return 'Desparasitaci├│n';
    case 'ENFERMEDAD':
      return 'Tratamiento';
    case 'CIRUGIA':
      return 'Cirug├¡a';
    default:
      return 'Evento';
  }
};

const accentByType = (type: string) => {
  switch (type) {
    case 'VACUNA':
      return '#e53935';
    case 'DESPARASITACION':
      return '#FFA000';
    case 'ENFERMEDAD':
      return '#2e7d32';
    case 'CIRUGIA':
      return '#2e7d32';
    default:
      return '#c6c6c6';
  }
};

const iconByType = (type: string) => {
  switch (type) {
    case 'VACUNA':
      return '­ƒÆë';
    case 'DESPARASITACION':
      return '­ƒÆè';
    case 'ENFERMEDAD':
      return '­ƒ®║';
    case 'CIRUGIA':
      return 'Ô£à';
    default:
      return 'ÔÇó';
  }
};

const formatMetaDay = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
};

const formatDateLong = (dateKey: string) => {
  const date = new Date(`${dateKey}T00:00:00`);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

const relativeDateLabel = (dateKey: string) => {
  const date = new Date(`${dateKey}T00:00:00`);
  const today = new Date();
  const todayNormalized = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const targetNormalized = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diffDays = Math.round((targetNormalized.getTime() - todayNormalized.getTime()) / 86400000);

  if (diffDays === 0) {
    return 'Hoy';
  }
  if (diffDays === 1) {
    return 'Ma├▒ana';
  }
  if (diffDays === -1) {
    return 'Ayer';
  }

  if (diffDays > 1) {
    return `En ${diffDays} d├¡as`;
  }

  return `Hace ${Math.abs(diffDays)} d├¡as`;
};

const selectedTimeFor = (evento: EventoSanitarioModel) => {
  return evento.fechaProximoEvento ? '08:00' : '09:00';
};

const formatClock = (time: string) => time;

function TabButton({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable style={[styles.tab, active && styles.tabActive]} onPress={onPress}>
      <Text style={[styles.tabText, active && styles.tabTextActive]}>{label}</Text>
    </Pressable>
  );
}

function SectionTitle({ title }: { title: string }) {
  return <Text style={styles.sectionTitle}>{title}</Text>;
}

function SectionHeader({ title, count }: { title: string; count: number }) {
  return (
    <View style={styles.sectionHeaderWrap}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionCount}>{count}</Text>
    </View>
  );
}

function SummaryPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: 'red' | 'amber' | 'green';
}) {
  return (
    <View style={[styles.summaryPill, tone === 'red' && styles.summaryPillRed, tone === 'amber' && styles.summaryPillAmber, tone === 'green' && styles.summaryPillGreen]}>
      <Text style={styles.summaryPillValue}>{value}</Text>
      <Text style={styles.summaryPillLabel}>{label}</Text>
    </View>
  );
}

function EmptyMessage({ text }: { text: string }) {
  return <Text style={styles.emptyText}>{text}</Text>;
}

function SectionDivider() {
  return <View style={styles.sectionDivider} />;
}

function NotificationCard({ item, onPress }: { item: NotificationItem; onPress: () => void }) {
  const handleReprogram = async () => {
    if (!item.evento) {
      Alert.alert('Error', 'Evento no disponible para reprogramar.');
      return;
    }

    try {
      await programarNotificacionEvento(item.evento);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Notificaci├│n reprogramada', ToastAndroid.SHORT);
      } else {
        Alert.alert('Listo', 'Notificaci├│n reprogramada.');
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo reprogramar la notificaci├│n.');
    }
  };

  const handleCancel = async () => {
    if (!item.evento) {
      Alert.alert('Error', 'Evento no disponible para cancelar.');
      return;
    }

    try {
      await cancelarNotificacionesEventos([item.evento]);
      if (Platform.OS === 'android') {
        ToastAndroid.show('Notificaci├│n cancelada', ToastAndroid.SHORT);
      } else {
        Alert.alert('Listo', 'Notificaci├│n cancelada.');
      }
    } catch {
      Alert.alert('Error', 'No se pudo cancelar la notificaci├│n.');
    }
  };

  return (
    <View style={styles.cardWrap}>
      <View style={[styles.accentBar, { backgroundColor: item.accent }]} />
      <View style={styles.card}>
        <Pressable style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }} onPress={onPress}>
          <View style={[styles.iconCircle, { backgroundColor: `${item.accent}22` }]}>
            <Text style={styles.iconText}>{item.icon}</Text>
          </View>

          <View style={styles.cardBody}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardSubtitle}>{item.subtitle}</Text>
            <Text style={styles.cardMeta}>{item.meta}</Text>
          </View>
        </Pressable>

        <View style={styles.cardActions}>
          <Pressable style={styles.cardActionButton} onPress={handleReprogram}>
            <Text style={styles.cardActionText}>Reprogramar</Text>
          </Pressable>
          <Pressable style={styles.cardActionOutline} onPress={handleCancel}>
            <Text style={styles.cardActionOutlineText}>Cancelar</Text>
          </Pressable>
        </View>

        {item.unread ? <View style={styles.unreadDot} /> : null}
      </View>
    </View>
  );
}

function SettingsShortcut({ onPress }: { onPress: () => void }) {
  return (
    <Pressable style={styles.settingsShortcut} onPress={onPress}>
      <Text style={styles.settingsShortcutIcon}>ÔÜÖ´©Å</Text>
      <View style={styles.settingsShortcutBody}>
        <Text style={styles.settingsShortcutTitle}>Ajustes de alertas locales</Text>
        <Text style={styles.settingsShortcutText}>Verificar permisos de bater├¡a y fondo</Text>
      </View>
    </Pressable>
  );
}

function SettingsRow({
  icon,
  title,
  text,
  onPress,
}: {
  icon: string;
  title: string;
  text: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.settingsRow} onPress={onPress}>
      <View style={styles.settingsRowIconWrap}>
        <Text style={styles.settingsRowIcon}>{icon}</Text>
      </View>
      <View style={styles.settingsRowBody}>
        <Text style={styles.settingsRowTitle}>{title}</Text>
        <Text style={styles.settingsRowText}>{text}</Text>
      </View>
      <Text style={styles.settingsRowChevron}>ÔÇ║</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f4f4f4',
  },
  header: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.16)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: FONTS.bold,
  },
  headerTextWrap: {
    flex: 1,
  },
  title: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: FONTS.bold,
  },
  subtitle: {
    marginTop: 2,
    color: '#d3e7d8',
    fontSize: 12,
    fontFamily: FONTS.regular,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  summaryCard: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
  },
  summaryPill: {
    flex: 1,
    borderRadius: 14,
    backgroundColor: '#ffffff',
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#ececec',
  },
  summaryPillRed: {
    borderColor: '#f0c7c7',
    backgroundColor: '#fff7f7',
  },
  summaryPillAmber: {
    borderColor: '#f2ddb4',
    backgroundColor: '#fffaf1',
  },
  summaryPillGreen: {
    borderColor: '#cae8d4',
    backgroundColor: '#f7fff8',
  },
  summaryPillValue: {
    color: '#222222',
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  summaryPillLabel: {
    marginTop: 2,
    color: '#8b8b8b',
    fontFamily: FONTS.semiBold,
    fontSize: 11,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  tab: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    backgroundColor: '#ffffff',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  tabActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  tabText: {
    color: '#808080',
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  tabTextActive: {
    color: '#ffffff',
  },
  sectionTitle: {
    fontSize: 18,
    color: '#222222',
    fontFamily: FONTS.bold,
  },
  sectionDivider: {
    height: 10,
  },
  sectionHeaderWrap: {
    marginTop: 8,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionCount: {
    minWidth: 24,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: '#eaf2ea',
    color: '#23603a',
    textAlign: 'center',
    fontFamily: FONTS.bold,
    fontSize: 11,
  },
  emptyText: {
    color: '#888888',
    fontFamily: FONTS.regular,
    marginBottom: 10,
  },
  cardWrap: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderRadius: 14,
    overflow: 'hidden',
    marginBottom: 10,
    minHeight: 82,
  },
  accentBar: {
    width: 4,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  iconText: {
    fontSize: 18,
  },
  cardBody: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 15,
    color: '#222222',
    fontFamily: FONTS.bold,
  },
  cardSubtitle: {
    marginTop: 2,
    color: '#60936b',
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  cardMeta: {
    marginTop: 3,
    color: '#a3a3a3',
    fontSize: 11,
    fontFamily: FONTS.regular,
  },
  unreadDot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#c62f2f',
    marginLeft: 10,
  },
  cardActions: {
    width: 110,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  cardActionButton: {
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 92,
  },
  cardActionText: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  cardActionOutline: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d9d9d9',
    paddingVertical: 6,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 92,
    backgroundColor: '#ffffff',
  },
  cardActionOutlineText: {
    color: '#444444',
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  settingsShortcut: {
    marginTop: 12,
    marginBottom: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#ffffff',
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingsShortcutIcon: {
    fontSize: 22,
    marginRight: 10,
  },
  settingsShortcutBody: {
    flex: 1,
  },
  settingsShortcutTitle: {
    color: '#23603a',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  settingsShortcutText: {
    color: '#9a9a9a',
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 2,
  },
  settingsPanel: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  settingsPanelTitle: {
    color: '#23603a',
    fontSize: 16,
    fontFamily: FONTS.bold,
  },
  settingsPanelSubtitle: {
    marginTop: 4,
    color: '#9a9a9a',
    fontSize: 12,
    fontFamily: FONTS.regular,
    marginBottom: 12,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eef2ee',
    borderBottomWidth: 1,
    borderBottomColor: '#eef2ee',
    marginBottom: 8,
  },
  toggleRowTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  toggleRowTitle: {
    color: '#23603a',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  toggleRowText: {
    color: '#8d8d8d',
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#eef2ee',
  },
  settingsRowIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#eef5ef',
    marginRight: 10,
  },
  settingsRowIcon: {
    fontSize: 18,
  },
  settingsRowBody: {
    flex: 1,
  },
  settingsRowTitle: {
    color: '#23603a',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  settingsRowText: {
    color: '#8d8d8d',
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginTop: 2,
  },
  settingsRowChevron: {
    color: '#b4b4b4',
    fontSize: 20,
    marginLeft: 8,
  },
  syncButton: {
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    paddingVertical: 12,
  },
  syncButtonDisabled: {
    opacity: 0.7,
  },
  syncButtonText: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  cancelButton: {
    marginBottom: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    paddingVertical: 12,
    borderWidth: 1.5,
    borderColor: '#d9d9d9',
  },
  cancelButtonText: {
    color: '#4b4b4b',
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
  detailContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 18,
  },
  detailAccent: {
    width: 4,
    height: 240,
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
    position: 'absolute',
    left: 16,
    top: 18,
  },
  detailCard: {
    marginLeft: 4,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 18,
    minHeight: 240,
  },
  detailTitle: {
    marginTop: 12,
    color: '#222222',
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  detailSubtitle: {
    marginTop: 4,
    color: '#60936b',
    fontFamily: FONTS.semiBold,
  },
  detailMeta: {
    marginTop: 4,
    color: '#a3a3a3',
    fontFamily: FONTS.regular,
    fontSize: 12,
  },
  detailInfoBox: {
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: '#f7f7f7',
    padding: 12,
  },
  detailInfoLabel: {
    marginTop: 4,
    color: '#8a8a8a',
    fontSize: 12,
    fontFamily: FONTS.semiBold,
  },
  detailInfoValue: {
    color: '#222222',
    fontFamily: FONTS.bold,
    fontSize: 14,
  },
  detailAction: {
    marginTop: 18,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    alignItems: 'center',
  },
  detailActionText: {
    color: '#ffffff',
    fontFamily: FONTS.bold,
  },
});
```

---

## src/features/reports/screens/ReportsScreen.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

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

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import { useEffect, useState, useCallback } from 'react';
import { obtenerEventosMes } from '../native/BridgeModule';
import type { EventoSanitarioModel } from '../types/Sanitario';

type EventsByDate = Record<string, EventoSanitarioModel[]>;

export function useCalendarioSanitario(year: number, month: number) {
  const [eventsByDate, setEventsByDate] = useState<EventsByDate>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const eventos = await obtenerEventosMes(year, month);
      const map: EventsByDate = {};

      eventos.forEach((ev: EventoSanitarioModel) => {
        if (ev.fechaEvento) {
          const k = ev.fechaEvento.slice(0, 10);
          map[k] = map[k] ? map[k].concat(ev) : [ev];
        }
        if (ev.fechaProximoEvento) {
          const k2 = ev.fechaProximoEvento.slice(0, 10);
          map[k2] = map[k2] ? map[k2].concat(ev) : [ev];
        }
      });

      setEventsByDate(map);
    } catch (e: any) {
      setError(e?.message || String(e));
      setEventsByDate({});
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  useEffect(() => {
    void load();
  }, [load]);

  return { eventsByDate, loading, error, reload: load } as const;
}
```

---

## src/hooks/useEventoSanitario.ts

**Estado:** Modificado

### Contenido en f6abc6d:

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

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import { useCallback, useEffect, useState } from 'react';
import { obtenerHistorialClinico } from '../native/BridgeModule';
import type { EventoSanitarioModel } from '../types/Sanitario';

export function useHistorialClinico(animalId: number) {
  const [eventos, setEventos] = useState<EventoSanitarioModel[]>([]);
  const [pagina, setPagina] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const perPage = 10;

  const cargarPagina = useCallback(
    async (p: number) => {
      if (loading) return;
      setLoading(true);
      try {
        const res = await obtenerHistorialClinico(animalId, p);
        const items = res.items || [];
        if (p === 0) {
          setEventos(items);
        } else {
          setEventos(prev => [...prev, ...items]);
        }
        const total = res.total || 0;
        const loaded = (p + 1) * perPage;
        setHasMore(loaded < total);
      } catch (e) {
        // ignore, caller can surface errors
      } finally {
        setLoading(false);
      }
    },
    [animalId, loading],
  );

  useEffect(() => {
    // load initial
    setPagina(0);
    void cargarPagina(0);
  }, [animalId]);

  const cargarMas = useCallback(() => {
    if (loading || !hasMore) return;
    const next = pagina + 1;
    setPagina(next);
    void cargarPagina(next);
  }, [pagina, loading, hasMore, cargarPagina]);

  const recargar = useCallback(() => {
    setPagina(0);
    setHasMore(true);
    void cargarPagina(0);
  }, [cargarPagina]);

  return { eventos, loading, hasMore, pagina, cargarMas, recargar };
}
```

---

## src/hooks/useSearch.ts

**Estado:** Modificado

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

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
  getEventosMes(year: number, month: number): Promise<EventoSanitarioModel[]>;
  getHistorialClinico(animalId: number, pagina: number): Promise<{ items: EventoSanitarioModel[]; total: number }>;
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

export const obtenerEventosMes = (year: number, month: number): Promise<EventoSanitarioModel[]> => {
  return getBridge().getEventosMes(year, month);
};

export const obtenerHistorialClinico = (
  animalId: number,
  pagina: number,
): Promise<{ items: EventoSanitarioModel[]; total: number }> => {
  return getBridge().getHistorialClinico(animalId, pagina);
};
```

---

## src/native/cameraPicker.ts

**Estado:** Modificado

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

```typescript
import React, { useState } from 'react';

import { EditarAnimalScreen } from '../screens/animales/EditarAnimalScreen';
import { ListadoAnimalesScreen } from '../screens/animales/ListadoAnimalesScreen';
import { RegistrarAnimalScreen } from '../screens/animales/RegistrarAnimalScreen';
import { AnimalModel } from '../types/Animal';
import { DetalleAnimalScreen } from '../screens/animales/DetalleAnimalScreen';
import HistorialClinico from '../features/animals/screens/HistorialClinico';
import { RegistrarEventoSanitario } from '../screens/sanitarios/RegistrarEventoSanitario';

type AnimalesNavigatorProps = {
  onBack: () => void;
};

type AnimalRoute =
  | { name: 'list' }
  | { name: 'register' }
  | { name: 'detail'; animalId: number; refreshToken: number }
  | { name: 'historial'; animalId: number }
  | { name: 'registerEvent'; animalId: number }
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
        onOpenHistorial={animalId => setRoute({ name: 'historial', animalId })}
      />
    );
  }

  if (route.name === 'historial') {
    return (
      <HistorialClinico
        route={{ params: { animalId: route.animalId } }}
        navigation={{
          goBack: () => setRoute({ name: 'detail', animalId: route.animalId, refreshToken: Date.now() }),
          navigate: (name: string, params?: any) => {
            if (name === 'NuevoEvento') {
              setRoute({ name: 'registerEvent', animalId: route.animalId });
            }
          },
        }}
      />
    );
  }

  if (route.name === 'registerEvent') {
    return (
      <RegistrarEventoSanitario
        animalId={route.animalId}
        onBack={() => setRoute({ name: 'historial', animalId: route.animalId })}
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

### Contenido en f6abc6d:

```typescript
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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
import { COLORS, FONTS } from '../shared/theme/identity';
import AuthFlow from '../screens/auth/AuthFlow';

type AppRoute = 'startup' | 'auth' | 'home' | HomeModuleRoute;

const NAV_TABS: { key: AppRoute; icon: string; label: string }[] = [
  { key: 'home', icon: '­ƒÅá', label: 'Inicio' },
  { key: 'animals', icon: '­ƒÉä', label: 'Animales' },
  { key: 'health', icon: '­ƒÆë', label: 'Sanitario' },
  { key: 'costs', icon: '­ƒÆÁ', label: 'Gastos' },
  { key: 'reports', icon: '­ƒôè', label: 'Reportes' },
];

function BottomNavBar({
  currentRoute,
  onNavigate,
}: {
  currentRoute: AppRoute;
  onNavigate: (r: AppRoute) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[navStyles.bar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {NAV_TABS.map(tab => {
        const active = currentRoute === tab.key;
        return (
          <Pressable
            key={tab.key}
            style={navStyles.tabItem}
            onPress={() => onNavigate(tab.key)}
          >
            <Text style={[navStyles.tabIcon, active && navStyles.tabIconActive]}>
              {tab.icon}
            </Text>
            <Text style={[navStyles.tabLabel, active && navStyles.tabLabelActive]}>
              {tab.label}
            </Text>
            {active && <View style={navStyles.activeIndicator} />}
          </Pressable>
        );
      })}
    </View>
  );
}

const navStyles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    borderTopWidth: 1,
    borderTopColor: '#e3e3e3',
    backgroundColor: '#ffffff',
    paddingTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    gap: 2,
    flex: 1,
    position: 'relative',
  },
  tabIcon: {
    fontSize: 17,
    opacity: 0.45,
  },
  tabIconActive: {
    opacity: 1,
  },
  tabLabel: {
    fontSize: 10,
    color: '#999',
    fontFamily: FONTS.semiBold,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  activeIndicator: {
    position: 'absolute',
    top: -8,
    width: 28,
    height: 3,
    borderRadius: 2,
    backgroundColor: COLORS.primary,
  },
});

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
      .catch(() => {})
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
    const timer = setTimeout(() => {
      resolveStartupSession()
        .then(hasSession => {
          if (!mounted) return;
          setRoute(hasSession ? 'home' : 'auth');
        })
        .catch(() => {
          if (mounted) setRoute('auth');
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
    return () => { clearInactivityTimer(); };
  }, [clearInactivityTimer]);

  useEffect(() => {
    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'inactive' || nextState === 'background') {
        clearInactivityTimer();
        markAppBackgrounded().catch(() => {});
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
          .catch(() => { setRoute('auth'); });
      }
    };
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, [clearInactivityTimer, startInactivityTimer]);

  const navigate = useCallback((target: AppRoute) => {
    registerActivity();
    setRoute(target);
  }, [registerActivity]);

  const wrapProtectedScreen = (screen: React.ReactNode) => {
    if (!protectedRoute) return screen;
    return (
      <View
        style={styles.protectedContainer}
        onStartShouldSetResponderCapture={() => { registerActivity(); return false; }}
        onMoveShouldSetResponderCapture={() => { registerActivity(); return false; }}
      >
        {screen}
        <BottomNavBar currentRoute={route} onNavigate={navigate} />
      </View>
    );
  };

  if (route === 'startup') return <SplashScreen />;

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
    return wrapProtectedScreen(
      <AnimalsScreen onBack={() => navigate('home')} />
    );
  }

  if (route === 'health') {
    return wrapProtectedScreen(
      <HealthScreen onBack={() => navigate('home')} />
    );
  }

  if (route === 'costs') {
    return wrapProtectedScreen(
      <CostsScreen onBack={() => navigate('home')} />
    );
  }

  if (route === 'reports') {
    return wrapProtectedScreen(
      <ReportsScreen onBack={() => navigate('home')} />
    );
  }

  if (route === 'notifications') {
    return wrapProtectedScreen(
      <NotificationsScreen onBack={() => navigate('home')} />
    );
  }

  return wrapProtectedScreen(
    <HomeScreen onOpenModule={target => navigate(target)} />
  );
}

const styles = StyleSheet.create({
  protectedContainer: {
    flex: 1,
  },
});
```

---

## src/navigation/CostsNavigator.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import React, { useState } from 'react';

import { RegistrarGastoScreen } from '../features/costs/screens/RegistrarGastoScreen';
import { GestionGastosScreen } from '../features/costs/screens/GestionGastosScreen';

type CostsNavigatorProps = {
  onBack: () => void;
};

type CostsRoute =
  | { name: 'list' }
  | { name: 'register' }
  | { name: 'edit'; gastoId: number };

export function CostsNavigator({ onBack }: CostsNavigatorProps) {
  const [route, setRoute] = useState<CostsRoute>({ name: 'list' });
  const [listKey, setListKey] = useState(0);

  const refreshList = () => {
    setListKey(k => k + 1);
    setRoute({ name: 'list' });
  };

  if (route.name === 'register') {
    return (
      <RegistrarGastoScreen
        onBack={() => setRoute({ name: 'list' })}
        onSuccess={refreshList}
      />
    );
  }

  if (route.name === 'edit') {
    return (
      <RegistrarGastoScreen
        key={route.gastoId}
        gastoId={route.gastoId}
        onBack={() => setRoute({ name: 'list' })}
        onSuccess={refreshList}
      />
    );
  }

  return (
    <GestionGastosScreen
      key={listKey}
      onBack={onBack}
      onNewGasto={() => setRoute({ name: 'register' })}
      onEditGasto={(gastoId) => setRoute({ name: 'edit', gastoId })}
    />
  );
}
```

---

## src/screens/animales/DetalleAnimalScreen.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

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
import { ResumenInversionCard } from '../../components/animales/ResumenInversionCard';
import { VentaAnimalModal } from '../../components/animales/VentaAnimalModal';
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
  onOpenHistorial?: (animalId: number) => void;
};

export function DetalleAnimalScreen({ animalId, refreshToken, onBack, onEdit, onDeleted, onOpenHistorial }: DetalleAnimalScreenProps) {
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
  const [showVentaModal, setShowVentaModal] = useState(false);


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
  const isBlocked = currentAnimal.estado === 'VENDIDO' || currentAnimal.estado === 'FALLECIDO';

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>ÔåÉ Volver</Text>
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

        <Pressable onPress={() => onOpenHistorial ? onOpenHistorial(animalId) : Alert.alert('Historial', 'Vista completa de historial cl├¡nico: pr├│ximamente.') }>
          <Text style={styles.historialLink}>Ver historial cl├¡nico completo ÔåÆ</Text>
        </Pressable>

        {currentAnimal && (
          <ResumenInversionCard
            animalId={currentAnimal.id}
            animalEstado={currentAnimal.estado as 'ACTIVO' | 'FALLECIDO' | 'VENDIDO'}
            onRegistrarVenta={() => {
              if (currentAnimal.estado === 'ACTIVO') {
                setShowVentaModal(true);
              }
            }}
          />
        )}
      </ScrollView>

      <View style={styles.actionBar}>
        <Pressable
          style={[styles.outlineButton, isBlocked && styles.actionButtonDisabled]}
          onPress={() => !isBlocked && onEdit(currentAnimal)}
          disabled={isBlocked}
        >
          <Text style={[styles.outlineButtonText, isBlocked && styles.actionButtonDisabledText]}>
            Ô£Å´©Å Editar Datos del Animal
          </Text>
        </Pressable>

        <Pressable
          style={[styles.primaryButton, isBlocked && styles.actionButtonDisabled]}
          onPress={() => !isBlocked && setShowRegistrarEvento(true)}
          disabled={isBlocked}
        >
          <Text style={[styles.primaryButtonText, isBlocked && styles.actionButtonDisabledText]}>
            Registrar Nuevo Evento
          </Text>
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

      {currentAnimal && (
        <VentaAnimalModal
          visible={showVentaModal}
          animalId={currentAnimal.id}
          arete={currentAnimal.arete}
          onVentaExitosa={() => {
            setShowVentaModal(false);
            void loadDetalle();
          }}
          onCancelar={() => setShowVentaModal(false)}
        />
      )}
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  backText: {
    color: '#ffffff',
    fontSize: 14,
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
    paddingBottom: 200,
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
    bottom: 76,
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
  actionButtonDisabled: {
    opacity: 0.35,
    borderColor: '#aaaaaa',
    backgroundColor: '#cccccc',
  },
  actionButtonDisabledText: {
    color: '#666666',
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

### Contenido en f6abc6d:

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
import { VentaAnimalModal } from '../../components/animales/VentaAnimalModal';
import { AnimalModule } from '../../native/AnimalModule';
import { AnimalModel, UpdateAnimalPayload } from '../../types/Animal';

const ESPECIES_BASE = [
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
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
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
  estado: 'ACTIVO' | 'VENDIDO' | 'FALLECIDO';
  fechaBaja: string;
  motivoBaja: string;
};

export function EditarAnimalScreen({ animal, onBack, onSaved }: EditarAnimalScreenProps) {
  // Derivados de estado original ÔÇö inmutables durante la sesi├│n
  const isVendido = animal.estado === 'VENDIDO';
  const isFallecidoOriginal = animal.estado === 'FALLECIDO';

  const normalizeSexo = (sexo: string | null | undefined) => {
    if (sexo === 'F') return 'H';
    return sexo ?? 'M';
  };

  const initialPhotoUri = useMemo(() => {
    const raw = animal.foto?.trim();
    if (!raw) return null;
    if (raw.startsWith('file://') || raw.startsWith('content://') || raw.startsWith('http')) return raw;
    return `file://${raw}`;
  }, [animal.foto]);

  const [form, setForm] = useState<EditFormState>({
    arete: animal.arete,
    especie: animal.especie,
    sexo: normalizeSexo(animal.sexo),
    fecha: animal.fecha,
    peso: animal.peso == null ? '' : String(Math.trunc(animal.peso)),
    fotoPath: initialPhotoUri,
    estado: animal.estado === 'FALLECIDO' ? 'FALLECIDO' : animal.estado === 'VENDIDO' ? 'VENDIDO' : 'ACTIVO',
    fechaBaja: animal.fecha_baja ?? '',
    motivoBaja: animal.motivo_baja ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [datePickerBajaVisible, setDatePickerBajaVisible] = useState(false);
  const [ventaModalVisible, setVentaModalVisible] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(() => {
    return form.fecha ? new Date(`${form.fecha}T00:00:00`) : new Date();
  });

  // Determina si la especie actual es "Otro" (no est├í en la lista base)
  const isOtroSelected = !ESPECIES_BASE.includes(form.especie);

  const canSubmit = useMemo(() => {
    if (isVendido) return false;
    return form.especie.trim().length > 0 && form.sexo.trim().length > 0 && form.fecha.trim().length > 0;
  }, [form, isVendido]);

  useEffect(() => {
    if (form.estado !== 'FALLECIDO') return;

    setForm(prev => {
      const today = formatDate(new Date());
      const nextFechaBaja = prev.fechaBaja.trim().length > 0 ? prev.fechaBaja : today;
      const nextMotivoBaja = prev.motivoBaja.trim().length > 0 ? prev.motivoBaja : 'Cambio de estado registrado desde editar';

      if (nextFechaBaja === prev.fechaBaja && nextMotivoBaja === prev.motivoBaja) return prev;

      return { ...prev, fechaBaja: nextFechaBaja, motivoBaja: nextMotivoBaja };
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

  const parseCalendarDate = (year: number, month: number, day: number) => new Date(year, month, day);

  const getMonthDays = (baseDate: Date) => {
    const year = baseDate.getFullYear();
    const month = baseDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells: Array<Date | null> = [];

    for (let i = 0; i < firstDay; i += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(parseCalendarDate(year, month, day));

    return cells;
  };

  const openCalendar = () => {
    if (isVendido) return;
    setCalendarMonth(form.fecha ? new Date(`${form.fecha}T00:00:00`) : new Date());
    setDatePickerVisible(true);
  };

  const openCalendarBaja = () => {
    if (isVendido) return;
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
    if (isAtCurrentMonth()) return;
    setCalendarMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const onGuardar = async () => {
    if (isVendido) {
      Alert.alert('No permitido', 'Este animal fue vendido y no puede modificarse.');
      return;
    }
    if (!canSubmit || loading) return;

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

      // ACTIVO ÔåÆ FALLECIDO: permitido
      if (animal.estado === 'ACTIVO' && form.estado === 'FALLECIDO') {
        await AnimalModule.changeEstado({
          id: animal.id,
          estado: 'FALLECIDO',
          fecha_baja: form.fechaBaja.trim().length > 0 ? form.fechaBaja.trim() : formatDate(new Date()),
          motivo_baja: form.motivoBaja.trim().length > 0 ? form.motivoBaja.trim() : 'Cambio de estado registrado desde editar',
        });
      }
      // FALLECIDO ÔåÆ ACTIVO: NO permitido (regla de negocio)
      // VENDIDO ÔåÆ cualquiera: bloqueado arriba

      Alert.alert('Actualizado', `Animal ${animal.arete} actualizado correctamente.`);
      onSaved();
    } catch (updateError) {
      const message = updateError instanceof Error ? updateError.message : 'No se pudo guardar los cambios del animal.';
      Alert.alert('Error', message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>ÔåÉ Volver</Text>
        </Pressable>
        <View>
          <Text style={styles.title}>Editar Animal</Text>
          <Text style={styles.subtitle}>La {animal.especie} ÔÇó #{animal.arete}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.container}>

        {/* Banner de VENDIDO */}
        {isVendido && (
          <View style={styles.vendidoBanner}>
            <Text style={styles.vendidoBannerTitle}>­ƒöÆ Animal Vendido</Text>
            <Text style={styles.vendidoBannerText}>Este animal fue vendido y no puede modificarse.</Text>
            {animal.fecha_venta && <Text style={styles.vendidoBannerText}>Fecha de venta: {animal.fecha_venta}</Text>}
            {animal.precio_venta && <Text style={styles.vendidoBannerText}>Precio: ${animal.precio_venta.toFixed(2)}</Text>}
          </View>
        )}

        <Text style={styles.label}>N├║mero de Arete SINIIGA ­ƒöÆ</Text>
        <TextInput value={form.arete} style={[styles.input, styles.inputDisabled]} editable={false} />
        <Text style={styles.helperText}>El arete oficial no se puede modificar</Text>

        {/* Selector de Estado */}
        <Text style={styles.label}>Estado actual del animal *</Text>
        <View style={styles.estadoSelectorRow}>
          {/* Chip ACTIVO: deshabilitado si VENDIDO o si ya es FALLECIDO original */}
          <Pressable
            style={[
              styles.estadoSelectorChip,
              form.estado === 'ACTIVO' && styles.estadoSelectorChipActive,
              (isVendido || isFallecidoOriginal) && styles.estadoSelectorChipDisabled,
            ]}
            onPress={() => {
              if (isVendido || isFallecidoOriginal) return;
              setField('estado', 'ACTIVO');
            }}
            disabled={isVendido || isFallecidoOriginal}
          >
            <Text style={[
              styles.estadoSelectorText,
              form.estado === 'ACTIVO' && styles.estadoSelectorTextActive,
              (isVendido || isFallecidoOriginal) && styles.estadoSelectorTextDisabled,
            ]}>
              ­ƒƒó Activo
            </Text>
          </Pressable>

          {/* Chip VENDIDO: deshabilitado si ya est├í VENDIDO */}
          <Pressable
            style={[
              styles.estadoSelectorChip,
              form.estado === 'VENDIDO' && styles.estadoSelectorChipVendido,
              isVendido && styles.estadoSelectorChipDisabled,
            ]}
            onPress={() => {
              if (isVendido) return;
              setVentaModalVisible(true);
            }}
            disabled={isVendido}
          >
            <Text style={[
              styles.estadoSelectorText,
              form.estado === 'VENDIDO' && styles.estadoSelectorTextVendido,
            ]}>
              ­ƒƒá Vendido {form.estado === 'VENDIDO' && 'Ô£ô'}
            </Text>
          </Pressable>

          {/* Chip FALLECIDO: deshabilitado si ya est├í VENDIDO */}
          <Pressable
            style={[
              styles.estadoSelectorChip,
              form.estado === 'FALLECIDO' && styles.estadoSelectorChipFallecido,
              isVendido && styles.estadoSelectorChipDisabled,
            ]}
            onPress={() => {
              if (isVendido) return;
              setField('estado', 'FALLECIDO');
            }}
            disabled={isVendido}
          >
            <Text style={[
              styles.estadoSelectorText,
              form.estado === 'FALLECIDO' && styles.estadoSelectorTextFallecido,
              isVendido && styles.estadoSelectorTextDisabled,
            ]}>
              ­ƒƒú Fallecido
            </Text>
          </Pressable>
        </View>

        {animal.estado === 'VENDIDO' && (
          <View style={styles.ventaDetailsCard}>
            <Text style={styles.ventaDetailsTitle}>Informaci├│n de venta</Text>
            {animal.fecha_venta && (
              <View style={styles.ventaDetailRow}>
                <Text style={styles.ventaDetailLabel}>Fecha:</Text>
                <Text style={styles.ventaDetailValue}>{animal.fecha_venta}</Text>
              </View>
            )}
            {animal.precio_venta && (
              <View style={styles.ventaDetailRow}>
                <Text style={styles.ventaDetailLabel}>Precio:</Text>
                <Text style={styles.ventaDetailValue}>${animal.precio_venta.toFixed(2)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Toggle fallecido: solo cuando el animal ORIGINAL es ACTIVO */}
        {animal.estado === 'ACTIVO' && !isVendido ? (
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

        {form.estado === 'FALLECIDO' && !isVendido ? (
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
              editable={!isVendido}
            />
          </>
        ) : null}

        {/* Raza */}
        <Text style={styles.label}>Raza / Especie</Text>
        <View style={styles.chipWrap}>
          {ESPECIES_BASE.map(option => {
            const selected = form.especie === option;
            return (
              <Pressable
                key={option}
                style={[styles.chip, selected && styles.chipSelected, isVendido && styles.chipDisabled]}
                onPress={() => {
                  if (isVendido) return;
                  setField('especie', option);
                }}
                disabled={isVendido}
              >
                <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{option}</Text>
              </Pressable>
            );
          })}
          {/* Chip "Otro" */}
          <Pressable
            key="Otro"
            style={[styles.chip, isOtroSelected && styles.chipSelected, isVendido && styles.chipDisabled]}
            onPress={() => {
              if (isVendido) return;
              if (!isOtroSelected) {
                setField('especie', '');
              }
            }}
            disabled={isVendido}
          >
            <Text style={[styles.chipText, isOtroSelected && styles.chipTextSelected]}>Otro</Text>
          </Pressable>
        </View>
        {isOtroSelected && (
          <TextInput
            value={form.especie}
            onChangeText={value => setField('especie', value)}
            placeholder="Escribe la raza..."
            style={[styles.input, { marginTop: 8 }]}
            editable={!isVendido}
            maxLength={50}
            autoFocus={form.especie === ''}
          />
        )}

        <Text style={styles.label}>Sexo</Text>
        <View style={styles.chipWrap}>
          {SEXO_OPTIONS.map(option => {
            const selected = form.sexo === option.value;
            return (
              <Pressable
                key={option.value}
                style={[styles.sexChip, selected && styles.sexChipSelected, isVendido && styles.chipDisabled]}
                onPress={() => {
                  if (isVendido) return;
                  setField('sexo', option.value);
                }}
                disabled={isVendido}
              >
                <Text style={[styles.sexChipText, selected && styles.sexChipTextSelected]}>
                  {option.value} ({option.label})
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.label}>Fecha de Ingreso</Text>
        <Pressable style={[styles.dateField, isVendido && styles.inputDisabled]} onPress={openCalendar}>
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
          style={[styles.input, isVendido && styles.inputDisabled]}
          keyboardType="number-pad"
          maxLength={6}
          editable={!isVendido}
        />

        <Text style={styles.label}>Fotografia del animal</Text>
        {isVendido ? (
          <View style={styles.fotoDisabledMsg}>
            <Text style={styles.fotoDisabledText}>Foto bloqueada ÔÇö animal vendido</Text>
          </View>
        ) : (
          <AnimalFotoCaptura
            rutaLocal={form.fotoPath ?? initialPhotoUri}
            onRutaLocalChange={rutaLocal => setField('fotoPath', rutaLocal)}
          />
        )}

        {/* Bot├│n guardar: oculto si est├í VENDIDO */}
        {!isVendido && (
          <Pressable
            onPress={onGuardar}
            disabled={!canSubmit || loading}
            style={[styles.submitButton, (!canSubmit || loading) && styles.submitDisabled]}
          >
            <Text style={styles.submitText}>{loading ? 'Guardando...' : 'Guardar cambios'}</Text>
          </Pressable>
        )}
      </ScrollView>

      {/* Calendar fechaIngreso */}
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
                <Text key={day} style={styles.weekLabel}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getMonthDays(calendarMonth).map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;
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

      {/* Calendar fechaBaja */}
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
                <Text key={`baja-label-${day}`} style={styles.weekLabel}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getMonthDays(calendarMonth).map((day, index) => {
                if (!day) return <View key={`baja-empty-${index}`} style={styles.dayCell} />;
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

      <VentaAnimalModal
        visible={ventaModalVisible}
        animalId={animal.id}
        arete={animal.arete}
        precioVentaExistente={animal.precio_venta}
        fechaVentaExistente={animal.fecha_venta}
        onVentaExitosa={() => {
          setField('estado', 'VENDIDO');
          setVentaModalVisible(false);
          onSaved();
        }}
        onCancelar={() => setVentaModalVisible(false)}
      />
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  backText: {
    color: '#ffffff',
    fontSize: 14,
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
    paddingBottom: 40,
  },
  vendidoBanner: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff6f00',
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
  },
  vendidoBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#e65100',
    marginBottom: 4,
  },
  vendidoBannerText: {
    fontSize: 12,
    color: '#795548',
    fontWeight: '600',
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
    opacity: 0.7,
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
    opacity: 0.45,
  },
  estadoSelectorChipFallecido: {
    borderColor: '#9145aa',
    backgroundColor: '#f6eefa',
  },
  estadoSelectorChipVendido: {
    borderColor: '#ff6f00',
    backgroundColor: '#ffe0b2',
    borderWidth: 2,
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
  estadoSelectorTextVendido: {
    color: '#e65100',
  },
  ventaDetailsCard: {
    marginTop: 16,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#f0f9f0',
    borderRadius: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#0a6b33',
  },
  ventaDetailsTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0a6b33',
    marginBottom: 8,
  },
  ventaDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  ventaDetailLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  ventaDetailValue: {
    fontSize: 12,
    color: '#0a6b33',
    fontWeight: '700',
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
  chipDisabled: {
    opacity: 0.5,
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
  fotoDisabledMsg: {
    borderWidth: 1,
    borderColor: '#d8d8d8',
    borderRadius: 10,
    backgroundColor: '#f0f0f0',
    padding: 16,
    alignItems: 'center',
    opacity: 0.6,
  },
  fotoDisabledText: {
    color: '#777',
    fontWeight: '600',
    fontSize: 13,
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
    paddingVertical: 16,
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

### Contenido en f6abc6d:

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
    paddingBottom: 90,
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

### Contenido en f6abc6d:

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

const ESPECIES_BASE = [
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
  especie: ESPECIES_BASE[0],
  sexo: SEXO_OPTIONS[0].value,
  fecha: '',
  peso: '',
  fotoPath: null,
  precioCompra: '',
  nacioEnRancho: false,
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
    const precioValue = form.precioCompra.trim();
    return {
      arete: form.arete.trim(),
      especie: form.especie.trim(),
      sexo: form.sexo.trim(),
      fecha: form.fecha.trim(),
      peso: pesoValue.length > 0 ? Number(pesoValue) : null,
      foto_path: form.fotoPath,
      precio_compra: form.nacioEnRancho ? 0 : (precioValue.length > 0 ? Number(precioValue) : 0),
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
          <Text style={styles.backText}>ÔåÉ Volver</Text>
        </Pressable>
        <Text style={styles.title}>Registrar Animal</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
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
          {ESPECIES_BASE.map(option => {
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
          {/* Opci├│n Otro */}
          <Pressable
            key="Otro"
            style={[styles.chip, !ESPECIES_BASE.includes(form.especie) && styles.chipSelected]}
            onPress={() => {
              if (ESPECIES_BASE.includes(form.especie)) {
                setField('especie', '');
              }
            }}
          >
            <Text style={[styles.chipText, !ESPECIES_BASE.includes(form.especie) && styles.chipTextSelected]}>Otro</Text>
          </Pressable>
        </View>
        {!ESPECIES_BASE.includes(form.especie) && (
          <TextInput
            value={form.especie}
            onChangeText={value => setField('especie', value)}
            placeholder="Escribe la raza..."
            style={[styles.input, { marginTop: 8 }]}
            maxLength={50}
            autoFocus={form.especie === ''}
          />
        )}

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

        <Text style={styles.label}>Precio de compra</Text>
        <View style={styles.origenContainer}>
          <Pressable
            style={[styles.origenChip, form.nacioEnRancho && styles.origenChipSelected]}
            onPress={() => setForm(prev => ({ ...prev, nacioEnRancho: true, precioCompra: '' }))}
          >
            <Text style={[styles.origenChipText, form.nacioEnRancho && styles.origenChipTextSelected]}>
              Naci├│ en el rancho ($0)
            </Text>
          </Pressable>
          <Pressable
            style={[styles.origenChip, !form.nacioEnRancho && styles.origenChipSelected]}
            onPress={() => setForm(prev => ({ ...prev, nacioEnRancho: false }))}
          >
            <Text style={[styles.origenChipText, !form.nacioEnRancho && styles.origenChipTextSelected]}>
              Comprado
            </Text>
          </Pressable>
        </View>
        {!form.nacioEnRancho && (
          <View style={styles.precioRow}>
            <Text style={styles.precioSimbolo}>$</Text>
            <TextInput
              value={form.precioCompra}
              onChangeText={value => setField('precioCompra', value.replace(/[^0-9.]/g, ''))}
              placeholder="0.00"
              style={styles.precioInput}
              keyboardType="decimal-pad"
            />
          </View>
        )}

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
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  backText: {
    color: '#ffffff',
    fontSize: 14,
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
    paddingBottom: 90,
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
  origenContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  origenChip: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#cfd9c3',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  origenChipSelected: {
    backgroundColor: '#0f6f35',
    borderColor: '#0f6f35',
  },
  origenChipText: {
    color: '#1c2b1d',
    fontWeight: '700',
    fontSize: 12,
  },
  origenChipTextSelected: {
    color: '#ffffff',
  },
  precioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#b6c7a0',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    paddingHorizontal: 12,
  },
  precioSimbolo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f6f35',
    marginRight: 6,
  },
  precioInput: {
    flex: 1,
    paddingVertical: 10,
    color: '#1c2b1d',
    fontSize: 15,
  },
});
```

---

## src/screens/auth/AuthenticatedScreen.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

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

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
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
      `­ƒôï Recomendaci├│n Nutricional ÔÇö AgroApp\n` +
      `Etapa: ${ETAPA_LABELS[r.etapa]}  |  Animal: ${TIPO_LABELS[r.tipoAnimal]}\n\n` +
      `ÔÇó Prote├¡na m├¡nima: ${r.proteinaMin}% BS\n` +
      `ÔÇó Energ├¡a: ${r.energiaMcal} Mcal EM/kg MS\n` +
      `ÔÇó Fibra m├íxima (FDN): ${r.fibraMaxima}% MS\n` +
      `ÔÇó Agua: ${r.aguaLitrosDia} L/d├¡a\n\n` +
      `Suplementos:\n${r.suplementos.map(s => `  - ${s}`).join('\n')}\n\n` +
      `Costo estimado: ${formatMXN(r.gastosEstimadosMXN.mensualPorAnimal)}/mes por animal\n` +
      `Fuente: ${r.gastosEstimadosMXN.fuente}\n\n` +
      `Observaciones: ${r.observaciones}`;

    try {
      await Share.share({ message: texto });
    } catch {
      // el usuario cancel├│
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>ÔåÉ Volver</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Nutrici├│n Animal</Text>
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

        {/* Chip de selecci├│n actual */}
        <View style={styles.chipRow}>
          <View style={styles.chip}>
            <Text style={styles.chipText}>
              {TIPO_LABELS[tipo]} ÔÇö {ETAPA_LABELS[etapa]}
            </Text>
          </View>
        </View>

        {/* Tabla con FadeIn */}
        <Animated.View style={{ opacity: fadeAnim }}>
          <TablaRecomendacion recomendacion={recomendacion} />
        </Animated.View>

        {/* Bot├│n share grande al final */}
        <Pressable style={styles.shareBtnBottom} onPress={onSharePress}>
          <Text style={styles.shareBtnBottomText}>Compartir por WhatsApp / Correo</Text>
        </Pressable>

        <Text style={styles.fuenteNota}>
          Datos basados en NRC (2016/2021) e INIFAP. Ajustar seg├║n condiciones locales.
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
```

---

## src/screens/sanitarios/CalendarioSanitario.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, FlatList } from 'react-native';
import CalendarioMensual from '../../components/sanitarios/CalendarioMensual';
import { useCalendarioSanitario } from '../../hooks/useCalendarioSanitario';
import type { EventoSanitarioModel } from '../../types/Sanitario';
import { COLORS, FONTS } from '../../shared/theme/identity';

export default function CalendarioSanitario() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { eventsByDate, loading } = useCalendarioSanitario(year, month);

  const prevMonth = () => {
    let m = month - 1;
    let y = year;
    if (m < 1) { m = 12; y = year - 1; }
    setMonth(m); setYear(y); setSelectedDate(null);
  };

  const nextMonth = () => {
    let m = month + 1;
    let y = year;
    if (m > 12) { m = 1; y = year + 1; }
    setMonth(m); setYear(y); setSelectedDate(null);
  };

  const eventsForSelected = selectedDate ? (eventsByDate[selectedDate] || []) : [];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={prevMonth} style={styles.navButton}><Text style={styles.navButtonText}>ÔÇ╣</Text></Pressable>
        <Text style={styles.headerTitle}>{month}/{year}</Text>
        <Pressable onPress={nextMonth} style={styles.navButton}><Text style={styles.navButtonText}>ÔÇ║</Text></Pressable>
      </View>

      <CalendarioMensual
        year={year}
        month={month}
        eventos={eventsByDate}
        selectedDate={selectedDate}
        onSelectDate={(d) => setSelectedDate(d)}
      />

      <View style={styles.legendRow}>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor:'#39a861'}]} /><Text style={styles.legendText}>Vacuna</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor:'#FFA000'}]} /><Text style={styles.legendText}>Desparasitaci├│n</Text></View>
        <View style={styles.legendItem}><View style={[styles.legendDot, {backgroundColor:'#D32F2F'}]} /><Text style={styles.legendText}>Enfermedad</Text></View>
      </View>

      <View style={styles.listWrap}>
        <Text style={styles.sectionTitle}>Eventos {selectedDate ? ` - ${selectedDate}` : ''}</Text>
        {loading ? <Text>Cargando...</Text> : (
          <FlatList
            data={eventsForSelected}
            keyExtractor={(i: EventoSanitarioModel) => String(i.id)}
            renderItem={({item}) => (
              <View style={styles.eventRow}>
                <Text style={styles.eventTitle}>{item.tipoEvento}</Text>
                <Text style={styles.eventDesc}>{item.descripcion || ''}</Text>
                <Text style={styles.eventMeta}>{item.fechaEvento}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No hay eventos para este d├¡a.</Text>}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerTitle: { fontFamily: FONTS.bold, color: COLORS.primary },
  navButton: { padding: 8 },
  navButtonText: { fontSize: 20, color: COLORS.primary },
  legendRow: { flexDirection: 'row', gap: 12, marginTop: 8, marginBottom: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  legendDot: { width: 12, height: 12, borderRadius: 6 },
  legendText: { color: '#444' },
  listWrap: { flex: 1, marginTop: 8 },
  sectionTitle: { fontFamily: FONTS.bold, marginBottom: 8 },
  eventRow: { padding: 12, backgroundColor: '#f6f6f6', borderRadius: 12, marginBottom: 8 },
  eventTitle: { fontFamily: FONTS.bold, color: COLORS.primary },
  eventDesc: { marginTop: 4 },
  eventMeta: { marginTop: 6, color: '#888', fontSize: 12 },
  emptyText: { color: '#777' },
});
```

---

## src/screens/sanitarios/RegistrarEventoSanitario.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  ActivityIndicator,
  NativeModules,
} from 'react-native';

import { useEventoSanitario } from '../../hooks/useEventoSanitario';
import { AnimalModule } from '../../native/AnimalModule';
import { programarNotificacionEvento } from '../../shared/services/notificacionSanitaria';
import { COLORS, FONTS } from '../../shared/theme/identity';
import { TipoEvento } from '../../types/Sanitario';
import type { AnimalModel } from '../../types/Animal';

const TIPOS_EVENTO = Object.values(TipoEvento);
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const WEEKDAY_LABELS = ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'];

type AnimalSeleccionado = { id: number; arete: string };

type RegistrarEventoSanitarioProps = {
  onBack: () => void;
  animalId?: number;
};

type FormState = {
  tipoEvento: TipoEvento;
  subtipo: string;
  descripcion: string;
  veterinario: string;
  dosis: string;
  observaciones: string;
  fechaEvento: string;
  fechaProximoEvento: string;
  fechaProximoEventoSugerida?: string;
};

const INITIAL_FORM: FormState = {
  tipoEvento: TipoEvento.VACUNA,
  subtipo: '',
  descripcion: '',
  veterinario: '',
  dosis: '',
  observaciones: '',
  fechaEvento: '',
  fechaProximoEvento: '',
};

const SUBTIPOS_POR_TIPO = {
  [TipoEvento.VACUNA]: ['AFTOSA', 'BRUCELOSIS'],
  [TipoEvento.DESPARASITACION]: ['INTERNA', 'EXTERNA'],
};

const formatDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parseDate = (value: string) => new Date(`${value}T00:00:00`);

const normalizeToday = (date: Date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isFutureDate = (date: Date) => normalizeToday(date).getTime() > normalizeToday(new Date()).getTime();
const isPastDate = (date: Date) => normalizeToday(date).getTime() < normalizeToday(new Date()).getTime();

const validateForm = (form: FormState, animalesCount: number) => {
  const errors: Record<string, string> = {};

  if (animalesCount === 0) {
    errors.animales = 'Selecciona al menos un animal.';
  }

  if (!TIPOS_EVENTO.includes(form.tipoEvento)) {
    errors.tipoEvento = 'Selecciona un tipo valido.';
  }

  if (!form.descripcion.trim()) {
    errors.descripcion = 'La descripcion es obligatoria.';
  }

  if (!form.fechaEvento) {
    errors.fechaEvento = 'Selecciona la fecha del evento.';
  } else if (isFutureDate(parseDate(form.fechaEvento))) {
    errors.fechaEvento = 'La fecha del evento no puede ser futura.';
  }

  if (!form.fechaProximoEvento) {
    errors.fechaProximoEvento = 'Selecciona la proxima fecha.';
  } else {
    const fechaProximo = parseDate(form.fechaProximoEvento);
    const today = normalizeToday(new Date());
    if (fechaProximo.getTime() < today.getTime()) {
      errors.fechaProximoEvento = 'La proxima fecha no puede ser pasada.';
    }
    if (form.fechaEvento) {
      const fechaEvento = parseDate(form.fechaEvento);
      if (fechaProximo.getTime() < fechaEvento.getTime()) {
        errors.fechaProximoEvento = 'La fecha proxima debe ser mayor o igual a la del evento.';
      }
    }
  }

  return errors;
};

export function RegistrarEventoSanitario({ onBack, animalId }: RegistrarEventoSanitarioProps) {
  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [calendarTarget, setCalendarTarget] = useState<'fechaEvento' | 'fechaProximoEvento' | null>(null);
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [listVisible, setListVisible] = useState(false);

  // Multi-animal selector
  const [animalesSeleccionados, setAnimalesSeleccionados] = useState<AnimalSeleccionado[]>([]);
  const [areteSearch, setAreteSearch] = useState('');
  const [sugerencias, setSugerencias] = useState<AnimalModel[]>([]);
  const [buscando, setBuscando] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { loading, error, eventos, registrar, listar } = useEventoSanitario();

  // Carga el animal inicial si se recibe animalId por prop
  useEffect(() => {
    if (!animalId) return;
    const cargar = async () => {
      try {
        const animal = await AnimalModule.getAnimalById(animalId);
        if (animal.estado !== 'ACTIVO') {
          Alert.alert(
            'Animal no activo',
            `El animal #${animal.arete} est├í ${animal.estado.toLowerCase()} y no puede recibir nuevos eventos sanitarios.`,
            [{ text: 'OK', onPress: onBack }],
          );
          return;
        }
        setAnimalesSeleccionados([{ id: animal.id, arete: animal.arete }]);
      } catch {
        setAnimalesSeleccionados([{ id: animalId, arete: `ID:${animalId}` }]);
      }
    };
    void cargar();
  }, [animalId]);

  // Cargar eventos del primer animal seleccionado para mostrar historial
  useEffect(() => {
    const primerAnimal = animalesSeleccionados[0];
    if (!primerAnimal) return;

    void listar(primerAnimal.id)
      .then(() => setListVisible(true))
      .catch(() => setListVisible(false));
  }, [animalesSeleccionados, listar]);

  // Calcular pr├│xima fecha NOM-041
  useEffect(() => {
    const calcular = async () => {
      if (
        form.tipoEvento &&
        form.subtipo &&
        form.fechaEvento &&
        (form.tipoEvento === TipoEvento.VACUNA || form.tipoEvento === TipoEvento.DESPARASITACION)
      ) {
        try {
          const proximaFecha = await NativeModules.AgroBridgeModule.calcularProximaFechaNOM(
            form.tipoEvento,
            form.subtipo,
            form.fechaEvento,
          );
          if (proximaFecha) {
            setForm(prev => ({ ...prev, fechaProximoEventoSugerida: proximaFecha }));
          }
        } catch {
          // Si falla el c├ílculo el usuario ingresa manualmente
        }
      }
    };
    void calcular();
  }, [form.tipoEvento, form.subtipo, form.fechaEvento]);

  // B├║squeda por arete con debounce
  const handleAreteSearch = useCallback(
    (term: string) => {
      const sanitized = term.replace(/\D/g, '').slice(0, 10);
      setAreteSearch(sanitized);
      setSugerencias([]);

      if (searchTimer.current) clearTimeout(searchTimer.current);

      if (sanitized.length < 2) return;

      searchTimer.current = setTimeout(async () => {
        setBuscando(true);
        try {
          const resultados = await AnimalModule.buscarPorArete(sanitized, 'ACTIVO');
          // Excluir los ya seleccionados
          const filtrados = resultados.filter(a => !animalesSeleccionados.find(sel => sel.id === a.id));
          setSugerencias(filtrados);
        } catch {
          setSugerencias([]);
        } finally {
          setBuscando(false);
        }
      }, 400);
    },
    [animalesSeleccionados],
  );

  const agregarAnimal = (animal: AnimalModel) => {
    if (!animalesSeleccionados.find(a => a.id === animal.id)) {
      setAnimalesSeleccionados(prev => [...prev, { id: animal.id, arete: animal.arete }]);
    }
    setAreteSearch('');
    setSugerencias([]);
    setFieldErrors(prev => ({ ...prev, animales: '' }));
  };

  const removerAnimal = (id: number) => {
    // No se puede remover el animal fijado por prop
    if (id === animalId) return;
    setAnimalesSeleccionados(prev => prev.filter(a => a.id !== id));
  };

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

    for (let index = 0; index < firstDay; index += 1) cells.push(null);
    for (let day = 1; day <= daysInMonth; day += 1) cells.push(new Date(year, month, day));

    return cells;
  };

  const canGoNextMonth = () => {
    if (calendarTarget === 'fechaProximoEvento') return true;
    const now = new Date();
    return (
      calendarMonth.getFullYear() < now.getFullYear() ||
      (calendarMonth.getFullYear() === now.getFullYear() && calendarMonth.getMonth() < now.getMonth())
    );
  };

  const selectDate = (date: Date) => {
    if (!calendarTarget) return;

    if (calendarTarget === 'fechaEvento' && isFutureDate(date)) {
      Alert.alert('Fecha invalida', 'La fecha del evento no puede ser futura.');
      return;
    }

    if (calendarTarget === 'fechaProximoEvento' && isPastDate(date)) {
      Alert.alert('Fecha invalida', 'La proxima fecha no puede ser pasada.');
      return;
    }

    setField(calendarTarget, formatDate(date));
    setCalendarTarget(null);
  };

  const onSubmit = async () => {
    const errors = validateForm(form, animalesSeleccionados.length);
    setFieldErrors(errors);

    if (Object.keys(errors).filter(k => errors[k]).length > 0) return;

    let exitosos = 0;
    const fallidos: string[] = [];

    for (const animal of animalesSeleccionados) {
      try {
        await registrar({
          animalId: animal.id,
          tipoEvento: form.tipoEvento,
          descripcion: form.descripcion.trim(),
          veterinario: form.veterinario.trim(),
          dosis: form.dosis.trim(),
          observaciones: form.observaciones.trim(),
          fechaEvento: form.fechaEvento,
          fechaProximoEvento: form.fechaProximoEvento,
        });

        if (reminderEnabled && form.fechaProximoEvento) {
          try {
            await programarNotificacionEvento({
              id: 0,
              animalId: animal.id,
              tipoEvento: form.tipoEvento,
              descripcion: form.descripcion.trim() || null,
              fechaEvento: form.fechaEvento,
              veterinario: form.veterinario.trim() || null,
              dosis: form.dosis.trim() || null,
              observaciones: form.observaciones.trim() || null,
              fechaProximoEvento: form.fechaProximoEvento,
            });
          } catch {
            // No bloqueamos el guardado si la notificaci├│n falla
          }
        }

        exitosos++;
      } catch {
        fallidos.push(animal.arete);
      }
    }

    if (exitosos > 0) {
      const msg =
        animalesSeleccionados.length > 1
          ? `Evento registrado para ${exitosos} de ${animalesSeleccionados.length} animales.`
          : 'El evento sanitario fue registrado correctamente.';

      if (fallidos.length > 0) {
        Alert.alert('Guardado con errores', `${msg}\nFallaron: ${fallidos.join(', ')}`, [
          { text: 'OK', onPress: () => onBack() },
        ]);
      } else {
        Alert.alert('Guardado', msg, [{ text: 'OK', onPress: () => onBack() }]);
      }

      setForm(INITIAL_FORM);
      setAnimalesSeleccionados(prev => (animalId ? prev.filter(a => a.id === animalId) : []));
    } else if (fallidos.length > 0) {
      Alert.alert('Error', `No se pudo registrar para: ${fallidos.join(', ')}`);
    }
  };

  const isAnimalFijo = (id: number) => id === animalId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />

      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backText}>ÔåÉ Volver</Text>
        </Pressable>
        <Text style={styles.title}>Registrar Evento Sanitario</Text>
        <Text style={styles.subtitle}>Vacunas, desparasitaciones y seguimiento cl├¡nico.</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {/* ÔöÇÔöÇ SELECTOR DE ANIMALES ÔöÇÔöÇ */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Animales a tratar</Text>

          {/* Chips de animales seleccionados */}
          {animalesSeleccionados.length > 0 && (
            <View style={styles.animalChipsWrap}>
              {animalesSeleccionados.map(a => (
                <Pressable
                  key={a.id}
                  style={[styles.animalChip, isAnimalFijo(a.id) && styles.animalChipFijo]}
                  onPress={() => removerAnimal(a.id)}
                >
                  <Text style={styles.animalChipText}>
                    #{a.arete}{isAnimalFijo(a.id) ? ' ­ƒöÆ' : ' Ô£ò'}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          {/* Input de b├║squeda por arete */}
          <Text style={styles.label}>
            {animalesSeleccionados.length === 0 ? 'Buscar animal por arete *' : 'Agregar otro animal'}
          </Text>
          <View style={styles.searchRow}>
            <TextInput
              value={areteSearch}
              onChangeText={handleAreteSearch}
              placeholder="Ingresa el arete (ej: 1234567890)"
              keyboardType="number-pad"
              maxLength={10}
              onFocus={() => setFocusedField('areteSearch')}
              onBlur={() => setFocusedField(null)}
              style={[
                styles.input,
                fieldErrors.animales ? styles.inputError : undefined,
                focusedField === 'areteSearch' && styles.inputFocused,
                { flex: 1 },
              ]}
            />
            {buscando && <ActivityIndicator size="small" color={COLORS.primary} style={{ marginLeft: 8 }} />}
          </View>

          {/* Lista de sugerencias */}
          {sugerencias.length > 0 && (
            <View style={styles.sugerenciasBox}>
              {sugerencias.map(s => (
                <Pressable
                  key={s.id}
                  style={styles.sugerenciaItem}
                  onPress={() => agregarAnimal(s)}
                >
                  <Text style={styles.sugerenciaArete}>#{s.arete}</Text>
                  <Text style={styles.sugerenciaEspecie}>{s.especie}</Text>
                </Pressable>
              ))}
            </View>
          )}

          {areteSearch.length >= 2 && sugerencias.length === 0 && !buscando && (
            <Text style={styles.noResultsText}>No se encontraron animales activos con ese arete.</Text>
          )}

          {fieldErrors.animales ? <Text style={styles.errorText}>{fieldErrors.animales}</Text> : null}
        </View>

        {/* ÔöÇÔöÇ TIPO DE EVENTO ÔöÇÔöÇ */}
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

          {(form.tipoEvento === TipoEvento.VACUNA || form.tipoEvento === TipoEvento.DESPARASITACION) && (
            <View>
              <Text style={styles.label}>Subtipo</Text>
              <View style={styles.chipsRow}>
                {(SUBTIPOS_POR_TIPO[form.tipoEvento] ?? []).map(sub => {
                  const selected = form.subtipo === sub;
                  return (
                    <Pressable
                      key={sub}
                      onPress={() => setField('subtipo', sub)}
                      style={[styles.chip, selected && styles.chipSelected]}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{sub}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        {/* ÔöÇÔöÇ DETALLES DEL EVENTO ÔöÇÔöÇ */}
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

          <Text style={styles.label}>Dosis (opcional)</Text>
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

        {/* ÔöÇÔöÇ FECHAS ÔöÇÔöÇ */}
        <View style={styles.card}>
          <Text style={styles.label}>Fecha del evento *</Text>
          <Pressable
            style={[
              styles.dateField,
              fieldErrors.fechaEvento ? styles.inputError : undefined,
              calendarTarget === 'fechaEvento' && styles.inputFocused,
            ]}
            onPress={() => openCalendar('fechaEvento')}
          >
            <Text style={[styles.dateText, !form.fechaEvento && styles.datePlaceholder]}>
              {form.fechaEvento || 'Seleccionar fecha (pasada o hoy)'}
            </Text>
            <Text style={styles.dateIcon}>­ƒôà</Text>
          </Pressable>
          {fieldErrors.fechaEvento ? <Text style={styles.errorText}>{fieldErrors.fechaEvento}</Text> : null}

          <Text style={styles.label}>Fecha proxima *</Text>
          <Text style={styles.labelHint}>Solo fechas actuales o futuras</Text>

          {form.fechaProximoEventoSugerida && !form.fechaProximoEvento && (
            <Pressable
              style={styles.suggestedDateButton}
              onPress={() => setField('fechaProximoEvento', form.fechaProximoEventoSugerida!)}
            >
              <Text style={styles.suggestedDateLabel}>Sugerido NOM-041</Text>
              <Text style={styles.suggestedDateValue}>{form.fechaProximoEventoSugerida}</Text>
            </Pressable>
          )}

          <Pressable
            style={[
              styles.dateField,
              fieldErrors.fechaProximoEvento ? styles.inputError : undefined,
              calendarTarget === 'fechaProximoEvento' && styles.inputFocused,
            ]}
            onPress={() => openCalendar('fechaProximoEvento')}
          >
            <Text style={[styles.dateText, !form.fechaProximoEvento && styles.datePlaceholder]}>
              {form.fechaProximoEvento || 'Seleccionar fecha futura'}
            </Text>
            <Text style={styles.dateIcon}>­ƒôà</Text>
          </Pressable>
          {fieldErrors.fechaProximoEvento ? <Text style={styles.errorText}>{fieldErrors.fechaProximoEvento}</Text> : null}
        </View>

        {/* ÔöÇÔöÇ RECORDATORIO ÔöÇÔöÇ */}
        <View style={styles.reminderCard}>
          <View style={styles.reminderTextWrap}>
            <Text style={styles.reminderLabel}>Programar Recordatorio</Text>
            <Text style={styles.reminderHint}>(Al d├¡a de la pr├│xima dosis)</Text>
          </View>
          <Switch
            value={reminderEnabled}
            onValueChange={setReminderEnabled}
            trackColor={{ true: COLORS.primary, false: '#d0d0d0' }}
            thumbColor="#ffffff"
          />
        </View>

        {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

        {/* ÔöÇÔöÇ BOT├ôN GUARDAR ÔöÇÔöÇ */}
        <Pressable
          onPress={onSubmit}
          disabled={loading}
          style={({ pressed }) => [styles.saveButton, (pressed || loading) && styles.saveButtonPressed]}
        >
          {loading
            ? <ActivityIndicator color="#fff" />
            : (
              <Text style={styles.saveButtonText}>
                {animalesSeleccionados.length > 1
                  ? `Guardar para ${animalesSeleccionados.length} animales`
                  : 'Guardar Evento Sanitario'}
              </Text>
            )}
        </Pressable>

        {/* ÔöÇÔöÇ HISTORIAL DEL PRIMER ANIMAL ÔöÇÔöÇ */}
        {listVisible && animalesSeleccionados[0] ? (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>Eventos del animal #{animalesSeleccionados[0].arete}</Text>
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

      {/* ÔöÇÔöÇ CALENDARIO ÔöÇÔöÇ */}
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
                <Text key={day} style={styles.weekDay}>{day}</Text>
              ))}
            </View>

            <View style={styles.daysGrid}>
              {getMonthDays(calendarMonth).map((day, index) => {
                if (!day) return <View key={`empty-${index}`} style={styles.dayCell} />;

                const disableDay =
                  calendarTarget === 'fechaEvento'
                    ? isFutureDate(day)
                    : calendarTarget === 'fechaProximoEvento'
                      ? isPastDate(day)
                      : false;

                const isSelected =
                  calendarTarget === 'fechaEvento'
                    ? form.fechaEvento === formatDate(day)
                    : form.fechaProximoEvento === formatDate(day);

                return (
                  <Pressable
                    key={day.toISOString()}
                    style={[
                      styles.dayCell,
                      isSelected && styles.dayCellSelected,
                      disableDay && styles.dayCellDisabled,
                    ]}
                    disabled={disableDay}
                    onPress={() => selectDate(day)}
                  >
                    <Text style={[styles.dayCellText, isSelected && styles.dayCellTextSelected]}>
                      {day.getDate()}
                    </Text>
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
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: 'rgba(255,255,255,0.15)',
    borderRadius: 999,
  },
  backText: {
    color: COLORS.white,
    fontSize: 14,
    fontFamily: FONTS.bold,
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
    paddingBottom: 40,
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
  sectionTitle: {
    color: COLORS.black,
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: 10,
  },
  label: {
    marginBottom: 6,
    marginTop: 10,
    color: COLORS.black,
    fontFamily: FONTS.semiBold,
  },
  labelHint: {
    marginBottom: 6,
    color: '#6c8060',
    fontFamily: FONTS.regular,
    fontSize: 12,
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
  inputFocused: {
    borderColor: COLORS.primary,
    borderWidth: 2,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sugerenciasBox: {
    borderWidth: 1,
    borderColor: '#d0dccf',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  sugerenciaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2ec',
  },
  sugerenciaArete: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    fontSize: 14,
  },
  sugerenciaEspecie: {
    fontFamily: FONTS.regular,
    color: '#666',
    fontSize: 12,
  },
  noResultsText: {
    color: '#888',
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginBottom: 8,
    fontStyle: 'italic',
  },
  animalChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  animalChip: {
    backgroundColor: COLORS.primary,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  animalChipFijo: {
    backgroundColor: '#4a8f6a',
  },
  animalChipText: {
    color: '#fff',
    fontFamily: FONTS.semiBold,
    fontSize: 13,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 6,
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
    paddingVertical: 14,
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
    paddingVertical: 18,
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
  reminderCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
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
  suggestedDateButton: {
    backgroundColor: '#f0f9f0',
    borderRadius: 10,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#c7e9c7',
  },
  suggestedDateLabel: {
    color: '#555555',
    fontFamily: FONTS.semiBold,
    fontSize: 12,
  },
  suggestedDateValue: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginTop: 6,
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
  dayCellSelected: {
    backgroundColor: COLORS.primary,
  },
  dayCellDisabled: {
    opacity: 0.25,
  },
  dayCellText: {
    color: COLORS.black,
    fontFamily: FONTS.semiBold,
  },
  dayCellTextSelected: {
    color: COLORS.white,
  },
  calendarCloseButton: {
    marginTop: 14,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    alignItems: 'center',
  },
  calendarCloseText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
});
```

---

## src/shared/components/ModulePlaceholderScreen.tsx

**Estado:** Modificado

### Contenido en f6abc6d:

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

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, PermissionsAndroid, Platform, Linking } from 'react-native';

import type { EventoSanitarioModel } from '../../types/Sanitario';

type NotificationNativeApi = {
  programarAlarma: (
    animalId: number,
    fechaISO: string,
    titulo: string,
    descripcion: string,
  ) => Promise<{ ok: boolean; alarmId: number; triggerAtMillis?: number; mode?: string }>;
  cancelarAlarma: (requestCode: number) => Promise<{ ok: boolean; alarmId: number }>;
};

const NOTIFICATIONS_ENABLED_KEY = '@agroapp:notificaciones_habilitadas';

const getNative = (): NotificationNativeApi => {
  const module = NativeModules.NotificationNativeModule as NotificationNativeApi | undefined;
  if (!module) {
    throw new Error('NotificationNativeModule no disponible. Revisa el registro en AgroAppPackage.');
  }
  return module;
};

const formatAsIsoDate = (date: Date): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const javaStringHashCode = (value: string): number => {
  let hash = 0;

  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }

  return Math.abs(hash);
};

const buildRequestCode = (animalId: number, fechaISO: string): number => {
  return javaStringHashCode(`${animalId}|${fechaISO}`);
};

export const getNotificationsEnabled = async (): Promise<boolean> => {
  const storedValue = await AsyncStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
  if (storedValue == null) {
    return true;
  }

  return storedValue === 'true';
};

export const setNotificationsEnabled = async (enabled: boolean): Promise<void> => {
  await AsyncStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
};

const emojiByTipo = (tipo: string): string => {
  switch (tipo) {
    case 'VACUNA':
      return '­ƒÉä';
    case 'DESPARASITACION':
      return '­ƒÆè';
    case 'ENFERMEDAD':
      return 'ÔÜá´©Å';
    case 'CIRUGIA':
      return '­ƒÅÑ';
    default:
      return '­ƒôî';
  }
};

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version < 33) {
    return true;
  }

  const result = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
  return result === PermissionsAndroid.RESULTS.GRANTED;
};

export const checkNotificationPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  if (Platform.Version < 33) {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS);
    return granted;
  } catch {
    return false;
  }
};

export const openAppSettings = async (): Promise<void> => {
  try {
    await Linking.openSettings();
  } catch {
    // ignore
  }
};

export const programarNotificacionEvento = async (evento: EventoSanitarioModel): Promise<void> => {
  if (!evento.fechaProximoEvento) {
    return;
  }

  const notificationsEnabled = await getNotificationsEnabled();
  if (!notificationsEnabled) {
    return;
  }

  const allowed = await requestNotificationPermission();
  if (!allowed) {
    return;
  }

  const native = getNative();
  const fechaExacta = evento.fechaProximoEvento.slice(0, 10);

  const baseDate = new Date(`${fechaExacta}T00:00:00`);
  const menosTres = new Date(baseDate);
  menosTres.setDate(baseDate.getDate() - 3);
  const fechaMenosTres = formatAsIsoDate(menosTres);

  const emoji = emojiByTipo(String(evento.tipoEvento));
  const eventoNombre = (evento.descripcion || evento.tipoEvento).trim();
  const descripcion = `Animal ID: ${evento.animalId} ┬À Pr├│ximo evento: ${fechaExacta}`;

  await native.programarAlarma(
    evento.animalId,
    fechaMenosTres,
    `${emoji} ${eventoNombre} en 3 dias`,
    descripcion,
  );
  await native.programarAlarma(
    evento.animalId,
    fechaExacta,
    `${emoji} ${eventoNombre} hoy`,
    descripcion,
  );
};

export const reprogramarNotificacionesEventos = async (
  eventos: EventoSanitarioModel[],
): Promise<{ programadas: number }> => {
  const uniqueEventos = Array.from(new Map(eventos.map(evento => [evento.id, evento])).values());
  let programadas = 0;

  for (const evento of uniqueEventos) {
    if (!evento.fechaProximoEvento) {
      continue;
    }

    await programarNotificacionEvento(evento);
    programadas += 1;
  }

  return { programadas };
};

export const cancelarNotificacionesEventos = async (
  eventos: EventoSanitarioModel[],
): Promise<{ canceladas: number }> => {
  const uniqueEventos = Array.from(new Map(eventos.map(evento => [evento.id, evento])).values());
  const native = getNative();
  let canceladas = 0;

  for (const evento of uniqueEventos) {
    if (!evento.fechaProximoEvento) {
      continue;
    }

    const fechaExacta = evento.fechaProximoEvento.slice(0, 10);
    const baseDate = new Date(`${fechaExacta}T00:00:00`);
    const menosTres = new Date(baseDate);
    menosTres.setDate(baseDate.getDate() - 3);
    const fechaMenosTres = formatAsIsoDate(menosTres);

    await native.cancelarAlarma(buildRequestCode(evento.animalId, fechaMenosTres));
    await native.cancelarAlarma(buildRequestCode(evento.animalId, fechaExacta));
    canceladas += 1;
  }

  return { canceladas };
};

export const cancelarNotificacion = async (id: number): Promise<void> => {
  const native = getNative();
  await native.cancelarAlarma(id);
};

export const programarNotificacionPrueba = async (): Promise<number> => {
  const allowed = await requestNotificationPermission();
  if (!allowed) {
    throw new Error('Permiso de notificaciones denegado.');
  }

  const native = getNative();
  const hoy = formatAsIsoDate(new Date());
  const result = await native.programarAlarma(
    999999,
    hoy,
    'Prueba de recordatorio sanitario',
    'Esta es una notificacion de prueba de AgroApp.',
  );

  return result.alarmId;
};
```

---

## src/shared/services/sessionManager.ts

**Estado:** Modificado

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

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

### Contenido en f6abc6d:

```typescript
export interface AnimalFormState {
  arete: string;
  especie: string;
  sexo: string;
  fecha: string;
  peso: string;
  fotoPath: string | null;
  precioCompra: string;
  nacioEnRancho: boolean;
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
  precio_compra: number | null;
  precio_venta: number | null;
  fecha_venta: string | null;
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
  precio_compra: number | null;
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
  precioVenta?: number;
  fechaVenta?: string;
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

export interface VentaAnimalPayload {
  id: number;
  precioVenta: number;
  fechaVenta: string;
  comprador?: string;
}

export interface VentaAnimalResult {
  ok: boolean;
  animalId: number;
  precioVenta: number;
  margenEstimado: number | null;
}
```

---

## src/types/Costos.ts

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
/**
 * Tipos y enums para el m├│dulo de costos/gastos
 * Sprint 4 ÔÇö RF003
 */

export enum CategoriaGasto {
  ALIMENTACION = 'ALIMENTACION',
  MEDICAMENTOS = 'MEDICAMENTOS',
  TRASLADO = 'TRASLADO',
  VETERINARIO = 'VETERINARIO',
  OTRO = 'OTRO',
}

export const CATEGORIA_GASTO_LABELS: Record<CategoriaGasto, string> = {
  [CategoriaGasto.ALIMENTACION]: '­ƒÑò Alimentaci├│n',
  [CategoriaGasto.MEDICAMENTOS]: '­ƒÆè Medicamentos',
  [CategoriaGasto.TRASLADO]: '­ƒÜÜ Traslado',
  [CategoriaGasto.VETERINARIO]: '­ƒæ¿ÔÇìÔÜò´©Å Veterinario',
  [CategoriaGasto.OTRO]: '­ƒôØ Otro',
};

export const CATEGORIA_COLORES: Record<CategoriaGasto, string> = {
  [CategoriaGasto.ALIMENTACION]: '#F59E0B', // ├ümbar
  [CategoriaGasto.MEDICAMENTOS]: '#EF4444', // Rojo
  [CategoriaGasto.TRASLADO]: '#3B82F6', // Azul
  [CategoriaGasto.VETERINARIO]: '#8B5CF6', // P├║rpura
  [CategoriaGasto.OTRO]: '#6B7280', // Gris
};

/**
 * Modelo de un gasto individual
 */
export interface GastoModel {
  id: number;
  animalId: number | null; // null = gasto general del hato
  categoria: CategoriaGasto;
  descripcion: string;
  monto: number;
  fecha: string; // YYYY-MM-DD
  notas: string | null;
}

/**
 * Payload para insertar un nuevo gasto
 */
export interface InsertGastoPayload {
  animalId: number | null;
  categoria: CategoriaGasto;
  descripcion: string;
  monto: number;
  fecha: string;
  notas?: string | null;
}

/**
 * Payload para actualizar un gasto
 */
export interface UpdateGastoPayload extends InsertGastoPayload {
  id: number;
}

/**
 * Resumen de gastos
 */
export interface GastoResumen {
  totalInvertido: number;
  porCategoria: Record<CategoriaGasto, number>;
  cantidadRegistros: number;
}

/**
 * Gasto agrupado por categor├¡a
 */
export interface GastoPorCategoria {
  categoria: CategoriaGasto;
  total: number;
  cantidad: number;
}
```

---

## src/types/Nutricion.ts

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
export type EtapaProductiva = 'CRIA' | 'ENGORDA' | 'LECHERA';
export type TipoAnimal = 'BOVINO' | 'OVINO' | 'CAPRINO';

export interface GastosEstimadosMXN {
  mensualPorAnimal: number;
  fuente: string;
}

export interface RecomendacionNutricional {
  etapa: EtapaProductiva;
  tipoAnimal: TipoAnimal;
  proteinaMin: number;       // % en base seca
  energiaMcal: number;       // Mcal EM / kg MS
  fibraMaxima: number;       // % FDN m├íxima
  aguaLitrosDia: number;     // litros/d├¡a
  suplementos: string[];
  observaciones: string;
  gastosEstimadosMXN: GastosEstimadosMXN;
}

export const ETAPA_LABELS: Record<EtapaProductiva, string> = {
  CRIA: 'Cr├¡a',
  ENGORDA: 'Engorda',
  LECHERA: 'Lechera',
};

export const TIPO_LABELS: Record<TipoAnimal, string> = {
  BOVINO: 'Bovino',
  OVINO: 'Ovino',
  CAPRINO: 'Caprino',
};
```

---

## src/types/Sanitario.ts

**Estado:** Modificado

### Contenido en f6abc6d:

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
  arete?: string;
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

### Contenido en f6abc6d:

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

**Estado:** Modificado

### Contenido en f6abc6d:

```typescript
export function formatMXN(monto: number): string {
  const abs = Math.abs(monto);
  const formatted = abs.toLocaleString('es-MX', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  const sign = monto < 0 ? '-' : '';
  return `${sign}$${formatted} MXN`;
}
```

---

## src/utils/validaciones/areteValidator.ts

**Estado:** Modificado

### Contenido en f6abc6d:

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
