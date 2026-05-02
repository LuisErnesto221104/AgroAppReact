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