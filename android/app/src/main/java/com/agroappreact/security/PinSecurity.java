package com.agroappreact.security;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;

public final class PinSecurity {

    private static final String APP_PIN_SALT = "AGROAPP_OFFLINE_PIN_V1";

    private PinSecurity() {
        // Utility class.
    }

    public static boolean isPinFormatValid(String pin) {
        return pin != null && pin.matches("^[0-9]{4,6}$");
    }

    public static String hashPin(String pin) throws Exception {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        String value = APP_PIN_SALT + ":" + pin;
        byte[] hashBytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));

        StringBuilder hex = new StringBuilder();
        for (byte hashByte : hashBytes) {
            hex.append(String.format("%02x", hashByte));
        }

        return hex.toString();
    }

    public static boolean looksHashed(String value) {
        return value != null && value.matches("^[a-fA-F0-9]{64}$");
    }
}