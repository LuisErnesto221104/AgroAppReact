package com.agroappreact.dao;

import android.content.ContentValues;
import android.database.Cursor;
import android.database.sqlite.SQLiteDatabase;
import android.text.TextUtils;

import com.agroappreact.database.DatabaseHelper;
import com.agroappreact.models.Usuario;

import java.util.ArrayList;
import java.util.List;

public class UsuarioDAO {
    private DatabaseHelper dbHelper;
    private static final int MAX_USUARIOS = 2; // Admin + 1 Usuario
    
    public UsuarioDAO(DatabaseHelper dbHelper) {
        this.dbHelper = dbHelper;
    }

    public Usuario validarPorPin(String pinHash) {
        if (TextUtils.isEmpty(pinHash)) {
            return null;
        }

        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Usuario usuario = null;

        Cursor cursor = db.query(
            DatabaseHelper.TABLE_USUARIOS,
            null,
            DatabaseHelper.COL_USUARIO_PIN + "=?",
            new String[]{pinHash},
            null, null, null,
            "1"
        );

        if (cursor != null && cursor.moveToFirst()) {
            usuario = cursorToUsuario(cursor);
            cursor.close();
        }

        return usuario;
    }

    public Usuario validarCredenciales(String nombre, String pinHash) {
        if (TextUtils.isEmpty(nombre) || TextUtils.isEmpty(pinHash)) {
            return null;
        }

        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Usuario usuario = null;

        Cursor cursor = db.query(
            DatabaseHelper.TABLE_USUARIOS,
            null,
            DatabaseHelper.COL_USUARIO_NOMBRE + "=? AND " + DatabaseHelper.COL_USUARIO_PIN + "=?",
            new String[]{nombre.trim(), pinHash},
            null, null, null,
            "1"
        );

        if (cursor != null && cursor.moveToFirst()) {
            usuario = cursorToUsuario(cursor);
            cursor.close();
        }

        return usuario;
    }

    public Usuario obtenerPorNombre(String nombre) {
        if (TextUtils.isEmpty(nombre)) {
            return null;
        }

        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Usuario usuario = null;

        Cursor cursor = db.query(
            DatabaseHelper.TABLE_USUARIOS,
            null,
            DatabaseHelper.COL_USUARIO_NOMBRE + "=?",
            new String[]{nombre.trim()},
            null, null, null,
            "1"
        );

        if (cursor != null && cursor.moveToFirst()) {
            usuario = cursorToUsuario(cursor);
            cursor.close();
        }

        return usuario;
    }
    
    public Usuario obtenerAdmin() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Usuario usuario = null;
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_USUARIOS,
            null,
            DatabaseHelper.COL_USUARIO_ROL + "=?",
            new String[]{"ADMIN"},
            null, null, null
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            usuario = cursorToUsuario(cursor);
            cursor.close();
        }
        
        return usuario;
    }
    
    public Usuario obtenerUsuarioNormal() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Usuario usuario = null;
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_USUARIOS,
            null,
            DatabaseHelper.COL_USUARIO_ROL + "=?",
            new String[]{"USUARIO"},
            null, null, null
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            usuario = cursorToUsuario(cursor);
            cursor.close();
        }
        
        return usuario;
    }
    
    public long insertarUsuario(Usuario usuario) {
        if (!puedeCrearUsuario()) {
            return -1;
        }
        
        usuario.setRol(Usuario.TipoUsuario.USUARIO);

        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COL_USUARIO_NOMBRE, usuario.getNombre());
        values.put(DatabaseHelper.COL_USUARIO_PIN, usuario.getPin());
        values.put(DatabaseHelper.COL_USUARIO_ROL, usuario.getRol().name());
        
        return db.insert(DatabaseHelper.TABLE_USUARIOS, null, values);
    }
    
    public long insertar(Usuario usuario) {
        return insertarUsuario(usuario);
    }
    
    public int actualizarUsuario(Usuario usuario) {
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        ContentValues values = new ContentValues();
        
        values.put(DatabaseHelper.COL_USUARIO_NOMBRE, usuario.getNombre());
        values.put(DatabaseHelper.COL_USUARIO_PIN, usuario.getPin());
        values.put(DatabaseHelper.COL_USUARIO_ROL, usuario.getRol().name());
        
        return db.update(
            DatabaseHelper.TABLE_USUARIOS,
            values,
            DatabaseHelper.COL_USUARIO_ID + "=?",
            new String[]{String.valueOf(usuario.getId())}
        );
    }
    
    public int eliminarUsuario(int id) {
        Usuario usuario = obtenerPorId(id);
        if (usuario != null && usuario.esAdmin()) {
            return 0;
        }
        
        SQLiteDatabase db = dbHelper.getWritableDatabase();
        return db.delete(
            DatabaseHelper.TABLE_USUARIOS,
            DatabaseHelper.COL_USUARIO_ID + "=?",
            new String[]{String.valueOf(id)}
        );
    }
    
    public Usuario obtenerPorId(int id) {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Usuario usuario = null;
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_USUARIOS,
            null,
            DatabaseHelper.COL_USUARIO_ID + "=?",
            new String[]{String.valueOf(id)},
            null, null, null
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            usuario = cursorToUsuario(cursor);
            cursor.close();
        }
        
        return usuario;
    }
    
    public boolean existeAdmin() {
        return obtenerAdmin() != null;
    }
    
    public boolean existeUsuarioNormal() {
        return obtenerUsuarioNormal() != null;
    }
    
    public boolean existeAlgunUsuario() {
        return contarUsuarios() > 0;
    }
    
    public int contarUsuarios() {
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        Cursor cursor = db.rawQuery("SELECT COUNT(*) FROM " + DatabaseHelper.TABLE_USUARIOS, null);
        
        int count = 0;
        if (cursor != null && cursor.moveToFirst()) {
            count = cursor.getInt(0);
            cursor.close();
        }
        
        return count;
    }
    
    public boolean puedeCrearUsuario() {
        return contarUsuarios() < MAX_USUARIOS;
    }
    
    public List<Usuario> obtenerTodosUsuarios() {
        List<Usuario> usuarios = new ArrayList<>();
        SQLiteDatabase db = dbHelper.getReadableDatabase();
        
        Cursor cursor = db.query(
            DatabaseHelper.TABLE_USUARIOS,
            null, null, null, null, null,
            DatabaseHelper.COL_USUARIO_ROL + " ASC"
        );
        
        if (cursor != null && cursor.moveToFirst()) {
            do {
                usuarios.add(cursorToUsuario(cursor));
            } while (cursor.moveToNext());
            cursor.close();
        }
        
        return usuarios;
    }
    
    private Usuario cursorToUsuario(Cursor cursor) {
        String rolStr = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_USUARIO_ROL));
        Usuario.TipoUsuario rol = Usuario.TipoUsuario.valueOf(rolStr);
        String pin = cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_USUARIO_PIN));
        
        return new Usuario(
            cursor.getInt(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_USUARIO_ID)),
            cursor.getString(cursor.getColumnIndexOrThrow(DatabaseHelper.COL_USUARIO_NOMBRE)),
            pin,
            rol
        );
    }
}
