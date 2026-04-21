package com.agroappreact.utils;

import java.util.regex.Pattern;

public final class AreteValidator {

    private static final Pattern ARETE_PATTERN = Pattern.compile("^[1-9]\\d{9}$");

    private AreteValidator() {
    }

    public static boolean isValid(String arete) {
        if (arete == null) {
            return false;
        }
        return ARETE_PATTERN.matcher(arete.trim()).matches();
    }
}
