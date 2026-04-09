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