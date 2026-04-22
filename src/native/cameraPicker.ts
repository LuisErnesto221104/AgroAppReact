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